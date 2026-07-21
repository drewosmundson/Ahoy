



// ----------------------------------------------------------------------------
// Collision handling
// ----------------------------------------------------------------------------

// Builds the layer-pair -> response-function map. Takes its dependencies as
// explicit params instead of reaching for bare globals (effectsBus,
// soundsManager, managers were undeclared globals in the original file).
function createCollisionResponses({ effectsBus, soundManager, projectileManager }) {
    return {
        "projectile:vessel": (projectile, boat) => {
            // effects on the boat (entityB in this pairing)
            applyDamage(boat, projectile.damage);
            effectsBus.emit("cameraShake", { intensity: projectile.damage / 100 });
            effectsBus.emit("damageNumberPopup", { amount: projectile.damage, entityId: boat.id });
            if (boat.controlSource === "ai") {
                boat.brain?.notify({ type: "tookDamage", from: projectile.ownerId });
            }

            // effects on the projectile (entityA in this pairing)
            soundManager.play("impact", { position: projectile.location });
            projectileManager.remove(projectile.id);
        },
        "vessel:vessel": (a, b) => pushApart(a, b),
        "vessel:terrain": (boat) => {
            boat.velocity = { x: 0, y: 0 };
        },
        "projectile:terrain": (proj) => projectileManager.remove(proj.id),
        "plane:terrain": (plane) => plane.crash?.(),
        "projectile:plane": (proj, plane) => {
            plane.health -= proj.damage;
            projectileManager.remove(proj.id);
        },
        "vessel:plane": (_boat, _plane) => {
            // TODO: decide once, here, what a boat/plane collision does.
        },
    };
}

class CollisionSystem {
    constructor(managers, heightmap, { effectsBus, soundManager, projectileManager }, cellSize = 20) {
        this.managers = managers;
        this.heightmap = heightmap;
        this.cellSize = cellSize;
        this.collisionResponses = createCollisionResponses({ effectsBus, soundManager, projectileManager });
    }

    update(_dt) {
        const colliders = [];

        for (const manager of this.managers) {
            manager.collectColliders?.(colliders);
        }

        const pairs = broadPhase(colliders, this.cellSize);

        for (const [a, b] of pairs) {
            const hit = entityCollision(a, b);
            if (hit) this.resolveCollision(hit);
        }

        for (const entity of colliders) {
            if (!entity.collidesWithTerrain) continue;

            const hit = terrainCollision(entity, this.heightmap);
            if (hit) this.resolveCollision(hit);
        }
    }

    resolveCollision({ entityA, entityB, penetration }) {
        const key = `${entityA.layer}:${entityB.layer}`;
        const reversedKey = `${entityB.layer}:${entityA.layer}`;

        if (this.collisionResponses[key]) {
            this.collisionResponses[key](entityA.entity ?? entityA, entityB.entity ?? entityB, penetration);
        } else if (this.collisionResponses[reversedKey]) {
            this.collisionResponses[reversedKey](entityB.entity ?? entityB, entityA.entity ?? entityA, penetration);
        }
    }
}

function entityCollision(entityA, entityB) {
    const distance = getDistance(entityA.location, entityB.location);
    const hitboxOverlap = entityA.hitboxSphereSize + entityB.hitboxSphereSize;
    const penetration = hitboxOverlap - distance;

    if (penetration > 0) {
        return { entityA, entityB, penetration };
    }
    return null;
}

// Naive O(n^2) fallback broad-phase. Fine for small entity counts / tests;
// swap for a real spatial hash keyed by cellSize once entity counts grow.
function broadPhase(colliders, _cellSize) {
    const pairs = [];
    for (let i = 0; i < colliders.length; i++) {
        for (let j = i + 1; j < colliders.length; j++) {
            pairs.push([colliders[i], colliders[j]]);
        }
    }
    return pairs;
}

// Placeholder terrain check: real version should sample `heightmap` under
// entity.location and compare to entity's vertical extent / hitbox.
function terrainCollision(_entity, _heightmap) {
    return null;
}

function getDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function pushApart(a, b) {
    const dx = b.location.x - a.location.x;
    const dy = b.location.y - a.location.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = (a.hitboxSphereSize + b.hitboxSphereSize - dist) / 2;
    a.location.x -= nx * overlap;
    a.location.y -= ny * overlap;
    b.location.x += nx * overlap;
    b.location.y += ny * overlap;
}

function applyDamage(entity, amount) {
    entity.health = (entity.health ?? 100) - amount;
}









// ----------------------------------------------------------------------------
// Minimal stand-ins for the other managers/systems referenced by Game but
// not defined anywhere in the original file. These are intentionally thin —
// just enough shape (start/update/collectColliders/collectRenderables) for
// the manager/system loops to run without crashing. Replace with the real
// implementations as they land.
// ----------------------------------------------------------------------------

class ProjectileManager {
    constructor(simulationBus, networkBus) {
        this.simulationBus = simulationBus;
        this.networkBus = networkBus;
        this.projectiles = new Map();
    }

    start(_lobbyData) {}

    update(_dt) {
        // TODO: drain fire-intent events, integrate projectile motion.
    }

    remove(id) {
        this.projectiles.delete(id);
    }

    collectColliders(output) {
        this.projectiles.forEach((p) => {
            output.push({
                id: p.id,
                layer: "projectile",
                location: p.location,
                velocity: p.velocity,
                hitboxSphereSize: p.hitboxSphereSize ?? 1,
                collidesWithTerrain: true,
                ownerId: p.ownerId,
                entity: p,
            });
        });
    }

    collectRenderables(output) {
        this.projectiles.forEach((p) => {
            output.push({ id: p.id, type: "projectile", location: p.location });
        });
    }
}









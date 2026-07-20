import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createScene } from "./scene/scene.js"

import { EventBuffer, LocalEventBus, NetworkEventBus } from './Network/Events.js';

// ============================================================================
// OWNERSHIP MODEL
// ----------------------------------------------------------------------------
// - Ownership is FIXED at lobby start and never changes for the match. Each
//   player is assigned a set of vehicles up front; that assignment is final.
// - A player actively controls exactly ONE of their own vehicles at a time.
//   All their OTHER owned vehicles run on AI. Switching which one is active
//   is pure local client state — no ownership check against other players is
//   ever needed, since a client can only switch among vehicles it already owns.
// - Every client is authoritative for ALL of its own vehicles (active or AI)
//   and is responsible for simulating + broadcasting their state. A client
//   never simulates another player's vehicle — it only blends toward that
//   player's broadcast snapshots (NetworkController).
// - So "controlSource" is NOT a stored fact — it's derived every tick from
//   (vehicle.ownerId, manager.activeVehicleId). See VehicleManager.controllerFor.
// - Controllers themselves are STATELESS strategies: update(vehicle, data, dt).
//
// BUS WIRING
// ----------------------------------------------------------------------------
// ClientInput emits onto TWO separate buses, and they are handled completely
// differently:
//
// - "mouseMove" -> an EFFECTS bus. Consumed immediately, every render frame,
//   at monitor refresh rate. Drives camera look / aim reticle only. NEVER
//   buffered, NEVER sent to the server, and NEVER touches VehicleManager.
// - "snapshot" (button/toggle actions) -> the SIMULATION lane. InputTranslator
//   turns this into { throttleDelta, steer } for whichever vehicle is
//   currently active and emits "intent". VehicleManager's intentBuffer drains
//   that on its own fixed tick. This IS what eventually gets broadcast to
//   other clients (via the vehicle's simulated state), just not per-mouse-move.
//
// Network snapshots arrive as ONE event per tick containing the WHOLE lobby's
// vehicle states ("worldSnapshot"), since the server doesn't know or care
// which client owns which vehicle — it just broadcasts everyone's state.
// authorityBuffer drains those and VehicleManager flattens+indexes them by id.
// ============================================================================

// ----------------------------------------------------------------------------
// Controllers: stateless. Each just knows how to turn "input for this vehicle"
// into a mutation of that vehicle. No maps, no buffers, no ids stored here.
// ----------------------------------------------------------------------------

const LocalController = {
    // intent: { throttleDelta, steer } for THIS vehicle only, already
    // translated + extracted by the manager from the intent buffer.
    //
    // TODO(reconciliation): this applies intent directly with no memory of
    // past inputs, so there's currently no way to "replay" from a corrected
    // baseline when an authoritative snapshot for the LOCAL player arrives.
    // To add that later without restructuring anything above this function:
    //   1. Give the manager a small ring buffer per local vehicle id that
    //      records { tick, intent } as it's applied.
    //   2. When a snapshot for a local vehicle shows up in authorityBuffer,
    //      snap vehicle state to it, then re-run this same update() for each
    //      buffered intent with a tick number > the snapshot's tick.
    update(vehicle, intent, dt) {
        if (!intent) return;
        vehicle.throttle = clamp(vehicle.throttle + intent.throttleDelta, -1, 1);
        vehicle.rotation += intent.steer * dt;
        integrate(vehicle, dt);
    },
};

const AIController = {
    // Drives any of THIS client's owned vehicles that aren't the active one.
    // brainOutput isn't sourced from either buffer — it comes from a
    // behavior tree / brain keyed by vehicle.id (see AISystem stub below).
    update(vehicle, brainOutput, dt) {
        if (!brainOutput) return;
        vehicle.throttle = clamp(vehicle.throttle + brainOutput.throttleDelta, -1, 1);
        vehicle.rotation += brainOutput.steer * dt;
        integrate(vehicle, dt);
    },
};

const NetworkController = {
    // snapshot: the latest authoritative { location, rotation, velocity } for
    // THIS vehicle, or undefined if nothing arrived this tick.
    // Reconciliation strategy: if we have a fresh snapshot, blend toward it
    // instead of snapping, so remote vehicles don't visibly teleport.
    update(vehicle, snapshot, dt) {
        if (snapshot) {
            const blend = 0.25; // lerp factor per tick towards authority
            vehicle.location.x += (snapshot.location.x - vehicle.location.x) * blend;
            vehicle.location.y += (snapshot.location.y - vehicle.location.y) * blend;
            vehicle.rotation += shortestAngleDelta(vehicle.rotation, snapshot.rotation) * blend;
            vehicle.velocity = { ...snapshot.velocity };
        } else {
            // No new snapshot this tick: keep coasting on last known velocity
            // so movement stays smooth between network updates.
            integrate(vehicle, dt);
        }
    },
};

const controllers = {
    local: LocalController,
    network: NetworkController,
    ai: AIController,
};

// ----------------------------------------------------------------------------
// InputTranslator: the only piece that knows both "what ClientInput's button
// snapshot looks like" and "what a vehicle's controller needs". Keeps
// ClientInput vehicle-agnostic and keeps VehicleManager input-source-agnostic.
// Deliberately has NOTHING to do with mouse movement — see CameraEffects below.
// ----------------------------------------------------------------------------

class InputTranslator {
    constructor(simulationBus, intentBus, manager) {
        this.manager = manager;

        // Every button/toggle change re-emits a full snapshot. That's our
        // cue to (re)compute intent for whichever vehicle is active right
        // now and push it out as an "intent" event.
        simulationBus.on("snapshot", (snapshot) => {
            const activeId = this.manager.activeVehicleId;
            if (activeId == null) return; // no vehicle to control yet

            const activeVehicle = this.manager.getVehicle(activeId);
            if (!activeVehicle) return;

            const intent = activeVehicle.inputMap(snapshot.actions);
            intentBus.emit("intent", { id: activeId, data: intent });
        });
    }
}

// ----------------------------------------------------------------------------
// CameraEffects: consumes mouse deltas directly off the EFFECTS bus, every
// frame, completely outside VehicleManager's tick. Nothing here is buffered
// and nothing here is ever sent to the server — nothing here even has a
// reference to a vehicle id. This is intentionally a dead end for the data:
// it exists purely to make local camera/aim feel instant regardless of
// network tick rate or server updates.
// ----------------------------------------------------------------------------

class CameraEffects {
    constructor(effectsBus) {
        this.yaw = 0;
        this.pitch = 0;

        effectsBus.on("mouseMove", (data) => {
            const SENSITIVITY = 0.002;
            this.yaw += data.deltaYaw * SENSITIVITY;
            this.pitch += data.deltaPitch * SENSITIVITY;
            // In the real client: apply directly to the camera/reticle
            // transform right here, same frame, no buffering.
        });
    }
}

// ----------------------------------------------------------------------------
// Boat: plain data + a couple of setters, plus the one place a vehicle knows
// how to turn RAW ACTION BOOLEANS into movement intent. ClientInput never
// needs to know this mapping exists — it just hands over actions/toggles.
// ----------------------------------------------------------------------------

class Boat {
    constructor(id) {
        this.id = id;
        this.teamId = null;
        this.ownerId = null; // fixed at lobby start, never changes for the match

        this.location = { x: 0, y: 0 };
        this.rotation = 0;
        this.velocity = { x: 0, y: 0 };
        this.throttle = 0;

        // Collision-system metadata. Kept here (not on CollisionSystem)
        // since it's a per-vehicle-type property, same reasoning as inputMap.
        this.layer = "vessel";
        this.hitboxSphereSize = 5;
        this.collidesWithTerrain = true;
    }

    setLocation(loc) {
        this.location = { ...loc };
    }

    setRotation(radians) {
        this.rotation = radians;
    }

    // Vehicle-specific input mapping. A plane would define its own version of
    // this with different bindings/feel — that's the whole reason this lives
    // on the vehicle rather than in InputTranslator or ClientInput.
    // Steering comes from buttons, not mouse — mouse is effects-only and
    // never reaches this far (see BUS WIRING note above).
    inputMap(actions) {
        const throttleDelta = actions.moveForward ? 0.02 : actions.moveBackward ? -0.02 : 0;
        const steer = actions.moveLeft ? -0.03 : actions.moveRight ? 0.03 : 0;
        return { throttleDelta, steer };
    }
}

// ----------------------------------------------------------------------------
// VehicleManager: owns vehicles + both buffers. Dispatches each vehicle to
// the correct stateless controller every tick.
// ----------------------------------------------------------------------------

class VehicleManager {
    // intentBus: LocalEventBus that InputTranslator emits "intent" onto.
    // networkBus: NetworkEventBus (or LocalEventBus stand-in) — used for BOTH
    // draining incoming "worldSnapshot" AND publishing this client's own
    // vehicle state out via networkBus.publish(). Two directions, one bus.
    constructor(localPlayerId, intentBus, networkBus) {
        this.vehicles = new Map();
        this.localPlayerId = localPlayerId;
        this.activeVehicleId = null; // which of MY vehicles is player-controlled right now
        this.networkBus = networkBus;

        this.intentBuffer = new EventBuffer(intentBus, "intent");
        this.authorityBuffer = new EventBuffer(networkBus, "worldSnapshot");
    }

    // lobbyData: [{ id, vehicle: "boat", ownerId, location, rotation, teamId, initiallyActive? }]
    // Ownership is fixed here for the whole match — never revisited after this.
    start(lobbyData) {
        lobbyData
            .filter((entry) => entry.vehicle === "boat")
            .forEach((entry) => this.add(entry));

        const initial = lobbyData.find(
            (e) => e.vehicle === "boat" && e.ownerId === this.localPlayerId && e.initiallyActive
        );
        if (initial) this.activeVehicleId = initial.id;
    }

    add(entry) {
        if (entry.vehicle !== "boat") {
            throw new Error(`Unknown vehicle type: ${entry.vehicle}`);
        }

        const vehicle = new Boat(entry.id);
        vehicle.ownerId = entry.ownerId;
        vehicle.teamId = entry.teamId;
        vehicle.setLocation(entry.location);
        vehicle.setRotation(entry.rotation ?? 0);

        this.vehicles.set(vehicle.id, vehicle);
        return vehicle;
    }

    getVehicle(id) {
        return this.vehicles.get(id);
    }

    // Pure local bookkeeping. No cross-player check needed — ownership
    // between players is fixed for the match, so just confirm the requested
    // vehicle is actually one of THIS client's own.
    switchControl(vehicleId) {
        const vehicle = this.vehicles.get(vehicleId);
        if (!vehicle || vehicle.ownerId !== this.localPlayerId) {
            throw new Error(`Cannot switch to vehicle ${vehicleId}: not owned by this player`);
        }
        this.activeVehicleId = vehicleId;
    }

    // What should drive this vehicle THIS tick, derived fresh every call.
    controllerFor(vehicle) {
        if (vehicle.ownerId !== this.localPlayerId) return "network";
        return vehicle.id === this.activeVehicleId ? "local" : "ai";
    }

    // Called once per tick from Game.fixedUpdate(). Order matters:
    //   1. Drain both buffers (whatever accumulated since last tick).
    //   2. Dispatch each vehicle to its controller — this is where vehicle
    //      state for THIS tick becomes final.
    //   3. Publish every vehicle THIS client owns — local AND ai-controlled
    //      alike — using the state that was JUST simulated in step 2, not
    //      the state from before this tick. Vehicles owned by other players
    //      are never published; they only ever get rendered from step 1's
    //      snapshots (see NetworkController).
    //
    // TODO(reconciliation): vehicles THIS client owns never read `snapshots`
    // right now — this client is authoritative for its own vehicles. If the
    // server ever needs to correct one of them, that correction would still
    // arrive on `authorityBuffer`; check it here for owned vehicles too.
    update(dt) {
        const intents = indexById(this.intentBuffer.drain());
        const snapshots = indexWorldSnapshots(this.authorityBuffer.drain());

        this.vehicles.forEach((vehicle) => {
            const controlSource = this.controllerFor(vehicle);
            const controller = controllers[controlSource];
            const input =
                controlSource === "network"
                    ? snapshots.get(vehicle.id)
                    : controlSource === "local"
                    ? intents.get(vehicle.id)
                    : undefined; // AI reads from its own brain — see AIController TODO
            controller.update(vehicle, input, dt);
        });

        this.vehicles.forEach((vehicle) => {
            if (vehicle.ownerId !== this.localPlayerId) return; // not ours to broadcast
            this.networkBus.publish("vehicleState", {
                id: vehicle.id,
                location: vehicle.location,
                rotation: vehicle.rotation,
                velocity: vehicle.velocity,
            });
        });
    }

    // ---- CollisionSystem hooks -------------------------------------------
    // CollisionSystem doesn't know or care what a "vehicle manager" is; it
    // just asks every manager to contribute colliders/renderables into a
    // shared output array.
    collectColliders(output) {
        this.vehicles.forEach((v) => {
            output.push({
                id: v.id,
                layer: v.layer,
                location: v.location,
                velocity: v.velocity,
                hitboxSphereSize: v.hitboxSphereSize,
                collidesWithTerrain: v.collidesWithTerrain,
                ownerId: v.ownerId,
                controlSource: this.controllerFor(v),
                entity: v,
            });
        });
    }

    collectRenderables(output) {
        this.vehicles.forEach((v) => {
            output.push({ id: v.id, type: "boat", location: v.location, rotation: v.rotation });
        });
    }
}

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

class PlaneManager {
    constructor(simulationBus, networkBus) {
        this.simulationBus = simulationBus;
        this.networkBus = networkBus;
        this.planes = new Map();
    }

    start(_lobbyData) {}

    update(_dt) {
        // TODO: same shape as VehicleManager, once plane flight model exists.
    }

    collectColliders(_output) {}

    collectRenderables(_output) {}
}

class AISystem {
    constructor(managers) {
        this.managers = managers;
    }

    update(_dt) {
        // TODO: for each AI-controlled vehicle across managers, compute
        // brainOutput and feed it in wherever AIController expects it.
    }
}

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

// ----------------------------------------------------------------------------
// helpers
// ----------------------------------------------------------------------------

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function integrate(vehicle, dt) {
    const speed = vehicle.throttle * 50; // arbitrary units/sec at full throttle
    vehicle.velocity = {
        x: Math.cos(vehicle.rotation) * speed,
        y: Math.sin(vehicle.rotation) * speed,
    };
    vehicle.location.x += vehicle.velocity.x * dt;
    vehicle.location.y += vehicle.velocity.y * dt;
}

function shortestAngleDelta(from, to) {
    let delta = (to - from) % (Math.PI * 2);
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
}

// "intent" events already arrive as { id, data } — one per emit.
function indexById(entries) {
    const map = new Map();
    entries.forEach((e) => map.set(e.id, e.data));
    return map;
}

// "worldSnapshot" events each carry the WHOLE lobby: { vehicles: [{id, ...}] }.
// Flatten every tick's worth of these (usually just one) into id -> state,
// last one wins if more than one arrived since the last drain.
function indexWorldSnapshots(entries) {
    const map = new Map();
    entries.forEach((snapshot) => {
        snapshot.vehicles.forEach((v) => map.set(v.id, v));
    });
    return map;
}

// createCamera wasn't defined in the original file either — thin wrapper so
// Game.setup has something real to call.
function createCamera(canvas, CameraClass) {
    const aspect = canvas.clientWidth / canvas.clientHeight || 16 / 9;
    return new CameraClass(60, aspect, 0.1, 5000);
}

// ----------------------------------------------------------------------------
// eventSchemas: required by NetworkEventBus — createSender validates outgoing
// publish() calls against these, and createReceiver only wires up
// socket.on(...) for events listed here (so unknown/unexpected socket
// messages are ignored rather than silently trusted). Only events that
// actually cross the client<->server boundary belong here — effects-only
// events (cameraShake, damageNumberPopup, mouseMove, etc.) never do, since
// those stay on LocalEventBus and never touch NetworkEventBus.
// ----------------------------------------------------------------------------

const eventSchemas = {
    // Sent client -> server -> other clients: "here's where my vehicles are now."
    vehicleState: (data) =>
        !!data &&
        typeof data.id !== "undefined" &&
        !!data.location && typeof data.location.x === "number" && typeof data.location.y === "number" &&
        typeof data.rotation === "number" &&
        !!data.velocity && typeof data.velocity.x === "number" && typeof data.velocity.y === "number",

    // Sent server -> client: "here's every vehicle in the lobby, this tick."
    worldSnapshot: (data) => Array.isArray(data?.vehicles),
};

const FIXED_DT = 1 / 60;

// ----------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------

export class Game {
    // socket: an already-connected transport (e.g. a socket.io client
    // instance) implementing on/off/emit/close — handed straight to
    // NetworkEventBus, which owns validating traffic against eventSchemas.
    constructor(localPlayerId, socket) {
        this.localPlayerId = localPlayerId;
        this.socket = socket;
        this.heightmap = createHeightmap();

        this.managers = [];
        this.systems = [];

        this.previousTime = 0;
        this.accumulator = 0;
    }

    setup(canvas, confirmedHeightmap) {
        this.heightmap = confirmedHeightmap ?? this.heightmap;

        this.scene = createScene();
        this.renderer = createRenderer(canvas, THREE.WebGLRenderer);
        this.camera = createCamera(canvas, THREE.PerspectiveCamera);
        this.canvas = canvas;

        // -------------------------------------------------------------------
        // Buses. See BUS WIRING note at the top of this file for why mouse
        // and buttons/toggles are split across effectsBus vs simulationBus.
        // -------------------------------------------------------------------
        const simulationBus = new LocalEventBus();
        const networkBus = new NetworkEventBus(this.socket, eventSchemas);
        const effectsBus = new LocalEventBus();
        const intentBus = new LocalEventBus();

        const vehicleManager = new VehicleManager(this.localPlayerId, intentBus, networkBus);
        const projectileManager = new ProjectileManager(simulationBus, networkBus);
        const planeManager = new PlaneManager(simulationBus, networkBus);

        this.managers = [vehicleManager, projectileManager, planeManager];

        // Translates button/toggle snapshots into per-vehicle intent, feeding
        // whichever vehicle is currently active in vehicleManager.
        this.inputTranslator = new InputTranslator(simulationBus, intentBus, vehicleManager);
        // Immediate, unbuffered, unnetworked mouse-look.
        this.cameraEffects = new CameraEffects(effectsBus);

        const soundManager = { play: (_name, _opts) => {} }; // TODO: real audio manager

        this.systems = [
            new CollisionSystem(this.managers, this.heightmap, {
                effectsBus,
                soundManager,
                projectileManager,
            }),
            new AISystem(this.managers),
        ];

        this.buses = { simulationBus, networkBus, effectsBus, intentBus };

        window.addEventListener("resize", this.handleWindowResize);
    }

    // starts when the host clicks start game
    // lobby data populates the managers with the quantity of components they need to create
    // and which internal systems they need to be assigned to
    //
    // Lobby Data Example:
    // [{ id, vehicle: "boat", ownerId, teamId, location, rotation, initiallyActive }]
    // "howControlled" (ai / client / network) is derived, not stored — see
    // VehicleManager.controllerFor / the OWNERSHIP MODEL note up top.
    start(lobbyData) {
        for (const manager of this.managers) {
            manager.start?.(lobbyData);
        }

        createSceneTerrain(this.scene, this.heightmap);

        this.previousTime = performance.now();
        this.accumulator = 0;

        this.handleWindowResize();

        this.renderer.setAnimationLoop(this.loop);
    }

    loop = (time) => {
        let frameTime = (time - this.previousTime) / 1000;
        this.previousTime = time;

        frameTime = Math.min(frameTime, 0.25); // clamp so tab-switch stalls don't cause a spiral of death

        this.accumulator += frameTime;

        while (this.accumulator >= FIXED_DT) {
            this.fixedUpdate(FIXED_DT);
            this.accumulator -= FIXED_DT;
        }

        this.renderer.render(this.scene, this.camera);
    };

    fixedUpdate(dt) {
        for (const manager of this.managers) {
            manager.update(dt);
        }

        for (const system of this.systems) {
            system.update(dt);
        }
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }

    handleWindowResize = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let width = windowWidth;
        let height = (width * 9) / 16;

        if (height > windowHeight) {
            height = windowHeight;
            width = (height * 16) / 9;
        }

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    };
}

// createSceneTerrain wasn't defined in the original file either — thin
// pass-through so Game.start has something real to call. Replace with the
// real terrain builder.
function createSceneTerrain(scene, heightmap) {
    // TODO: build terrain mesh from heightmap and add to scene.
    return { scene, heightmap };
}

// ----------------------------------------------------------------------------
// Self-contained smoke test for the vehicle/controller/input system. Doesn't
// touch Game/THREE/canvas at all (those need a real browser), so this is the
// part that can actually run end-to-end here in Node.
// ----------------------------------------------------------------------------

// Fake transport standing in for a real socket.io client: publish() ->
// socket.emit() -> loops straight back into socket.on() listeners, as if
// the server echoed the message straight back to this same client. Good
// enough to exercise NetworkEventBus's real validate-then-send/receive path
// without an actual server.
function createMockSocket() {
    const listeners = new Map();
    return {
        on(event, handler) {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event).add(handler);
        },
        off(event, handler) {
            listeners.get(event)?.delete(handler);
        },
        emit(event, data) {
            listeners.get(event)?.forEach((h) => h(data));
        },
        close() {},
    };
}

function testing() {
    const simulationBus = new LocalEventBus(); // button/toggle snapshots -> ticked intent
    const effectsBus = new LocalEventBus();     // mouse deltas -> immediate, unbuffered, unnetworked
    const intentBus = new LocalEventBus();      // InputTranslator -> VehicleManager
    const networkBus = new NetworkEventBus(createMockSocket(), eventSchemas); // real bus, fake transport

    const manager = new VehicleManager("P1", intentBus, networkBus);
    manager.start([
        { id: 1, vehicle: "boat", ownerId: "P1", location: { x: 0, y: 0 }, teamId: "A", initiallyActive: true },
        { id: 2, vehicle: "boat", ownerId: "P1", location: { x: 20, y: 0 }, teamId: "A" },
        { id: 3, vehicle: "boat", ownerId: "P2", location: { x: 0, y: 0 }, teamId: "B" },
    ]);

    new InputTranslator(simulationBus, intentBus, manager);
    const camera = new CameraEffects(effectsBus);

    for (let tick = 0; tick < 4; tick++) {
        // Mouse moves every frame regardless of tick — applied instantly via
        // CameraEffects, never reaching intentBus, never reaching the network.
        effectsBus.emit("mouseMove", { deltaPitch: 0, deltaYaw: 25 });

        // Player holds "up" — this is what drives the vehicle, via buttons.
        simulationBus.emit("snapshot", {
            timestamp: tick,
            actions: {
                moveForward: true, moveBackward: false,
                moveLeft: false, moveRight: false,
                fireProjectileLeft: false, fireProjectileRight: false,
            },
            toggles: { pointerLocked: true, toggleCamera: false, toggleTerrain: false, toggleFog: false },
        });

        // Simulate a server "worldSnapshot" broadcast for the whole lobby,
        // arriving every other tick (packet loss / lower send rate sim).
        // This client only actually USES boat 3's entry (boat 1/2 are its own).
        if (tick % 2 === 0) {
            networkBus.emit("worldSnapshot", {
                vehicles: [
                    { id: 3, location: { x: tick * 10, y: 2 }, rotation: 0.1 * tick, velocity: { x: 5, y: 0 } },
                ],
            });
        }

        // Mid-run: player switches from boat 1 to boat 2.
        if (tick === 2) {
            manager.switchControl(2);
        }

        manager.update(1 / 30);

        const b1 = manager.getVehicle(1);
        const b2 = manager.getVehicle(2);
        const b3 = manager.getVehicle(3);
        console.log(
            `tick ${tick} | active=${manager.activeVehicleId} | cam yaw=${camera.yaw.toFixed(3)} | ` +
            `boat1 pos=(${b1.location.x.toFixed(2)}, ${b1.location.y.toFixed(2)}) thr=${b1.throttle.toFixed(2)} | ` +
            `boat2 pos=(${b2.location.x.toFixed(2)}, ${b2.location.y.toFixed(2)}) thr=${b2.throttle.toFixed(2)} | ` +
            `boat3(P2, network) pos=(${b3.location.x.toFixed(2)}, ${b3.location.y.toFixed(2)})`
        );
    }
}

testing();
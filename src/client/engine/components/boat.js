
// ----------------------------------------------------------------------------
// Boat: plain data + a couple of setters, plus the one place a vehicle knows
// how to turn RAW ACTION BOOLEANS into movement intent. ClientInput never
// needs to know this mapping exists — it just hands over actions/toggles.
// ----------------------------------------------------------------------------

export class Boat {
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
 
        // Tuning for reconcile() blending — how fast a network-controlled
        // boat catches up to the authoritative snapshot per second.
        this.reconcileLerpRate = 8;
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
    // never reaches this far (see BUS WIRING note in Game.js).
    inputMap(actions) {
        const throttleDelta = actions.moveForward ? 0.02 : actions.moveBackward ? -0.02 : 0;
        const steer = actions.moveLeft ? -0.03 : actions.moveRight ? 0.03 : 0;
        return { throttleDelta, steer };
    }
 
    // called by controllers.local for the actively-controlled vehicle.
    // Consumes the { throttleDelta, steer } shape produced by inputMap().
    // This is the one place a boat's actual physics step lives.
    applyIntent(intent, dt) {
        this.throttle = clamp(this.throttle + intent.throttleDelta, -1, 1);
        this.rotation += intent.steer;
 
        const speed = this.throttle * MAX_SPEED;
        this.velocity = {
            x: Math.cos(this.rotation) * speed,
            y: Math.sin(this.rotation) * speed,
        };
 
        this.location = {
            x: this.location.x + this.velocity.x * dt,
            y: this.location.y + this.velocity.y * dt,
        };
    }
 
    // called by controllers.network for vehicles owned by other
    // players. NOT an instant teleport to the snapshot — that would make
    // every remote boat look jittery. Lerp position, slerp-equivalent
    // (shortest-angle) rotation, toward the latest snapshot instead.
    reconcile(snapshot, dt) {
        const t = clamp(this.reconcileLerpRate * dt, 0, 1);
 
        this.location = {
            x: lerp(this.location.x, snapshot.location.x, t),
            y: lerp(this.location.y, snapshot.location.y, t),
        };
 
        this.rotation = lerpAngle(this.rotation, snapshot.rotation, t);
        this.velocity = { ...snapshot.velocity };
    }
}
 
const MAX_SPEED = 12;
 
function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
}
 
function lerp(a, b, t) {
    return a + (b - a) * t;
}
 
// Shortest-path angle interpolation so a boat doesn't spin the long way
// around when the snapshot's heading wraps past ±π.
function lerpAngle(a, b, t) {
    let diff = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * t;
}

// ----------------------------------------------------------------------------
// BoatManager: owns Boat instances + both buffers. Dispatches each vehicle
// to the correct stateless controller every tick. Does NOT track which
// vehicle is "active" — that's VehicleCoordinator's job, shared across every
// vehicle-type manager, so switching from a boat to a plane works correctly.
//
// A PlaneManager would look identical to this file except for `new Plane(...)`
// in add() — everything else (controller dispatch, buffer draining,
// broadcast) is type-agnostic.
// ----------------------------------------------------------------------------
export class BoatManager {
    constructor(localPlayerId, intentBus, networkBus, coordinator) {
        this.vehicles = new Map();
        this.localPlayerId = localPlayerId;
        this.networkBus = networkBus;
        this.coordinator = coordinator; // shared, not owned
 
        this.intentBuffer = new EventBuffer(intentBus, "intent");
        this.authorityBuffer = new EventBuffer(networkBus, "worldSnapshot");
    }
 
    start(lobbyData) {
        lobbyData
            .filter((e) => e.vehicle === "boat")
            .forEach((entry) => this.add(entry));
 
        const initial = lobbyData.find(
            (e) => e.vehicle === "boat" && e.ownerId === this.localPlayerId && e.initiallyActive
        );
        if (initial) this.coordinator.setInitialActive(initial.id);
    }
 
    add(entry) {
        const vehicle = new Boat(entry.id);
        vehicle.ownerId = entry.ownerId;
        vehicle.teamId = entry.teamId;
        vehicle.setLocation(entry.location);
        vehicle.setRotation(entry.rotation ?? 0);
 
        this.vehicles.set(vehicle.id, vehicle);
        // CHANGED: pass the vehicle itself, not just its id/owner, so the
        // coordinator can hand it back out via getActiveVehicle().
        this.coordinator.register(vehicle.id, vehicle.ownerId, vehicle);
        return vehicle;
    }
 
    getVehicle(id) {
        return this.vehicles.get(id);
    }
 
    // switchControl(vehicleId) intentionally NOT here — call
    // coordinator.switchControl(vehicleId) directly from wherever input
    // handling lives. No manager-specific switching anymore.
 
    controllerFor(vehicle) {
        if (vehicle.ownerId !== this.localPlayerId) return "network";
        return this.coordinator.isActive(vehicle.id) ? "local" : "ai";
    }
 
    // Called once per tick from Game.fixedUpdate(). Order matters:
    //   1. Drain both buffers (whatever accumulated since last tick).
    //   2. Dispatch each vehicle to its controller — this is where vehicle
    //      state for THIS tick becomes final.
    //   3. Publish every vehicle THIS client owns — local AND ai-controlled
    //      alike — using the state JUST simulated in step 2. Vehicles owned
    //      by other players are never published; they're only ever
    //      rendered from step 1's snapshots.
    //
    // TODO(reconciliation): vehicles THIS client owns never read
    // `snapshots` right now — this client is authoritative for its own
    // vehicles. If the server ever needs to correct one of them, that
    // correction would still arrive on authorityBuffer; check it here for
    // owned vehicles too.
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
                    : undefined; // AI reads from its own brain — see controllers.js TODO
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
 



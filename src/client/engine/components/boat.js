
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






export class BoatManager {
    constructor(localPlayerId, intentBus, networkBus, coordinator) {
        this.vehicles = new Map();
        this.localPlayerId = localPlayerId;
        this.networkBus = networkBus;
        this.coordinator = coordinator;           // shared, not owned

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
        this.coordinator.register(vehicle.id, vehicle.ownerId);   // <-- new
        return vehicle;
    }

    // switchControl(vehicleId) REMOVED from here — call
    // coordinator.switchControl(vehicleId) directly from wherever input
    // handling lives. No manager-specific switching anymore.

    controllerFor(vehicle) {
        if (vehicle.ownerId !== this.localPlayerId) return "network";
        return this.coordinator.isActive(vehicle.id) ? "local" : "ai";   // <-- was this.activeVehicleId
    }

    // ...update(), collectColliders(), collectRenderables() unchanged
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
    update(dt, intents) {
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

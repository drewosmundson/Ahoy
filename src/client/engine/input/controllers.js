
// ----------------------------------------------------------------------------
// Controllers: stateless. Each just knows how to turn "input for this vehicle"
// into a mutation of that vehicle.
// ----------------------------------------------------------------------------


function integrate(vehicle, dt) {
    const speed = vehicle.throttle * 50; // arbitrary units/sec at full throttle
    vehicle.velocity = {
        x: Math.cos(vehicle.rotation) * speed,
        y: Math.sin(vehicle.rotation) * speed,
    };
    vehicle.location.x += vehicle.velocity.x * dt;
    vehicle.location.y += vehicle.velocity.y * dt;
}


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

export const controllers = {
    local: LocalController,
    network: NetworkController,
    ai: AIController,
};
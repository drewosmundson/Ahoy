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
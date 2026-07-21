

// Single source of truth for "which one vehicle, across every type, is this
// player currently driving." BoatManager/PlaneManager no longer track
// activeVehicleId themselves — they register their vehicles here and defer
// to isActive() every tick. Switching is done here too, so a switch to a
// plane automatically stops a boat from also being "active."
export class VehicleCoordinator {
    constructor(localPlayerId) {
        this.localPlayerId = localPlayerId;
        this.activeVehicleId = null;
        this.registry = new Map(); // vehicleId -> { ownerId }
    }

    // Called by each manager's add() so the coordinator knows who owns what,
    // without needing to know which manager/type a vehicle belongs to.
    register(vehicleId, ownerId) {
        this.registry.set(vehicleId, { ownerId });
    }

    unregister(vehicleId) {
        if (this.activeVehicleId === vehicleId) this.activeVehicleId = null;
        this.registry.delete(vehicleId);
    }

    // Used once at lobby start to seed the initially-active vehicle,
    // bypassing the ownership check below (nothing to switch "from" yet).
    setInitialActive(vehicleId) {
        this.activeVehicleId = vehicleId;
    }

    switchControl(vehicleId) {
        const entry = this.registry.get(vehicleId);
        if (!entry || entry.ownerId !== this.localPlayerId) {
            throw new Error(`Cannot switch to vehicle ${vehicleId}: not owned by this player`);
        }
        this.activeVehicleId = vehicleId;
    }

    isActive(vehicleId) {
        return vehicleId === this.activeVehicleId;
    }
}
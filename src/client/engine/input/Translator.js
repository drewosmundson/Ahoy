
// ----------------------------------------------------------------------------
// InputTranslator: the only piece that knows both "what ClientInput's button
// snapshot looks like" and "what a vehicle's controller needs". Keeps
// ClientInput vehicle-agnostic and keeps VehicleManager input-source-agnostic.
// Deliberately has NOTHING to do with mouse movement
// ----------------------------------------------------------------------------
// I think this just needs to be replaced by the buffer and not needed 
class InputTranslator {
    constructor(simulationBus, intentBus, coordinator) {
        // takes the shared VehicleCoordinator instead of a single
        // manager. The coordinator knows the active vehicle regardless of which manager actually owns it.
        this.coordinator = coordinator;

        simulationBus.on("snapshot", (snapshot) => {
            // one call replaces the old
            //   activeId = this.manager.activeVehicleId
            //   activeVehicle = this.manager.getVehicle(activeId)
            // pair. No manager-specific lookup, so it can't silently miss
            // a vehicle that belongs to a different manager than the one
            // this class was constructed with.
            const activeVehicle = this.coordinator.getActiveVehicle();
            if (!activeVehicle) return; // no vehicle to control yet

            const intent = activeVehicle.inputMap(snapshot.actions);
            intentBus.emit("intent", { id: activeVehicle.id, data: intent });
        });
    }
}
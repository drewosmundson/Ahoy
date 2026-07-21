
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

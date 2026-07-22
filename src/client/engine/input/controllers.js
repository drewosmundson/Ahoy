
// Controllers know how to apply each type of input to the given vehicle
// a user boat that is controlled by the user 

/*
1. Something calls coordinator.switchControl(newVehicleId)
This isn't triggered by ClientInput/InputTranslator in what we've built so far — presumably a key binding like toggleCamera-style toggle, or a UI action, calls this directly. It does one thing:

javascript
switchControl(vehicleId) {
    const entry = this.registry.get(vehicleId);
    if (!entry || entry.ownerId !== this.localPlayerId) {
        throw new Error(...);
    }
    this.activeVehicleId = vehicleId;
}

That's the entire state change. The old active vehicle isn't touched, told, or flagged in any way. There's no wasActive cleanup step — because "active" was never a property on the vehicle to begin with, only ever a single id living on the coordinator.

2. Next fixed tick, controllerFor re-evaluates from scratch for every vehicle

javascript
controllerFor(vehicle) {
    if (vehicle.ownerId !== this.localPlayerId) return "network";
    return this.coordinator.isActive(vehicle.id) ? "local" : "ai";
}

This runs fresh every tick for every owned vehicle, so:

The vehicle you just switched to → isActive() now returns true → "local".
The vehicle you just switched from → isActive() now returns false → "ai".

Nothing decided "this one becomes AI now" — it just fell out of the same one-line check no longer matching, the same way it would for any vehicle that was never active.

3. InputTranslator picks up the new active vehicle automatically
It doesn't need to be told either — it asks the coordinator fresh on every snapshot event:

javascript
const activeVehicle = this.coordinator.getActiveVehicle();

So the very next button press after a switch produces intent for the new vehicle, not the old one, with zero coordination required between InputTranslator and whichever manager owns which vehicle.

The practical effect: the previously-local vehicle doesn't "hand off" state to its AI controller — it just starts getting AIController.update(vehicle, brainOutput, dt) called on it next tick instead of LocalController.update(...). Whatever brainOutput is (per your TODO, a behavior tree keyed by vehicle.id) needs to pick up from wherever the vehicle physically is/was facing when control dropped — there's no transition state, so if the AI brain assumes it's always been driving, that's worth double-checking once it's built. */ 


const LocalController = {
    update(vehicle, intent, dt) {
        if (intent) {
            vehicle.applyIntent(intent, dt); 
        } else {
            vehicle.coast(dt); 
        }
    },
};

const NetworkController = {
    update(vehicle, snapshot, dt) {
        if (snapshot) {
            vehicle.reconcile(snapshot, dt);
        } else {
            vehicle.coast(dt); 
        }
    },
};

const AiController = {
    update (vehicle, brainActions, dt) {
        if (brainActions.vehicle.id) {
            vehicle.applyIntent(snapshot, dt);
        } else {
            vehicle.coast(dt); 
        }
    }
}


export const controllers = {
    local: LocalController,
    network: NetworkController,
    ai: AIController,
};
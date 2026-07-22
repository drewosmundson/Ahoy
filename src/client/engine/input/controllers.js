
// Controllers know how to apply each type of input to the given vehicle
// a user boat that is controlled by the user 

/*
1. Calls coordinator.switchControl(newVehicleId)

        switchControl(vehicleId) {
            const entry = this.registry.get(vehicleId);
            if (!entry || entry.ownerId !== this.localPlayerId) {
                throw new Error(...);
            }
            this.activeVehicleId = vehicleId;
        }

The old active vehicle isn't touched, told, or flagged in any way. There's no wasActive cleanup step.
"active" was never a property on the vehicle to begin with, only ever a single id living on the coordinator.

2. Next fixed tick, controllerFor re-evaluates from scratch for every vehicle
        controllerFor(vehicle) {
            if (vehicle.ownerId !== this.localPlayerId) return "network";
            return this.coordinator.isActive(vehicle.id) ? "local" : "ai";
        }

3. InputTranslator picks up the new active vehicle automatically
        const activeVehicle = this.coordinator.getActiveVehicle();
*/ 


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
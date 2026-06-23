











class AiInput { 
    constructor(localEventHandler, networkEventHandler) {
        this.updateBrain = this.randomMovements;
        this.actionPercent = { 
            moveForward: 0,
            moveBackward: 0,
            moveLeft: 0,
            moveRight: 0,
            fireProjectileLeft: 0,
            fireProjectileRight: 0,
        };

        this.actions = {
            moveForward:  false,
            moveBackward: false,
            moveLeft:     false,
            moveRight:    false,
            fireProjectileLeft:  false,
            fireProjectileRight: false,
        };

        this.toggles = {
            pointerLocked: false,
            toggleCamera:  false,
            toggleTerrain: false,
            toggleFog:     false,
        };
    }


    randomMovements(heightmap, boats) { 
        this.actionPercent.moveForward += 100
    }

    calculateNextAction() { 
        const willEmit = false
        for(const [key, value] of Object.entries(this.possibleActions)) {
            if ( value > 100 )
            this.possibleActions[key] = 0; 
            actions[key] = true;
            willEmit = true
        } 
        if (!willEmit) {
            return false
        }
        return true
    } 

    getSnapshot() {
        const snapshot = {
            timestamp: performance.now(),
            actions: { ...this.actions },
            toggles: { ...this.toggles },
            mouse: {
                deltaPitch: this.mouseMovement.deltaPitch,
                deltaYaw: this.mouseMovement.deltaYaw,
            }
        }
        this.resetOneTimeActions();
        return snapshot
    }
    
   update() { 
        this.updateBrain()
        this.actions = calculateNextActions
        const snapshot = this.getSnapshot()
        this.localEventHandler.emit("snapshot", snapshot);
        //this.networkEventHandler.emit("snapshot", snapshot);
    } 
    
}

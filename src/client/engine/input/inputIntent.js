


// TODO: turn this into a function now that is stateless


class ClientInput {
    constructor(eventBus) {
        this.keyBindings = {
            0:          'fireProjectileLeft',
            2:          'fireProjectileRight',
            KeyW:       'moveForward',
            ArrowUp:    'moveForward',
            KeyS:       'moveBackward',
            ArrowDown:  'moveBackward',
            KeyA:       'moveLeft',
            ArrowLeft:  'moveLeft',
            KeyD:       'moveRight',
            ArrowRight: 'moveRight',
            KeyM:       'showMap',
            KeyC:       'toggleCamera',
            KeyP:       'toggleTerrain',
            KeyF:       'toggleFog',
            Escape:     'exitPointerLock',
        };
        
        // Empty object that is modified on event to limit object creation
        this.actionData = {
            timestamp: 0
            action: 0
        }

        // Keydown event TODO: add Gamepad Down 
        const downActionHandler = (event) => {
            const data = this.handleActionEvent(event);
            if (!data) return;
            eventBus.emit("buttonPressed", data);
        };
        
        ["keydown", "mousedown"].forEach(type => {
            document.addEventListener(type, downActionHandler);
        });


        // Keyup TODO: add Gamepad up
        const upActionHandler = (event) => {
            const data = this.handleActionEvent(event);
            if (!data) return;
            eventBus.emit("buttonReleased", data);
        };
        
        ["keyup", "mouseup"].forEach(type => {
            document.addEventListener(type, upActionHandler);
        });


        // Mouse Movement Event 
        document.addEventListener("mousemove", (event) => {
            eventBus.emit("mouseMovement", event.movementX, event.movementY)
        });
    }

    handleActionEvent(event) {
        if (event.repeat) return;
        const eventCode = event.code;
        const eventButton = event.button
        const action = this.keyBindings[eventCode] ?? this.keyBindings[eventButton];
        if (!action) return;
        const data = this.actionData;
        data.timestamp = performance.now(),
        data.action = action;
        return data 
    }
}

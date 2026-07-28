





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

        this.mouseMovementData = {
            timestamp: 0,
            dx: 0,
            dy: 0,
        };

        this.actionData = {
            timestamp: 0,
            action: 0,
        }

        // Keydown Event
        const downActionHandler = (event) => {
            const data = this.handleActionEvent(event);
            if (!data) return;
            eventBus.emit("buttonPressed", data);
        };

        ["keydown", "mousedown"].forEach(type => {
            document.addEventListener(type, downActionHandler);
        });


        // Keyup Event 
        const upActionHandler = (event) => {
            const data = this.handleActionEvent(event);
            if (!data) return;
            eventBus.emit("buttonReleased", data);
        };
        ["keyup", "mouseup"].forEach(type => {
            document.addEventListener(type, upActionHandler);
        });


        // Mouse Movement Event
        const movementActionHandler = (event) => {
            const data = this.handleMovementEvent(event);
            if (!data) return;
            eventBus.emit("mouseMovement", data);
        };
        ["mousemove"].forEach(type => {
            document.addEventListener(type, movementActionHandler);
        });
    }

    handleActionEvent(event) {
        const eventCode = event.code;
        const eventButton = event.button
        const action = this.keyBindings[eventCode] ?? this.keyBindings[eventButton];
        if (event.repeat) return;
        if (!action) return;
        const data = this.actionData;
        data.timestamp = performance.now(),
        data.action = action;
        return data 
    }

    handleMovementEvent(event) {
        const data = this.mouseMovementData;
        data.timestamp = performance.now();
        data.dx = event.movementX;
        data.dy = event.movementY;
        return data;
    }


    removeEventListeners() {
        ["keydown", "mousedown"].forEach(type => {
            document.removeEventListener(type, downActionHandler);
        });

        ["keyup", "mouseup"].forEach(type => {
            document.removeEventListener(type, upActionHandler);
        });

        ["mousemove"].forEach(type => {
            document.removeEventListener(type, movementActionHandler);
        });
    }
}

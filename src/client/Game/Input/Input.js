class ClientInput {
    constructor(events) {
        this.events = events;

        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
            this.update();
        });
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
            this.update();
        });
        document.addEventListener('mousedown', (event) => {
            this.handleKeyDown(event);
            this.update();
        });
        document.addEventListener('mouseup', (event) => {
            this.handleKeyUp(event);
            this.update();
        })
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
            this.updateMouse()
        });

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
            KeyC: 'toggleCamera',
            KeyP: 'toggleTerrain',
            KeyF: 'toggleFog',
            Escape: 'exitPointerLock',
        };
        // make this into a bitmask to compare against what changed then emit what changed
        // example last emit
        //wsad LR   pctf xy
        //0000 0000 0000 0000
        //0000 0100 1000 0000

        this.actions = {
            moveForward:  false,
            moveBackward: false,
            moveLeft:     false,
            moveRight:    false,
            fireProjectileLeft:  false,
            fireProjectileRight: false,
        }

        this.toggles = {
            pointerLocked: false,
            toggleCamera:  false,
            toggleTerrain: false,
            toggleFog:     false,
        }

        this.mouseMovement = {
            deltaPitch: 0, 
            deltaYaw:   0,
        }
    }

    handleKeyDown(event) {
        const eventCode = event.code;
        const eventButton = event.button
        const buttonPressed = this.keyBindings[eventCode] ?? this.keyBindings[eventButton];
        if (!buttonPressed) return;
        if (!event.repeat && this.actions[buttonPressed] !== undefined) {
            this.actions[buttonPressed] = true;
        }
        if (!event.repeat && this.toggles[buttonPressed] !== undefined) {
            this.toggles[buttonPressed] = !this.toggles[buttonPressed];
        }
    }

    handleKeyUp(event) {
        const eventCode = event.code;
        const eventButton = event.button;
        const buttonReleased = this.keyBindings[eventCode] ?? this.keyBindings[eventButton];
        if (!buttonReleased) return;
        if ( this.actions[buttonReleased] !== undefined) {
            this.actions[buttonReleased] = false;
        }
    }

    handleMouseMove(event) {
        if (!this.toggles.pointerLocked) return;
        this.mouseMovement.deltaPitch += event.movementY;
        this.mouseMovement.deltaYaw   += event.movementX;
    }

    // Actions that need to be reset to their default go here
    resetOneTimeActions() {

    }
    // It is very unlikely that this will ever be needed as event.movementX resets to 0 after each event and update() is called after each event
    // this function exists for safty and asurance that the same movement of the mouse will always be deterministic
    resetMouse() {
        this.mouseMovement.deltaPitch = 0;
        this.mouseMovement.deltaYaw = 0;
        // this.mouseMovement.mousewheel = 0;
    }

    getSnapshot() {
        const snapshot = {
            timestamp: performance.now(),
            actions: { ...this.actions },
            toggles: { ...this.toggles },
        }
        return snapshot
    }

    update() { 
        const mouseData = this.mouseMovement
        this.events.emit("mouseMove", mouseData);
        this.resetMouse() 

        const snapshot = this.getSnapshot()
        this.events.emit("snapshot", snapshot);
        this.resetOneTimeActions() 
    } 
}

q

class boat {

    constructor() {

    }
}

// consumes intent produced by controllers
class boatMovementSystem {

    constructor(){


    }

}

// produces intent based on snapshots
class boatController {
    constructor(){



    }
}

networkController() {}

class NetworkInputManager {
    constructor(inputSource)
    
    }

// receives buffer snapshots from inputSource
class ClientInputManager {
    constructor(inputSourceCallback) {
        this.inputSource = inputSource;
        this.snapshotBuffer = [];
    }

    changeInputSource(inputSource) {
        this.inputSource = inputSource;
    }

    pollInputs() {
        const snapshot = this.snapshotBuffer;
        this.snapshotBuffer = [];
        return snapshot;
    }
    
    sendData() {



    }
    update() {
        this.snapshotBuffer.push(this.inputSource.getSnapshotBuffer());
        // for memory safty it is very unlikley this will ever trigger for client inputs.
        // it may flip if used for network inputs and connection is suddenly lost or very slow
        if (this.snapshotBuffer.length > 100) {
            this.snapshotBuffer.shift();
        }
    }
}

// async operations
class clientInput {
    constructor() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event.code);
        });
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event.code);
        });
        document.addEventListener('mousedown', (event) => {
            this.handleKeyDown(event.button);
        });
        document.addEventListener('mouseup', (event) => {
            this.handleKeyUp(event.button);
        })
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
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

    handleKeyDown(eventType) {
        const buttonPressed = this.keyBindings[eventType];
        if (!buttonPressed) return;
        if (buttonPressed in this.actions) {
            this.actions[buttonPressed] = true;
        }
        if (buttonPressed in this.toggles) {
            this.toggles[buttonPressed] = !this.toggles[buttonPressed];
        }
    }

    handleKeyUp(eventType) {
        const buttonReleased = this.keyBindings[eventType];
        if (!buttonReleased) return;
        if (buttonReleased in this.actions) {
            this.actions[buttonReleased] = false;
        }
    }

    handleMouseMove(event) {
        if (!this.toggles.pointerLocked) return;
        this.mouseMovment.deltaPitch += event.movementX;
        this.mouseMovment.deltaYaw   += event.movementY;
    }

    resetOnetimeActions() {
        // Actions that need to be reset to their default go here
        this.mouseMovment.deltaPitch = 0;
        this.mouseMovment.deltaYaw = 0;
        // this.mouseMovment.mousewheel = 0;
    }

    getSnapshot() {
        const snapshot = {
            timestamp: performance.now(),
            actions: { ...this.actions },
            toggles: { ...this.toggles },
            mouse: {
                deltaPitch: this.mouseMovment.deltaPitch,
                deltaYaw: this.mouseMovment.deltaYaw,
            }
        }
        this.resetOnetimeActions();
        return snapshot
    }
    emitLocally(snapshot) 
    
    emitToNetwork(snapshot) {
        
        } 
    update() { 
        const snapshot = getSnapshot()
        emitLocally(snapshot)
        emitToNetwork(snapshot)
    } 
}

export class Game {

    constructor(dependacies) {
        this.loadDependancies(dependacies)
    }

    loadDependancies(dependacies) {
        this.THREE = dependacies.THREE
        this.utils = dependacies.utils
        this.world = dependacies.world
    }

    setup(canvas, heightmap, networkHandler) {
        const scene = new this.THREE.Scene();
        this.heightmap = heightmap ?? this.utils.createHeightmap();
        this.worldComponents = this.world.createWorldComponents(scene, heightmap);
        this.renderer = this.utils.createRenderer(canvas, this.THREE.WebGLRenderer);

        this.playerInput = new ClientInput(networkHandler)
        this.AiInput = createAiInputManager(networkHandler)
        this.remoteInput = createRemoteInputManager(networkHandler)

        window.addEventListener('resize', this.handleWindowResize);
    }


    start() {
        this.handleWindowResize();
        this.renderer.setAnimationLoop((time) => {
            this.update(time);
            this.renderer.render(this.scene, this.camera);
        });
    }
    update(time) {



    }
  
    stop() {
        this.renderer.setAnimationLoop(null);
    }
}



    // FRAME START
/*
1. NetworkManager receives snapshots asynchronously
   - buffers snapshots
   - stores authoritative states
   AI Brain updates every few hundred frames adds to intent state
   user input is taken ready to be pulled adds to intent state

2. Managers assign controllers to certain objects one of each r
   - PlayerController pulls from PlayerInputSource 
   - AIController pulls from AIInputSource 
   - NetworkController/RemoteController pulls from snapshot buffer

3. Controllers update locally controlled entities
   - PlayerController pulls from PlayerInputSource
   - AIController pulls from AIInputSource
   - NetworkController/RemoteController pulls from snapshot buffer

4. Locally controlled entities simulate immediately
   - local boat movement
   - local projectiles
   - local sounds

6. Send local player inputs to server

7. Remote entities interpolate/extrapolate
   - interpolate between snapshots
   - extrapolate briefly if next snapshot missing

8. Reconcile locally predicted entities
   - compare predicted state vs authoritative snapshot
   - apply soft correction

9. Render scene

*/
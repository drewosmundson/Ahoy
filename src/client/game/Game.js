
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createWorld } from "./world/world.js"
import { createCamera } from './components/Camera.js';


class boatController(inputManagerInstance, boatInstance){}




// receives buffer snapshots from inputSource
// dual use for accepting local changes as well as network updates
// it is this way so that all controllers accept the same API structure
class InputManager {
    constructor(EventHandler) {
        this.eventHandler = EventHandler
        this.snapshotBuffer = [];

        this.eventHandler.on('snapshot', (snapshot) => {
            this.snapshotBuffer.push(snapshot);
        });
    }

    changeInputSource(NewEventHandler) {
        this.eventHandler = NewEventHandler;
    }

    pollInputs() {
        const snapshot = this.snapshotBuffer;
        this.snapshotBuffer = [];
        return snapshot;
    }
}

class NetworkEventHandler {
    constructor(network) {

    }
    on(event, callback) {


    }
    emit(event, data) {


    }
}

//i think local and remove event handler can be merged into one class

class LocalEventHandler {
    constructor() {
        this.listeners = new Map();
    }
    on(event, callback) {
        if(!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    emit(event, data){
        const callbacks = this.listeners.get(event);

        if(!callbacks) return;

        for (const callback of callbacks) {
            callback(data);
        }
    }
}


class AiInput { 
    constructor(localEventHandler, networkEventHandler)
        this.mode = this.randomMovents
        this.lastActions = null 
        this.actionPercent = { 
            moveForward = 0
            moveBackward = 0 
            moveLeft = 0 
            moveRight = 0 
            fireProjectileLeft  = 0 
            fireProjectileRight = 0 
        }
    } 

    randomMovements(heightmap, boats) { 
        this.actionPercent.moveForward += 100
    }
    
    calculateNextAction() { 
        const acrions = {
            moveForward: false
            moveBackward: false
            moveLeft: false
            moveRight: false
            fireProjectileLeft: false
            fireProjectileRight: false 
        }
        const willEmit = false
        for(const [key, value] of Object.entries(this.possibleActions)) {
            if ( value > 100 )
            this.possibleActions[key] = 0; 
            actions[key] = true;
            willEmit = true
        } 
        if (!willEmit) {
            return 
        }
        
        return actions
    } 
    
    
    updateBrain(heightmap, boats) {
        this.mode(heightmap, boats)
        return this.calculateNextAction()
    } 
    
    
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
        this.actions = aiBrain.update()
        const snapshot = this.getSnapshot()
        this.localEventHandler.emit("snapshot", snapshot);
        //this.networkEventHandler.emit("snapshot", snapshot);
    } 
    
}

class ClientInput {
    constructor(localEventHandler, networkEventHandler) {
        this.localEventHandler = localEventHandler;
        this.networkEventHandler = networkEventHandler;

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
            this.update();
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
        this.mouseMovement.deltaPitch = 0;
        this.mouseMovement.deltaYaw = 0;
        // this.mouseMovement.mousewheel = 0;
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
        const snapshot = this.getSnapshot()
        this.localEventHandler.emit("snapshot", snapshot);
        //this.networkEventHandler.emit("snapshot", snapshot);
    } 
}

export class Game {
    constructor(network) {
        this.networkEventHandler = new NetworkEventHandler(network);
        this.localEventHandler = new LocalEventHandler();
        this.heightmap = createHeightmap();
    }

    setup(canvas) {
        this.scene = new THREE.Scene();
        this.renderer = createRenderer(canvas, THREE.WebGLRenderer);
        this.camera = createCamera(canvas, THREE.PerspectiveCamera);
        this.canvas = canvas

        this.clientInput = new ClientInput(this.localEventHandler, this.networkEventHandler);
        this.clientInputManager = new InputManager(this.localEventHandler); 
        this.networkInputManager = new InputManager(this.networkEventHandler)

        this.world = createWorld(this.scene, this.heightmap);

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
        const snapshots = this.clientInputManager.pollInputs();
        if (snapshots.length > 0) {
            console.log('[InputManager] snapshots this frame:', snapshots);
        }
    }
    stop() {
        this.renderer.setAnimationLoop(null);
    }

    handleWindowResize = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let width = windowWidth;
        let height = (width * 9) / 16;

        if (height > windowHeight) {
        height = windowHeight;
        width = (height * 16) / 9;
        }

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
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
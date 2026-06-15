
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/createHeightmap.js"
import { createRenderer } from "./utils/createRenderer.js"
import { createWorld } from "./world/createWorld.js"



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


class ClientInput {
    constructor(localEmitter, networkEmitter) {
        this.localEmitter = localEmitter;
        this.networkEmitter = networkEmitter;

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
        this.localEmitter.emit("snapshot", snapshot);
        //this.networkEmitter.emit("snapshot", snapshot);
    } 
}

export class Game {
    constructor(networkEventHandler) {
        this.networkEventHandler = networkEventHandler;
        this.heightmap = createHeightmap();
    }
    setHeightmap(newHeightmap) {
        this.heightmap = newHeightmap;
    }
    getHeightmap() {
        const heightmap = this.heightmap;
        return heightmap
    }
    setup(canvas) {
        const scene = new THREE.Scene();
        this.world = createWorld(scene, this.heightmap);
        this.renderer = createRenderer(canvas, THREE.WebGLRenderer);

        this.localEventHandler = new LocalEventHandler();

        this.clientInput = new ClientInput(this.localEventHandler, this.networkEventHandler);
        this.inputManager = new InputManager(this.localEventHandler); 

        this.tempUpdateForTesting();

        window.addEventListener('resize', this.handleWindowResize);
    }


    tempUpdateForTesting() {
        const loop = () => {
            const snapshots = this.inputManager.pollInputs();

            if (snapshots.length > 0) {
                console.log('[InputManager] snapshots this frame:', snapshots);
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
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
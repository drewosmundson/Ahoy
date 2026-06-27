
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createWorld } from "./world/world.js"
import { createCamera } from './components/Camera.js';
import { events } from "../../shared/realtimeEvents.js"


import BoatManager from "./BoatManager.js";
import CameraManager from "./CameraManager.js";
import OrbitCamera from "./cameras/OrbitCamera.js";

const boatManager = new BoatManager();
const cameraManager = new CameraManager();



export default class PlayerControlSystem {

    constructor(
        emit
        input,
        boats,
        //planes 
        //tanks 
        cameras
    ) {
        this.input = input;
        this.boats = boats;
        this.cameras = cameras;
    }

    emit.on( snapshot recieved) 

        if (
            this.input.pressed("TAB")
        ) {

            const boat =
                this.boats.next();

            this.boats
                .setActiveBoat(
                    boat.id
                );

            this.cameras
                .follow(
                    boat
                );
        }
    }
}




cameraManager.set(
    new OrbitCamera()
);

cameraManager.current.setTarget(
    boatManager.activeBoat
);





class Boat {



}


class BoatController {
    constructor (inputManagerInstance, boatInstance) {

    }
}
class camera {
    constructor(

}


class cameraController { 
    
    
    
    }


// receives buffer snapshots from inputSource ansny via eventHandler
// dual use for accepting local changes as well as network updates
// it is this way so that all controllers accept the same API structure

// flatten into bitmask to be sent to the server and controller
class NetworkManager  {
    constructor(events, network) {
        this.network = network
        this.actionBuffer = [];
        this.toggleBuffer = [];
        

        this.eventHandler.on('action', (actionSnapshot) => {
            this.actionBuffer.push(actionSnapshot);
        });
        this.eventHandler.on('toggle', (toggleSnapshot) => {
            this.toggleBuffer.push(toggleSnapshot);
        });
        this.eventHandler.on("camera", (cameraSnapshot) => {
            this.cameraBuffer.push(cameraSnapshot)
        });
    }

    flattenBuffer(snapshotBuffer) {
        const flattenedBuffer = {};
        snapshotBuffer.forEach(snapshot => {
            Object.entries(snapshot).forEach(([key, value]))
            if (value == true && Object.hasOwn(flattenedBuffer, key)) {
                
            }
        }
    }
    // send to server 
    // send recived to controllers authoratativly 
    update() {
        
    
    } 
}


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


export class Game {
    constructor(network) {
        this.network = network;
        this.events = events; 

        this.heightmap = createHeightmap();
    }

    setup(canvas) {
        this.scene = new THREE.Scene();
        this.renderer = createRenderer(canvas, THREE.WebGLRenderer);
        this.camera = createCamera(canvas, THREE.PerspectiveCamera);
        this.canvas = canvas

        this.eventHandler = new EventHandler()
        this.clientInput = new ClientInput(this.eventHandler);
        this.InputManager = new InputManager(this.eventHandler);


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
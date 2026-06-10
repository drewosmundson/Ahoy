
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/Heightmap.js"

import { createRenderer  } from './world/Renderer.js';

import { TerrainRenderer } from "./world/Terrain.js";
import { generateTerrain } from "./utils/hightmapGenerator.js";

import { createSoundManager } from "./utils/SoundManager.js"

import { GAME_CONSTANTS } from "./utils/GAME_CONSTANTS.js";
import { createInputManager } from './utils/InputManager.js';

// game lazely gets raw inputs from these 3 classes


// does not know anythjng about boats
//  or inputs just tells the camera controller where it ahoukd be 
// and what type of camera based on input and game events 
class CameraPerspectiveManager{} 




class CameraController {
  constructor(camera) {
    this.camera = camera;
  }
  update(dt) {}
}

class OrbitCameraController extends CameraController {
  constructor(camera, target, domElement) {
    super(camera);
    this.controls = new OrbitControls(camera, domElement, target,);
  }
  update(dt) {
    this.controls.update();
  }
}

class RTSCameraController extends CameraController{
  update(){}
}

class FollowCameraController extends CameraController {
  constructor(camera, target) {
    super(camera);
    this.target = target;
  }

  update(dt) {
    const desiredPosition =
      this.target.position
        .clone()
        .add(new THREE.Vector3(0, 10, -20));

    this.camera.position.lerp(
      desiredPosition,
      0.1
    );

    this.camera.lookAt(
      this.target.position
    );
  }
}

class camera{}


// keydown event handlers 
class ClientButtonInput {
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

    this.mouseMovment = {
      lastYaw: 0,
      lastPitch: 0,
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
      this.toggles[buttonPressed] = !this.toggles[button];
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
    if (!this.toggles.isPointerLocked) return;
    this.deltaPitch = event.movementX - this.mouseMovment.lastPitch;
    this.deltaYaw = event.movementY - this.mouseMovment.lastYaw;
    this.lastPitch = event.movementX;
    this.lastYaw = event.movementY;
  }

  getState(category, key) {
    if (!this[category]) return;
    return this[category][key];
  }
}

//ai brain
class AiInputGenerator {
  getState() {
    return {
      throttle: 1,
      left: Math.random() > 0.5,
      right: false,
      fire: false
    };
  } 
}
// manages which boats are controlled by the user or the ai on client side 
// the user can transfer boat pov and control
class UserInputManager { 
  
  
  
  } 



// server message receiver 
class NetworkInput {

  newEntityUpdates() {

  }
  getState() {
    return this.latestServerInput;
  }
} 
// i dont think i will nedd this class as networkInput is authoratative 
// this is more for one time events like spawning new bosts arriving from the remote user 
class networkManager{}

class BoatController {
  constructor(boat, inputSource) {
    this.boat = boat;
    this.inputSource = inputSource;
  }

  setInputSource(inputSource) {
    this.inputSource = inputSource;
  }

  update(dt) {
    const input =
      this.inputSource.getState();

    this.boat.move(input, dt);
  }
}

export class LocalBoatController
  extends BoatController {

  update(dt) {

    const input =
      this.inputSource.getState();

    this.boat.simulateMovement(
      input,
      dt
    );

    if (input.fireLeft) {
      this.boat.fireLeft();
    }

    if (input.fireRight) {
      this.boat.fireRight();
    }
  }
}

export class RemoteBoatController
  extends BoatController {

  update(dt) {

    const state =
      this.inputSource.getState();

    if (!state) {
      return;
    }

    this.boat.position.lerp(
      state.position,
      0.1
    );

    this.boat.rotation.y =
      lerpAngle(
        this.boat.rotation.y,
        state.rotation,
        0.1
      );
  }
}

export class Game {
  constructor(canvas) {
    this.heightmap = createHeightmap();
  }

  setup(canvas, networkHandler) {
    
    const scene = new THREE.Scene();
    this.canvas = canvas
    this.renderer = createRenderer(this.canvas, THREE.WebGLRenderer);

    this.worldComponents = createWorldComponents(scene, this.heightmap);

    this.playerInput = createPlayerInputManager(networkHandler) // Client -> Server
    this.AiInput = createAiInputManager(networkHandler)         // Client -> Server
    this.remoteInput = createRemoteInputManager(networkHandler) // Server -> Client

    this.controllers = new Map();

    window.addEventListener('resize', this.handleWindowResize);
  }

  #createWorldComponents(scene, heightMap) {
    return {
      lighting: createLighting(scene),
      terrain: createTerrain(scene, heightmap),
      water: createWater(scene),
      skybox: createSkybox(scene),
    }
  }

/// switches the users camera from orbit controlls 
// to follow to rts cam spectator 
  setCameraController(camera Controller){
    this.cameraController = cameraComtroller
    }
    
  createBoat(inputSource) {
    const boat = new Boat(this.scene);
  
    const controller =
      new BoatController(
        boat,
        inputSource
      );
  
    this.controllers.push(controller);
  
    return {
      boat,
      controller
    };
  }

  update(time) { 
     

  }
  
  start() {
    this.handleWindowResize();
    this.renderer.setAnimationLoop((time) => {
      this.update(time);
      this.renderer.render(this.scene, this.camera);
    });
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




   OBJECts should be the ones wiht controllers 
2. Managers assign controllers to certain objects one of each 3 typwes of manager 
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
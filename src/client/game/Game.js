
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/Heightmap.js"

import { createRenderer  } from './world/Renderer.js';
import { createCamera, CameraController } from "./utils/Camera.js';"

import { TerrainRenderer } from "./world/Terrain.js";
import { generateTerrain } from "./utils/hightmapGenerator.js";

import { createSoundManager } from "./utils/SoundManager.js"

import { GAME_CONSTANTS } from "./utils/GAME_CONSTANTS.js";
import { createInputManager } from './utils/InputManager.js';

// game lazely gets raw inputs frkm these 4 classes

// i shoudm combine these 8 classes for 4 total 

// mouse orbit event handlers 
class ClientMousePointerInput {} 

// keydown event handlers 
class ClientButtonInput {
  constructor() {
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
    window.addEventListener('mousedown', (event) => {
      this.handleKeyDown(event);
    });
    this.keyBindings = {
      KeyW: 'moveForward',
      ArrowUp: 'moveForward',

      KeyS: 'moveBackward',
      ArrowDown: 'moveBackward',

      KeyA: 'moveLeft',
      ArrowLeft: 'moveLeft',

      KeyD: 'moveRight',
      ArrowRight: 'moveRight',

      KeyC: 'toggleCamera',
      KeyP: 'toggleTerrain',
      KeyF: 'toggleFog',
    };
    this.actions = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
    }
    this.toggles = {
      toggleCamera: false
      toggleTerrain: false;
    }
  }

  handleKeyDown(event) {
    const action = this.bindings[event.code];
    if (!action) {
      this.toggleEvent(event)
    }
    this.actions[this.bindings[event.code]] = true;
  }
  toggleEvent(event) {
    const toggle = this.bindings[event.code]
    if(!toggle) return;
    if(this.toggles[toggle] == true) {
      this.toggles[toggle] == false;
    } else {
      this.toggles[toggle] = true;
    }
  }
  getState() {
    return {
      throttle: this.inputManager.isKeyDown("w") ? 1 : 0,
      left: this.inputManager.isKeyDown("a"),
      right: this.inputManager.isKeyDown("d"),
      fire: this.inputManager.isMouseDown(0)
    };
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
// server message receiver 
class NetworkInput {

  newEntityUpdates() {

  }
  getState() {
    return this.latestServerInput;
  }
} 


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
    this.canvas = canvas
    this.heightmap = createHeightmap();
  }

  setup(networkHandler) {
    const scene = new THREE.Scene();
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

2. Controllers update locally controlled entities
   - PlayerController pulls from PlayerInputSource
   - AIController pulls from AIInputSource
   - NetworkController/RemoteController pulls from snapshot buffer

3. Locally controlled entities simulate immediately
   - local boat movement
   - local projectiles
   - local sounds

4. Send local player inputs to server

5. Remote entities interpolate/extrapolate
   - interpolate between snapshots
   - extrapolate briefly if next snapshot missing

6. Reconcile locally predicted entities
   - compare predicted state vs authoritative snapshot
   - apply soft correction

7. Render scene

*/
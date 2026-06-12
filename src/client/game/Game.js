
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

class Galleon extends Boat {
  constructor(scene) {
    super(scene);
    this.maxSpeed  = 6;
    this.turnSpeed = 0.7;
    this.hull      = 200;
    // heavier, slower, more cannons
  }
}

class Sloop extends Boat {
  constructor(scene) {
    super(scene);
    this.maxSpeed  = 16;
    this.turnSpeed = 2.1;
    this.hull      = 60;
  }
}
class Boat extends THREE.Group {
  constructor(scene) {
    super();

    // Physical state
    this.velocity        = new THREE.Vector3();
    this.angularVelocity = 0;
    this.hull            = 100; // health

    // Config — overridden by subclasses
    this.maxSpeed        = 10;
    this.turnSpeed       = 1.2;
    this.drag            = 0.98;

    this.cannons = {
      left:  new CannonBank(this, 'left'),
      right: new CannonBank(this, 'right'),
    };

    // Build visuals as children
    this._buildMesh();
    scene.add(this);
  }

  // Called by LocalBoatController every frame
  simulateMovement(input, dt) {
    if (input.moveForward)  this.velocity.z += this.maxSpeed * dt;
    if (input.moveBackward) this.velocity.z -= this.maxSpeed * dt;
    if (input.moveLeft)     this.angularVelocity += this.turnSpeed * dt;
    if (input.moveRight)    this.angularVelocity -= this.turnSpeed * dt;

    this.velocity.multiplyScalar(this.drag);
    this.angularVelocity *= this.drag;

    this.position.addScaledVector(this.velocity, dt);
    this.rotation.y += this.angularVelocity * dt;
  }

  // Called by LocalBoatController on input events
  fireLeft()  { this.cannons.left.fire(); }
  fireRight() { this.cannons.right.fire(); }

  takeDamage(amount) {
    this.hull = Math.max(0, this.hull - amount);
    if (this.hull === 0) this.destroy();
  }

  destroy() {
    this.parent?.remove(this);
    // trigger explosion, emit event etc.
  }
}
class BoatSpawner {
  constructor(factory, registry, localPlayerId, playerInput, snapshotBuffers) {
    this.factory        = factory;
    this.registry       = registry;
    this.localPlayerId  = localPlayerId;
    this.playerInput    = playerInput;
    this.snapshotBuffers = snapshotBuffers;
  }

  spawnFromNetwork(data) {
    const { id, ownerId, position, rotation, team } = data;

    // Avoid duplicate spawns (server may resend on reconnect)
    if (this.registry.get(id)) return;

    const boat = this.factory.create({ position, rotation, team });
    const controller = this.#createController(id, ownerId, boat);

    this.registry.register(id, boat, controller);
  }

  despawnFromNetwork({ id }) {
    this.registry.remove(id);
    this.snapshotBuffers.delete(id);
  }

  #createController(id, ownerId, boat) {
    if (ownerId === this.localPlayerId) {
      // This is our boat being confirmed by the server
      return new LocalBoatController(boat, this.playerInput);
    }

    // Remote player or AI driven by server snapshots
    const buffer = new SnapshotBuffer();
    this.snapshotBuffers.set(id, buffer);
    return new RemoteBoatController(boat, buffer);
  }
}

class BoatFactory {
  constructor(scene, assetLoader) {
    this.scene = scene;
    this.assetLoader = assetLoader;
  }

  create(config) {
    const boat = new Boat(this.scene);
    boat.position.copy(config.position);
    boat.rotation.y = config.rotation;
    boat.team = config.team;
    // load skin, set up health, physics body etc.
    return boat;
  }
}


class BoatManager {
  constructor() {
    this.boats = new Map(); // serverId -> { boat, controller }
  }

  register(serverId, boat, controller) {
    this.boats.set(serverId, { boat, controller });
  }

  get(serverId) {
    return this.boats.get(serverId);
  }

  remove(serverId) {
    const entry = this.boats.get(serverId);
    if (!entry) return;
    entry.boat.destroy(); // cleanup mesh, physics etc.
    this.boats.delete(serverId);
  }

  updateAll(dt) {
    for (const { controller } of this.boats.values()) {
      controller.update(dt);
    }
  }
}
class CameraAnchor {
  constructor() {
    this.position = new THREE.Vector3();
    this.rotation = 0;
  }

  // Follows boat with configurable lag — filters out 
  // wave bobbing, impact shake, etc.
  update(boat, dt) {
    this.position.lerp(boat.position, 0.08);
    this.rotation = lerpAngle(this.rotation, boat.rotation.y, 0.1);
  }
}

class FollowCameraController extends CameraController {
  constructor(camera, anchor) {
    super(camera);
    this.anchor = anchor;
  }

  update(dt) {
    // Camera follows the anchor, not the boat
    const offset = new THREE.Vector3(0, 10, -20)
      .applyEuler(new THREE.Euler(0, this.anchor.rotation, 0));

    this.camera.position.lerp(
      this.anchor.position.clone().add(offset),
      0.15
    );
    this.camera.lookAt(this.anchor.position);
  }
}

class Boat extends THREE.Group {
  constructor(scene) {
    super();

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
    - or should i have one manager for each kind of object

    
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
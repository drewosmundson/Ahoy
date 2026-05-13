
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/Heightmap.js"

import { createRenderer  } from './world/Renderer.js';
import { createCamera, CameraController } from "./utils/Camera.js';"

import { TerrainRenderer } from "./world/Terrain.js";
import { generateTerrain } from "./utils/hightmapGenerator.js";

import { createSoundManager } from "./utils/SoundManager.js"

import { GAME_CONSTANTS } from "./utils/GAME_CONSTANTS.js";
import { createInputManager } from './utils/InputManager.js';

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

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createRenderer  } from './world/Renderer.js';
import { createCamera, CameraController } from "./utils/Camera.js';"

import { createHeightmap, TerrainRenderer } from "./world/Terrain.js";
import { generateTerrain } from "./utils/hightmapGenerator.js";

import { createSoundManager } from "./utils/SoundManager.js"

import { GAME_CONSTANTS } from "./utils/GAME_CONSTANTS.js";
import { createInputManager } from './utils/InputManager.js';


export class Game {
  constructor(emit) {
    this.emit = emit;
  }
  setup({canvas, heightmap}) {
    this.canvas = canvas;
    this.heightmap = heightmap ?? createHeightmap(config);
    this.renderer = createRenderer(canvas, THREE.WebGLRenderer);
    this.scene = new THREE.Scene();
    
    this.deltaTime = 0;
    this.lastTime = 0;

    this.worldComponents = createWorldComponents(this.scene, this.heightmap);
   
    this.controllers = new Map();
    this.projectiles = new Map();
    
    this.playerInput = createPlayerInputManager()
    this.AiInput = createAiInputManager()
    this.remoteInput = createRemoteInputManager()
    
    this.player = createPlayer(playerInput);
    
    window.addEventListener('resize', this.handleWindowResize);
  }
  createWorldComponents(scene, heightMap){
    return {
      lighting: createLighting(scene),
      terrain: createTerrain(scene, heightmap),
      water: createWater(scene),
      skybox: createSkybox(scene),
    }
  }
  createPlayer() { 
    const sound = createSoundManagr() 
    const setting = createSettingsManager()
    const boat = createBoat()
    const input = inputManager()
    const boatController = createBoatContrer() 
    const cameraController = createCameraControl()
    return { boatController, cameraController } 
  }
  
  addBoat(){ 
    return boatController
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

  updateEnemyBoatInterpolation() {
    const currentTime = Date.now();
    
    Object.entries(this.enemyBoats).forEach(([playerId, enemyData]) => {
      const { boat, targetPos, targetRot, startPos, startRot, lerpStartTime, lerpDuration } = enemyData;
      
      if (!boat || !boat.model) {
        console.warn(`Enemy boat for ${playerId} is missing model`);
        return;
      }
      
      const elapsed = currentTime - lerpStartTime;
      const factor = Math.min(elapsed / lerpDuration, 1.0);
      const easedFactor = factor * factor * (3.0 - 2.0 * factor);
      
      const newX = boat.lerp(startPos.x, targetPos.x, easedFactor);
      const newZ = boat.lerp(startPos.z, targetPos.z, easedFactor);
      boat.model.position.set(newX, this.waterLevel, newZ);
      
      const newRotY = boat.lerpAngle(startRot, targetRot, easedFactor);
      boat.model.rotation.y = newRotY;
    });
  }




  updateEnemyBoatPosition(data) {
    const { playerId, position, rotation } = data;
    
    // Don't update our own boat
    if (playerId === this.socket.id) return;
    
    console.log(`Updating enemy boat ${playerId} to position:`, position, 'rotation:', rotation);
    
    const currentTime = Date.now();
    
    if (this.enemyBoats[playerId]) {
      // Update existing enemy boat
      const enemyData = this.enemyBoats[playerId];
      const enemyBoat = enemyData.boat;
      
      enemyData.startPos = {
        x: enemyBoat.model.position.x,
        z: enemyBoat.model.position.z
      };
      enemyData.startRot = enemyBoat.model.rotation.y;
      
      enemyData.targetPos = { x: position.x, z: position.z };
      enemyData.targetRot = rotation;
      enemyData.lerpStartTime = currentTime;
      
    } else {
      // Create new enemy boat
      console.log(`Creating new enemy boat for player ${playerId}`);
      
      const enemyBoat = new Boat(this.scene, this.waterLevel, null, false, null);
      enemyBoat.model.position.set(position.x, this.waterLevel, position.z);
      enemyBoat.model.rotation.y = rotation;
      
      // Make enemy boats visually distinct (different colored sail)
      const sail = enemyBoat.model.children.find(child => 
        child.material && child.material.color && child.material.color.getHex() === 0xFFFFFF
      );
      if (sail) {
        sail.material = sail.material.clone();
        sail.material.color.setHex(0xFF6B6B); // Red sail for enemy boats
      }
      
      this.enemyBoats[playerId] = {
        boat: enemyBoat,
        targetPos: { x: position.x, z: position.z },
        targetRot: rotation,
        startPos: { x: position.x, z: position.z },
        startRot: rotation,
        lerpStartTime: currentTime,
        lerpDuration: 100
      };

      console.log(`Enemy boat created for ${playerId}. Total enemy boats:`, Object.keys(this.enemyBoats).length);
    }
  }
  boatDestroyed(data) {
    this.boat.createDeathEffect(data.position);
    
  }

  enemyFiredProjectile(data) {
    const { position, rotation, sideOfBoat } = data;
    const enemyProjectile = new Projectile(
      this.scene,
      this.waterLevel,
      this.terrain,
      position.x,
      position.z,
      rotation,
      sideOfBoat
    );
    this.enemyProjectiles.push(enemyProjectile);
  }

  playerFiredProjectile(sideOfBoat) {

    if (!this.isAlive || !this.socket) {
      return;
    }
    const position = this.boat.getPosition();
    const rotation = this.boat.getRotation();
    const cameraYaw = this.cameraController.cameraYaw;
    const cameraPitch = this.cameraController.cameraPitch;

    const projectile = new Projectile(
      this.scene,
      this.waterLevel,
      this.terrain,
      position.x,
      position.z,
      rotation,
      sideOfBoat,
      cameraYaw,
      cameraPitch
    );
    this.projectiles.push(projectile);
    if (this.multiplayer) {
      this.socket.emit('projectileFired', {
        position: {
          x: position.x,
          z: position.z
        },
        rotation: rotation, 
        sideOfBoat,
        timestamp: Date.now() // Add timestamp for synchronization
      });
    }

  }

  updateProjectiles(deltaTime) {
    for (let i = 0; i < this.projectiles.length; i++) {
      const projectile = this.projectiles[i];
      
      if (!projectile.update(deltaTime) || !projectile.isProjectileActive()) {
        this.projectiles.splice(i, 1);
      }
    }
  }
  // Game.js - Fixed collision detection to prevent double hits
  updateEnemyProjectiles(deltaTime) {
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const enemyProjectile = this.enemyProjectiles[i];
      
      // Check collision BEFORE updating projectile
      const collisionDetected = this.boat.checkEnemyProjectileCollision(enemyProjectile);
      
      // If collision was detected, remove projectile immediately
      if (collisionDetected) {
        this.enemyProjectiles.splice(i, 1);
        continue; // Skip to next projectile
      }
      
      // Update projectile if no collision
      if (!enemyProjectile.update(deltaTime) || !enemyProjectile.isProjectileActive()) {
        this.enemyProjectiles.splice(i, 1);
      }
    }
  }
  toggleFog() {
    if (this.scene.fog) {
      this.scene.fog = null;
    } else {
      this.scene.fog = new THREE.FogExp2(0xF7F4E9, 0.008);
    }
  }

  toggleCameraMode() {
    this.cameraController.toggleCameraMode();
  }
  
  toggleTerrainMode() {
    return this.terrain.toggleTerrainMode();
  }

  toggleMouseLook() {
    this.cameraController.toggleMouseLook();
  }

  lookRight() {
    this.cameraController.lookRight();
  }

  lookLeft() {
    this.cameraController.lookLeft();
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

update(time) {

  const deltaTime = this.lastTime === 0 ? 16 : time - this.lastTime;
  this.lastTime = time;

  // Update all components
  this.water?.update(time);
  
  if (this.isAlive) {
    this.boat?.update(time, this.input.boatMovement, deltaTime);

  }
  this.updateEnemyBoatInterpolation();
  this.updateProjectiles(deltaTime);
  this.updateEnemyProjectiles(deltaTime); 

  this.cameraController?.update(this.boat);
}



  cleanup() {
    this.boat?.cleanup();
    this.cameraController?.cleanup();
  
    // Cleanup all projectiles
    this.projectiles.forEach(projectile => {
      if (projectile.isProjectileActive()) {
        projectile.destroy();
      }
    });
    this.projectiles = [];
    
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    this.stop();
  }
}
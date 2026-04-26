
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { CameraController } from '../../../public/utils/CameraController.js';
import { TerrainRenderer } from 
import { HeightmapGenerator } from 

class Game { 
  constructor(canvas, emitter) {
    this.canvas = canvas;
    this.emitter = emitter;
  }
  generateHeightmap(){
    heightMap 
    return heightmap;
  }

  gameLoop(time) {
    const deltaTime = this.lastTime === 0 ? 16 : time - this.lastTime;
    this.currentTime = time;
    this.renderer.render(this.scene, this.camera);
  }
  multiplayerGameLoop(){ 


  } 

  singleplayerGameLoop(){

  }

  startGame(multiplayer, terrain) {
    window.addEventListener('resize', this.handleWindowResize);
    this.handleWindowResize();
    this.initRenderer();
    this.initCamera();
    this.initSound();
    this.initLighting();
    this.terrain = new Terrain(this.scene, this.socket, this.multiplayer, this.heightmap, this.heightmapOverlay);
    this.water = new Water(this.scene, this.waterLevel);
    this.boat = new Boat(this.scene, this.waterLevel, this.socket, this.multiplayer, this.terrain);
    this.skybox = new Skybox(this.scene);
    this.input = new InputController(this);

    if(multiplayer == true) {
      this.renderer.setAnimationLoop(this.multiplayerGameLoop);
    }
    else {
      this.renderer.setAnimationLoop(this.singleplayerGameLoop);
    }
  }

  stopGame() {
    this.renderer.setAnimationLoop(null);
  }

}

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { CameraController } from '../../../public/utils/CameraController.js';
import { TerrainRenderer } from "./worldRender/Terrain.js";
import { heightmapGenerator } from "./utils/hightmapGenerator.js";

import { createRenderer  } from './utils/renderer.js';

import { GAME_CONFIG } from "./utils/constants.js";

class Game {
  constructor() {

  }

  initialize(canvas, emitter) {
    const scene = new THREE.Scene();

    this.renderer = createRenderer(canvas, THREE);
    this.camera = createCamera(canvas)

    this.initCamera();
    this.initSound();
    this.initLighting();
    this.initComponents();
 
    if (this.multiplayer && this.socket) {
      this.initMultiplayerEvents();
    }
    if(!this.multiplayer) {
      this.initEnemyAI();
    }


    window.addEventListener('resize', this.handleWindowResize);
    this.handleWindowResize();
  }

  createHeightmap(){
    heightmap = heightmapGenerator(constants.HEIGHTMAP_CONFIG);
    return heightmap;
  }
  
  loadHeightmap(heightMap) { 
    terrain.loadHeightmap(heightMap);
  }

  startGame(multiplayer, terrain) {
    window.addEventListener('resize', this.handleWindowResize);
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


  gameLoop(time) {
    const deltaTime = this.lastTime === 0 ? 16 : time - this.lastTime;
    this.currentTime = time;
    this.renderer.render(this.scene, this.camera);
  }

  multiplayerGameLoop(){ 


  } 

  singleplayerGameLoop(){

  }
}
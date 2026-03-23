
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { dom } from "../app/dom.js";
import { CameraController } from '../../../public/utils/CameraController.js';


class Game { 
  constructor() {
    this.canvas = dom.canvas.game;
    this.renderer = this.initRenderer(this.canvas);

    this.scene = new THREE.Scene();
    this.comonents = this.initComponents(this.scene);


    this.CameraController = new CameraController(this.canvas);
    this.SoundController = new SoundController(this.CameraController.camera);

  }

  initRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
  }
  initComponents(scene){
    const terrain = new Terrain(scene, this.socket, this.multiplayer, this.heightmap, this.heightmapOverlay);
    const water = new Water(scene, this.waterLevel);
    this.boat = new Boat(scene, this.waterLevel, this.socket, this.multiplayer, this.terrain);
    this.skybox = new Skybox(scene);
    this.lighting = new Lighting(scene)
    return 
  }

  startGame(){



    this.startGameLoop();
  }
  startGameLoop(){


  }
}

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { dom } from "../core/dom.js";
import { CameraController } from '../../../public/utils/CameraController.js';


class Game { 
  constructor() {
    this.canvas = dom.canvas.game;
    this.renderer = initRenderer(this.canvas);
    this.camera = initCamera(this.canvas);

    this.CameraController = new CameraController(this.camera, this.canvas);
    this.SoundController = new SoundController(this.camera);

    this.scene = new THREE.Scene();
    this.terrain = new Terrain(this.scene, this.socket, this.multiplayer, this.heightmap, this.heightmapOverlay);
    this.water = new Water(this.scene, this.waterLevel);
    this.boat = new Boat(this.scene, this.waterLevel, this.socket, this.multiplayer, this.terrain);
    this.skybox = new Skybox(this.scene);
    this.lighting = new Lighting(this.scene)
  }
  initRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
  }

  initCamera(canvas) {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 30, 50);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  startGame(){


    this.startGameLoop();
  }
  startGameLoop(){


  }
}
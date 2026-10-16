import * as THREE from 'three';
import { EVENTS } from "../GameTemplate/EventRegistry.js";

export class RenderManager {
    constructor(canvas) {
        this.canvas = canvas;

        this.threeRenderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });

        this.threeRenderer.setPixelRatio(window.devicePixelRatio);

    }

    resize(width, height) {
        console.log("Renderer resized")
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.threeRenderer.setSize(width, height, false);
    }

    setAnimationLoop(loop) {
        this.threeRenderer.setAnimationLoop(loop);
    }

    draw(scene, camera) {
        this.threeRenderer.render(scene, camera);
    }

    dispose() {
        this.threeRenderer.setAnimationLoop(null);

        this.threeRenderer.dispose();
    }
}
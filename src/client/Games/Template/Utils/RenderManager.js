
import * as THREE from 'three';
import { EVENTS } from "../EventRegistry.js"

export class RenderManager {
    constructor(bus, canvas) {
        this.threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.threeRenderer.setPixelRatio(window.devicePixelRatio);
        this.threeRenderer.setSize(window.innerWidth, window.innerHeight);

        this.canvas = canvas

        this.subscriptions = [
            bus.on(EVENTS.WINDOW_RESIZED, () => this.resized()),
        ];
    }

    resized({ width, height }) {
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
        this.stopAnimation();
        window.removeEventListener('resize', this.onWindowResize);
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
        this.threeRenderer.dispose();
    }
}


import * as THREE from 'three';
import { EVENTS } from "../EventRegistry.js";

export class RenderManager {
    constructor(bus, canvas) {
        this.canvas = canvas;

        this.threeRenderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });

        this.threeRenderer.setPixelRatio(window.devicePixelRatio);

        this.subscriptions = [
            bus.on(EVENTS.WINDOW_RESIZED, (size) => this.resized(size)),
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
        this.threeRenderer.setAnimationLoop(null);

        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];

        this.threeRenderer.dispose();
    }
}
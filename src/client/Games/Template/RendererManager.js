import * as THREE from 'three';


export class RendererManager {

    constructor(canvas, bus) {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.subscriptions = [
            bus.on("windowResize", (data) => this.resize(data))
        ];
    }

    resize({ width, height }) {
        this.renderer.setSize(width, height, false);
    }

    startAnimation(loop) {
        // loop receives (time, xrFrame). Time is in ms.
        this.renderer.setAnimationLoop(loop);
    }

    stopAnimation() {
        this.renderer.setAnimationLoop(null);
    }

    dispose() {
        this.stopAnimation();
        this.subscriptions.forEach(unsub => unsub());
        this.subscriptions = [];
        this.renderer.dispose();
    }
}
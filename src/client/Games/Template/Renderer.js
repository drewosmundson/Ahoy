
import * as THREE from 'three';

export class RendererManager {
    constructor(canvas, bus) {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.subscriptions = [
            bus.on("windowResize", (data) => this.resize(data)),
        ];

        // Temporary: until a sync/frame interface emits "windowResize"
        this.onWindowResize = () =>
            this.resize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', this.onWindowResize);
    }

    resize({ width, height }) {
        this.renderer.setSize(width, height);
    }

    startAnimation(loop) {
        this.renderer.setAnimationLoop(loop);
    }

    stopAnimation() {
        this.renderer.setAnimationLoop(null);
    }

    dispose() {
        this.stopAnimation();
        window.removeEventListener('resize', this.onWindowResize);
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
        this.renderer.dispose();
    }
}




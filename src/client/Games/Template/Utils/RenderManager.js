
import * as THREE from 'three';



export class RenderManager {
    constructor(canvas, bus) {
        this.threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.threeRenderer.setPixelRatio(window.devicePixelRatio);
        this.threeRenderer.setSize(window.innerWidth, window.innerHeight);

        this.subscriptions = [
            bus.on("windowResize", (data) => this.resize(data)),
        ];

        // Temporary: until a sync/frame interface emits "windowResize"
        this.onWindowResize = () =>
            this.resize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', this.onWindowResize);
    }

    resize({ width, height }) {
        this.threeRenderer.setSize(width, height);
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


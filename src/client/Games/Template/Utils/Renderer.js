
import * as THREE from 'three';



export class Camera {


}

export class Scene {

    
}

export class RendererWrapper {
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

    setAnimationLoop(loop) {
        this.renderer.setAnimationLoop(loop);
    }

    setAnimationLoop() {
        this.renderer.setAnimationLoop(null);
    }

    resize({ width, height }) {
        this.renderer.setSize(width, height);
        this.lastAspect = width / height;
        this.services?.forEach(s => s.setAspect?.(this.lastAspect));
    }

    draw(scene, camera) {
        this.renderer.render(scene, camera);
    }
        

    dispose() {
        this.stopAnimation();
        window.removeEventListener('resize', this.onWindowResize);
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
        this.renderer.dispose();
    }
}


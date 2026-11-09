


import { SceneManager } from "./SceneManager.js";
import { CameraManager } from "./CameraManager.js";
import { AudioManager } from "./AudioManager.js"
import { RenderManager } from "./RenderManager.js";

export class GraphicsContext {
    constructor(canvas) {
        this.sceneManager = new SceneManager(canvas);
        this.cameraManager = new CameraManager(canvas);
        this.audioManager = new AudioManager(canvas);
        this.renderManager = new RenderManager(canvas);

        window.addEventListener("resize", this.resize);
    }

    resize = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let width = windowWidth;
        let height = width * 0.5625; // (9 / 16)

        if (height > windowHeight) {
            height = windowHeight;
            width = height * 1.7777777777777777; // (16 / 9)
        }

        this.cameraManager.resize(width, height);
        this.renderManager.resize(width, height);
    };


    get scene() {
        return this.sceneManager.get();
    }


    get camera() {
        return this.cameraManager.get();
    }

    
    draw() {
        this.renderManager.draw(this.scene, this.camera);
    }

    setAnimationLoop(callback) {
        this.renderManager.setAnimationLoop(callback);
    }

    dispose() {
        this.renderManager.dispose();
        this.cameraManager.dispose();
        this.sceneManager.dispose?.();
        window.removeEventListener("resize", this.resize);
    }
}
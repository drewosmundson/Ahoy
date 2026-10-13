


import { SceneManager } from "./SceneManager.js";
import { CameraManager } from "./CameraManager.js";
import { RenderManager } from "./RenderManager.js";

export class GraphicsContext {
    constructor(bus, canvas) {
        this.sceneManager = new SceneManager(bus);
        this.cameraManager = new CameraManager(bus);
        this.renderManager = new RenderManager(bus, canvas);
    }

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
    }
}
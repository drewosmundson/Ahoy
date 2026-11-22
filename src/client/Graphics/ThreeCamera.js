import * as THREE from 'three';

export class CameraManager {
    constructor() {
        this.threeCamera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
        this.threeCamera.position.set(0, 5, 10);
    }

    resize(width, height) {
        this.threeCamera.aspect = width / height;
        this.threeCamera.updateProjectionMatrix();
    }

    get() { return this.threeCamera; }

    dispose() {}
}
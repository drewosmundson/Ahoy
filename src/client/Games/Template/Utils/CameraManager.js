



import * as THREE from 'three';

export class CameraManager {
    constructor(bus) {
        this.threeCamera = new THREE.PerspectiveCamera();
    
        this.subscriptions = [
            bus.on("windowResize", ({width, height}) => this.resize({width, height})),
        ];
    }

    resize({ width, height }) {
        this.threeCamera.aspect = width / height;
        this.threeCamera.updateProjectionMatrix();
    }

    get(){
        return this.threeCamera;
    }
}
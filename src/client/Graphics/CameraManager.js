



import * as THREE from 'three';
import { EVENTS } from "../EventRegistry.js"

export class CameraManager {
    constructor(bus) {

        // const fov = 75;                                          // Field of view (in degrees)
        // const aspect = window.innerWidth / window.innerHeight;   // Aspect ratio
        // const near = 0.1;                                        // Near clipping plane
        // const far = 1000;                                        // Far clipping plane

        // const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

        this.aspect = 16 / 9;
        
        this.threeCamera = new THREE.PerspectiveCamera( 75, this.aspect, 0.1, 1000 );

        // 2. Set the camera position (X, Y, Z)
        this.threeCamera.position.set(0, 5, 10); 

        // 3. Point the camera at a specific target (e.g., the center of the scene)
        this.threeCamera.lookAt(0, 0, 0); 

        this.subscriptions = [
            bus.on(EVENTS.WINDOW_RESIZED, (size) => this.resized(size)),
        ];
        this
    }

    resized({ width, height }) {
        console.log("cameraResized")
        this.threeCamera.aspect = width / height;
        this.threeCamera.updateProjectionMatrix();
    }

    setCamera() {



    }

    get(){
        return this.threeCamera;
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }
}

import * as THREE from 'three';



export class CameraWrapper {
    constructor(bus) {
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10);
        this.camera.position.z = 1.5;


        // this.subscriptions = [
        //     bus.on("windowResize", (data) => this.setAspect(data)),
        // ];

        // Temporary: until a sync/frame interface emits "windowResize"
        this.onWindowResize = () =>
            this.setAspect({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', this.onWindowResize);
    }


    setAspect(aspect) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }
}



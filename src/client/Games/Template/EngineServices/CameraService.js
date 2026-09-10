

// outside of the ECS Services own the 



class CameraManager {
    constructor() {
        this.camera = new THREE.PerspectiveCamera();
    }

    update(world) {
        const cameraState = world.getComponent(
            this.cameraEntity,
            Camera
        );

        // Translate ECS state → THREE.Camera
        this.camera.position.set(...);
        this.camera.lookAt(...);
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}


// outside of the ECS. Services own the actual THREE.js objects

// cameraState Component
// cameraSystem Event



export function camera() {
    const camera = new THREE.PerspectiveCamera();

    return camera

}

class CameraManager {
    constructor() {

    }

    update(world) {
        const cameraState = world.getComponent(
            this.cameraEntity,
            Camera
        );

        // Translate ECS state → THREE.Camera
        // this.camera.position.set(...);
        // this.camera.lookAt(...);
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
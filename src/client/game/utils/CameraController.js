


class CameraController {

  #defaultCameraPosition = { x: 0, y: 0, z: 0 }
  #defaultCameraLookAt = { x: 0, y: 0, z: 0 }

  constructor(){
    this.camera = this.newCamera();
  }

  newCamera(position = this.#defaultCameraPosition, lookAt = this.#defaultCameraLookAt) {
    const camera = new THREE.PerspectiveCamera(75, state.aspect, 0.1, 1000);
    camera.position.set(position.x, position.y, position.z);
    camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    return camera
  }

  updateAspect(width, height) {

  }

  update

}
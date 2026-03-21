


const cameraDefalts




class CameraController {

  constructor(canvas){
    this.perspective
    this.aspect = canvas.clientWidth / canvas.clientHeight
    this.camera = newCamera(canvas, this.aspect, this.per)

  }

  newCamera(canvas) {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 30, 50);
    this.camera.lookAt(0, 0, 0);

    this.cameraController = new CameraController(this.camera, this.canvas);
    return camera
  }

  updateAspect() {



  }


  update

}
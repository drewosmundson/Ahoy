
  initLighting() {
    const directionalLight = new THREE.DirectionalLight(0xFFF5EE, 1);
    directionalLight.position.set(50, 50, 50);
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
  }



class Lighting {
  constructor(scene) { 
    this.scene = scene;
    this.scene.add(this.newDirectionalLight(0xffffff));
    this.scene.add(this.newAmbiantLight(0xFFF5EE, 50, 50, 50))
  }
  newAmbiantLight(color) {
    const ambientLight = new THREE.AmbientLight(color, 0.3);
    scene.add(ambientLight);
  }
  newDirectionalLight(color, x, y, z) {
    const directionalLight = new THREE.DirectionalLight(color, 1);
    directionalLight.position.set(x, y, z);
    return directionalLight;
  }
  updateDirectionalLight(){

  

  }
  updateAmbiantLight() {


  }
}
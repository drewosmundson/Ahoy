
export function createLighting() {
    return;
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
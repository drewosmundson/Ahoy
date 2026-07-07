
export function createLighting(scene, AmbientLight, DirectionalLight) {
    const lighting = new Lighting(AmbientLight, DirectionalLight);
    scene.add(lighting.newDirectionalLight(0xffffff));
    scene.add(lighting.newAmbiantLight(0xFFF5EE, 50, 50, 50))
    return lighting
}


class Lighting {
  constructor(AmbientLight, DirectionalLight) { 
    this.AmbientLight = AmbientLight;
    this.DirectionalLight = DirectionalLight

  }
  newAmbiantLight(color) {
    const ambientLight = new this.AmbientLight(color, 0.3);
    return ambientLight
  }
  newDirectionalLight(color, x, y, z) {
    const directionalLight = new this.DirectionalLight(color, 1);
    directionalLight.position.set(x, y, z);
    return directionalLight;
  }
  updateDirectionalLight(light){

  

  }
  updateAmbiantLight(light) {


  }
}
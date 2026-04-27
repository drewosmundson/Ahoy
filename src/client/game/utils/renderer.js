



export function createRenderer(){
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  })
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
}



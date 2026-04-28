




export function createRenderer(canvas, WebGLRenderer){
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
}




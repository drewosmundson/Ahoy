





export function createSingleplayer({ dom, navigate, game }, heightmap) {
  return {
    initEventListeners, 
    start,
    toMenuScreen
  };

  function initEventListeners() {
    dom.buttons.mainToSingleplayer?.addEventListener('click', toMenuScreen);
    dom.buttons.singleplayerStart?.addEventListener('click', start);
  }

  function toMenuScreen() {
    navigate.toScreen(dom.screens.singleplayer)
  }

  function start() {
    const heightmap = generateHeightmap();
    navigate.toScreen(dom.screens.game);
    game.start(heightmap);
  }
}
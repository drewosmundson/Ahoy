





export function singleplayer({ dom, navigate, emitter, Game }) {
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
    

    const gameScreen = dom.screens.game;
    navigate.toScreen(dom.screens.game);

    const gamecanvas = dom.canvas.game;
    const game = new Game({ gameCanvas, emitter });
    const heightmap = game.generateHeightmap();
    
    game.loadHeightmap(heightmap);
    game.start(multiplayer == false);
  }
}


export function singleplayer({ dom, navigate, emitter, Game, CONSTANTS }) {
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
    navigate.toScreen(dom.screens.game);
    const canvas = dom.canvas.game;
    const game = new Game({ canvas, emitter });
    game.setup();
    game.start();
  }
}


export function singleplayer({ dom, navigate, emitter, Game, CONSTANTS }) {
  return {
    initEventListeners,
    toMenuScreen,
    start,
  };

  function initEventListeners() {
    dom.buttons.mainToSingleplayer?.addEventListener('click', toMenuScreen);
    dom.buttons.singleplayerStart?.addEventListener('click', start);
  }

  function toMenuScreen() {
    navigate.toScreen(dom.screens.singleplayer)
  }

  function start() {
    const canvas = dom.canvas.game;
    const game = new Game(emitter.nullEmitter);
    game.setup(canvas);
    navigate.toScreen(dom.screens.game);
    game.start();
  }
}
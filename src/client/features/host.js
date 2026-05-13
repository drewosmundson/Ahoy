



export function host({ dom, navigate, emitter, Game, CONSTANTS }) {
  return {
    initEventListeners,
    toMenuScreen,
    start,
  };

  function initEventListeners() {
    dom.buttons.host?.addEventListener('click', toMenuScreen);
    dom.buttons.hostStart?.addEventListener('click', start);
  }

  function toMenuScreen() {
    navigate.toScreen(dom.screens.host)
  }

  function start() {
    const canvas = dom.canvas.game;
    const game = new Game();
    game.setup(canvas, heightmap);
    navigate.toScreen(dom.screens.game);
    game.start();
  }
}






export function createSingleplayer({ dom, navigate, startGame }) {
  return {
    initialize,
    start
  };

  function initialize() {
    dom.buttons.mainToSingleplayer?.addEventListener('click', () => {
      navigate.toScreen(dom.screens.singleplayer);
    });

    dom.buttons.singleplayerStart?.addEventListener('click', start);
  }

  function start() {
    startGame({ multiplayer: false });
  }
}
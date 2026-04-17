




export function createSingleplayer({ dom, navigate, startGame }) {
  return {
    initialize
  };

  function initialize() {
    dom.buttons.singleplayerStart?.addEventListener('click', start);
  }

  function start() {
    startGame({ multiplayer: false });
  }
}

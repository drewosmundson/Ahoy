



export function mmo({ dom, navigate, createGame }) {
  return {
    initEventListeners, 
    start,
    toMenuScreen
  };

  function initEventListeners() {
    dom.buttons.mainToMMO?.addEventListener('click', toMenuScreen);
    dom.buttons.mmoStart?.addEventListener('click', start);
  }

  function toMenuScreen() {
    navigate.toScreen(dom.screens.mmo)
  }

  function start() {
    
    game.generateTerrain();
    game.start();
    navigate.toScreen(dom.screens.game);

  }
}
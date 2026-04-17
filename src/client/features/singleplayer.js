



export const singleplayer = { 
  initalize(dom, navigate, startGame) {
    dom.buttons.mainToSingleplayer?.addEventListener('click', () => {
      navigate.toScreen(dom.screens.singleplayer);
    });

    dom.buttons.singleplayerStart?.addEventListener('click', () => {
      start(startGame);
    });
  }, 

  start(startGame){
    startGame({ multiplayer: false });
  }
}
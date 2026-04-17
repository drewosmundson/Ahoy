



export const host = { 
  initalize(dom, navigation, startGame){ 
    dom.buttons.mainToHost?.addEventListener('click', () => {
      navigation.toScreen(dom.screens.singleplayer);
    });

    dom.buttons.hostStart?.addEventListener('click', () => {
      start(startGame);
    });
  },

  start(startGame){
    startGame({multiplayer: true})
  }
}
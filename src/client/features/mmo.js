



export const mmo = { 
  initalize(dom, navigation, startGame){ 
    dom.buttons.mainToMMO?.addEventListener('click', () => {
      navigation.toScreen(dom.screens.singleplayer);
    });

    dom.buttons.MMOStart?.addEventListener('click', () => {
      start(startGame);
    });
  },

  start(startGame){
    startGame({multiplayer: true})
  }
}

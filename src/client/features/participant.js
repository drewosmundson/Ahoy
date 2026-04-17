



export const participant = { 
  initalize(dom, navigation, startGame){ 
    dom.buttons.mainToParticipant?.addEventListener('click', () => {
      navigation.toScreen(dom.screens.singleplayer);
    });

    dom.buttons.participantStart?.addEventListener('click', () => {
      start(startGame);
    });
  },

  start(startGame){
    startGame({multiplayer: true})
  }
}


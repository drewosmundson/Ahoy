



export function participant(dom, navigation, emit, startGame) {
  function initalize(){ 
    dom.buttons.mainToParticipant?.addEventListener('click', () => {
      navigation.toScreen(dom.screens.singleplayer);
    });

    dom.buttons.participantStart?.addEventListener('click', () => {
      start(startGame);
    });
  },

  function start(){
    startGame({multiplayer: true})
  }
 return { initalize, start } 
}


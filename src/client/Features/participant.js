



export function participant({ dom, navigate, emit, game }) {

  return { initEventListeners, start, toMenuScreen } 

  function initEventListeners(){ 
    dom.buttons.mainToParticipant?.addEventListener('click', () => toScreen);
    dom.buttons.participantStart?.addEventListener('click', () => start);
  }

  function toMenuScreen() {
    navigate.toScreen(dom.screens.participant);
  }

  function start(){
  
  }
}








// grab DOM
// wire modules together
// start navigation
// start socket layer
// ( inits app )
           

// DOM and user interactions is not aware of sockets

// single player 
// create friend room
// join friend room
// join mmo room



import { state } from "../app/state.js";
import { navigation } from "../app/navigation.js";
import { dom } from "../app/dom.js";
import { Game } from "./game/Game.js";

// Eventually as this list becomes large or I am looking to break up this file    
// one idea I have is to create a features folder in this layer that will contain
// singleplayer.js mmo.js multiplayer.js so ownership of those features become more 
// independant. This would be a page/feature module archetecture.   

document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const emit = createEmitter(socket);
  dom.initalize();
  navigation.initalize();

  // ---- Features & Main Menu Options ----
  initSingleplayer();
  initHost(emit);
  initParticipant(emit);
  initMMO(emit);
});
 
function initSingleplayer() {
  dom.buttons.mainToSingleplayer?.addEventListener('click', () => {
    navigate.toScreen(dom.screens.singleplayer);
  });

  dom.buttons.singleplayerStart?.addEventListener('click', () => {
    state.setState({ multiplayer: false })
    startGame();
  });
}

function initHost() {
  dom.buttons.mainToHost?.addEventListener('click', () => {
    navigation.toScreen(dom.screens.singleplayer);
    emit()
  });

  dom.buttons.hostStart?.addEventListener('click', () => {
    state.setState({ multiplayer: true })
    startGame();
  });
}

function initParticipant() {
  dom.buttons.mainToParticipant?.addEventListener('click', () => {
    navigation.toScreen(dom.screens.singleplayer);
  });

  dom.buttons.participantStart?.addEventListener('click', () => {
    state.setState({ multiplayer: true })
    startGame();
  });
}

function initMMOEvents() {
  dom.buttons.mainToMMO?.addEventListener('click', () => {
    navigation.toScreen(dom.screens.lobbyCreate);
  });

  dom.buttons.mmoStart?.addEventListener('click', () => {
    state.setState({ multiplayer: true })
    startGame();
  });
}

function startGame() {
  navigateToScreen(dom.screens.game);
  const game = new Game({
    canvas: dom.canvas,
    emitter: state.emit, 
    heightmap: state.heightmap,
  });
  game.start();
}


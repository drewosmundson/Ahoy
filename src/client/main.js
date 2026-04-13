





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
import { initDom } from "./app/dom.js";
import { initNavigation } from "./app/navigation.js";
import { initSingleplayer } from "./Singleplayer.js";
import { initLobby } from "./features/Host.js";
import { initMMO } from "./features/MMO.js";
import { initAppSockets } from "./socket.appEmitter.js"
import { initGameSockets } from "./socket/game.emitter.js"
import { createEmitter } from "../shared/emitter.js";


import { state } from "../client/app/state.js";
import { navigation } from "../client/app/navigation.js";
import { dom } from "../client/app/dom.js";
import { Game } from "../client/game/Game.js";

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

export function initMMOEvents() {
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
  const game = new Game();
  game.start();
}








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

import { state } from "./app/state.js";
import { navigation } from "./app/navigation.js";
import { dom } from "./app/dom.js";
import { ui } from ".app/ui.js"

import { singleplayer } from "./features/singleplayer.js"
import { host } from "./features/host.js"
import { participant } from "./features/participant.js";
import { mmo } from "./features/mmo.js"

import { Game } from "./game/Game.js";
// Eventually as this list becomes large or I am looking to break up this file    
// one idea I have is to create a features folder in this layer that will contain
// singleplayer.js mmo.js multiplayer.js so ownership of those features become more 
// independant. This would be a page/feature module archetecture.   

document.addEventListener('DOMContentLoaded', () => {

  const socket = io();

  const context = {
    emit: createEmitter(socket),
    dom: createDom(),
    navigation: createNav(),
    startGame,
  };

  // ---- Features & Main Menu Options ----

  [singleplayer, host, participant, mmo].forEach(feature => 
    feature.initialize(context)
  );


function startGame() {
  navigateToScreen(dom.screens.game);
  const game = new Game({
    canvas: dom.canvas,
    emitter: context.emit,
    heightmap: config.heightmap,
  });
  game.start();
}








// grab DOM
// wire modules together
// start navigation
// start socket layer

// dependancy singleton factories
import { createNavigation } from "./app/navigation.js";
import { createDom } from "./app/dom.js";
import { createUi } from ".app/ui.js"

// page/feature module archetecture. 
import { singleplayer } from "./features/singleplayer.js"
import { host } from "./features/host.js"
import { participant } from "./features/participant.js";
import { mmo } from "./features/mmo.js"

import { Game } from "./game/Game.js";


function startGame() {
  navigateToScreen(dom.screens.game);
  const game = new Game({
    canvas: dom.canvas,
    emitter: context.emit,
    heightmap: config.heightmap,
  });
  game.start();


document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const context = {
    emit: createEmitter(socket); 
    dom: createDom();
    navigation: createNavigation(dom);
    ui: createUi(dom);
    startGame,
  };
  
  const gameConfig = {
  
  } 
  
  // ---- Features & Main Menu Options ----
  [singleplayer, host, participant, mmo].forEach(feature => 
    feature.initialize(context, gameConfig)
  );
}


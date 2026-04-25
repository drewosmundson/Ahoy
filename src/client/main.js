



// grab DOM
// wire modules together
// start navigation
// start socket layer

// dependancy singleton factories
import { createNavigation } from "./app/navigation.js";
import { createDom } from "./app/dom.js";
import { createUi } from ".app/ui.js"
import { createEmitter } from "./app/emitter.js"

// page/feature module archetecture. 
import { createSingleplayer } from "./features/singleplayer.js"
import { createHost } from "./features/host.js"
import { createParticipant } from "./features/participant.js";
import { createMMO } from "./features/mmo.js"

import { eventSchemas } from "../shared/schemas.js";
import { heightmapGenerator }  from "../shared/terrain/HeightmapGenerator"

import { Game } from "./game/Game.js";

document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const emitter = createEmitter(socket, eventSchemas);
  const dom = createDom();
  const navigate = createNavigation(dom);
  const ui = createUi(dom);
  const game = createGame(dom);
  const heightmap = createHeightmapGenerator();
  
  const context = {
    dom,
    emitter,
    navigate,
    ui,
    game,
    heightmapGenerator
  };
  
  const singleplayer = createSingleplayer(context);

  const host = createHost(context);
  const participant = createParticipant(context);
  const mmo = createMMO(context);
  
  [singleplayer, host, participant, mmo].forEach(feature =>
    feature.initEventListeners()
  );

});

function createGame(dom) {
  const canvas = dom.canvas.game;
  const game = new Game({ canvas });
  return game;
}
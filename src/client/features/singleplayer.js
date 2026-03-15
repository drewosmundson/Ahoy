


import { state } from "../core/state.js";
import { navigateToScreen } from "../core/navigation.js";
import { dom } from "../core/dom.js";
import { Game } from "../game";

export function initSingleplayer() {
  dom.buttons.mainToSingleplayer?.addEventListener('click', () => {
    navigateToScreen(dom.screens.singleplayer);
  });

  dom.buttons.singleplayerStart?.addEventListener('click', () => {
    startGame();
  });
}

function startGame() { 
  state.setState({ multiplayer: false })
  navigateToScreen(dom.screens.game);
  
  const Game = new Game();
  Game.start();
}
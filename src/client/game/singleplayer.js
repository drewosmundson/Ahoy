


import { state } from "../app/state.js";
import { navigateToScreen } from "../app/navigation.js";
import { dom } from "../app/dom.js";
import { Game } from "./Game.js";

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
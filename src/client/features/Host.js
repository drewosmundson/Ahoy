


import { state } from "../app/state.js";
import { navigateToScreen } from "../app/navigation.js";
import { dom } from "../app/dom.js";
import { Game } from "../game/Game.js";

export function initHostEventListeners() {
  dom.buttons.mainToLobbyCreate?.addEventListener('click', () => {
    navigateToScreen(dom.screens.lobbyCreate);
  });
  dom.buttons.lobbyCreate?.addEventListener('click', () => {
    navigateToScreen(dom.screens.lobbyHost);
  });
}




function startGame() { 
  state.setState({ multiplayer: false })
  navigateToScreen(dom.screens.game);
  const Game = new Game();
  Game.start();
}          
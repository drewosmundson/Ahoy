import { state } from "../client/app/state.js";
import { navigateToScreen } from "../client/app/navigation.js";
import { dom } from "../client/app/dom.js";
import { Game } from "../client/game/Game.js";

export function initMMOEvents() {
  dom.buttons.mainToMMO?.addEventListener('click', () => {
    navigateToScreen(dom.screens.lobbyCreate);
  });

  dom.buttons.mmoStart?.addEventListener('click', () => {
    startGame();
  });
}

function startGame() { 
  state.setState({ multiplayer: false })
  navigateToScreen(dom.screens.game);
  const Game = new Game();
  Game.start();
}          
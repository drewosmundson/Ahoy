import { state } from "./app/state.js";
import { navigateToScreen } from "./app/navigation.js";
import { dom } from "./app/dom.js";
import { Game } from "./game/Game.js";

export function initMMO() {
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



import { state } from "./app/state.js";
import { navigateToScreen } from "./app/navigation.js";
import { dom } from "./app/dom.js";
import { Game } from "./game/Game.js";

export function initSingleplayer() {
  dom.buttons.mainToSingleplayer?.addEventListener('click', () => {
    navigateToScreen(dom.screens.singleplayer);
  });

  dom.buttons.singleplayerStart?.addEventListener('click', () => {
    startGame();
  });
}

function startGame() {
    navigateToScreen(dom.screens.game);
    state.setState({ multiplayer: false })
    const Game = new Game();
    Game.start();
}
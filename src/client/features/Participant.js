









import { state } from "./app/state.js";
import { navigateToScreen } from "./app/navigation.js";
import { dom } from "./app/dom.js";
import { Game } from "./game/Game.js";

export function initParticipantEvents() {
  dom.buttons.mainToSingleplayer?.addEventListener('click', () => {
    navigateToScreen(dom.screens.singleplayer);
  });

  dom.buttons.singleplayerStart?.addEventListener('click', () => {
    startGame();
  });
}



import { dom } from "../core/dom.js";
import { userState } from "../core/state.js"

export function initSingleplayer() {
  singlePlayerMenuButton?.addEventListener('click', () => {
    navigateToScreen('singlePlayerMenu');
  });

  singlePlayerStartButton?.addEventListener('click', () => {
    startGameForSinglePlayer();
  });
}


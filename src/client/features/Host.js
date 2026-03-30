


import { state } from "../app/state.js";
import { navigateToScreen } from "../app/navigation.js";
import { dom } from "../app/dom.js";
import { Game } from "../game/Game.js";

export function initHostEventListeners() {
  dom.buttons.mainToLobbyCreate?.addEventListener('click', () => {
    navigateToScreen(dom.screens.lobbyCreate);
  });
  dom.buttons.lobbyCreate?.addEventListener('click', () => {
    createLobby();
  });
  dom.buttons.lobbyStart?.addEventListener('click', () => {
    startGame();
  })
  dom.buttons.lobbyLeave?.addEventListener('click', () => {
    leaveLobby();
  })
}

function createLobby() {
  navigateToScreen(dom.screens.lobbyHost);
}

function startGame() {

}

function leaveLobby() {

}






import { state } from "../app/state.js";
import { navigateToScreen } from "../app/navigation.js";
import { dom } from "../app/dom.js";
import { Game } from "../game/Game.js";
import { APP_EVENTS } from "../../shared/CONSTANTS.js";

export function initHostEvets(emit) {
  dom.buttons.mainToLobbyCreate?.addEventListener('click', () => {
    navigateToScreen(dom.screens.lobbyCreate);
  });
  dom.buttons.lobbyCreate?.addEventListener('click', () => {
    createLobby(emit);
  });
  dom.buttons.lobbyStart?.addEventListener('click', () => {
    startGame(emit);
  })
  dom.buttons.lobbyLeave?.addEventListener('click', () => {
    leaveLobby();
  })
}

function createLobby(emit) {
  navigateToScreen(dom.screens.lobbyHost);
  const emit = createEmitter(socket);
  emit(APP_EVENTS.LOBBY.CREATE, { state.socketId; })
}

function startGame() {

}

function leaveLobby() {

}



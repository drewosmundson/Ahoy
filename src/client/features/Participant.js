



import { state } from "../app/state.js";
import { navigation } from "../app/navigation.js";
import { dom } from "../app/dom.js";
import { Game } from "../game/Game.js";
import { APP_EVENTS } from "../../shared/CONSTANTS.js";


export function initParticipantEvents() {
  dom.buttons.mainToSingleplayer?.addEventListener('click', () => {
    navigation.toScreen(dom.screens.singleplayer);
  });

  dom.buttons.singleplayerStart?.addEventListener('click', () => {
    startGame();
  });
}






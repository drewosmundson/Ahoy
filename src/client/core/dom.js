import { 
  SCREENS, 
  BUTTONS,
  INPUTS,
  LISTS,
  CANVASES,
} from "../../shared/constants.js"


export const dom = {
  // populated from constants using loadDomItems() after initDom() is called.

  screens: {},

  buttons: {},

  inputs: {
    playerName:           document.getElementById("input-player-name"),
    lobbyCode:            document.getElementById("input-lobby-code"),
  },

  lists: {
    players:              document.getElementById("list-players"),
  },

  canvases: {
    game:                 document.getElementById("canvas-game")
  }
}

export function initDom() {
  // ---- Load Screen Doms ----
  loadDomItems(SCREENS);
  loadDomItems(BUTTONS);
  // loadDomItems(LISTS);
  // loadDomItems(INPUTS);
  // loadDomItems(CANVASES);

  validateDomItems();
}
function validateDomItems() {
  //TODO check index.html to see if their are any DOM elements that are not in dom.js
  // if not throw error this is a JS first approch to DOM management.
}

function loadDomItems(items) {
  Object.keys(items).forEach((item) => {
    dom.screens[item] = document.getElementById(items[item].id);
  });
}
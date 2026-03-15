import { 
  SCREENS, 
  BUTTONS,
} from "../../shared/constants.js"


export const dom = {
  screens: {
    mainMenu:         { id: "screen-main",              title: "Ahoy.io - Main Menu" },
    singleplayer:     { id: "screen-singleplayer",      title: "Ahoy.io - Single Player" },
    mmo:              { id: "screen-mmo",               title: "Ahoy.io - MMO" },
    lobbyCreate:      { id: "screen-lobby-create",      title: "Ahoy.io - Create Lobby" },
    lobbyJoin:        { id: "screen-lobby-join",        title: "Ahoy.io - Join Lobby" },
    lobbyHost:        { id: "screen-lobby-host",        title: "Ahoy.io - Lobby" },
    lobbyParticipant: { id: "screen-lobby-participant", title: "Ahoy.io - Lobby" },
    game:             { id: "screen-game",              title: "Ahoy.io - Game" }
  }, 

export const BUTTONS = {
  mainToSingleplayer:     { id: "button-main-singleplayer" },
  mainToLobbyJoin:        { id: "button-main-lobby-join" },
  mainToLobbyCreate:      { id: "button-main-lobby-create" },
  singleplayerStart:      { id: "button-singleplayer-start" },
  mmoStart:               { id: "button-mmo-start" },
  lobbyCreate:            { id: "button-lobby-create" }, 
  lobbyJoin:              { id: "button-lobby-join" },
  lobbyStart:             { id: "button-lobby-start" },
  lobbyLeave:             { id: "button-lobby-leave" },
}

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
  loadDomItems(SCREENS, dom.screens);
  loadDomItems(BUTTONS, dom.buttons);
  // loadDomItems(LISTS);
  // loadDomItems(INPUTS);
  // loadDomItems(CANVASES);

  validateDomItems();
}
function validateDomItems() {
  //TODO check index.html to see if their are any DOM elements that are not in dom.js
  // if not throw error this is a JS first approch to DOM management.
}

function loadDomItems(items, target) {
  Object.keys(items).forEach((key) => {
    target[key] = document.getElementById(items[key].id);
  });
}
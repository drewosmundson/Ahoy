import { ALL_SCREENS } from "../../shared/constants.js"



export const dom = {
  // ---- Screens ----
  // populated from constants
  screens: {},

  // ---- Buttons ----
  button: {
    mainSingleplayer:     document.getElementById("button-main-singleplayer"),
    mainLobbyJoin:        document.getElementById("button-main-lobby-join"),
    mainLobbyCreate:      document.getElementById("button-main-lobby-create"),
    singleplayerStart:    document.getElementById("button-singleplayer-start"),
    mmoStart:             document.getElementById("button-mmo-start"),
    lobbyCreate:          document.getElementById("button-lobby-create"),
    lobbyJoin:            document.getElementById("button-lobby-join"),
    lobbyStart:           document.getElementById("button-lobby-start"),
    lobbyLeave:           document.getElementById("button-lobby-leave"),
  },

  // ---- Inputs ----
  input: {
    playerName:           document.getElementById("input-player-name"),
    lobbyCode:            document.getElementById("input-lobby-code"),
  },

  // ---- Lists ----
  list: {
    players:              document.getElementById("list-players"),
  },

  // ---- Canvas ----
  canvas: {
    game:                 document.getElementById("canvas-game")
  }
}

// ---- Load Screen Doms ----
Object.keys(ALL_SCREENS).forEach((screen) => {
  dom.screens[screen] = document.getElementById(SCREEN_CONFIG[screen].id);
});

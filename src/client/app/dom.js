

export const dom = { 
  // ---- Screens ----
  screen: {
    home:                  document.getElementById("screen-home"),
    mainMenu:              document.getElementById("screen-main"),
    singleplayer:          document.getElementById("screen-singleplayer"),
    mmo:                   document.getElementById("screen-mmo"),//To be implemented
    lobbyCreate:           document.getElementById("screen-lobby-create"),
    lobbyJoin:             document.getElementById("screen-lobby-join"),
    lobbyHost:             document.getElementById("screen-lobby-host"),
    lobbyParticipant:      document.getElementById("screen-lobby-participant"),
    game:                  document.getElementById("screen-game")
  },

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
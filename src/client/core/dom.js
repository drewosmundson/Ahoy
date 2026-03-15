
export const dom = {
  screens: {
    mainMenu:             document.getElementById("screen-main"),
    singleplayer:         document.getElementById("screen-singleplayer"),     
    mmo:                  document.getElementById("screen-mmo"),               
    lobbyCreate:          document.getElementById("screen-lobby-create"),    
    lobbyJoin:            document.getElementById("screen-lobby-join"),        
    lobbyHost:            document.getElementById("screen-lobby-host"),        
    lobbyParticipant:     document.getElementById("screen-lobby-participant"), 
    game:                 document.getElementById("screen-game"),              
  }, 

  buttons: {
    mainToSingleplayer:   document.getElementById("button-main-singleplayer"),
    mainToLobbyJoin:      document.getElementById("button-main-lobby-join"),
    mainToLobbyCreate:    document.getElementById("button-main-lobby-create"),
    singleplayerStart:    document.getElementById("button-singleplayer-start"),
    mmoStart:             document.getElementById("button-mmo-start"),
    lobbyCreate:          document.getElementById("button-lobby-create"),
    lobbyJoin:            document.getElementById("button-lobby-join"),
    lobbyStart:           document.getElementById("button-lobby-start"),
    lobbyLeave:           document.getElementById("button-lobby-leave"),
  },

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

  //TODO check index.html to see if their are any DOM elements that are not in dom.js
  // if not throw error this is a JS first approch to DOM management.

}



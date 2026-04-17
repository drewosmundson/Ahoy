



export function createDom(){ 
    const screens = {
      mainMenu:             mustGet("screen-main"),
      singleplayer:         mustGet("screen-singleplayer"),     
      mmo:                  mustGet("screen-mmo"),               
      lobbyCreate:          mustGet("screen-lobby-create"),    
      lobbyJoin:            mustGet("screen-lobby-join"),        
      lobbyHost:            mustGet("screen-lobby-host"),        
      lobbyParticipant:     mustGet("screen-lobby-participant"), 
      game:                 mustGet("screen-game"),              
    };

    const buttons = {
      mainToSingleplayer:   mustGet("button-main-singleplayer"),
      mainToLobbyJoin:      mustGet("button-main-lobby-join"),
      mainToLobbyCreate:    mustGet("button-main-lobby-create"),
      singleplayerStart:    mustGet("button-singleplayer-start"),
      mmoStart:             mustGet("button-mmo-start"),
      lobbyCreate:          mustGet("button-lobby-create"),
      lobbyJoin:            mustGet("button-lobby-join"),
      lobbyStart:           mustGet("button-lobby-start"),
      lobbyLeave:           mustGet("button-lobby-leave"),
    };

    const inputs = {
      playerName:           mustGet("input-player-name"),
      lobbyCode:            mustGet("input-lobby-code"),
    };

    const lists = {
      players:              mustGet("list-players"),
    };

    const canvas = {
      game:                 mustGet("canvas-game")
    };

    return {screens, inputs, buttons, lists, canvas};
  }

function mustGet(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error('Missing DOM element: ${id}');
  return element;
}
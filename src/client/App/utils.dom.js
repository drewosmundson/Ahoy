



export function createDom() {
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

        mainToLobbyCreate:    mustGet("button-main-lobby-create"),
        mainToMMO:            mustGet("button-main-mmo"),

        singleplayerStart:    mustGet("button-singleplayer-start"),
        mmoStart:             mustGet("button-mmo-start"),

        lobbyCreate:          mustGet("button-lobby-create"),
        lobbyJoin:            mustGet("button-lobby-join"),
        lobbyStart:           mustGet("button-lobby-start"),
        hostLeave:            mustGet("button-host-leave"),
        participantLeave:     mustGet("button-participant-leave"),
    };

    const inputs = {
        hostName:   mustGet("input-host-name"),
        lobbyCode:  mustGet("input-lobby-code"),
    };

    const lists = {
        hostPlayers:         mustGet("list-host-players"),
        participantPlayers:  mustGet("list-participant-players"),
    };

    const displays = {
        hostLobbyCode:        mustGet("display-host-lobby-code"),
        participantLobbyCode: mustGet("display-participant-lobby-code"),
    };

    const canvas = {
      game:                 mustGet("canvas-game")
    };

    return { screens, inputs, buttons, lists, displays, canvas };
  }

function mustGet(id) {
  const el = document.getElementById(id);
  if (!el){
    console.log(id)
    throw new Error(`Missing element: ${id}`);
  } 
  return el;
}
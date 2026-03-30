








export const appEventSchemas = {
  [EVENTS.LOBBY.CREATE]: (data) =>
    typeof data.hostNickname === 'string' &&
    typeof data.socketId === 'string',

  [EVENTS.LOBBY.JOIN]: (data) =>
    typeof data.lobbyId === 'string' &&
    typeof data.socketId === 'string',

  [EVENTS.GAME.START]: (data) =>
    typeof data.lobbyId === 'string',
};


export const gameEventSchemas = {




}

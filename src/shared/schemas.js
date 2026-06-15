import { APP_EVENTS } from "./constants.js";


export const eventSchemas = {
  // ---- App Event Schemeas ----
  [APP_EVENTS.LOBBY.CREATE]: (data) =>
    typeof data.hostNickname === 'string' &&
    typeof data.socketId === 'string',

  [APP_EVENTS.LOBBY.JOIN]: (data) =>
    typeof data.lobbyId === 'string' &&
    typeof data.socketId === 'string',

  [APP_EVENTS.GAME.START]: (data) =>
    typeof data.lobbyId === 'string',
};


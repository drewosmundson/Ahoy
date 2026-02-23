


// ==== lobby.events.js ====

// ---- Client -> Server ----
export const ClientLobbyEvents = {
  CREATE_LOBBY: 'lobby:create',
  JOIN_LOBBY: 'lobby:join',
  LEAVE_LOBBY: 'lobby:leave',
  START_GAME: 'lobby:start',
  TERRAIN_READY: 'lobby:terrain_ready',
} 

// ---- Server -> Client ----
export const ServerLobbyEvents = {
  LOBBY_CREATED: 'lobby:created',
  LOBBY_JOINED: 'lobby:joined',
  LOBBY_UPDATED: 'lobby:updated',
  GAME_STARTED: 'game:started',
  ERROR: 'lobby:error',
  HOST_TRANSFERRED: 'lobby:host_transferred',
}


// current implmentation

// export const ClientLobbyEvents = {
//   CREATE_LOBBY_REQUEST: 'createLobbyRequest',
//   JOIN_LOBBY_REQUEST: 'joinLobbyRequest',
//   LEAVE_LOBBY_REQUEST: 'leaveLobbyRequest',
//   START_GAME: 'startGame',
//   DEBUG: 'debug',
// }


// export const ServerLobbyEvents = {
//   LOBBY_CREATED: 'lobbyCreated',
//   LOBBY_JOINED: 'lobbyJoined',
//   LOBBY_UPDATED: 'lobbyUpdated',
//   GAME_STARTED: 'gameStarted',
//   TERRAIN_DATA_RECEIVED: 'terrainDataReceived',
//   ERROR: 'error',
// }









// ==== ui.events.js ====
export const NavigationEvents = {
  NAVIGATE_MAIN_MENU: 'nav:main_menu',
  NAVIGATE_SINGLE_PLAYER_MENU: 'nav:single_player_menu',
  NAVIGATE_CREATE_LOBBY: 'nav:create_lobby',
  NAVIGATE_JOIN_LOBBY: 'nav:join_lobby',
  NAVIGATE_HOST_LOBBY: 'nav:host_lobby',
  NAVIGATE_PARTICIPANT_LOBBY: 'nav:participant_lobby',
  NAVIGATE_GAME: 'nav:game',
  NAVIGATE_BACK: 'nav:back',
}


export const UIEvents = {
  CLICK_SINGLE_PLAYER_MENU: 'ui:click_single_player_menu',
  CLICK_SINGLE_PLAYER_START: 'ui:click_single_player_start',

  CLICK_CREATE_LOBBY_MENU: 'ui:click_create_lobby_menu',
  CLICK_CREATE_LOBBY_CONFIRM: 'ui:click_create_lobby_confirm',

  CLICK_JOIN_LOBBY_MENU: 'ui:click_join_lobby_menu',
  CLICK_JOIN_LOBBY_CONFIRM: 'ui:click_join_lobby_confirm',

  CLICK_START_GAME: 'ui:click_start_game',
  CLICK_LEAVE_LOBBY: 'ui:click_leave_lobby',

  SOCKET_DISCONNECTED: 'ui:socket_disconnected',
};

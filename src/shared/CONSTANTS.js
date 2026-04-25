



export const APP_EVENTS = {
  LOBBY: { 
    CREATE:      'lobby:create',
    CREATED:     'lobby:created',

    JOIN:        'lobby:join',
    JOINED:      'lobby:joined',

    LEAVE:       'lobby:leave',
    UPDATE:      'lobby:update',
  },

  MMO: {
    JOIN:        'MMO:join',
    JOINED:      'MMO:joined',
  }, 

  GAME: {
    START:       'game:start',
    STARTED:     'game:started',
  }, 

  UTIL: { 
    DISCONNECT:  'disconnect',
    ERROR:       'error'
  }
}

export const GAME_EVENTS = {




}

export const TITLE = {
  mainMenu:             "Ahoy.io - Main Menu",
  singleplayer:         "Ahoy.io - Single Player",
  mmo:                  "Ahoy.io - MMO",
  lobbyCreate:          "Ahoy.io - Create Lobby",
  lobbyJoin:            "Ahoy.io - Join Lobby", 
  lobbyHost:            "Ahoy.io - Lobby", 
  lobbyParticipant:     "Ahoy.io - Lobby",
  game:                 "Ahoy.io - Game",
}


export const CSS_HIDDEN_CLASS = "hidden"
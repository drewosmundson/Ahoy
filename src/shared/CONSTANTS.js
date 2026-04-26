


export const HEIGHTMAP = {

  mapSize: 512,

  multiplyer: 90,

  addition: 0.2,

  base: {
      scale: 0.015,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2,
      falloff: true,
      falloffStrength: 4,
      falloffScale: 0.9,

      barrierWidth: 0.1,        // Width of barrier as fraction of map size (0.15 = 15%)
      barrierHeight: 0.6,        // Height of barrier (0-1)
      barrierFalloff: 0.5,       // How sharply barrier falls off inward
      barrierNoise: true,        // Add noise to barrier for natural look
      barrierNoiseScale: 0.04    // Scale of noise applied to barrier
  },
  overlays: [
    overlay1 = {
      scale: 0.01,
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2,
      falloff: false,
      falloffStrength: 4,
      falloffScale: 0.9,

      mountainBarrier: true,
      barrierWidth: 0.4,        // Width of barrier as fraction of map size (0.15 = 15%)
      barrierHeight: 0.9,        // Height of barrier (0-1)
      barrierFalloff: 2.0,       // How sharply barrier falls off inward
      barrierNoise: true,        // Add noise to barrier for natural look
      barrierNoiseScale: 0.04    // Scale of noise applied to barrier
    },
    // overlay2 = {}, 
    // overlay3 = {}
  ]
}


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
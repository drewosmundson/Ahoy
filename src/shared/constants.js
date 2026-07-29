


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

export const KEYBINDINGS = {
    0:          'fireProjectileLeft',
    2:          'fireProjectileRight',
    KeyW:       'moveForward',
    ArrowUp:    'moveForward',
    KeyS:       'moveBackward',
    ArrowDown:  'moveBackward',
    KeyA:       'moveLeft',
    ArrowLeft:  'moveLeft',
    KeyD:       'moveRight',
    ArrowRight: 'moveRight',
    KeyM:       'showMap',
    KeyC:       'toggleCamera',
    KeyP:       'toggleTerrain',
    KeyF:       'toggleFog',
    Escape:     'exitPointerLock',
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



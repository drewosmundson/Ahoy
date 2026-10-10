// EventRegistery.js
export const SimulationEvents = Object.freeze({
    KEY_DOWN: "keydown",
    KEY_UP:   "keyup",
});

export const NetworkEvents = Object.freeze({
    PLAYER_JOINED: "playerJoined",
    STATE_UPDATE:  "stateUpdate",
});

export const FrameEvents = Object.freeze({
    WINDOW_RESIZED: "windowResized",
    MOUSE_MOVE:     "mousemove",
});

export const SyncEvents = Object.freeze({

});


export const simulationEvents = Object.values(SimulationEvents);
export const networkEvents    = Object.values(NetworkEvents);
export const frameEvents      = Object.values(FrameEvents);
export const syncEvents       = Object.values(SyncEvents);
const stateDefaults = { 

  // User State
  socket: null,
  host: true,
  currentLobbyId: null,
  screen: null,

  // Game State
  multiplayer: false,
  game: null,
  heightmap: null,
  heightmapOverlay: null,
};

let _state = { ...stateDefaults };

function setState(updates) {
  Object.assign(_state, updates);
}

function getStateValue(key) {
  return _state[key];
}

function getState() {
  return { ..._state };
}

export const state = {
  getState, 
  setState,
  getStateValue
}

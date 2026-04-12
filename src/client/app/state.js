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

function setStateValue(updates) {
  Object.assign(_state, updates);
}

function getStateValue(key) {
  return _state[key];
}

export const state = {
  setStateValue,
  getStateValue
}

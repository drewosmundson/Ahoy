



const state = { 
  socket: null,
  game: null,
  host: true,
  currentLobbyId: null,
  multiplayer: false,
  heightmap: null,
  heightmapOverlay: null,
  screen: null
};

export function setState(updates) {
  Object.assign(state, updates);
}

export function getStateValue(key) {
  return state[key];
}

export function getState() {
  return { ...state };
}




const state = { 
  socket: null,
  game: null,
  host: true,
  currentLobbyId: null,
  multiplayer: false,
  heightmap: null,
  heightmapOverlay: null,
};

export function setState(updates) {
  Object.assign(state, updates);
}

export function getStateValue(state) {
  return Object.values(state);
}

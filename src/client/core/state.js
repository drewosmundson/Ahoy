const userStateValues = { 
  socket: null,
  game: null,
  host: true,
  currentLobbyId: null,
  multiplayer: false,
  heightmap: null,
  heightmapOverlay: null,
  screen: null
};

let _userState = { ...userStateValues }

function setState(updates) {
  Object.assign(_userState, updates);
}

function getStateValue(key) {
  return _userState[key];
}

function getState() {
  return { ..._userState };
}

export const userState = {
  getState, 
  setState,
  getStateValue
}
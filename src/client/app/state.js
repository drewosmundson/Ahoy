const appState = {
  socket: null,
  host: true,
  currentLobbyId: null,
  currentScreen: 'mainMenu'
};

const gameConfig = {
  multiplayer: false,
  heightmap: null,
  heightmapOverlay: null
};

let game = null;
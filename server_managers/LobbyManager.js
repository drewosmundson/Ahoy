import { HeightmapGenerator } from '../server_utils/HeightmapGenerator.js';
import { ClientLobbyEvents, ServerLobbyEvents } from '../shared/lobby.events.js';

// make the heigtmap use a seed for everyone to use the same map
// or run on the server so that there is reduced loading times creating a map
// and a bunch of predetermined heightmaps are ready to go
export class LobbyManager {
  constructor(io) {
    this.io = io;
    this.lobbies = new Map();
  }
  initializeSockets(socket) {
    // Lobby-related event handlers
    socket.on(ClientLobbyEvents.START_GAME, (data) => {
      this.startGame(socket, data);
    });

    socket.on(ClientLobbyEvents.TERRAIN_GENERATED, (terrainData) => {
      this.handleTerrainGenerated(socket, terrainData);
    });
    
    socket.on(ClientLobbyEvents.CREATE_LOBBY_REQUEST, (data) => {
      this.createLobby(socket, data);
    });

    socket.on(ClientLobbyEvents.JOIN_LOBBY_REQUEST, (data) => {
      this.joinLobby(socket, data);
    });

    socket.on(ClientLobbyEvents.LEAVE_LOBBY_REQUEST, () => {
      this.leaveLobby(socket);
    });

    socket.on(ClientLobbyEvents.CONFIRM_GAME_START, (data) => {
      this.confirmGameStart(socket, data);
    });
  }

  generateLobbyCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  //this.lobbies[socket.currentLobby]
  startGame(socket) {
    if (socket.currentLobby && this.lobbies.get(socket.currentLobby) && 
       this.lobbies.get(socket.currentLobby).host === socket.id) {

      this.updateLobby(socket.currentLobby, { gameStarted: true });
      this.io.to(socket.currentLobby).emit(ServerLobbyEvents.GAME_STARTED);

      console.log("Game started for lobby", socket.currentLobby);
    }
  }

  handleTerrainGenerated(socket, terrainData) {
    const currentLobby = socket.currentLobby;
    const lobby = this.getLobby(currentLobby);
    
    if (currentLobby && lobby && lobby.host === socket.id) {
      this.updateLobby(currentLobby, {
        terrainData: terrainData,
        gameStarted: true
      });

      const gameStartedData = {
        terrainData: terrainData.terrainData
      };

      socket.to(currentLobby).emit(ServerLobbyEvents.GAME_STARTED, gameStartedData);
      socket.to(currentLobby).emit(ServerLobbyEvents.TERRAIN_DATA_RECEIVED, gameStartedData);
    }
  }
  createLobby(socket, data) {
    const lobbyCode = this.generateLobbyCode();
    const lobbyName = data?.lobbyName || `Lobby ${lobbyCode}`;
    const heightmapGenerator = new HeightmapGenerator();
    const heightmap = heightmapGenerator.heightmap;
    const heightmapOverlay = heightmapGenerator.heightmapOverlay;

    this.lobbies.set(lobbyCode, {
      id: lobbyCode,
      host: socket.id,
      heightmap: heightmap,
      heightmapOverlay: heightmapOverlay,
      players: [{
        id: socket.id,
        name: `Player ${socket.id.substr(0, 4)}`,
        isHost: true,
        health: 100,
        maxHealth: 100,
        alive: true
      }],
      settings: {
        gameMode: "noBots",
        terrainType: "default"
      },
      gameStarted: false,
      chatMessages: []
    });

    socket.join(lobbyCode);
    socket.currentLobby = lobbyCode;

    console.log(`Lobby created: ${lobbyCode} by ${socket.id}`);

    socket.emit(ServerLobbyEvents.LOBBY_CREATED, {
      lobbyId: lobbyCode,
      lobbyName,
      players: this.lobbies.get(lobbyCode).players,
      heightmap: this.lobbies.get(lobbyCode).heightmap,
      heightmapOverlay: this.lobbies.get(lobbyCode).heightmapOverlay
    });
  }

  joinLobby(socket, data) {
    const { lobbyId } = data;

    if (this.lobbies.get(lobbyId)) {
      const playerData = {
        id: socket.id,
        name: `Player ${socket.id.substr(0, 4)}`,
        isHost: false,
        health: 100,
        maxHealth: 100,
        alive: true
      };

      this.lobbies.get(lobbyId).players.push(playerData);
      socket.join(lobbyId);
      socket.currentLobby = lobbyId;

      console.log(`Player ${socket.id} joined lobby ${lobbyId}`);

      const lobby = this.lobbies.get(lobbyId);

      // Send player the current lobby state
      socket.emit(ServerLobbyEvents.LOBBY_JOINED, {
        lobbyId,
        lobbyName: lobby.name,
        players: lobby.players,
        heightmap: lobby.heightmap,
        heightmapOverlay: lobby.heightmapOverlay,
        gameStarted: lobby.gameStarted
      });

      // If game is already started, send terrain data
      if (lobby.gameStarted && lobby.terrainData) {
        socket.emit(ServerLobbyEvents.GAME_STARTED, {
          terrainData: lobby.terrainData.terrainData
        });
      }

      // Notify others about updated player list
      socket.to(lobbyId).emit(ServerLobbyEvents.LOBBY_UPDATED, {
        players: lobby.players
      });
    } else {
      socket.emit(ServerLobbyEvents.ERROR, { message: "Lobby not found" });
    }
  }

  leaveLobby(socket) {
    const currentLobby = socket.currentLobby;
    
    if (currentLobby && this.lobbies.get(currentLobby)) {
      const lobby = this.lobbies.get(currentLobby);
      lobby.players = lobby.players.filter(
        player => player.id !== socket.id
      );

      console.log(`Player ${socket.id} left lobby ${currentLobby}`);

      // Handle host transfer or lobby deletion
      if (lobby.host === socket.id) {
        if (lobby.players.length > 0) {
          const newHost = lobby.players[0];
          lobby.host = newHost.id;
          newHost.isHost = true;
          this.io.to(newHost.id).emit(ServerLobbyEvents.BECAME_HOST);
        } else {
          this.lobbies.delete(currentLobby);
          socket.currentLobby = null;
          return;
        }
      }

      socket.leave(currentLobby);

      if (this.lobbies.get(currentLobby)) {
        this.io.to(currentLobby).emit(ServerLobbyEvents.LOBBY_UPDATED, {
          players: this.lobbies.get(currentLobby).players
        });
      }

      socket.currentLobby = null;
    }
  }

  confirmGameStart(socket, data) {
    const { lobbyId, socketId } = data;

    if (this.lobbies.get(lobbyId)) {
      const lobby = this.lobbies.get(lobbyId);
      const existingPlayer = lobby.players.find(p => p.id === socketId);

      if (!existingPlayer) {
        const wasHost = lobby.host === socketId;
        const playerIndex = lobby.players.findIndex(p =>
          p.id !== socketId && p.isHost === wasHost
        );

        if (playerIndex !== -1) {
          lobby.players[playerIndex].id = socket.id;
          if (wasHost) {
            lobby.host = socket.id;
          }
        }
      }

      socket.join(lobbyId);
      socket.currentLobby = lobbyId;
    }
  }

  handleDisconnection(socket) {
    for (const [lobbyId, lobby] of this.lobbies) {
      const index = lobby.players.findIndex(p => p.id === socket.id);

      if (index !== -1) {
        const wasHost = lobby.players[index].isHost;

        // Remove player
        lobby.players.splice(index, 1);
        console.log(`Removing disconnected player: ${socket.id} from lobby ${lobbyId}`);

        // Promote new host if necessary
        if (wasHost && lobby.players.length > 0) {
          lobby.players[0].isHost = true;
          lobby.host = lobby.players[0].id;
          console.log(`Promoting new host: ${lobby.players[0].id}`);
        }

        // Delete empty lobby
        if (lobby.players.length === 0) {
          this.lobbies.delete(lobbyId);
          console.log(`Deleted empty lobby ${lobbyId}`);
        } else {
          // Notify remaining players
          this.io.to(lobbyId).emit(ServerLobbyEvents.LOBBY_UPDATED, {
            players: lobby.players
          });
        }

        break;
      }
    }
  }


  // Getters for other managers
  getLobby(lobbyId) {
    return this.lobbies.get(lobbyId);
  }

  updateLobby(lobbyId, updateData) {
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      Object.assign(lobby, updateData);
    }
  }

  // Debugging utility
  printArrayValues(array) {
    let values = [];
    array.forEach(function(item) { values.push(item); });
    console.log(values);
  }
}
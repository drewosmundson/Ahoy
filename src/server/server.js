// ---- Imports ----
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { CONSTANTS } from './utils/CONSTANTS';

import { LobbyManager } from './server_managers/LobbyManager.js';
import { GameManager } from './server_managers/GameManager.js';

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Implement once domain aquired
// const io = new Server(server, {cors: { origin: ['https://ahoy.io'] }});

server.on('error', (err) => {
  console.error('HTTP SERVER ERROR');
  console.error(err);
  process.exit(1);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Initialize managers
const lobbyManager = new LobbyManager();
lobbyManager.start();

const gameManager = new GameManager();
gameManager.start();

// Initialize handlers

import { dom } from "./dom.js";


export function createUI(dom) { 
  return {updatePlayerList, updateLobbyCodeDisplay}

  // functions that update the DOM 
  function updatePlayerList(players) {
    dom.playerListItems.forEach(el => {
      if (!el) return;
      el.innerHTML = '';
      players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name || player.id;
        if (player.isHost) li.textContent += ' (Host)';
        el.appendChild(li);
      });
    });
  }
  
  function updateLobbyCodeDisplay(lobbyId) {
    dom.lobbyCodeDisplay.forEach(el => {
      if (el) el.textContent = lobbyId;
    });
    }
}
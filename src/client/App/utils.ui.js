

export function createUi(dom) { 
  // functions that update the DOM 
    function updatePlayerList(players) {
        [dom.lists.hostPlayers, dom.lists.participantPlayers].forEach(el => {
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
        [dom.displays.hostLobbyCode, dom.displays.participantLobbyCode].forEach(el => {
            if (el) el.textContent = lobbyId;
        });
    }

    return { updatePlayerList, updateLobbyCodeDisplay}

}
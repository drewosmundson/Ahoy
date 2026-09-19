






export const lobbyEventSchemas = {
    'game:start': (data) => typeof data.gameId === 'string' && typeof data.lobbyId === 'string',
    'game:stop': (data) => typeof data.reason === 'string',
    'player-joined': (data) => typeof data.playerId === 'string',
};
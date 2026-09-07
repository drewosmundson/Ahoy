    
    
function getIntents({ inputs, worldState, dt }) {
    const userIntents = inputCoordinator.create(inputs, worldState);
    const aiIntents = aiCoordinator.create(worldState, dt);
    return {...userIntents, ...aiIntents}
}

function userIntents(inputs, worldState){}

function aiIntents() {}


// grab DOM
// wire modules together
// start navigation
// start socket layer

// Dependancy singleton factories
import { createNavigation } from "./app/navigation.js";
import { createDom } from "./app/dom.js";
import { createUi } from "./app/ui.js"
import { registerSubscriptions } from "./app/subscriptions.js";

// Page/feature module archetecture. 
import { singleplayer } from "./features/singleplayer.js"
import { host } from "./features/host.js"
import { participant } from "./features/participant.js";
import { mmo } from "./features/mmo.js"


import { lobbyEventSchemas } from "../shared/lobbyEventSchemas.js";


// Game Engine
import { Engine } from "./Engine/Engine.js";

// playable Games 
import { games } from "./Games"

document.addEventListener('DOMContentLoaded', () => {
    const engine = new Engine()

    const dom = createDom();
    const navigate = createNavigation(dom);
    const ui = createUi(dom);
    const socket = io();
    const subscriptions = registerSubscriptions(engine, socket, lobbyEventSchemas)


    // This creates a shared context and passes it to each feature
    // to create their instances, then initializes each feature's event listeners.
    const context = {
        games,

        engine,
        dom,
        navigate,
        ui,
        socket,
        subscriptions,
    };
    
    // catch if page reloaded with no internet 
    if (!socket.connected) {
        navigate.toScreen(dom.screens.offline)
        singleplayer(context).initEventListeners();
    }

    // As this grows, it may be worth initializing only the
    // event listeners required by for the active features.
    // For now this is fine since each feature only has about 3 listeners.
    [singleplayer, host, participant, mmo]
        .map(feature => feature(context))
        .forEach(feature => { 
            feature.initEventListeners();
            // feature.otherFunction(); 
        });
});



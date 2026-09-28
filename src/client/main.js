

// grab DOM
// wire modules together
// start navigation
// start socket layer

// Dependancy singleton factories
import { createNavigation } from "./App/navigation.js";
import { createDom } from "./App/dom.js";
import { createUi } from "./App/ui.js"
import { createSubscriptionRegister } from "./App/subscriptions.js";

// Page/feature module archetecture. 
import { singleplayer } from "./Features/singleplayer.js"
import { host } from "./Features/host.js"
import { participant } from "./Features/participant.js";
import { mmo } from "./Features/mmo.js"

// Game Engine
import { Engine } from "./Engine/Engine.js";

// Playable Games 
import { games } from "./Games/gamesIndex.js"

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    
    const dom = createDom();
    const navigate = createNavigation(dom);
    const ui = createUi(dom);
    const subscriptionRegister = createSubscriptionRegister()
  
    // This creates a shared context and passes it to each feature
    // to create their instances, then initializes each feature's event listeners.
    const context = {
        dom,
        navigate,
        ui,
        subscriptionRegister,

        Engine,
        games,
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





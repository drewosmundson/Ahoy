

// grab DOM
// wire modules together
// start navigation
// start socket layer

// Dependancy singleton factories
import { createNavigation } from "./App/utils.navigation.js";
import { createDom } from "./App/utils.dom.js";
import { createUi } from "./App/utils.ui.js"
import { createSubscriptionRegister } from "./App/utils.subscriptions.js";

// Page/feature module archetecture. 
import { singleplayer } from "./App/page.singleplayer.js"
import { host } from "./App/page.host.js"
import { participant } from "./App/page.participant.js";
import { mmo } from "./App/page.mmo.js"

// Game Engine
import { Engine } from "./Engine/Engine.js";

// Playable Games 
import { GraphicsContext } from "./Graphics/Graphics.js";

import { Template } from "./GameFiles/Template.js"

const games  = {
    Template
}


document.addEventListener('DOMContentLoaded', () => {
    const socket   = io();
    const dom      = createDom();
    const navigate = createNavigation(dom);
    const ui       = createUi(dom);
    const subscriptionRegister = createSubscriptionRegister()
    // This creates a shared context for each feature
    const context = {
        dom,
        navigate,
        ui,
        subscriptionRegister,
        GraphicsContext,
        Engine,
        games,
    };
    
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err.message);
        navigate.toScreen(dom.screens.singleplayer);
    });

    socket.on('disconnect', (reason) => {
        console.warn('Socket disconnected:', reason);
    });
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





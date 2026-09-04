
// grab DOM
// wire modules together
// start navigation
// start socket layer

// Dependancy singleton factories
import { createNavigation } from "./app/navigation.js";
import { createDom } from "./app/dom.js";
import { createUi } from "./app/ui.js"
import { createEmitter } from "./app/emitter.js"

// Page/feature module archetecture. 
import { singleplayer } from "./features/singleplayer.js"
import { host } from "./features/host.js"
import { participant } from "./features/participant.js";
import { mmo } from "./features/mmo.js"

import { eventSchemas } from "../shared/schemas.js";
import { Game } from "./game/Game.js";

document.addEventListener('DOMContentLoaded', () => {
    const dom = createDom();
    const navigate = createNavigation(dom);
    const ui = createUi(dom);
    
    const socket = io();

    const networkBus = new NetworkEventBus(eventSchemas.network, socket);
    const simulationBus = new LocalEventBus(eventSchemas.simulation);
    const effectsBus = new LocalEventBus(eventSchemas.effects)

    // This creates a shared context and passes it to each feature
    // to create their instances, then initializes each feature's event listeners.
    const context = {
        dom,
        navigate,
        ui,
        networkBus,
        simulationBus,
        effectsBus,
        Game,
    };
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



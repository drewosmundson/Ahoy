
// grab DOM
// wire modules together
// start navigation
// start socket layer

// dependancy singleton factories
import { createNavigation } from "./app/navigation.js";
import { createDom } from "./app/dom.js";
import { createUi } from "./app/ui.js"
import { createEmitter } from "./app/emitter.js"

// page/feature module archetecture. 
import { singleplayer } from "./features/singleplayer.js"
import { host } from "./features/host.js"
import { participant } from "./features/participant.js";
import { mmo } from "./features/mmo.js"

import { eventSchemas } from "../shared/schemas.js";
import { Game } from "./game/Game.js";
import { NetworkInterface } from "./app/network.js";

document.addEventListener('DOMContentLoaded', () => {
    const dom = createDom();
    const navigate = createNavigation(dom);
    const ui = createUi(dom);
    
    const socket = io();

    const networkInterface =  createEmitter(socket, eventSchemas);


    const context = {
        dom,
        navigate,
        ui,
        networkInterface,
        Game,
    };
    // As this becomes large it would be good practice to inialize only the nessesary event listeners
    // For now this is fine as there are only about 3 event listeners for each feature
    [singleplayer, host, participant, mmo]
        .map(feature => feature(context))
        .forEach(feature => { 
            feature.initEventListeners();
            // feature.otherFunction(); 
        });
});


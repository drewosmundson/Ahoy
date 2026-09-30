
// Game.js
// import { Config } from './Config/index.js';
import { RendererManager } from './Utils/RendererManager.js';

import { frameEvents } from './Events/frameEvents.js';
import { networkEvents } from './Events/networkEvents.js';
import { simulationEvents } from './Events/simulationEvents.js';
import { syncEvents } from './Events/syncEvents.js';

// import { Components } from './components/index.js';
// import { PresentationComponents } from './presentationComponents/index.js';

// import { SimulationSystems } from './systems/simulation/index.js';
// import { NetworkSystems } from './systems/network/index.js';
// import { EffectSystems } from './systems/effect/index.js';
// import { PresentationSystems } from './systems/presentation/index.js';
// import { Services } from './services/index.js';

export const Template = {
    //  --- required ---
    RendererManager,

    // Events
    frameEvents,
    networkEvents,
    simulationEvents,
    syncEvents,

    Interfaces,
    // Services,
    // Interfaces,

    // Components,
    // SimulationSystems,
    // NetworkSystems,
    // EffectSystems,
    // PresentationSystems,

};


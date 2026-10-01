
// Game.js
// import { Config } from './Config/index.js';
import { Renderer } from './Utils/RendererManager.js';

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
    Renderer,

    // World data component factories
    Components: [

    ],


    // Events
    simulationEvents,
    frameEvents,
    networkEvents,
    syncronousEvents,


    // Interfaces
    simulationInterfaces: [

    ],
    networkInterfaces: [

    ],
    mouseInterface: [

    ],
    browserInterface: [

    ],


    // Systems 
    SimulationBufferedSystems: [

    ],
    NetworkBufferedSystems: [

    ],
    FrameBufferedSystems: [

    ],

    SyncronousEventSystems: [

    ],


    // Services
    Services: [

    ],
};




import {} from "./Components";
import {} from "./Systems";
import { GAME_CONFIG } from 'Constants.js'

// Ordering of items here affects execution
export const Game = {
    GAME_CONFIG, 

    Components: [


    ],

    SimulationSystems: [
        MovementSystem,
        CollisionSystem,
    ],

    EventSystems: [
        CollisionEventSystem,
    ],

    NetworkSystems: [
        ReconciliationSystem,
    ],

    Services: [
        BrowserEvents,
        CameraManager,
        RenderManager,
        AudioManager,
    ],
};


import { Engine } from "../../Engine/Engine";
import {} from "./Components";
import {} from "./Systems";

// Ordering of items here affects execution
export const Game = {
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


    Presentation: [



    ],
};
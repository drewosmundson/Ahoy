

import {} from "./Components-Simulation";
import {} from "./Systems";
import { GAME_CONFIG } from 'Constants.js'



// Ordering of items here affects execution
export const Game = {
    GAME_CONFIG, 

    Renderer: RenderManager,

    Components: [


    ],

    Interfaces: [


    ],
    // Simulation Layer: interfaces -> buffer -> poll user updates on game tick + worlddata = changes
    SimulationSystems: [

    ],

    // changes + world data = changes + presentation emit
    EventSystems: [

    ],

    // changes + world data = changes + presentation emit
    NetworkSystems: [
        

    ],

    // eventData + world data = presenation emit
    // Event.on 

    // networkEventData + worldData = 
    // Network.on


    // changes are they applied to world data
    // world data read by engine services and then rendered to the screen or audio effect played
    Services: [
        BrowserEvents,
        CameraManager,
        AudioManager,
    ],
};
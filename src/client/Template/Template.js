import { RenderManager } from "./Utils/RenderManager.js";
import { CameraManager } from "./Utils/CameraManager.js"
import { SceneManager } from "./Utils/SceneManager.js"

import { events } from "./EventRegistry.js"

import { BrowserInterface } from "./Interfaces/Browser.js";



import { RotatingCube } from './Components/Services/RotatingCube.js';



export const Template = {

    // Required Utilies to display the world data to the screen 
    // These utilites hold the required Three objects to actually see the game on the screen
    RenderManager: RenderManager,
    CameraManager: CameraManager,
    SceneManager:  SceneManager,


    events: events,


    // === ECS ================
    // WorldData component names
    Components: [],



    SimulationInterfaces: [],
    NetworkInterfaces: [],
    FrameInterfaces: [],
    SyncInterfaces: [BrowserInterface],

    SimulationSystems: [],
    NetworkSystems: [],
    FrameSystems: [],
    SyncSystems: [],

    // Services read world data that was updated by systems 
    // They tell the scene what to add given world data info.
    Services: [RotatingCube],
};
import { RenderManager } from "./Utils/RenderManager.js";
import { CameraManager } from "./Utils/CameraManager.js"
import { SceneManager } from "./Utils/SceneManager.js"


import { RotatingCube } from './Services/RotatingCube.js';



export const Template = {

    // Required Utilies to display the world data to the screen 
    // These utilites hold the required Three objects to actually see the game on the screen
    RenderManager: RenderManager,
    CameraManager: CameraManager,
    SceneManager:  SceneManager,


    // === ECS ================
    // WorldData component names
    Components: [],


    // Event name lists (arrays of strings)
    simulationEvents: [],
    networkEvents: [],
    frameEvents: [],
    syncEvents: [],

    SimulationInterfaces: [],
    NetworkInterfaces: [],
    FrameInterfaces: [],
    SyncInterfaces: [],

    SimulationSystems: [],
    NetworkSystems: [],
    FrameSystems: [],
    SyncSystems: [],

    // Services read world data that was updated by systems 
    // They tell the scene what to add given world data info.
    Services: [RotatingCube],
};
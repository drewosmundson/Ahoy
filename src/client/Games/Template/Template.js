import { RendererWrapper } from "./Utils/RendererWrapper.js";
import { CameraWrapper } from "./Utils/camera.js"
import { SceneWrapper } from "./Utils/scene.js"


import { RotatingCube } from './Services/RotatingCube.js';

export const Template = {
    RendererWrapper,
    CameraWrapper,
    SceneWrapper,

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

    Services: [RotatingCube],
};
import { RendererManager } from "./Utils/Renderer.js";
import { TestRendererService } from './Services/TestService.js';

export const Template = {
    RendererManager,

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

    Services: [TestRendererService],
};
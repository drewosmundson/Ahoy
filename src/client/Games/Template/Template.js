import { RendererManager } from "./Renderer.js";
import { TestRendererService } from './Services/TestService.js';

export const Template = {
    RendererManager,

    // Event name lists (arrays of strings)
    simulationEvents: [],
    frameEvents: [],
    syncEvents: [],
    networkEvents: [],

    // WorldData component names
    Components: [],

    SimulationInterfaces: [],
    NetworkInterfaces: [],
    FrameInterfaces: [],
    SyncInterfaces: [],

    SyncEvents: [],

    SimulationSystems: [],
    NetworkSystems: [],
    FrameSystems: [],

    Services: [TestRendererService],
};
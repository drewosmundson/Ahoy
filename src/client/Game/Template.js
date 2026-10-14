


import { events } from "./EventRegistry.js"

import { BrowserInterface } from "./Interfaces/Browser.js";

import { RotatingCube } from './Services/RotatingCube.js';


export const Template = {

    // === ECS ================
    // WorldData component names
    Components: [],

    events: events,

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
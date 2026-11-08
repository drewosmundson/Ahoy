
import { Position } from './Components/Position.js';
import { Velocity } from './Components/Velocity.js';
import { Controlled } from './Components/Controlled.js';
import { CameraState } from "./Components/CameraState.js"

import { KeypressInterface } from './Interfaces/Keypress.js'
import { MouseInterface } from './Interfaces/Mouse.js';


import { PlayerInputSystem } from "./Systems/PlayerInputSystem.js";
import { CubeMoveSystem } from './Systems/CubeMoveSystem.js';
import { SingleplayerInit } from "./Systems/SingleplayerInit.js";
import { CameraSystem } from './Systems/CameraSystem.js';


import { BoatService } from './Services/RotatingCubeService.js';
import { TerrainService } from "./Services/Terrain.js";
import { Heightmap } from "./Components/Heightmap.js";
import { CameraService } from './Services/CameraService.js';

// EventRegistery.js
const EVENTS = Object.freeze({
    KEY_DOWN:     "keyDown",
    KEY_UP:       "keyUp",
    
    MOUSE_MOVE:   "mouseMoved",

    MOUSE_WHEEL:  "wheel",
    CAMERA_DRAG_START: "cameraDragStart", 
    CAMERA_DRAG_END: "cameraDragEnd",

});

const events = Object.values(EVENTS);

export const Template = {
    // === ECS ================
    // WorldData component names
    Components: {
        Position,
        Velocity,
        Controlled,
        Heightmap,
        CameraState,
    },

    events: events,

    SimulationInterfaces: [KeypressInterface],
    NetworkInterfaces: [],
    FrameInterfaces: [MouseInterface],


    SimulationSystems: [SingleplayerInit, PlayerInputSystem, CubeMoveSystem],
    NetworkSystems: [],
    FrameSystems: [CameraSystem],


    // Services read world data that was updated by systems 
    // They tell the scene what to add given world data info.
    Services: [ 
        BoatService, 
        TerrainService,
        CameraService,
    ],
};
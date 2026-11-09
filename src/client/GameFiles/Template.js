
import { Position } from './Components/Position.js';
import { Velocity } from './Components/Velocity.js';
import { Controlled } from './Components/Controlled.js';
import { CameraState } from "./Components/CameraState.js"
import { Heightmap } from "./Components/Heightmap.js";


import { KeypressInterface } from './Interfaces/Keypress.js'
import { MouseInterface } from './Interfaces/Mouse.js';


import { PlayerInputSystem } from "./Systems/PlayerInputSystem.js";
import { CubeMoveSystem } from './Systems/CubeMoveSystem.js';
import { SingleplayerInit } from "./Systems/SingleplayerInit.js";
import { CameraSystem } from './Systems/CameraSystem.js';


import { BoatService } from './Rendering/RotatingCubeService.js';
import { TerrainService } from "./Rendering/Terrain.js";
import { CameraService } from './Rendering/CameraService.js';


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

    Events: {
        "keyDown",
         "keyUp",
        "mouseMoved",
         "mouseWheel",
    } 

    SimulationInterfaces: [KeypressInterface],
    NetworkInterfaces: [],
    FrameInterfaces: [MouseInterface],


    SimulationSystems: [SingleplayerInit, PlayerInputSystem, CubeMoveSystem],
    NetworkSystems: [],
    FrameSystems: [CameraSystem],


    // Services read world data that was updated by systems 
    // They tell the scene, audio, and camera what to add given world data info.
    Services: [ 
        // Scene
        BoatService, 
        ProjectileService,
        TerrainService,
        
        // Camera
        CameraService,
        
        // Audio 
        MusicService,
        SoundEffectService
    ],
};











// Systems: {
//     simulation: {
//         local: [
//             SingleplayerInit,
//             PlayerInputSystem,
//             CubeMoveSystem,
//         ],

//         network: [],
//     },

//     presentation: {
//         frame: [
//             CameraSystem,
//         ],
//     },
// },
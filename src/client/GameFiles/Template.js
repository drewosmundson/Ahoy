
import { Position } from './Components/Position.js';
import { Velocity } from './Components/Velocity.js';
import { Controlled } from './Components/Controlled.js';
import { CameraState } from "./Components/CameraState.js"
import { Heightmap } from "./Components/Heightmap.js";
import { Projectile } from './Components/Projectile.js';
import { Boat } from './Components/Boat.js';
import { Water } from './Components/Water.js';



import { KeypressInterface } from './Interfaces/Keypress.js'
import { MouseInterface } from './Interfaces/Mouse.js';


import { PlayerInputSystem } from "./Systems/PlayerInputSystem.js";
import { MovementSystem } from './Systems/MovementSystem.js';
import { SingleplayerInit } from "./Systems/SingleplayerInit.js";
import { CameraSystem } from './Systems/CameraSystem.js';


import { BoatService } from './Services/BoatService.js';
import { TerrainService } from "./Services/TerrainService.js";
import { CameraService } from './Services/CameraService.js';
import { ProjectileService } from './Services/ProjectileService.js';
import { MusicService } from './Services/MusicService.js';
import { SoundEffectService } from './Services/SoundEffectsService.js';


export const Template = {
    // === ECS ================
    // WorldData component names
    Components: {
        Position,
        Velocity,
        Controlled,
        Heightmap,
        CameraState,
        Boat,
        Projectile,
        Water
    },

    Events: {
        KEY_DOWN:    "keyDown",
        KEY_UP:      "keyUp",
        MOUSE_MOVE:  "mouseMoved",
        MOUSE_WHEEL: "mouseWheel",
    },

    SimulationInterfaces: [KeypressInterface],
    NetworkInterfaces: [],
    FrameInterfaces: [MouseInterface],


    SimulationSystems: [SingleplayerInit, PlayerInputSystem, MovementSystem],
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
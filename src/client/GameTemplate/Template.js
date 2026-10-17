import { events } from "./EventRegistry.js"

import { Position } from './Components/Position.js';
import { Velocity } from './Components/Velocity.js';
import { Controlled } from './Components/Controlled.js';

import { KeypressInterface } from './Interfaces/Keypress.js'



import { PlayerInputSystem } from "./Systems/PlayerInputSystem.js";
import { CubeMoveSystem } from './Systems/CubeMoveSystem.js';



import { RotatingCubeService } from './Services/RotatingCubeService.js';






export const Template = {

    // === ECS ================
    // WorldData component names
    Components: ["Position", "Velocity", "Controlled"],

    lobbyData: () => ({
        entities: [{
            components: {
                Position: Position.createPositionComponent({}),
                Velocity: Velocity.createVelocityComponent({ x: 1}),
                Controlled: Controlled.createControlledComponent({ speed: 5 }),
            },
        }],
    }),

    events: events,

    SimulationInterfaces: [KeypressInterface],
    NetworkInterfaces: [],
    FrameInterfaces: [],
    SyncInterfaces: [],

    SimulationSystems: [PlayerInputSystem ,CubeMoveSystem],
    NetworkSystems: [],
    FrameSystems: [],
    SyncSystems: [],

    // Services read world data that was updated by systems 
    // They tell the scene what to add given world data info.
    Services: [RotatingCubeService],
};
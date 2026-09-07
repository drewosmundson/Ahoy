
// Utils
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';
import { CONSTANTS } from "../../shared/CONSTANTS.js";
import { CONFIG } from "../../shared/config.js"

import WorldData from "WorldData.js"
import NetworkInterface from "NetworkInterface.js"



// Systems
import { createTerrain } from "./Terrain.js"

// Async and networking events and buffers
import { LocalEventBus } from '../../shared/eventBus.js';
import { NetworkEventBus } from '../../shared/eventBus.js';
import { EventBuffer } from '../../shared/eventBuffer.js';
import { eventSchemas } from './Utils/schemas.js';

// Factory's for static functions needed for setup
import { createHeightmap } from "./Utils/Heightmap.js"

// ---------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------
export class Engine {
    
    constructor(Game) {
        this.Components = Game?.components;
        this.AsyncSystems = Game?.asyncSystems;
        this.InSyncSystems = Game?.inSyncSystems;
        this.Terrain = Game?.Terrain;
        this.NetworkEvents
        this.InputEvents 
        this.cameraManager = Game?.cameraManager
    }

    setup(canvas, serverHeightmap, socket) {
        this.canvas        = canvas;
        this.heightmap     = serverHeightmap ?? Terrain.createHeightmap()
        this.renderer      = createRenderer(canvas, THREE.WebGLRenderer);
        this.scene         = createScene();
        this.camera        = createCamera()
        
        

        // ==== Async update handling  ===========================
        const localBus  = new LocalEventBus(eventSchemas);// Intra-process event bus for updates in the same process that are not in sync with the game loop like mouse and keyboard
        const networkBus  = new NetworkEventBus(socket, eventSchemas); // Inter-process event bus for communication to the server

        this.keyDownEventBuffer = new EventBuffer(localBus, eventSchemas.keydown) // array of keydowns 
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.serverSnapshot) 
        // ===================================================================

        // ================ Input Sources ======================================
        initalizeUserInput(localBus, this.keyboardEvents);
        initalizeNetworkInterface(localBus, networkBus, this.networkEvents) 
        // ==================================================================

        // ============ Components and entity initalization ==============
        this.world = new WorldData(this.components);
        // ================================================================

        // ==== Simulated & Reconciled Systems  ===============================
        this.simulationSystems  = [         // Data changes sent to and validated the servers
            new BoatSystem(localBus),
            new PlaneSystem(localBus),
            new ProjectileSystem(localBus),
            new CollisionSystem(localBus, this.heightmap),
        ]

        this.directSystems = [           // Systems that run on 
            new VehicleCoordinator(),
            new SoundCoordinator(),
            new CameraManager(), 
            new SoundManager(),
        ]
        // ====================================================================
        this.cameraManager = new CameraManager(localBus, this.Camera)
        
        window.addEventListener("resize", this.handleWindowResize); 
        this.handleWindowResize(); // immidiately fire this once to fix if already mutated before listener was added
        networkBus.emit(eventSchemas.userSetup, true)
    }

    // starts when the host clicks start game
    // lobby data populates the managers with the quantity of components they need to create
    // and which internal systems they need to be assigned to
    // decoded Lobby Data Example:
    // [{ id, vehicle: "boat", ownerId, teamId, location, rotation, initiallyActive }]
    start(lobbyData) {
        world.apply(lobbyData)

        for (const simulationSystem of this.simulationSystems) {
            simulationSystem.start?.(decodedLobbyData);
        }
        for (const reactionarySystems of this.reactionarySystems) {
            reactionarySystems.start?.(decodedLobbyData);
        }

        createTerrain(this.scene, this.heightmap);

        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setAnimationLoop(loop)
    }

    loop = (time) => {
        const frameTime = Math.min(((time - this.previousTime) * 0.001), 0.25)  // clamp so tab switch does not spiral the system
        this.previousTime = time;
        this.accumulator += frameTime;
        while (this.accumulator >= FIXED_DT) {
            this.tick(this.world, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }
        this.render()
    };

    tick(world, dt) {
        this.aiBrain.update(world, dt)

        const intents = {
            ...this.keyDownEventBuffer.pollSet(),
            ...this.aiThoughtsEventBuffer.pollSet()
        }

        this.networkInterface.send(intents);

        const changes = [];
        for (const system of this.simulationSystems) {
            changes.push(system.simulate(dt, world, intents)); 
        }
        world.apply(changes); 

        const networkSnapshot = this.networkInterface.poll();
        this.world.reconcile(networkSnapshot);
    }

    render() {
        this.graphics.update(this.world.getState()) 
        this.renderer.render(this.scene, this.camera);
    }


    stop() {
        this.renderer.setAnimationLoop(null);
    }

    handleWindowResize = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let width = windowWidth;
        let height = (width * 9) / 16;

        if (height > windowHeight) {
            height = windowHeight;
            width = (height * 16) / 9;
        }
 
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    };
}


// these are the systems equivilent to coordinators for the managers

//=================


// systems need data in and then data out the data comes from these buffer reads and then outputs to intents that are then passed in through update(intents) intents group local and ai changes
// also receives a reconcile from the network buffer. there are two buffers that send data to each the systems. 


// the managers also need data in and data out but their data comes from the buses.emit() and received by busses.on()
// the managers can have many bus reader classes that emit to a specific mamanger this happens async of the game loop that is why this has to be done this way.
// these systems do do not need to be reconciled nore do the updates that they operate on and compare to components need to be sent to the server

//=====================


// directors read from buffer "emit" to systems the data "emitted" here

// coordinators read from emit update


// Utils
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import WorldData from "WorldData.js"

// Async and networking events and buffers
import { LocalEventBus } from './Utils/eventBus.js';
import { NetworkEventBus } from './Utils/eventBus.js';
import { EventBuffer } from './Utils/eventBuffer.js';

import { eventSchemas } from './Utils/schemas.js';
// ---------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------
export class Engine {
    constructor(Game) {


        // Assined to entities and organized in world data. 
        this.Components        = Game?.Components;

        // Systems read from components in world data and act given the new information passed from the user or network
        this.SimulationSystems = Game?.SimulationSystems;
        this.EventSystems      = Game?.EventSystems
        this.NetworkSystems    = Game?.NetWorkSystems;

        // creates intended changes that the systems will read and react to and compare to the data in components
        // Authorative updates from the server does not need to be passed into systems these updates go straight into world data after reconcile
        this.UserEvents        = Game?.UserEvents;
        this.NetworkEvents     = Game?.NetworkEvents

    }


    setup(canvas, socket = null) {

        // Engine Services
        // this.renderer   = new WebGLRenderer({canvas: canvas, antialias: true});
        // this.audio
        // this.camera
        // this.scene      = new THREE.scene() 
        // this.canvas     = canvas;
        
        // Engine ECS
        // ============ Components and entity initalization ==============
        this.world = new WorldData();
        this.world.register(this.Components)
        // ================================================================

        const localBus    = new LocalEventBus(eventSchemas);             // Intra-process bus for events in the same process like mouse and keyboard
        const networkBus  = new NetworkEventBus(socket, eventSchemas);   // Inter-process bus for events to and from the server
        const effectsBus  = new LocalEventBus(eventSchemas)

        // ====  Systems  ============================================
        this.simulationSystems  = this.SimulationSystems.map(System => new System());
        this.eventSystems       = this.EventSystems.map(System => new System(localBus));
        this.networkSystems     = this.NetworkSystems.map(System => new System(localBus, networkBus));
        // =======================================================

        // Unique Systems that create the changes that all other systems react to
        this.userEvents      = new this.UserEvents(localBus)
        this.networkEvents   = new this.NetworkEvents(localBus, networkBus)

        // Event buffers take an event bus and stores a history of events with timestamps. can be polled to read and clear the buffer
        this.keyDownEventBuffer = new EventBuffer(localBus, eventSchemas.localEventBuffer)       // keydowns buffer
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.networkEventBuffer)   // server updates buffer

        networkBus.emit(eventSchemas.userSetup, true)
    }

    // starts when the host clicks start game
    // lobby data populates the managers with the quantity of components they need to create
    // and which internal systems they need to be assigned to
    // decoded Lobby Data Example:
    // [{ id, vehicle: "boat", ownerId, teamId, location, rotation, initiallyActive }]
    // lobby data contains the the heightmap if is one if not it is created on the spot
    // the host just needs to have started before all of the others so this step can finish and the others can get their heightmap externally


    start(lobbyData) {
        this.world.start(lobbyData)

        this.RegisterWindowEventListeners();

        window.dispatchEvent(new Event("resize"));

        this.renderer.setAnimationLoop(loop)
    }

    loop = (time) => {
        const world = this.world
        const frameTime = Math.min(((time - this.previousTime) * 0.001), 0.25)  // clamp so tab switch does not spiral the system
        this.previousTime = time;
        this.accumulator += frameTime;

        // Simulation of state
        while (this.accumulator >= FIXED_DT) {
            this.tick(world, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }

        // Presentation Render Frame
        // this.camera.update(this.world);
        // this.audio.update(this.world)
        // this.graphics.update(this.world) 
        // this.renderSystem.update(this.world, this.cameraManager.camera);

        // this.renderer.render(this.scene, );
    };

    tick(world, dt) {
        const changes = [];

        const userUpdates  = this.keyDownEventBuffer.poll()
        for (const system of this.simulationSystems) {
            changes.push(system?.simulate(dt, world, userUpdates)); 
        }
        world.apply(changes)
 

        this.networkInterface.send(changes, dt);


        const networkUpdates = this.networkEventBuffer.poll()
        for (const system of this.networkSystems) {
            changes.push(system?.networkUpdate(dt, world, networkUpdates)); 
        }
        world.reconcile(changes);

        // These systems listen for specific changes and trigger events to happen on the presentation layer like sound effects on collision detection
        for (const system of this.eventSystems) {
            system?.update(dt, world, changes);
        }
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }
}

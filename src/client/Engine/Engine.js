

import WorldData from "WorldData.js"

// Async and networking events and buffers
import { LocalEventBus, NetworkEventBus, Prese } from '../../shared/eventBus.js';
import { buildEventBuffers } from '../../shared/eventBuffer.js';
import { FIXED_DT } from '../../shared/CONSTANTS.js'


export class Engine {
    constructor() {

    }

    setup(Game, canvas, socket = null) {
        this.renderer = Game.renderer;

        const eventSchemas  = Game.eventSchemas;

        const simulationBus = new LocalEventBus(eventSchemas);             // Intra-process bus for events in the same process like mouse and keyboard
        const frameBus      = new LocalEventBus(eventSchemas);
        const networkBus    = new NetworkEventBus(socket, eventSchemas);   // Inter-process bus for events to and from the server
    

        // ============ Components and Entity initalization =========
        //  keyboard, mouse, network, touch, gamepad, browser etc.
        this.interfaces = Game.Interfaces.map(
            Interface => new Interface(localBus, networkBus, frameBus, eventSchemas)
        );
        // ==========================================================
        
       

        // ============ Event Buffers ==============================
        //  Event buffers take an event bus and store a history of events with timestamps to be polled each game tick.
        //  simulation Buffer's purpose is when event triggered and its result must wait for the game loop to reach its next tick 
        //  NetworkBuffers's purpose is when events arrive from the server out of sync with the game loop or out of order.
        this.simulationEventBuffer = buildEventBuffers(simulationBus, eventSchemas.simulationEvents)       // keydowns buffer
        this.networkEventBuffer = buildEventBuffers(networkBus, eventSchemas.networkEvents)   // server updates buffer
        this.frameEventBuffer = buildEventBuffers(frameBus, eventSchemas.frameEvents) // takes dom input and reads once per AFr frame
        // ==========================================================



        // ============ Components and Entity initalization =========
        //  Components are where they can be filtered by the system that require them. 
        //  WorldData is updated on each game tick by systems
        this.worldData = new WorldData();
        this.worldData.register(Game.Components.name)                      // simulation & network authoritative state
        // ===========================================================



        // ====  Systems  ============================================
        //  Systems act on the new information polled from buffers sent by interfaces and current world data
        //  They calculate and return the delta change for world data to apply changes 
        this.simulationSystems = Game.SimulationSystems.map(System => new System());
        this.networkSystems = Game.NetworkSystems.map(System => new System());
        this.perFrameSystems = Game.PerFrameSystems.map(System => new System()); 
        // ==========================================================
        
        // can sustems have .on() ? as long as that they dont manipulate world data at all 
        // this.domUpdateSystems = Game.domUpdateSystems.map(System => new System()); 

        // ======= Engine Services ===================================
        //  Services hold the actual rendering and graphics libray.
        //  They read from world data and actually display the data on the screen.
        //  They should not manipulate world data. These are read only
        this.services = Game.Services.map(
            Service => new Service(canvas)
        );
        // ===========================================================

    }


    start(lobbyData = null) {
        this.worldData.start(lobbyData)

        // One off event to resize the screen to cover case if screen resized while loading
        window.dispatchEvent(new Event("resize"));

        this.previousTime = 0;
        this.accumulator = 0;
        this.renderer.startAnimation(this.animationLoop)
    }

    stop() {
        this.renderer.stopAnimation()
    }

    pause() {
        this.renderer.stopAnimation();
    }

    resume() {
        this.renderer.startAnimation(this.animationLoop)
    }


    animationLoop = (time) => {
        const frameTime = Math.min(
            (time - this.previousTime) * 0.001,
            0.25
        );

        this.previousTime = time;
        this.accumulator += frameTime;

        // simulation
        while (this.accumulator >= FIXED_DT) {
            this.simulation(this.worldData, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }
    
        // presentation
        this.presentation(FIXED_DT)

        for (const service of this.services) {
            service?.update(this.worldData);
        }
    };



    simulation(world, dt) {
        const changes = [];

        // Keyboard Input / ai brain / Collison
        const localEvents  = this.localEventBuffer.poll()
        for (const system of this.simulationSystems) {
            changes.push(...system?.update(dt, world, localEvents));
        }

        this.networkInterface?.sendComponentType(changes.filter(change => change.component)); 

        // Network Input / reconciliation
        const networkEvents = this.networkEventBuffer.poll()
        for (const system of this.networkSystems) {
            changes.push(...system?.update(dt, world, networkEvents));
        }

        world.apply(changes)
    }

    presentation(world, dt) {
        const changes = [];

        const presentationEvents  = this.presentaionEventBuffer.poll()
        for (const system of this.presentationSystems) {
            changes.push(...system.update(dt, world, presentationEvents));
        }

        world.apply(changes)
    }
}




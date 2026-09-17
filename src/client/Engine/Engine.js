

import WorldData from "WorldData.js"

// Async and networking events and buffers
import { LocalEventBus } from './Utils/eventBus.js';
import { NetworkEventBus } from './Utils/eventBus.js';
import { EventBuffer } from './Utils/eventBuffer.js';
import { FIXED_DT } from './Utils/CONSTANTS.js'


export class Engine {
    constructor(Game) {
        this.Game = Game;
    }

    setup(canvas, socket = null) {
        const eventSchemas  = this.Game.eventSchemas; 
        const localBus      = new LocalEventBus(eventSchemas);             // Intra-process bus for events in the same process like mouse and keyboard
        const networkBus    = new NetworkEventBus(socket, eventSchemas);   // Inter-process bus for events to and from the server

        // ============ Event Buffers ==============================
        //  Event buffers take an event bus and store a history of events with timestamps to be polled each game tick.
        //  LocalBuffer's purpose is when event triggered and its result must wait for the game loop to reach its next tick 
        //  NetworkBuffers's purpose is when events arrive from the server out of sync with the game loop or out of order.
        this.localEventBuffer   = new EventBuffer(localBus, eventSchemas.localEventBuffer)       // keydowns buffer
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.networkEventBuffer)   // server updates buffer
        // ==========================================================


        // ============ Components and Entity initalization =========
        //  Components are where they can be filtered by the system that require them. 
        //  WorldData is updated on each game tick by systems
        this.worldData = new WorldData();
        this.worldData.register(this.Game.Components)
        // ===========================================================


        // ============ Components and Entity initalization =========
        //  keyboard, network, touch, gamepad, browser etc.
        this.interfaces = this.Game.Interfaces.map(
            Interface => new Interface(localBus, networkBus, eventSchemas)
        );
        // ==========================================================


        // ====  Buffered Systems  ============================================
        //  Systems act on the new information polled from buffers sent by interfaces and current world data
        //  They calculate and return the delta change for world data to apply
        this.simulationSystems = this.Game.SimulationSystems.map(System => new System());
        this.reconciledSystems = this.Game.ReconciledSystems.map(System => new System());
        // ===========================================================


        // ============ Event Systems =========
        //  Event Systems are different from buffered systems in that they can directly manipulate world data as it does not need to be reconciled later.
        //  These events are the
        this.localEventSystems = this.Game.EventSystems.map(System => new System(localBus, eventSchemas)); // event systems apply changes from events to world data
        this.networkEventSystems = this.Game.NetworkSystems.map(System => new System(localBus, eventSchemas))
        // ====================================


        // ======= Engine Services ===================================
        //  Services hold the actual rendering and graphics libray.
        //  They read from world data and actually display the data on the screen.
        //  They should not directly manipulate world data. These are read only
        this.services = this.Game.Services.map(
            Service => new Service(canvas, localBus, networkBus, eventSchemas)
        );  
        // ===========================================================

        networkBus.emit(eventSchemas.userSetup, true)
    }   


    start(lobbyData = null) {
        this.worldData.start(lobbyData)

        this.interfaces.forEach(interface => interface.start(lobbyData)); // inits event listeners like keyboard presses and window resize

        this.simulationSystems.forEach(system => system.start(lobbyData)); 
        this.eventSystems.forEach(system => system.start(lobbyData)); 
        this.networkSystems.forEach(system => system.start(lobbyData)); 

        this.services.forEach(service => service.start(lobbyData))

        // One off event to resize the screen to cover case if screen resized while loading
        window.dispatchEvent(new Event("resize"));

        this.previousTime = 0;
        this.accumulator = 0;
        this.renderer.setAnimationLoop(loop)
    }


    loop = (time) => {
        const frameTime = Math.min(
            (time - this.previousTime) * 0.001,
            0.25
        );

        this.previousTime = time;
        this.accumulator += frameTime;

        while (this.accumulator >= FIXED_DT) {
            this.simulateGameTick(this.worldData, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }

        this.updatePresentation(this.worldData);
    };


    simulateGameTick(world, dt) {
        const localChanges = [];
        const userUpdates  = this.localEventBuffer.poll()
        for (const system of this.simulationSystems) {
            changes.push(system?.simulate(dt, world, userUpdates)); 
        }
        world.apply(localChanges)

        for (const interface of this.interfaces) { // for sending information to another process the emit to eventSystems.on() and buffers Poll()
            interface?.send(dt, localChanges);
        }

        const networkChanges = [];
        const networkUpdates = this.networkEventBuffer.poll()
        for (const system of this.networkSystems) {
            changes.push(system?.networkUpdate(dt, world, networkUpdates)); 
        }
        world.reconcile(networkChanges);

    }


    updatePresentation(world) {
        for (const service of this.services) {
            service?.update(world);
        }
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }
}



import WorldData from "./WorldData.js"

// Async and networking events and buffers
import { LocalEventBus, NetworkEventBus } from '../../shared/eventBus.js';
import { createEventBuffers } from '../../shared/eventBuffer.js';
import { FIXED_DT } from '../../shared/CONSTANTS.js'


export class Engine {
    constructor() {

    }

    setup(Game, canvas, socket = null) {

        this.renderer = Game.renderer;

        const simulationBus = new LocalEventBus(Game.simulationEvents);             // Intra-process bus for events in the same process like mouse and keyboard
        const networkBus    = new NetworkEventBus(socket, Game.networkEvents);   // Inter-process bus for events to and from the server
        const frameBus      = new LocalEventBus(Game.frameEvents);


        // ============ Interfaces =================================
        //  keyboard, mouse, network, touch, gamepad, browser etc.
        this.simulationInterfaces = Game.SimulationInterfaces.map(Interface => new Interface(simulationBus,  Game.simulationEvents));
        this.networkInterfaces    = Game.NetworkInterfaces.map(Interface => new Interface(networkBus,  Game.networkEvents));
        this.frameInterfaces      = Game.FrameInterfaces.map(Interface => new Interface(frameBus, Game.frameEvents));
        // ==========================================================
        

        // ============ Event Buffers ==============================
        //  Event buffers take an event bus and store a history of events with timestamps to be polled each game tick.
        //  simulation Buffer's purpose is when event triggered and its result must wait for the game loop to reach its next tick 
        //  NetworkBuffers's purpose is when events arrive from the server out of sync with the game loop or out of order.
        this.simulationEventBuffer = createEventBuffers(simulationBus, Game.simulationEvents); // keydowns buffer
        this.networkEventBuffer    = createEventBuffers(networkBus, Game.networkEvents);       // server updates buffer
        this.frameEventBuffer      = createEventBuffers(frameBus, Game.frameEvents);           // takes dom input and reads once per AFr frame
        // ==========================================================


        // ============ Components and Entity initalization =========
        //  Components are where they can be filtered by the system that require them. 
        //  WorldData is updated on each game tick by systems
        this.worldData = new WorldData(Game.Components.name);
        // ===========================================================



        // ====  Systems  ============================================
        //  Systems act on the new information polled from buffers sent by interfaces and current world data
        //  They calculate and return the delta change for world data to apply changes to after they are updated
        this.simulationSystems = Game.SimulationSystems.map(System => new System());
        this.networkSystems    = Game.NetworkSystems.map(System => new System());
        this.frameSystems      = Game.FrameSystems.map(System => new System());
        // ==========================================================



        // ======= Engine Services ===================================
        //  Services hold the actual rendering and graphics libray.
        //  They read from world data and actually display the data on the screen.
        //  They do not manipulate world data. These are read only
        this.services = Game.Services.map(Service => new Service(canvas));
        // ===========================================================

    }


    start(lobbyData = null) {
        this.worldData.start(lobbyData)

        // One off event to resize the screen to cover case if screen resized while loading
        window.dispatchEvent(new Event("resize"));


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
        const frameTime = Math.min((time - this.previousTime) * 0.001, 0.25);

        this.previousTime = time;
        this.accumulator += frameTime;

        // Simulation loop called 0, 1 or mulitple times per amimation frame request
        while (this.accumulator >= FIXED_DT) {
            this.simulation(this.world, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }
    
        // Presentation loop called every Animation Frame request. Updates te
        this.presentation(FIXED_DT, this.world)

        for (const service of this.services) {
            service?.update(this.world);
        }
    };



    simulation(world, dt) {
        const changes = [];

        // Keyboard Input / ai brain / Collison
        const simulationEvents = this.simulationEventBuffer.poll()
        for (const system of this.simulationSystems) {
            changes.push(...system?.update(dt, world, simulationEvents));
        }

        const timestamp = performance.now()
        for (const networkInterface of this.interfaces) {
            networkInterface?.send(timestamp, changes);
        }

        // Network Input / reconciliation
        const networkEvents = this.networkEventBuffer.poll()
        for (const system of this.networkSystems) {
            changes.push(...system?.update(dt, world, networkEvents));
        }

        world.apply(changes)
    }

    presentation(world, dt) {
        const changes = [];

        const frameEvents  = this.frameEventBuffer.poll()
        for (const system of this.frameSystems) {
            changes.push(...system.update(dt, world, frameEvents));
        }

        world.apply(changes)
    }
}




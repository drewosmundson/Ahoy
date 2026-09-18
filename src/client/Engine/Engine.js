

import WorldData from "WorldData.js"

import Renderer from "Renderer.js"

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
        const engineBus     = new LocalEventBus(eventSchemas);
        const presentationBus = new LocalEventBus(eventSchemas);
        const networkBus    = new NetworkEventBus(socket, eventSchemas);   // Inter-process bus for events to and from the server


        // ============ Event Buffers ==============================
        //  Event buffers take an event bus and store a history of events with timestamps to be polled each game tick.
        //  LocalBuffer's purpose is when event triggered and its result must wait for the game loop to reach its next tick 
        //  NetworkBuffers's purpose is when events arrive from the server out of sync with the game loop or out of order.
        this.localEventBuffer   = new EventBuffer(localBus, eventSchemas.localEventBuffer)       // keydowns buffer
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.networkEventBuffer)   // server updates buffer
        // ==========================================================

        this.engineSubscriptions = this.registerEngineSubscriptions(engineBus);


        // ============ Components and Entity initalization =========
        //  Components are where they can be filtered by the system that require them. 
        //  WorldData is updated on each game tick by systems
        this.worldData = new WorldData();
        this.worldData.register(this.Game.Components)
        // ===========================================================


        // ============ Components and Entity initalization =========
        //  keyboard, mouse, network, touch, gamepad, browser etc.
        this.interfaces = this.Game.Interfaces.map(
            Interface => new Interface(localBus, networkBus, eventSchemas)
        );
        // ==========================================================


        // ====  Systems  ============================================
        //  Systems act on the new information polled from buffers sent by interfaces and current world data
        //  They calculate and return the delta change for world data to apply
        this.simulationSystems = this.Game.SimulationSystems.map(System => new System());
        this.simulationEffectSystems = this.Game.SimulationEventSystems.map(System => new System());                // need the outputs from 
        this.effectsEventSystems = this.Game.EventSystems.map(System => new System(localBus, eventSchemas)); // event systems apply changes from events to world data
        this.networkEventSystems = this.Game.NetworkSystems.map(System => new System(localBus, networkBus, eventSchemas))
        // ==========================================================


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



    animationLoop = (time) => {
        const frameTime = Math.min(
            (time - this.previousTime) * 0.001,
            0.25
        );

        this.previousTime = time;
        this.accumulator += frameTime;

        while (this.accumulator >= FIXED_DT) {
            this.simulation(this.worldData, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }

        this.presentation(this.worldData);
    };


    simulation(world, dt) {
        const changes = [];

        const localEvents  = this.localEventBuffer.poll()
        for (const system of this.simulationSystems) {
            changes.push(...system?.simulate(dt, world, localEvents)); 
        }

        for (const system of this.effectSystems) {
            changes.push(...system?.simulate(dt, world, changes)); 
        }

        for (const iface of this.interfaces) {
            iface.send(changes)
        }

        const networkEvents = this.networkEventBuffer.poll()
        for (const system of this.networkSystems) {
            changes.push(...system?.simulate(dt, world, networkEvents)); 
        }

        world.apply(changes);
    }


    presentation(world) {
        for (const service of this.services) {
            service?.update(world);
        }
    }


    start(lobbyData = null) {
        this.worldData.start(lobbyData)

        // One off event to resize the screen to cover case if screen resized while loading
        window.dispatchEvent(new Event("resize"));

        this.previousTime = 0;
        this.accumulator = 0;
        this.renderer.setAnimationLoop(this.animationLoop)
    }

    stop() {
        this.renderer.setAnimationLoop(null);
        this.engineSubscriptions.destroy()
    }

    pause() {


    }

    resume() {


    }

    registerEngineSubscriptions(engineBus, eventSchemas) {
        const subscriptions = [];

        subscriptions.push(
            engineBus.on(eventSchemas.start, () => this.start()),
            engineBus.on(eventSchemas.stop, () => this.stop()),
            engineBus.on(eventSchemas.pause, () => this.pause()),
            engineBus.on(eventSchemas.resume, () => this.resume()),
        );

        return {
            destroy() {
                for (const subscription of subscriptions) {
                    subscription.unsubscribe();
                }
            }
        };
    }










}

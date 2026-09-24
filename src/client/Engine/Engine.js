

import WorldData from "WorldData.js"

// Async and networking events and buffers
import { LocalEventBus, NetworkEventBus } from '../../shared/eventBus.js';
import { EventBuffer } from '../../shared/eventBuffer.js';
import { FIXED_DT } from '../../shared/CONSTANTS.js'


export class Engine {
    constructor() {

    }

    setup(Game, canvas, socket = null) {
        this.renderer = Game.renderer;

        const eventSchemas  = Game.eventSchemas;

        const localBus      = new LocalEventBus(eventSchemas);             // Intra-process bus for events in the same process like mouse and keyboard
        const presentationBus = new LocalEventBus(eventSchemas);
        const networkBus    = new NetworkEventBus(socket, eventSchemas);   // Inter-process bus for events to and from the server


        // ============ Event Buffers ==============================
        //  Event buffers take an event bus and store a history of events with timestamps to be polled each game tick.
        //  LocalBuffer's purpose is when event triggered and its result must wait for the game loop to reach its next tick 
        //  NetworkBuffers's purpose is when events arrive from the server out of sync with the game loop or out of order.
        this.keydownEventBuffer = new EventBuffer(localBus, eventSchemas.keydownEventBuffer)       // keydowns buffer
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.networkEventBuffer)   // server updates buffer
        // ==========================================================



        // ============ Components and Entity initalization =========
        //  Components are where they can be filtered by the system that require them. 
        //  WorldData is updated on each game tick by systems
        this.worldData = new WorldData();
        this.worldData.register(Game.Components.name)                      // simulation & network authoritative state
        // ===========================================================



        // ============ Components and Entity initalization =========
        //  keyboard, mouse, network, touch, gamepad, browser etc.
        this.interfaces = Game.Interfaces.map(
            Interface => new Interface(localBus, networkBus, eventSchemas)
        );
        // ==========================================================



        // ====  Systems  ============================================
        //  Systems act on the new information polled from buffers sent by interfaces and current world data
        //  They calculate and return the delta change for world data to apply changes 
        this.simulationSystems = Game.SimulationSystems.map(System => new System());
        this.networkSystems = Game.NetworkSystems.map(System => new System(networkBus, eventSchemas));
        this.effectSystems = Game.EffectSystems.map(System => new System(localBus, eventSchemas)); 
        // ==========================================================



        // ======= Engine Services ===================================
        //  Services hold the actual rendering and graphics libray.
        //  They read from world data and actually display the data on the screen.
        //  They should not directly manipulate world data. These are read only
        this.services = Game.Services.map(
            Service => new Service(canvas, localBus, networkBus, eventSchemas)
        );
        // ===========================================================


        // Examples of the two data pipelines

        // Simulation pipeline Example:
        // Keyboard interface -> localBus -> eventBuffer -> animationloop buffer.poll() -> simulation Systems -> networkSystems -> effectSystems -> worldDataapply() -> enginePresentation(){services(worldData)}


        // Event pipeline Example:
        // Mouse interface    -> localBus ->  cameraMovement effectSystem (or presentation systems) (world data(settings and target)) + mouse interface updates) -> presentationBus -> services(updates) camera render service




        // one item of note for the current data split I could make the event pipeline compleatly split from the game loop. Right now with the Event pipeline Mouse updates are happening 
        // at the same rate as the rAF from the while loop this is fine as that is as fast as I would want the render to happen anyways. However I do not want to manipulate world data directly
        // and because mouse movemenent is on the document level it can acually update out of sync or faster than the while loop that updates my game loop and renderer. The simpliest way I could fix this is to allow the effect systems to update world data outside of the main game loop. thsi would allow for the addition and subtraction of mouse movements so that renderer will get the correct position when the frame comes around but This sounds like it could lead to potentally unknown behavior for other things and I Would like to keep this as tight as possibnle wiht my rules around what systems can and should not do. 
        
        // Potential solution to this make camera movement system a presentation system and create another world data that can be manipulated 

        // make it exist compleatly outside of the game loop. 
        // this.presentationData = new WorldData();
        // this.presentationData.register(Game.PresentationComponents)   // local-only, per client, never networked/buffered
        // this.presentationSystems = Game.PresentationSystems.map(System => new System(localBus, this.presentationData));

        // or I could make effectsSystems able to access and update the presentation data and leave how it then certain effects systems will just not have an update() function
        // and have a interface -> bus.on() then manipulate data in the presentationData and also emit on the presentation bus if needed for somthing like camera shake.

    }

    // The question is not should systems emit the question is if event systems should be constructed with a copy  of world data or not. If so they can manipulate world data before sending the world pointer on the presentation bus
    // or if systems absolutly must be read only on world data then how can a pure event systtem in the event pipeline say that an event happened to change the world data that the services can then act on. it is important to me that the camera movement systems render and trigger as often as possible outside of the main simulation loop on mouse move render everything 
    // however the system or the service needs to read from world data at some point to get the location of the camera state and the camera target. a what point after the event system could the world be updated so that the service can read the delta change and its oragin point

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
    
        // animation
        this.presentation(FIXED_DT)

    };

    presentation(dt) {
        const changes = [];
        for (const system of this.presentationSystems) {
            changes.push(...system.update(dt, this.worldData, this.presentationData, localEvents));
        }

        this.presentationData.apply(changes);


        for (const service of this.services) {
            service?.update(this.worldData);
        }
    }

    simulation(world, dt) {
        const changes = [];

        const localEvents  = this.localEventBuffer.poll()
        for (const system of this.simulationSystems) {
            changes.push(...system?.update(dt, world, localEvents));
        }

        this.interfaces.emit(changes)

        const networkEvents = this.networkEventBuffer.poll()
        for (const system of this.networkSystems) {
            changes.push(...system?.update(dt, world, networkEvents));
        }

        for (const system of this.effectSystems) {
            changes.push(...system?.update(dt, world, changes));
        }

        world.apply(changes);
    }
}




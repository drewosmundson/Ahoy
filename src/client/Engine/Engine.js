

import WorldData from "WorldData.js"

// Async and networking events and buffers
import { LocalEventBus } from './Context/eventBus.js';
import { NetworkEventBus } from './Context/eventBus.js';
import { EventBuffer } from './Context/eventBuffer.js';

import { eventSchemas } from './Utils/schemas.js';

import { } from "./Context"

// ---------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------
export class Engine {
    constructor(Game) {
        this.Game = Game;
    }

    setup(canvas, socket = null) {
        const canvas = canvas
        const socket = socket; 

        const localBus    = new LocalEventBus(eventSchemas);             // Intra-process bus for events in the same process like mouse and keyboard
        const networkBus  = new NetworkEventBus(socket, eventSchemas);   // Inter-process bus for events to and from the server
        const presentationBus  = new LocalEventBus(eventSchemas);   // Presentation/effects events between ECS event systems and client-side services


        const context = {
            canvas,
            localBus,
            networkBus,
            presentationBus,
        }

        this.services = this.Game.Services.map(
            Service => new Service(context)
        );

        // Engine ECS
        // ============ Components and entity initalization ==============
        this.world = new WorldData();
        this.world.register(this.Game.Components)
        // ================================================================


        // ====  Systems  ============================================
        this.simulationSystems  = this.Game.SimulationSystems.map(System => new System());
        this.eventSystems       = this.Game.EventSystems.map(System => new System(localBus));
        this.networkSystems     = this.Game.NetworkSystems.map(System => new System(localBus, networkBus));
        // =======================================================


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
        const frameTime = Math.min(
            (time - this.previousTime) * 0.001,
            0.25
        );

        this.previousTime = time;
        this.accumulator += frameTime;

        while (this.accumulator >= FIXED_DT) {
            this.simulateGameTick(this.world, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }

        this.updatePresentation();
    };


    simulateGameTick(world, dt) {
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


    updatePresentation() {
        for (const service of this.services) {
            service.update?.();
        }
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }
}

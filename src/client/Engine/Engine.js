
// Utils
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import WorldData from "WorldData.js"
import NetworkInterface from "NetworkInterface.js"

// Async and networking events and buffers
import { LocalEventBus } from '../../shared/eventBus.js';
import { NetworkEventBus } from '../../shared/eventBus.js';
import { EventBuffer } from '../../shared/eventBuffer.js';

import { eventSchemas } from './Utils/schemas.js';
// ---------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------
export class Engine {
    constructor(Game) {
        // Assined to entities and organized in world data. 
        this.Components       = Game?.Components;

        // Systems read from components in world data and act given the new information passed down from the user or ai inputs
        this.OnTickSystems    = Game?.OnTickSystems;
        this.RealtimeSystems  = Game?.RealtimeSystems;

        // creates intended changes that the systems will read and react to and compare to the data in components
        this.UserInput        = Game?.UserEvents;
        this.AiBrain          = Game?.AiBrain

        // Authorative updates from the server does not need to be passed into systems these updates go straight into world data after reconcile
        this.NetworkInterface = Game?.NetworkEvents

        // Does not fit in neatly with other systems or components because the camera is always needed.
        this.CameraManager    = Game?.CameraManager
    }

    setup(canvas, socket = null) {
        this.renderer   = new WebGLRenderer({canvas: canvas, antialias: true});
        this.scene      = new Three.scene() 
        this.camera     = new Three.Perspectivecamera() 
        this.canvas     = canvas;
        
        // ============ Components and entity initalization ==============
        this.world = new WorldData();
        this.world.register(this.Components)
        // ================================================================

        const localBus  = new LocalEventBus(eventSchemas);// Intra-process event bus for updates in the same process that are not in sync with the game loop like mouse and keyboard
        const networkBus  = new NetworkEventBus(socket, eventSchemas); // Inter-process event bus for communication to the server


        // ====  Systems  ============================================
        this.onTickSystems = this.OnTickSystems.map(System => new System());
        this.realtimeSystems = this.RealtimeSystems.map(System => new System(localBus));
        // =======================================================

        // Unique Systems that create the changes that all other systems react to
        this.userInput        = new this.UserInput()
        this.aiBrain          = new this.AiBrain()
        this.networkInterface = new this.NetworkInterface(localBus, networkBus)

        // Event buffers take an event bus and stores a history of events with timestamps. can be polled to read and clear the buffer
        this.keyDownEventBuffer = new EventBuffer(localBus, eventSchemas.localEventBuffer)       // keydowns buffer
        this.aiBrainEventBuffer = new EventBuffer(localBus, eventSchemas.aiBrainEventBuffer)   // slow thinking ai so that the game does not need to wait for it
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.networkEventBuffer)   // server updates buffer

        this.cameraManager = new CameraManager(localBus, camera)

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
        this.world.apply(lobbyData)

        for (const simulationSystem of this.simulationSystems) {
            simulationSystem.start?.(decodedLobbyData);
        }
        for (const reactionarySystems of this.reactionarySystems) {
            reactionarySystems.start?.(decodedLobbyData);
        }
        
        window.addEventListener("resize", () => {
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

            const data = {
                width,
                height,
            }

            bus.emit("windowResize", data);
        });

        window.dispatchEvent(new Event("resize"));
        this.renderer.setAnimationLoop(loop)
    }

    loop = (time) => {
        const world = this.world
        const frameTime = Math.min(((time - this.previousTime) * 0.001), 0.25)  // clamp so tab switch does not spiral the system
        this.previousTime = time;
        this.accumulator += frameTime;
        while (this.accumulator >= FIXED_DT) {
            this.tick(world, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }
        this.graphics.update(world) 
        this.renderer.render(this.scene, this.cameraManager.camera);
    };

    tick(world, dt) {
        const intents  = this.keyDownEventBuffer.poll()

        this.networkInterface.send(userIntents, dt);

        const changes = [];
        for (const system of this.simulationSystems) {
            changes.push(system.simulate(dt, world, intents)); 
        }

        for (const system of this.reactionSystems) {
            changes.push(system.react(dt, world, changes)); 
        }
        
        world.apply(changes)
        
        const intents  = this.networkEventBuffer.poll()
        
        for (const system of this.networkSystems) {
            changes.push(system.react(dt, world, changes)); 
        }
        
        world.reconcile(networkUpdates);
    }


    stop() {
        this.renderer.setAnimationLoop(null);
    }
}



class CameraManager {
    constructor(camera, bus) {
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.subscriptions = [
            bus.on("windowResize", (data) => this.changeAspect(data)),
            bus.on("mouseMove", (data) =>
        ]
    }
    changeAspect(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}


class RendererManager {
    constructor(bus) {
        this.renderer = 
    }
    changeAspect(width, height) {
        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(window.devicePixelRatio);
}
}

class sceneManager { 
    

}


class CanvasManager {
    constructor(bus) {



    }
}





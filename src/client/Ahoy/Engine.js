
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


// ---------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------
export class Engine {
    constructor(Game, canvas) {
        // create changes that the systems will read and react to and compare to the data in components
        this.UserInput      = Game?.UserEvents;
        this.AiBrain        = Game?.AiBrain

        // Assined to entities and organized in world data. 
        this.Components     = Game?.Components;

        // Systems read from components in world data and act given the new information passed down from the user or ai inputs
        this.AsyncSystems   = Game?.AsyncSystems;
        this.InSyncSystems  = Game?.InSyncSystems;

        // Does not fit in neatly with other systems or components because the camera is always needed.
        this.CameraManager  = Game?.CameraManager

        // Authorative updates from the server does not need to be passed into systems these updates go straight into world data after reconcile
        this.NetworkEvents  = Game?.NetworkEvents

        this.canvas         = canvas;
    }

    setup(camvas, socket = null) {
        this.canvas        = canvas

        //this.renderer      = createRenderer(THREE.WebGLRenderer, canvas);

        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setAnimationLoop(loop)
        this.camera        = createCamera(THREE.PerspecitveCamera)
        this.scene         = createScene(THREE.Scene);

        const localBus  = new LocalEventBus(eventSchemas);// Intra-process event bus for updates in the same process that are not in sync with the game loop like mouse and keyboard
        const networkBus  = new NetworkEventBus(socket, eventSchemas); // Inter-process event bus for communication to the server

        this.keyDownEventBuffer = new EventBuffer(localBus, eventSchemas.keydown) // array of keydowns 
        this.AiBrainEventBuffer = new EventBuffer(localBus, eventSchemas.serverSnapshot) 
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.serverSnapshot) 

        // ================ Input Sources ======================================
        initalizeUserInput(localBus, this.keyboardEvents);
        initalizeAiBrain(localBus, this.aiBrain)
        // ==================================================================

        // ============ Components and entity initalization ==============
        this.world = new WorldData(this.Components);
        // ================================================================

        // ====  Systems  ============================================
        this.InSyncSystems = this.InSyncSystems.map(System => new System(localBus));
        this.AsyncSystems = this.AsyncSystems.map(System => new System(localBus));
        // =======================================================

        this.CameraManager = new CameraManager(localBus)

        this.NetworkInterface = initalizeNetworkInterface(localBus, networkBus, this.networkEvents) 

        
        window.addEventListener("resize", this.handleWindowResize); 
        this.handleWindowResize(); // immidiately fire this once to fix if already mutated before listener was added
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
        const userInputs = this.keyDownEventBuffer.poll()
        const aiInputs = this.aiBrainBuffer.poll()

        const intents = [...userInputs, ...aiInputs]

        this.networkInterface.send(intents);

        const changes = [];
        for (const system of this.simulationSystems) {
            changes.push(system.simulate(dt, world, intents)); 
        }

        this.world.apply(changes); 
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


// Utils
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';
import { CONSTANTS } from "../../shared/constants.js";


// Factory's for static functions needed for setup
import { createRenderer } from "./utils/Renderer.js"
import { createScene } from "./"
import { createHeightmap } from "./utils/Heightmap.js"
import { createTerrain } from "./landscape/Terrain.js"
import { createCamera } from "./utils/Camera.js"

// Components


// Simulation Systems
import { BoatSystem } from './BoatSystem.js';
import { PlaneSystem } from './PlaneSystem.js';
import { ProjectileSystem } from './ProjectileSystem.js';
import { CollisionSystem } from './CollisionSystem.js';

// Effect Systems
import { CameraSystem } from './CameraManager.js';
import { SoundSystem } from './SoundManager.js';
import { EffectsSystem } from './EffectsManager.js';

// Async and networking events and buffers
import { LocalEventBus } from '../../shared/eventBus.js';
import { NetworkEventBus } from '../../shared/eventBus.js';
import { EventBuffer } from '../../shared/eventBuffer.js';
import { eventSchemas } from './utils/schemas.js';


// ---------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------
export class Game {
    // socket: an already-connected transport (e.g. a socket.io client
    // instance) implementing on/off/emit/close — handed straight to
    // NetworkEventBus, which owns validating traffic against eventSchemas.
    constructor() {
        this.heightmap = createHeightmap();

        this.simulationSystems = []
        this.effectsSystems = [] 

        this.previousTime = 0;
        this.accumulator = 0;
    }

    setup(canvas, serverHeightmap, socket) {
        this.canvas        = canvas;
        this.heightmap     = serverHeightmap ?? this.heightmap;
        this.renderer      = createRenderer(canvas, THREE.WebGLRenderer);
        this.scene         = createScene();
    
    
        this.initalizeUserInput(localBus, CONFIG.KEYBINDS);
        this.initalizeAiBrain(localBus, CONFIG.AiTemperature)
        this.initalizeNetworkInterface(localBus, )
    
    
        // ==== Async update handling  ===========================
        const localBus  = new LocalEventBus(eventSchemas);    // Intra-process event bus for updates in the same process that are not in sync with the game loop like mouse and keyboard
        const networkBus  = new NetworkEventBus(socket, eventSchemas); // Inter-process event bus for communication to the server
 
        this.keyDownEventBuffer = new EventBuffer(localBus, eventSchemas.keydown) // array of keydowns 
        this.aiUpdateEventBuffer = new EventBuffer(localBus, eventSchemas.aiBrainIntent) 
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.serverSnapshot) 
        // ===================================================================


        // ============ Components and entity initalization ==============
        const components = [ 
            Position,
            Rotation,
            Velocity,
            Controller,
            Health 
        ]
        const world = new WorldData(components);
        // ================================================================


        // ==== Simulated & Reconciled Systems  ===============================
        this.simulationSystems  = [                       // Data changes sent to the server 
            new BoatSystem(localBus),
            new PlaneSystem(localBus),
            new ProjectileSystem(localBus),
            new CollisionSystem(world, this.heightmap, localBus),
        ]

        this.coordinators = [           // the emitters to managers Bus.on
            new VehicleCoordinator(world),
            new SoundCoordinator(world), 
        ]
        
        this.effectsManagers = [         // Local data changes NOT sent to the server 
            new CameraManager(, localBus), 
            new SoundManager(localBus),
            new VFXManager(localBus),
            new TerrainManager(localBus),
        ] 
        // ====================================================================

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
            this.tick(FIXED_DT);
            this.accumulator -= FIXED_DT;
        }
        this.render()
    };

    tick(dt) {
        const inputs = this.userInputs.pollSet();
        const intents = this.intentPipeline.getIntents(inputs, world, dt); // read directly, nothing has mutated yet

        this.networkInterface.send(intents);

        const changes = [];
        for (const system of this.simulationSystems) {
            changes.push(system.simulate(dt, world, intents)); // reads world, doesn't write it
        }
        world.apply(changes); // single mutation point

        const networkSnapshot = this.networkInterface.poll();
        world.reconcile(networkSnapshot);
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

function getIntents({ inputs, worldState, dt }) {
    const userIntents = this.inputCoordinator.create(inputs, worldState);
    const aiIntents = this.aiCoordinator.create(worldState, dt);
    return {...userIntents, ...aiIntents}
}

function userIntents(inputs, worldState){}



function aiIntents() {}


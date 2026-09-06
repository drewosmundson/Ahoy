
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
    
        // ==== Async update handling  ===========================
        const localBus  = new LocalEventBus(eventSchemas);    // Intra-process event bus for updates in the same process that are not in sync with the game loop like mouse and keyboard
        const networkBus  = new NetworkEventBus(socket, eventSchemas); // Inter-process event bus for communication to the server
 
        this.initalizeUserInput(localBus, CONSTANTS.KEYBINDS);

        this.keyDownEventBuffer = new EventBuffer(localBus, eventSchemas.keydown) // array of keydowns 
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
            new BoatSystem(world, localBus),
            new PlaneSystem(world, localBus),
            new ProjectileSystem(world, localBus),
            new CollisionSystem(world, this.heightmap, localBus),
        ]
        
        this.effectsManagers = [         // Local data changes NOT sent to the server
            new CameraManager(canvas, THREE.PerspectiveCamera, localBus), 
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
        const worldStateSnapshot = world.getState();
        const inputs = this.userInputs.pollSet()
        const intents = this.intentPipline.getIntents(inputs, worldStateSnapshot, dt)

        this.networkInterface.send(intents);

        const changes = [];
        for (const system of this.simulationSystems) {
            changes.push(system.simulate(dt, worldState, intents));
        }
        worldState.apply(changes);

        const networkSnapshot = this.networkInterface.poll();
        worldState.reconcile(networkSnapshot)
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





export function createRenderer(canvas, WebGLRenderer){

}






// ============================================================================
// OWNERSHIP MODEL
// ----------------------------------------------------------------------------
// - Ownership is FIXED at lobby start and never changes for the match. Each
//   player is assigned a set of vehicles up front; that assignment is final.
// - A player actively controls exactly ONE of their own vehicles at a time,
//   tracked centrally by VehicleCoordinator (not per-manager). All their
//   OTHER owned vehicles run on AI. Switching which one is active is pure
//   local client state — no ownership check against other players is ever
//   needed, since a client can only switch among vehicles it already owns.
// - Every client is authoritative for ALL of its own vehicles (active or AI)
//   and is responsible for simulating + broadcasting their state. A client
//   never simulates another player's vehicle — it only blends toward that
//   player's broadcast snapshots (controllers.network / Boat.reconcile).
// - So "controlSource" is NOT a stored fact — it's derived every tick from
//   (vehicle.ownerId, coordinator.activeVehicleId). See
//   BoatManager.controllerFor / VehicleCoordinator.isActive.
// - Controllers themselves are STATELESS strategies: update(vehicle, data, dt).
//   See controllers.js.
//
// BUS WIRING
// ----------------------------------------------------------------------------
// ClientInput emits onto TWO separate buses, and they are handled completely
// differently:
//
// - "mouseMove" -> the EFFECTS bus. Consumed immediately, every render
//   frame, at monitor refresh rate. Drives camera look / aim reticle only.
//   NEVER buffered, NEVER sent to the server, and NEVER touches any vehicle
//   manager or the coordinator.
// - "snapshot" (button/toggle actions) -> the SIMULATION bus. InputTranslator
//   turns this into { throttleDelta, steer } for whichever vehicle the
//   coordinator says is active, and emits "intent". Each vehicle manager's
//   intentBuffer drains that on its own fixed tick. This IS what eventually
//   gets broadcast to other clients (via the vehicle's simulated state), just
//   not per-mouse-move.
//
// Network snapshots arrive as ONE event per tick containing the WHOLE
// lobby's vehicle states ("worldSnapshot"), since the server doesn't know or
// care which client owns which vehicle — it just broadcasts everyone's
// state. Each manager's authorityBuffer drains those and flattens+indexes
// them by id.
// ============================================================================
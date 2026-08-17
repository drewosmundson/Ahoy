wimport * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/Heightmap.js"
import { createRenderer } from "./utils/Renderer.js"
import { createScene, createSceneTerrain } from "./landscape/Terrain.js"
import { createCamera } from "./utils/Camera.js"

import { LocalEventBus, NetworkEventBus } from '../../shared/eventBus.js';
import { EventBuffer } from '../../shared/eventBuffer.js';
import { CONSTANTS } from "../../shared/constants.js";
import { eventSchemas } from './utils/schemas.js';

import { VehicleCoordinator } from './VehicleCoordinator.js';
import { BoatManager } from './BoatManager.js';
import { PlaneManager } from './PlaneManager.js';
import { InputTranslator } from './InputTranslator.js';
import { ProjectileManager } from './ProjectileManager.js';
import { CameraManager } from './CameraManager.js';
import { SoundManager } from './SoundManager.js';
import { EffectsManager } from './EffectsManager.js';
import { CollisionSystem } from './CollisionSystem.js';
import { AISystem } from './AISystem.js';


// ----------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------
export class Game {
    // socket: an already-connected transport (e.g. a socket.io client
    // instance) implementing on/off/emit/close — handed straight to
    // NetworkEventBus, which owns validating traffic against eventSchemas.
    constructor() {
        this.heightmap = createHeightmap();

        this.simulationManagers = []
        this.effectsManagers = [] 
        this.systems = [];

        this.previousTime = 0;
        this.accumulator = 0;
    }

    setup(canvas, localPlayerId, confirmedHeightmap) {
        this.localPlayerId = localPlayerId;
        this.canvas        = canvas;
        this.heightmap     = confirmedHeightmap ?? this.heightmap;
        this.renderer      = createRenderer(canvas, THREE.WebGLRenderer);
        this.scene         = createScene();
        this.camera        = createCamera(canvas, THREE.PerspectiveCamera);

        const localBus  = new LocalEventBus(eventSchemas);    // Intra-process event bus for ansyc updates in the same process
        const serverBus  = new NetworkEventBus(eventSchemas); // Inter-process event bus for asnyc communication to the server
        const effectsBus  = new LocalEventBus(eventSchemas);   // Intra-process event bus for ansyc updates in the same process but can be fired and forgotton never to be reconciled by the server

        initalizeUserInput(localBus, CONSTANTS.KEYBINDS);
        
        const keyDownEventBuffer = new EventBuffer(localBus, eventSchemas.keydown) // array of keydowns 
        const keyUpEventBuffer = new EventBuffer(localBus, eventSchemas.keyUp)
        const networkEventBuffer = new EventBuffer(serverBus, eventSchemas.serverSnapshot)
    
        this.vehicleOwnershipCoordinator = new VehicleOwnershipCoordinator(effectsBus);

        // ==== Simulated & Reconciled Systems  ===========================
        const boatSimulator  = new BoatSimulator(effectsBus);
        const planeSimulator = new PlaneSimulator(effectsBus);
        const projectileSimulator = new ProjectileSimulator(effectsBus);
        const collisionSystem =  new CollisionSystem(this.heightmap, effectsBus)

        this.simulationSystems  = [boatSimulator, planeSimulator, projectileSimulator, collisionSystem];
        // ====================================================================


        // ==== Reactionary managers  =======================================
        const cameraManager = new CameraManager(this.camera, effectsBus);
        const soundManager   = new SoundManager(effectsBus);
        const vfxManager = new VFXManager(effectsBus);
        const terrainManager = new TerrainManager(effectsBus)

        this.reactionaryManagers = [cameraManager, soundManager, effectManager];
        // ====================================================================

        window.addEventListener("resize", this.handleWindowResize);
    }

    // starts when the host clicks start game
    // lobby data populates the managers with the quantity of components they need to create
    // and which internal systems they need to be assigned to
    //
    // Lobby Data Example:
    // [{ id, vehicle: "boat", ownerId, teamId, location, rotation, initiallyActive }]
    // "howControlled" (ai / client / network) is derived, not stored — see
    // OWNERSHIP MODEL note below / VehicleCoordinator.
    start(lobbyData) {
        this.handleWindowResize();
        
        this.previousTime = performance.now();
        this.accumulator = 0;

        vehicleCoordinator.start(data)

        for (const system of this.simulationSystems) {
            system.start?.(lobbyData);
        }
        for (const manager of this.reactionaryManagers) {
            manager.start?.(lobbyData);
        }

        createSceneTerrain(this.scene, this.heightmap);

        this.renderer.setAnimationLoop(loop)
    }
    
    loop = (time) => {
        let frameTime = (time - this.previousTime) / 1000;
        this.previousTime = time;

        frameTime = Math.min(frameTime, 0.25); // clamp so tab-switch stalls don't cause a spiral of death

        this.accumulator += frameTime;

        while (this.accumulator >= FIXED_DT) {
            this.gameRenderUpdate(FIXED_DT);
            this.accumulator -= FIXED_DT;
        }
        this.renderer.render(this.scene, this.camera);
    };


    // BOAT AND MANAGERS AHOUKD NOT OWN LOCATION DATA 
    // cases when user switches boats 
    // boat manager contains the system that the boats use 
    gameRenderUpdate(dt) {
        const userInputs = this.removeDuplicates(
            this.userInputBuffer.poll()
        )
        const userIntents = vehicleCoordinator.getUserControlled(noDuplicatesInput);

        const worldState = world.getState();
        const aiControlledVehicles = vehicleCoordinator.getAiControlled();
        const aiIntents = this.aiBrain.getChanges(
            aiControlledVehicles,
            worldState
        );

        const intents = utils.merge(userIntents, aiIntents);

        this.sendIntentsToServer(intents);

        const changes = [];

        for (const system of simulationSystems) {
            changes.push(
                system.simulate(dt, worldState, intents)
            );
        }

        worldState.apply(changes);

        const networkSnapshot = this.networkSnapshotBuffer.poll();
        worldState.reconcile(networkSnapshot)

        gameGraphics.update(worldState);
    }

}
    
    sendIntentsToServer(intents) {

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


const serverToClientPacketDecoding = {
    ENTITY_ID: { 
        offset: 0,
        bits: 8,
    },
    CONTROLGROUP_ID: {
        offset: 8,
        bits: 8,
    },
    TEAM_ID: { 
       offset: 16,
       bits: 8,
    },
    VEHICLES: { 
        offset: 24,
        bits: 8,
        values: [
            "BOAT",
            "PLANE",
            "PROJECTILE",
        ],
    },
    X_LOCATION: {
       offset: 32,
       bits: 32,
    },
    Y_LOCATION: {
       offset: 64,
       bits: 32,
    },
    Z_LOCATION: {
       offset: 96,
       bits: 32,
    },
    PITCH: {
       offset: 128,
       bits: 16,
    },
    YAW: {
       offset: 132,
       bits: 16,
    },
}

// dataPacketExample = [
//     teamId playerId boatype, startinglocx y z  rotation lastaction
    // ,10000000 1010 1001 11110000 10100000 10101010 1010101011
    // ,10010010 10101010 10000101 101001000 1001010 1010100 00001010
// ]

function readField(value, offset, bits) {
    const mask = (1n << BigInt(bits)) - 1n;
    return Number((value >> BigInt(offset)) & mask);
}


class WorldData {
    constructor(initalData) {
        this.data = initalData
    }

    decodeData(dataPacket) {

    
}


    // return list
    getIdsFromTypeGroup(type) { 
        const offset = this.dataSchema.type.offest
        const bits = this.dataSchema.type.bits
        const entities = []
        this.data.foreach((entity) => {
            readFeild(entity, offset, bits) 
        }
        return 
    } 

    getDataFromIds(data, entityId) {
    
        data.foreach((entity) => {
            readFeild(entity, offset, bits) 
            
        }
        return 
    }
}


class vehiclCoordinator {
    constructor() {
    
        
        
    }
    
    
    getAiControlledVehicles(data) {
        
        
    } 
    
    getUserControlledVehicles(data) {
        
    } 
    
    getNetworkControlledVehicles(data) {
        
        
    } 
} 
    


function reconcile(snapshot, dt) {
        const t = clamp(this.reconcileLerpRate * dt, 0, 1);
 
        this.location = {
            x: lerp(this.location.x, snapshot.location.x, t),
            y: lerp(this.location.y, snapshot.location.y, t),
        };
 
        this.rotation = lerpAngle(this.rotation, snapshot.rotation, t);
        this.velocity = { ...snapshot.velocity };
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
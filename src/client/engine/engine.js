import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

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

const FIXED_DT = CONSTANTS.FIXED_DT ?? 1 / 60;

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

        this.componentManagers = [];
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


        const effectsBus  = new LocalEventBus(eventSchemas);    // no buffering, straight to manager, fire and forget
        const simulationBus = new LocalEventBus(eventSchemas);  // gets buffered, polled by managers on update tick
        const intentBus   = new LocalEventBus(eventSchemas);    // InputTranslator -> vehicle managers, buffered
        const networkBus  = new NetworkEventBus(eventSchemas);  // gets buffered, sent to the server on update tick




        // ==== Simulated & Reconciled Components  ===========================
        // ----------- Controllable Simulated & Reconciled -------------------
        this.vehicleCoordinator = new VehicleCoordinator(this.localPlayerId);
        const boatManager  = new BoatManager(this.localPlayerId, intentBus, networkBus, this.vehicleCoordinator);
        const planeManager = new PlaneManager(this.localPlayerId, intentBus, networkBus, this.vehicleCoordinator);

        // ----------- Non Controllable Simulated & Reconciled ----------------
        const projectileManager = new ProjectileManager(simulationBus, networkBus);
        // ====================================================================





        // ==== Reactionary Components  =======================================
        // ----------- Camera Required ----------------------------------------
        const cameraManager = new CameraManager(this.camera, effectsBus);
        const soundManager   = new SoundManager();

        // ----------- No Camera Required ----------------
        const effectManager = new EffectsManager(effectsBus);
        // ====================================================================

        this.inputTranslator = new InputTranslator(simulationBus, intentBus, this.vehicleCoordinator);

        
        this.simulatedComponents   = [boatManager, planeManager, projectileManager];
        this.reactionaryComponents = [cameraManager, soundManager, effectManager];
        this.managers = [...this.simulatedComponents, ...this.reactionaryComponents];


        this.systems = [
            new CollisionSystem(this.managers, this.heightmap, {
                effectsBus,
                soundManager,
                projectileManager,
            }),
            new AISystem(this.managers),
        ];

        this.buses = { simulationBus, networkBus, effectsBus, intentBus };

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
        for (const manager of this.managers) {
            manager.start?.(lobbyData);
        }

        createSceneTerrain(this.scene, this.heightmap);

        this.previousTime = performance.now();
        this.accumulator = 0;

        this.handleWindowResize();

        this.renderer.setAnimationLoop((time) => {
            let frameTime = (time - this.previousTime) / 1000;
            this.previousTime = time;

            frameTime = Math.min(frameTime, 0.25); // clamp so tab-switch stalls don't cause a spiral of death

            this.accumulator += frameTime;

            while (this.accumulator >= FIXED_DT) {
                this.fixedUpdate(FIXED_DT);
                this.accumulator -= FIXED_DT;
            }

            this.renderer.render(this.scene, this.camera);
        });
    }

    fixedUpdate(dt) {
        for (const manager of this.managers) {
            manager.update(dt);
        }

        for (const system of this.systems) {
            system.update(dt);
        }
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
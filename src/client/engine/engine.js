import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./landscape/Heightmap.js"
import { createRenderer } from "./utils/Renderer.js"
import { createScene } from "./landscape/Terrain.js"


import { LocalEventBus, NetworkEventBus } from '../../shared/eventBus.js';
import { EventBuffer } from '../../shared/eventBuffer.js';
import { CONSTANTS } from "../..shared/constants.js";


// ============================================================================
// OWNERSHIP MODEL
// ----------------------------------------------------------------------------
// - Ownership is FIXED at lobby start and never changes for the match. Each
//   player is assigned a set of vehicles up front; that assignment is final.
// - A player actively controls exactly ONE of their own vehicles at a time.
//   All their OTHER owned vehicles run on AI. Switching which one is active
//   is pure local client state — no ownership check against other players is
//   ever needed, since a client can only switch among vehicles it already owns.
// - Every client is authoritative for ALL of its own vehicles (active or AI)
//   and is responsible for simulating + broadcasting their state. A client
//   never simulates another player's vehicle — it only blends toward that
//   player's broadcast snapshots (NetworkController).
// - So "controlSource" is NOT a stored fact — it's derived every tick from
//   (vehicle.ownerId, manager.activeVehicleId). See VehicleManager.controllerFor.
// - Controllers themselves are STATELESS strategies: update(vehicle, data, dt).
//
// BUS WIRING
// ----------------------------------------------------------------------------
// ClientInput emits onto TWO separate buses, and they are handled completely
// differently:
//
// - "mouseMove" -> an EFFECTS bus. Consumed immediately, every render frame,
//   at monitor refresh rate. Drives camera look / aim reticle only. NEVER
//   buffered, NEVER sent to the server, and NEVER touches VehicleManager.
// - "snapshot" (button/toggle actions) -> the SIMULATION lane. InputTranslator
//   turns this into { throttleDelta, steer } for whichever vehicle is
//   currently active and emits "intent". VehicleManager's intentBuffer drains
//   that on its own fixed tick. This IS what eventually gets broadcast to
//   other clients (via the vehicle's simulated state), just not per-mouse-move.
//
// Network snapshots arrive as ONE event per tick containing the WHOLE lobby's
// vehicle states ("worldSnapshot"), since the server doesn't know or care
// which client owns which vehicle — it just broadcasts everyone's state.
// authorityBuffer drains those and VehicleManager flattens+indexes them by id.
// ============================================================================


// "intent" events already arrive as { id, data } — one per emit.
function indexById(entries) {
    const map = new Map();
    entries.forEach((e) => map.set(e.id, e.data));
    return map;
}

// "worldSnapshot" events each carry the WHOLE lobby: { vehicles: [{id, ...}] }.
// Flatten every tick's worth of these (usually just one) into id -> state,
// last one wins if more than one arrived since the last drain.
function indexWorldSnapshots(entries) {
    const map = new Map();
    entries.forEach((snapshot) => {
        snapshot.vehicles.forEach((v) => map.set(v.id, v));
    });
    return map;
}





// ----------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------

export class Game {
    // socket: an already-connected transport (e.g. a socket.io client
    // instance) implementing on/off/emit/close — handed straight to
    // NetworkEventBus, which owns validating traffic against eventSchemas.
    constructor(localPlayerId, socket) {
        this.localPlayerId = localPlayerId;
        this.socket = socket;
        this.heightmap = createHeightmap();

        this.managers = [];
        this.systems = [];

        this.previousTime = 0;
        this.accumulator = 0;
    }

    setup(canvas, confirmedHeightmap) {
        this.heightmap = confirmedHeightmap ?? this.heightmap;

        this.scene = createScene();
        this.renderer = createRenderer(canvas, THREE.WebGLRenderer);
        this.camera = createCamera(canvas, THREE.PerspectiveCamera);
        this.canvas = canvas;

        // -------------------------------------------------------------------
        // Buses. See BUS WIRING note at the top of this file for why mouse
        // and buttons/toggles are split across effectsBus vs simulationBus.
        // -------------------------------------------------------------------
        const simulationBus = new LocalEventBus();
        const networkBus = new NetworkEventBus(this.socket, eventSchemas);
        const effectsBus = new LocalEventBus();
        const intentBus = new LocalEventBus();


        const coordinator = new VehicleCoordinator(this.localPlayerId);
        const boatManager = new BoatManager(this.localPlayerId, intentBus, networkBus, coordinator);
        const planeManager = new PlaneManager(this.localPlayerId, intentBus, networkBus, coordinator);

        this.coordinator = coordinator; // input handling calls coordinator.switchControl(id) on this



        const projectileManager = new ProjectileManager(simulationBus, networkBus);



        this.managers = [boatManager, planeManager, projectileManager];

        // Translates button/toggle snapshots into per-vehicle intent, feeding
        // whichever vehicle is currently active in vehicleManager.
        this.inputTranslator = new InputTranslator(simulationBus, intentBus, vehicleManager);
        // Immediate, unbuffered, unnetworked mouse-look.
        this.cameraEffects = new CameraEffects(effectsBus);

        const soundManager = { play: (_name, _opts) => {} }; // TODO: real audio manager

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
    // VehicleManager.controllerFor / the OWNERSHIP MODEL note up top.
    start(lobbyData) {
        for (const manager of this.managers) {
            manager.start?.(lobbyData);
        }

        createSceneTerrain(this.scene, this.heightmap);

        this.previousTime = performance.now();
        this.accumulator = 0;

        this.handleWindowResize();

        this.renderer.setAnimationLoop(this.loop);
    }

    loop = (time) => {
        let frameTime = (time - this.previousTime) / 1000;
        this.previousTime = time;

        frameTime = Math.min(frameTime, 0.25); // clamp so tab-switch stalls don't cause a spiral of death

        this.accumulator += frameTime;

        while (this.accumulator >= FIXED_DT) {
            this.fixedUpdate(FIXED_DT);
            this.accumulator -= FIXED_DT;
        }

        this.renderer.render(this.scene, this.camera);
    };

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

// createSceneTerrain wasn't defined in the original file either — thin
// pass-through so Game.start has something real to call. Replace with the
// real terrain builder.
function createSceneTerrain(scene, heightmap) {
    // TODO: build terrain mesh from heightmap and add to scene.
    return { scene, heightmap };
}

// ----------------------------------------------------------------------------
// Self-contained smoke test for the vehicle/controller/input system. Doesn't
// touch Game/THREE/canvas at all (those need a real browser), so this is the
// part that can actually run end-to-end here in Node.
// ----------------------------------------------------------------------------

// Fake transport standing in for a real socket.io client: publish() ->
// socket.emit() -> loops straight back into socket.on() listeners, as if
// the server echoed the message straight back to this same client. Good
// enough to exercise NetworkEventBus's real validate-then-send/receive path
// without an actual server.
function createMockSocket() {
    const listeners = new Map();
    return {
        on(event, handler) {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event).add(handler);
        },
        off(event, handler) {
            listeners.get(event)?.delete(handler);
        },
        emit(event, data) {
            listeners.get(event)?.forEach((h) => h(data));
        },
        close() {},
    };
}

function testing() {
    const simulationBus = new LocalEventBus(); // button/toggle snapshots -> ticked intent
    const effectsBus = new LocalEventBus();     // mouse deltas -> immediate, unbuffered, unnetworked
    const intentBus = new LocalEventBus();      // InputTranslator -> VehicleManager
    const networkBus = new NetworkEventBus(createMockSocket(), eventSchemas); // real bus, fake transport

    const manager = new VehicleManager("P1", intentBus, networkBus);
    manager.start([
        { id: 1, vehicle: "boat", ownerId: "P1", location: { x: 0, y: 0 }, teamId: "A", initiallyActive: true },
        { id: 2, vehicle: "boat", ownerId: "P1", location: { x: 20, y: 0 }, teamId: "A" },
        { id: 3, vehicle: "boat", ownerId: "P2", location: { x: 0, y: 0 }, teamId: "B" },
    ]);

    new InputTranslator(simulationBus, intentBus, manager);
    const camera = new CameraEffects(effectsBus);

    for (let tick = 0; tick < 4; tick++) {
        // Mouse moves every frame regardless of tick — applied instantly via
        // CameraEffects, never reaching intentBus, never reaching the network.
        effectsBus.emit("mouseMove", { deltaPitch: 0, deltaYaw: 25 });

        // Player holds "up" — this is what drives the vehicle, via buttons.
        simulationBus.emit("snapshot", {
            timestamp: tick,
            actions: {
                moveForward: true, moveBackward: false,
                moveLeft: false, moveRight: false,
                fireProjectileLeft: false, fireProjectileRight: false,
            },
            toggles: { pointerLocked: true, toggleCamera: false, toggleTerrain: false, toggleFog: false },
        });

        // Simulate a server "worldSnapshot" broadcast for the whole lobby,
        // arriving every other tick (packet loss / lower send rate sim).
        // This client only actually USES boat 3's entry (boat 1/2 are its own).
        if (tick % 2 === 0) {
            networkBus.emit("worldSnapshot", {
                vehicles: [
                    { id: 3, location: { x: tick * 10, y: 2 }, rotation: 0.1 * tick, velocity: { x: 5, y: 0 } },
                ],
            });
        }

        // Mid-run: player switches from boat 1 to boat 2.
        if (tick === 2) {
            manager.switchControl(2);
        }

        manager.update(1 / 30);

        const b1 = manager.getVehicle(1);
        const b2 = manager.getVehicle(2);
        const b3 = manager.getVehicle(3);
        console.log(
            `tick ${tick} | active=${manager.activeVehicleId} | cam yaw=${camera.yaw.toFixed(3)} | ` +
            `boat1 pos=(${b1.location.x.toFixed(2)}, ${b1.location.y.toFixed(2)}) thr=${b1.throttle.toFixed(2)} | ` +
            `boat2 pos=(${b2.location.x.toFixed(2)}, ${b2.location.y.toFixed(2)}) thr=${b2.throttle.toFixed(2)} | ` +
            `boat3(P2, network) pos=(${b3.location.x.toFixed(2)}, ${b3.location.y.toFixed(2)})`
        );
    }
}

testing();
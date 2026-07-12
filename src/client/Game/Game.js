
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createWorld } from "./world/World.js"

// The thing that should drive this archectiure is the three different sources of truth for the same vehicle over its lifetime
// A local player's input, a network snapshot, and an AI brain
// Which one applies to a given vehicle is decided by the server and can be any of the three.
// Reconciliation (predict locally, correct against authoritative snapshot) also means a single boat's state needs to be diffed and blended, not just set.



class ClientInput {
    constructor(events) {
        this.events = events;

        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
            this.update();
        });
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
            this.update();
        });
        document.addEventListener('mousedown', (event) => {
            this.handleKeyDown(event);
            this.update();
        });
        document.addEventListener('mouseup', (event) => {
            this.handleKeyUp(event);
            this.update();
        })
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
            this.updateMouse()
        });

        this.keyBindings = {
            0:          'fireProjectileLeft',
            2:          'fireProjectileRight',
            KeyW:       'moveForward',
            ArrowUp:    'moveForward',
            KeyS:       'moveBackward',
            ArrowDown:  'moveBackward',
            KeyA:       'moveLeft',
            ArrowLeft:  'moveLeft',
            KeyD:       'moveRight',
            ArrowRight: 'moveRight',
            KeyM:       'showMap',
            KeyC: 'toggleCamera',
            KeyP: 'toggleTerrain',
            KeyF: 'toggleFog',
            Escape: 'exitPointerLock',
        };
        // make this into a bitmask to compare against what changed then emit what changed
        // example last emit
        //wsad LR   pctf xy
        //0000 0000 0000 0000
        //0000 0100 1000 0000

        this.actions = {
            moveForward:  false,
            moveBackward: false,
            moveLeft:     false,
            moveRight:    false,
            fireProjectileLeft:  false,
            fireProjectileRight: false,
        }

        this.toggles = {
            pointerLocked: false,
            toggleCamera:  false,
            toggleTerrain: false,
            toggleFog:     false,
        }

        this.mouseMovement = {
            deltaPitch: 0, 
            deltaYaw:   0,
        }
    }

    handleKeyDown(event) {
        const eventCode = event.code;
        const eventButton = event.button
        const buttonPressed = this.keyBindings[eventCode] ?? this.keyBindings[eventButton];
        if (!buttonPressed) return;
        if (!event.repeat && this.actions[buttonPressed] !== undefined) {
            this.actions[buttonPressed] = true;
        }
        if (!event.repeat && this.toggles[buttonPressed] !== undefined) {
            this.toggles[buttonPressed] = !this.toggles[buttonPressed];
        }
    }

    handleKeyUp(event) {
        const eventCode = event.code;
        const eventButton = event.button;
        const buttonReleased = this.keyBindings[eventCode] ?? this.keyBindings[eventButton];
        if (!buttonReleased) return;
        if ( this.actions[buttonReleased] !== undefined) {
            this.actions[buttonReleased] = false;
        }
    }

    handleMouseMove(event) {
        if (!this.toggles.pointerLocked) return;
        this.mouseMovement.deltaPitch += event.movementY;
        this.mouseMovement.deltaYaw   += event.movementX;
    }

    // Actions that need to be reset to their default go here
    resetOneTimeActions() {

    }
    // It is very unlikely that this will ever be needed as event.movementX resets to 0 after each event and update() is called after each event
    // this function exists for safty and asurance that the same movement of the mouse will always be deterministic
    resetMouse() {
        this.mouseMovement.deltaPitch = 0;
        this.mouseMovement.deltaYaw = 0;
        // this.mouseMovement.mousewheel = 0;
    }

    getSnapshot() {
        const snapshot = {
            timestamp: performance.now(),
            actions: { ...this.actions },
            toggles: { ...this.toggles },
        }
        return snapshot
    }

    update() { 
        const mouseData = this.mouseMovement
        this.events.emit("mouseMove", mouseData);
        this.resetMouse() 

        const snapshot = this.getSnapshot()
        this.events.emit("snapshot", snapshot);
        this.resetOneTimeActions() 
    } 
}

class EventBuffer {
    constructor(eventBus, bufferedEvent) {
        this.queue = [];
        eventBus.on(bufferedEvent, (data) => this.queue.push(data));
    }

    drain() {
        const items = this.queue;
        this.queue = [];
        return items;
    }
}


class LocalController {
  constructor() { 

    } 
    update(input) {
        vehicle.applyIntent(this.inputMap(input));
    }
}

class AIController {
  constructor(brain) { 
    this.brain = brain;
 } // brain can outlive any single binding
  update(vehicle, dt, world) {
    vehicle.applyIntent(this.brain.decide(vehicle, world, dt));
  }
}

class NetworkController {
  constructor(vehicle) {
    this.vehicle = vehicle;
  }
  onPacket(packet) {
    // server already sends intent-shaped data, no interpretation needed
    this.vehicle.applyIntent(packet.cmd);
  }
}


class Plane {
    constructor() {
        const planeInputMap = (input) => ({
            throttleDelta: input.up ? 0.02 : (input.down ? -0.02 : 0),
            pitch: input.mouseY,
            roll: input.mouseX,
            fire: input.mouseDown,
        });
    }
}


class Boat { 
    constructor() {
        this.team
        this.location
        this.rotation

        const boatInputMap = (input) => ({
            throttleDelta: input.up ? 0.02 : (input.down ? -0.02 : 0),
            steer: input.mouseX,
        });

        }
    setLocation() {
        

    }

    setRotation() {
        
        
    }
    
    
    throttleSytem() {
        
    }

    rotationSystem() {
        
    }

    predictBoat() {
        
        
    }
    interpolateBoat() {

    }

    reconcile() {

    }
    
    applyIntent() {

    }

    update() {

    }

}


class VehicleManager {

    constructor(vehicleFactories) { 
        this.vehicles = new Map(); 
        this.vehicleFactories = vehicleFactories;
    }

    // lobbyData = [
    //     { 1, "boat", "ai", initalLocation }
    //     { 1, "plane", "ai", initalLocation },
    //     { 1, "boat", "client", initalLocation }
    //     { 3, "boat", "network", initalLocation }
    // ]
    start(lobbyData) {
        lobbyData.forEach((entry) => {
            add(entry)
        });
    }

    add(entry) { 
        const factory = this.vehicleFactories[entry.vehicle];

        if (!factory) {
            throw new Error(`Unknown vehicle type: ${entry.vehicle}`);
        }

        const vehicle = factory();
        vehicle.location = { ...entry.location };
        vehicle.controller = entry.controller;
        vehicle.teamId = entry.teamId;

        this.vehicles.set(vehicle.id, vehicle);
    }

    update(dt) {
        for (const vehicle of this.vehicles.values()) {
            vehicle.update(dt);
        }
    }
    
}


export class Game {
    constructor() {
        // all players create a heightmap, the host will pass on their hightmap to other users
        this.heightmap = createHeightmap();
    }


    setup(canvas, confirmedHeightmap, effectsBus, simulationBus, networkBus) {
        this.scene = new THREE.Scene();
        this.renderer = createRenderer(canvas, THREE.WebGLRenderer);
        this.camera = createCamera(canvas, THREE.PerspectiveCamera);
        this.canvas = canvas
        
        if (confirmedHeightmap != null) {
            this.heightmap = confirmedHeightmap;
        }

        // -------------------------------------------------------------------------
        // Managers that can accept fire and forget input from the user

        // If a component group takes async effects Evetns it means that component group received real time input from the user
        // for instance camera orbit controls should not be buffered as this could appear jumpy on very high hz monitors
        // same with components that do not impact gameplay such as volume controls
        // -------------------------------------------------------------------------

        const camera = new CameraManager(effectsBus);
        const sounds = new SoundManager(effectsBus);


        // Creates a buffer for async local and network events 
        // so they can be polled by the systems that need them and order can be maintained
        const simulationEventBuffer  = new EventBuffer(simulationBus, eventSchemas.inputIntent)
        const networkEventBuffer = new EventBuffer(networkBus, eventSchemas.gameStateAuthority);


        // when different component groups need to interact, tell the manager something
        // happened; the manager then processes this — similar to how a manager processes
        // input from the user or the client: intentUpdate -> systemsUpdate -> reconcile



        vehicleManager = new VehicleManager() {

            
        }

        // This has methods like attach to object that makes sure camera and boat end up at the same location

        window.addEventListener('resize', this.handleWindowResize);
    }
    // starts when the host clicks start game 
    // lobby data populates the managers with the quantity of components they need to create 
    // and which internal systems they need to be assigned to   

    // Lobby Data Example:
    // [teamID, vehicleType, howControlled] 
    // how controlled is determined by the server for each player"
    // the server will attempt to balance this among all the players in the lobby
    // with priority towards the first player on a particular team"
    // another player on the clients own team will be network. 
    // same team players will show the same number but then network as the howControlled
    // lobbyData = {
    //     { 1, "boat", "ai", initalLocation }
    //     { 1, "plane", "ai", initalLocation },
    //     { 1, "boat", "client", initalLocation }
    //     { 3, "boat", "network", initalLocation }
    // }

    start(lobbyData) {
        Object.values(this.managers).forEach((manager) => {
            manager.start?.(lobbyData);
        });

        this.world = createWorld(this.scene, this.heightmap);

        this.handleWindowResize();
        this.renderer.setAnimationLoop((time) => {
            this.update(time);
            this.renderer.render(this.scene, this.camera);
        });
    }

    update(time) {
        const intentUpdates = this.localEventBuffer.poll();
        this.networkEventBuffer.source?.send?.(intentUpdates);
 
        Object.values(this.globalSystems).forEach((system) => system.update?.(intentUpdates));
        Object.values(this.internalSystems).forEach((manager) => manager.update?.(intentUpdates));
 
        const authUpdates = this.networkEventBuffer.poll();
 
        Object.values(this.globalSystems).forEach((system) => system.reconcile?.(authUpdates));
        Object.values(this.internalSystems).forEach((manager) => manager.reconcile?.(authUpdates));
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
    }
}




const collisionResponses = {
    'projectile:vessel': (projectile, boat, penetration) => {
        // effects on the boat (entityB in this pairing)
        applyDamage(boat, projectile.damage);
        effectsBus.emit('cameraShake', { intensity: projectile.damage / 100 });
        effectsBus.emit('damageNumberPopup', { amount: projectile.damage, entityId: boat.id });
        if (boat.controlSource === 'ai') {
            boat.brain.notify({ type: 'tookDamage', from: projectile.ownerId });
        }

        // effects on the projectile (entityA in this pairing)
        soundsManager.play('impact', { position: projectile.position });
        managers.projectiles.remove(projectile.id);
    },
    'vessel:vessel':      (a, b) => pushApart(a, b),
    'vessel:terrain':     (boat) => { boat.velocity = 0; },
    'projectile:terrain': (proj) => removeProjectile(proj.id),

    // new entries only - nothing above was touched
    'plane:terrain':      (plane) => plane.crash(),
    'projectile:plane': (proj, plane) => { plane.health -= proj.damage; removeProjectile(proj.id); },
    'vessel:plane':       (boat, plane) => { /* decide once, here */ },
};

function resolveCollision({ entityA, entityB, penetration }) {
    const key = `${entityA.layer}:${entityB.layer}`;
    const reversedKey = `${entityB.layer}:${entityA.layer}`;

    if (collisionResponses[key]){
        collisionResponses[key](entityA, entityB, penetration);
    }

    else if (collisionResponses[reversedKey]) {
        collisionResponses[reversedKey](entityB, entityA, penetration);
    }
}

function entityCollision(entityA, entityB) {
        const distance = getDistance(entityA.location, entityB.location);

        const hitboxOverlap = entityA.hitboxSphereSize + entityB.hitboxSphereSize;
        const penetration = hitboxOverlap - distance;

        if (penetration > 0) {
            return { entityA, entityB, penetration };
        } 
        return null;
}

function collisionSystem(managers, cellSize = 20) {
    const colliders = collectColliders(managers);

    for (const [a, b] of broadPhase(colliders, cellSize)) {
        if (entityCollision(a, b)) {
            resolveCollision(hit);
        } 
    }
}


    // FRAME START
/*
1. NetworkManager receives snapshots asynchronously
   - buffers snapshots
   - stores authoritative states

   AI Brain updates every few hundred frames adds to intent state
   
   user input is taken ready to be pulled adds to intent state

2. Managers assign controllers to certain objects one of each r
   - PlayerController pulls from PlayerInputSource 
   - AIController pulls from AIInputSource 
   - NetworkController/RemoteController pulls from snapshot buffer

3. Controllers update locally controlled entities
   - PlayerController pulls from PlayerInputSource
   - AIController pulls from AIInputSource
   - NetworkController/RemoteController pulls from snapshot buffer

4. Locally controlled entities simulate immediately
   - local boat movement
   - local projectiles
   - local sounds

6. Send local player inputs to server

7. Remote entities interpolate/extrapolate
   - interpolate between snapshots
   - extrapolate briefly if next snapshot missing

8. Reconcile locally predicted entities
   - compare predicted state vs authoritative snapshot
   - apply soft correction

9. Render scene

*/










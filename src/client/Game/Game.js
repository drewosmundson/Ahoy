
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createWorld } from "./world/World.js"

// The thing that should drive this archectiure is the three different sources of truth for the same vehicle over its lifetime
// A local player's input, a network snapshot, and an AI brain
// Which one applies to a given vehicle is decided by the server and can be any of the three.
// Reconciliation (predict locally, correct against authoritative snapshot) also means a single boat's state needs to be diffed and blended, not just set.



export class EventBuffer {
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


// local async bus usage
export class LocalEventBus {
    constructor() {
        this.listeners = new Map();
    }

    // const sub = bus.on('foo', myCallback);
    // sub.unsubscribe();
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event).add(callback);

        return {
            unsubscribe: () => {
                this.off(event, callback);
            },
        };
    }

    
    off(event, callback) {
        const callbacks = this.listeners.get(event);

        if (!callbacks) return;

        callbacks.delete(callback);

        if (callbacks.size === 0) {
            this.listeners.delete(event);
        }
    }


    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (!callbacks) return;
        for (const callback of [...callbacks]) {
            try {
                callback(data);
            } catch (err) {
                console.error(err);
            }
        }
    }
}


function createSender(socket, eventSchemas) {
    return function send(event, data) {
        if (!(event in eventSchemas)) {
            throw new Error(`Unknown event: ${event}`);
        }

        if (!eventSchemas[event](data)) {
            throw new Error(`Invalid payload`);
        }

        socket.emit(event, { ...data });
    };
}


function createReceiver(socket, eventSchemas) {
    return function subscribe(handler) {
        const cleanup = [];

        for (const event in eventSchemas) {
            const listener = data => {
                if (!eventSchemas[event](data)) return;

                handler(event, data);
            };

            socket.on(event, listener);

            cleanup.push(() => {
                socket.off(event, listener);
            });
        }

        return {
            unsubscribe() {
                cleanup.forEach(func => func());
            }
        };
    };
}


// IPC bus usage
// const networkBus = new NetworkEventBus(socket, eventSchemas)
// networkBus.publish(event, data) // events going from client->server or server -> client
// networkBus.emit(event, data)   // events going to the same process client -> client or server -> server
// networkBus.on(event, data)     // does not care if this event comes from a publish or an emit
export class NetworkEventBus extends LocalEventBus {
    constructor(socket, eventSchemas) {
        super();
        this.socket = socket;


        // publish('message', { text: 'hello' });    // passes checks, calls socket.emit
        // publish('badEvent', { text: 'hi' });      // throws "Unknown event: bogusEvent"
        // publish('badData', { text: 123 });       //throws "Invalid payload" (if schema expects a string)
        this.publisher = createSender(socket, eventSchemas);

        // createReceiver(socket, eventSchemas) returns a subscribe function
        // this function is called immediately with a handler, which runs
        //    socket.on() for all events in eventSchemas, and returns an unsubscribe function
        //  .unsubscribe is stored as this.detach can be called via this.detach() to stop listening

        // The handler passes in broadcasts incoming socket events through this bus's own local emit()
        // this is so bus.on(event, data) can happen without caring where that event came from
        this.detach = createReceiver(socket, eventSchemas)((event, data) => {
            this.emit(event, data);
        }).unsubscribe;

        this.connected = true;
    }

    publish(event, data) {
        if (!this.connected) {
            throw new Error('Cannot publish: bus is disconnected');
        }
        this.publisher(event, data);
    }

    disconnect() {
        if (!this.connected) return; // idempotent guard

        this.detach();   // remove all socket.on listeners (per event)
        this.listeners.clear(); // drop all local .on() subscribers too
        this.connected = false;

        // Only close the socket if this bus owns its lifecycle.
        // Skip this if the socket is shared/managed elsewhere.
        this.socket.close?.();
    }
}

// const networkEvents = new NetworkEventBus(socket, schemas);     // network lane - to and from the server
// const effectsEvents = new LocalEventBus(schemas);               // presentation lane - fire and forget
// const simulationEvents = new LocalEventBus(schemas);            // intent lane - feeds the pull pipeline


// effects example
// Authoritative mutation happens directly, NOT via emit.
// emit is to tell the world this happened.

// class Player {
//     constructor() {
//         this.health = 100;
//     }

//     applyDamage(amount) {
//         this.health -= amount;
//         effectsEvents.emit("cameraShake", { intensity: amount / 100 });
//         effectsEvents.emit("damageNumberPopup", { amount, entityId: this.id });
//     }
// }


/*
----- Network Events ----- 
const network = new NetworkInterface(socket, eventSchemas);

Receive network events
const sub = network.on("playerJoined", data => {
    console.log("Player joined:", data);
});


Send network events
network.sendEvent("move", {
    x: 10,
    y: 20
});


Stop listening locally
sub.unsubscribe();


Stop receiving socket events
network.disconnect();
*/


class LocalControlSystem {
    constructor(buffer) { 
        this.locallyControlled = new Map();
    }

    add(componentId) {

    }

    remove(componentId) {

    }

    update(input, dt) {
        const intent = this.buffer.drian;
 
        this.locallyControlled.forEach((component) => {
            component.applyIntent(intent)
        });
    }
}


class NetworkControlSystem {
    constructor(buffer) { 
        this.networkControlled = new Map();
    }

    add(componentId) {

    }

    remove(componentId) {

    }

    update(input, dt) {
        const state = this.buffer.drian;

        // TODO get most recent state for authority. only pass in flat object
 
        this.locallyControlled.forEach((component) => {
            component.interpolate(state)
        });
    }
}

class Boat { 
    constructor() {
        this.id;
        this.team;
        this.location;
        this.rotation;

        const boatInputMap = (input) => ({
            throttleDelta: input.up ? 0.02 : (input.down ? -0.02 : 0),
            steer: input.mouseX,
        });

    }
    setLocation() {

    }

    setRotation() {

    }

    applyIntent() {

    }

    runAnimations() {

    }
}
function boatFactory() {
    
    
}
class VehicleManager {
    constructor(vehicleFactories, systems) { 
        this.vehicles = new Map(); 
        this.vehicleFactories = vehicleFactories;
    }

    // lobbyData = [
    //     { id, "boat", "ai", initalLocation }
    //     { 1, "plane", "ai", initalLocation },
    //     { 1, "boat", "client", initalLocation }
    //     { 3, "boat", "network", initalLocation }
    // ]    
    start(lobbyData) {
        lobbyData.forEach(entry => this.add(entry));
    }

    getVehicle(vehicleId) {
        return this.vehicles.get(vehicleId);
    }

    add(entry) { 
        const factory = this.vehicleFactories[entry.vehicle];
        if (!factory) {
            throw new Error(`Unknown vehicle type: ${entry.vehicle}`);
        }

        const vehicle = factory();

        vehicle.teamId = entry.teamId;
        vehicle.location = { ...entry.location };
        vehicle.rotation = entry.rotation 

        const controlSystem = this.vehicleControlSystems[entry.controller];

        if (!controller) {
            throw new Error(`Unknown controller type: ${entry.controller}`);
        }

        controlSystem.add(vehicle.id, vehicle)
        collisionSystem.add(vehicle.id, vehicle)

        this.vehicles.set(vehicle.id, vehicle);
    }

    update(dt) {
        for (const vehicle of this.vehicles.values()) {
            vehicle.runAnimations(dt);
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
        
        this.vehicleFactories = {
            boat: boatFactory
            plane: planeFactoy
        }

        // -------------------------------------------------------------------------
        // Managers that can accept fire and forget input from the user

        // If a component group takes async effects Evetns it means that component group received real time input from the user
        // for instance camera orbit controls should not be buffered as this could appear jumpy on very high hz monitors
        // same with components that do not impact gameplay such as volume controls
        // -------------------------------------------------------------------------
        const simulationEventBuffer  = new EventBuffer(simulationBus, eventSchemas.intentGameState)
        const networkEventBuffer     = new EventBuffer(networkBus, eventSchemas.authorityGameState);

        const vehicleManager    = new VehicleManager()
        const projectileManager = new ProjectileManager()
        const cameraManager     = new CameraManager(effectsBus, eventSchemas.effects);
        const soundManager      = new SoundManager(effectsBus, eventSchemas.effects);
        
        
        this.managers = {
            
            
        } 

        // Managers are their own ECS world. Entites that are in managers get added to the systems of 
        // that managers. They fire on update that are specific to that component. like animations on boats or
        // camera changing. 

        const collisonSystem       = new CollisionSystem(this.heightmap)
        const localControlSystem   = new localControlSystem()
        const networkControlSystem = new NetworkControlSystem() 

        this.systems = {




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










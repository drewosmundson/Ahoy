
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createWorld } from "./world/World.js"




// local async bus usage
class LocalEventBus {
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

class inputManager {
    
    
}



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

class ControlManager {
    
    
    
 } 

// TODO input from input buffer? or send to input buffer after ? ?
// I am thinking buffering the raw input then translating at update time from input map
// One controller per INPUT SOURCE, not per (input × vehicle) pair maybe per event buffer 
class LocalController {
  constructor(vehicle, inputMap) {
    this.vehicle = vehicle;
    this.inputMap = inputMap; // translates raw input -> generic intent
  }
  update(input) {
    this.vehicle.applyControl(this.inputMap(input));
  }
}

class NetworkController {
  constructor(vehicle) {
    this.vehicle = vehicle;
  }
  onPacket(packet) {
    // server already sends intent-shaped data, no interpretation needed
    this.vehicle.applyControl(packet.cmd);
  }
}

class AIController {
  constructor(vehicle, brain) {
    this.vehicle = vehicle;
    this.brain = brain; // strategy object, e.g. PathFollower, Dogfighter
  }
  update(dt, world) {
    this.vehicle.applyControl(this.brain.decide(this.vehicle, world, dt));
  }
}

const planeInputMap = (input) => ({
  throttleDelta: input.up ? 0.02 : (input.down ? -0.02 : 0),
  pitch: input.mouseY,
  roll: input.mouseX,
  fire: input.mouseDown,
});

const boatInputMap = (input) => ({
  throttleDelta: input.up ? 0.02 : (input.down ? -0.02 : 0),
  steer: input.mouseX,
});

// const planeController = new LocalController(planeC, planeInputMap);
// const boatController  = new LocalController(dinghy, boatInputMap);




boatDriver()




// interface
class Vehicle {
    update(dt) {}
    applyControl(){}
    applyAuthority(){} 
}
// useboatCotroller like thing if i want to have boat be purely data
class Boat extends Vehicle {
    constructor() {
        this.cannonLocation
        this.location
        this.throttle
        this.fireleft
        this.fireright
        this.rotateRight
        this.rotateLeft
        }
    setLocation() {
        

    }
    
    
    
    setRotation() {
        
        
    }
    
    
    throttleSytem() {
        
    }

    rotationSystem() {
        
    }
    
        
    predictBoat(){
        
        
    }
    
    
    
  //BoatConollerSystem{ 
    update() {
        
        this.applyExactComtol()
        
        
        
        
        }
        
        

    applyExactControl(){
        
        }
    
    applyIntent() {
        
        }
        
   // } 

}

class Plane extends Vehicle {


}

class VehicleManager {
    constructor() { 
        this.vehicles = new Map(); 
    }
    add(vehicle) { 
        this.vehicles.set(vehicle.id, vehicle); 
    }
    update(dt) {
        for (const vehicle of this.vehicles.values()) {
            vehicle.update(dt);
        }
      }
 }









export class Game {
    constructor(socket) {
        // all players create a heightmap, the host will pass on their hightmap to other users
        this.networkEventBus = new NetworkEventBus(socket, eventSchemas.network)
        this.localEventBus = new LocalEventBus(eventSchemas.local)
        this.heightmap = createHeightmap();
    }


    setup(canvas, newHeightmap, localEvents, networkEvents) {
        this.scene = new THREE.Scene();
        this.renderer = createRenderer(canvas, THREE.WebGLRenderer);
        this.camera = createCamera(canvas, THREE.PerspectiveCamera);
        this.canvas = canvas
        
        if (newHeightmap != null) {
            this.heightmap = newHeightmap;
        }

        // Creates a buffer for async local and network events 
        // so they can be polled by the systems that need them and order can be maintained

        this.localEventBuffer  = new EventBuffer(localEventBus)
        this.networkEventBuffer = new EventBuffer(networkEventBus);

        // if a component group takes asyncLocalEvetns it means that component group received real time input from the user
        // for instance camera orbit controls should not be buffered as this could appear jumpy on very high hz monitors
        // same with components that do not impact gameplay such as volume controls
        const camera = new CameraManager(localEventBus);
        const sounds = new SoundManager(localEventBus);

        const boats = new BoatManager(this.localEventBuffer, this.networkEventBuffer);
        const projectiles = new ProjectileManager(this.localEventBuffer, this.networkEventBuffer);

        // when different component groups need to interact, tell the manager something
        // happened; the manager then processes this — similar to how a manager processes
        // input from the user or the client: intentUpdate -> systemsUpdate -> reconcile

        this.globalSystems = {
            terrainCollision: terrainCollisionSystem(this.heightmap, { components: [] }),
 
            projectileCollision: projectileCollisionSystem(projectiles, { components: [boats] }),
 
            boatCollision: boatCollisionSystem(boats, {
                components: [
                    boats,
                    // planes,
                    // players,
                ],
            }),
 
            cameraFollow: cameraFollowSystem(camera, { components: [] }),
        };

        this.managers = {
            boats,
            projectiles,
            camera,
            sounds,
        };

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
    //     { 0, "boat", "ai" }
    //     { 1, "plane", "ai" },
    //     { 1, "boat", "client" }
    //     { 3, "boat", "network" }
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
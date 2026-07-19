
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createScene } from "./scene/scene.js"

import { events } from './Network/Events.js';

// The thing that should drive this archectiure is the three different sources of truth for the same vehicle over its lifetime
// A local player's input, a network snapshot, and an AI brain
// Which one applies to a given vehicle is decided by the server and can be any of the three.
// Reconciliation (predict locally, correct against authoritative snapshot) also means a single boat's state needs to be diffed and blended, not just set.


class LocalController {
    constructor(buffer) { 
        this.locallyControlled = new Map();
    }

    add(component) {
        this.locallyControlled.set(component.id, component)
    }

        remove(component) {
        this.locallyControlled.delete(component.id)
    }
    
    applyIntent(component, intent) {
        const oldIntent = component.intended
        
    }

    update(input, dt) {
        this.locallyControlled.forEach((component) => {
            const intent = this.buffer.drian(component.id);
            component.applyIntent(intent)
        });
    }
}


class NetworkControllerSystem {
    constructor(buffer) { 
        this.networkControlled = new Map();
    }

    add(component) {
        this.networkControlled.set(component.id, component)
    }

    remove(component) {
        this.networkControlled.delete(component.id)
    }

    interpolateEntity() {
        
    } 

    update(input, dt) {
        const state = this.buffer.drian;
        this.locallyControlled.forEach((component) => {
            component.interpolate(state)
        });
    }
}



//components passed into the object 
// other places the components are tracked in the manager 
// and sytems systems have a referencbe to the component jn tbe boat
// manager.boat.component like anamations specific controller and collider shape
// if boat compoeknts are not null the systems run these from managers 
// tje managers know all possoble componens an object can use 
class Boat { 
    constructor() {
        this.id;
        this.team;
        this.rotation;
        this.mass 
        this.location = new Vector2()
        this.intendedLocation = new Vector2()
        this.velocity = new Vector2()
      
        this.boatInputMap = (input) => ({
            throttleDelta: input.up ? 0.02 : (input.down ? -0.02 : 0),
            steer: input.mouseX,
        });
        
        this.animations 
        
        this.controller
        
        this.collider

    }
    setLocation(vector) {
        this.locaion = vector
    }

    setRotation(radians) {
        this.rotation = radians
    }



    runAnimations() {

    }
}


class VehicleManager {
    constructor(vehicleFactories, controllers) { 
        this.vehicles = new Map(); 
        this.vehicleFactories = vehicleFactories;
        this.controllers = controllers
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
    getAllVehicles() {
        return this.vehicles
    } 
    
    // ststem interaction options 
    // from outside 
    getVehiclesWithCollisons() {
        
    }
    // inseart from inside manager on creation
    // and whenever triggerd on updatw 
    //vehicleManager = new VehicleManager(systems)
    //this.systems.collisions.add(boat24)
    
    add(entry) { 
        const factory = this.vehicleFactories[entry.vehicle];
        if (!factory) {
            throw new Error(`Unknown vehicle type: ${entry.vehicle}`);
        }
        
        const controlSystem = this.vehicleControlSystems[entry.controller];
        if (!controller) {
            throw new Error(`Unknown controller type: ${entry.controller}`);
        }
        
        const collisionSystem 
        
        const vehicle = factory(controlSystem, );
        
        vehicle.control = controlSystem
        vehicle.teamId = entry.teamId;
        vehicle.location = { ...entry.location };
        vehicle.rotation = entry.rotation 


        collisionSystem.add(vehicle.id, vehicle)

        this.vehicles.set(vehicle.id, vehicle);
    }
}



export class Game {
    constructor() {
        // all players create a heightmap, the host will pass on their hightmap to other users
        this.heightmap = createHeightmap();
    }

    setup(canvas, confirmedHeightmap) {
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
        const cameraManager     = new CameraManager(this.camera, effectsBus, eventSchemas.effects);
        const soundManager      = new SoundManager(effectsBus, eventSchemas.effects);
    
        // -------------------------------------------------------------------------
        // Managers that take input from the user that will be sent to the server for validation and reconciliation accross users

        // If a component group takes async effects Evetns it means that component group received real time input from the user
        // These managers events should  be buffered as they update on set ticks so high hz moniter controlled boats dont move slower than others 
        // -------------------------------------------------------------------------
        const simulationEventBuffer  = new EventBuffer(simulationBus, eventSchemas.intentGameState)
        const networkEventBuffer     = new EventBuffer(networkBus, eventSchemas.authorityGameState);


        const vehicleManager    = new VehicleManager(simulationEventBuffer, networkEventBuffer, collisionSystem)
        const projectileManager = new ProjectileManager(simulationEventBuffer, networkEventBuffer )

        const collisonSystem  = new CollisionSystem(this.heightmap)
        this.managers = {
            

        }
        // ---------------------------------------------------------
        // Systems are to be cross components based they they reach into the managers that have been inseated into them to
        // query on update 
        // -------------------------------------------------------------------------------------------------
        
        this.systems = {
            collisonSystem,
        }
        
        window.addEventListener('resize', this.handleWindowResize);
    }
    // starts when the host clicks start game 
    // lobby data populates the managers with the quantity of components they need to create 
    // and which internal systems they need to be assigned to   

    // Lobby Data Example:
    // [playerId, teamId, vehicleType, howControlled, initLocation] 
    // how controlled is determined by the server for each player the server will attempt to balance this among all the players in the lobby with priority towards the first player on a particular team"
    // another player on the clients own team will be network. same team players will show the same number but then network as the howControlled
    // lobbyData = {
    //     { 1, "boat", "ai", initLocation }
    //     { 1, "plane", "ai", initLocation },
    //     { 1, "boat", "client", initLocation }
    //     { 3, "boat", "network", initLocation }
    // }

    start(lobbyData) {
        Object.values(this.managers).forEach((manager) => {
            manager.start?.(lobbyData);
        });


        this.sceneTerrain = createSceneTerrain(this.scene, this.heightmap);

        this.handleWindowResize();
        this.renderer.setAnimationLoop((time) => {
            this.update(time);
            this.renderer.render(this.scene, this.camera);
        });
    }

    update(time) {
        const intentUpdates = this.localEventBuffer.poll();
        const authUpdates = this.networkEventBuffer.poll();
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



class CollisionSystem {
    constructor(heightmap) {   
        this.heightmap = heightmap
        entitiesWithCollider = (entityWithCollisionLocation, colliderShape)
        entitiesWithCollider = new Map()

        this.gridSize = Math.max(heightmap.length >> 4, 1);
        
    }

    getEntitiesColliders() {


    }

    createGrid(heightmap)
    
    collisionCheck() {
        


    }


}

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








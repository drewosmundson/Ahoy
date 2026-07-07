
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createCamera } from './components/Camera.js';
import { eventSystem } from "../app/localEvents.js" 
import { createWorld } from "./world/World.js"

export class Game {
    constructor() {
        // all players create a heightmap, the host will pass on their hightmap to other users
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

        this.localEventBuffer  = new EventBuffer(localEvents)
        this.networkEventBuffer = new EventBuffer(networkEvents);

        // if a component group takes asyncLocalEvetns it means that component group received real time input from the user
        // for instance camera orbit controls should not be buffered as this could appear jumpy on very high hz monitors
        // same with components that do not impact gameplay such as volume controls
        const camera = new CameraManager(localEvents);
        const sounds = new SoundManager(localEvents);

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

class playerCotrolManager {
    constructor() {
        
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
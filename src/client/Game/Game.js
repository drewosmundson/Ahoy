
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"
import { createCamera } from './components/Camera.js';
import { eventSystem } from "./systems/EventSystem.js" 
import { createWorld } from "./world/World.js"


export class Game {
    constructor(networkInterface) {
        this.networkInterface = networkInterface;
        this.networkBuffer = new EventBuffer();
        this.heightmap = createHeightmap();
    }

    // Lobby Data Example:
    // [teamID, vehicleType, howControlled] 
    // how controlled is determined by the server for each player"
    // the server will attempt to balance this among all the players in the lobby
    // with priority towards the first player on a particular team"
    // another player on the clients own team will be network. 
    // same team players will show the same number but then network as the howControlled
    // lobbyData = [
    //     [0, "boat", "ai"]
    //     [1, "plane", "ai"],
    //     [1, "boat", "client"]
    //     [3, "boat", "network"]
    // ]
    setup(canvas, lobbyData) {
        this.scene = new THREE.Scene();
        this.renderer = createRenderer(canvas, THREE.WebGLRenderer);
        this.camera = createCamera(canvas, THREE.PerspectiveCamera);
        this.canvas = canvas


        const events  = new EventSystem();
        const buffer  = new bufferSystem(events),
        

        // Add needed systems here to each ECS group this is done to reduce time complexity iterating all the systems over each components
        // this is dependncy injection for systems into. My thoughts are that components should be organized into groups to reduce complexity
        this.managers = {
            input:      new InputManager(),
            network:    new netManager(),
            boat:       new BoatManager(),
            projectile: new ProjectileManager(),
            camera:     new CameraManager(events),
            sound:      new SoundManager(events),
        }

        // Init Input
        this.clientInput = new ClientInput(events);
        this.aiInput = new AiInput()
  


        this.world = createWorld(this.scene, this.heightmap);

        window.addEventListener('resize', this.handleWindowResize);
    }



    start() {
        
        this.managers.forEach(manager => {
            manager.start(lobbyData)
        });

        this.handleWindowResize();
        this.renderer.setAnimationLoop((time) => {
            this.update(time);
            this.renderer.render(this.scene, this.camera);
        });
    }

    update(time) {
        const intents = clientInputBuffer.pollIntents()

        this.managers.forEach(manager => {
            manager.update(intents)
        });

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
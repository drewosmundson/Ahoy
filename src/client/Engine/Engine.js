
// Utils
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

import WorldData from "WorldData.js"
import NetworkInterface from "NetworkInterface.js"

// Async and networking events and buffers
import { LocalEventBus } from '../../shared/eventBus.js';
import { NetworkEventBus } from '../../shared/eventBus.js';
import { EventBuffer } from '../../shared/eventBuffer.js';

import { eventSchemas } from './Utils/schemas.js';
// ---------------------------------------------------------------------------
// Game: top-level wiring. Fixed-timestep loop; managers simulate, systems
// react across managers (collision, AI, etc).
// ----------------------------------------------------------------------------
export class Engine {

    constructor(Game) {
        // Assined to entities and organized in world data. 
        this.Components       = Game?.Components;

        // Systems read from components in world data and act given the new information passed down from the user or ai inputs
        this.OnTickSystems  = Game?.OnTickSystems;
        this.RealtimeSystems    = Game?.RealtimeSystems;

        // creates intended changes that the systems will read and react to and compare to the data in components
        this.UserInput        = Game?.UserEvents;
        this.AiBrain          = Game?.AiBrain

        // Authorative updates from the server does not need to be passed into systems these updates go straight into world data after reconcile
        this.NetworkInterface = Game?.NetworkEvents

        // Does not fit in neatly with other systems or components because the camera is always needed.
        this.CameraManager    = Game?.CameraManager
    }

    setup(canvas, socket = null) {
        this.canvas        = canvas;
        this.renderer      = createRenderer(THREE.WebGLRenderer, canvas);
        this.camera        = createCamera(THREE.PerspecitveCamera)
        this.scene         = createScene(THREE.Scene);
        
        // ============ Components and entity initalization ==============
        this.world = new WorldData();
        this.world.register(this.Components)
        // ================================================================

        const localBus  = new LocalEventBus(eventSchemas);// Intra-process event bus for updates in the same process that are not in sync with the game loop like mouse and keyboard
        const networkBus  = new NetworkEventBus(socket, eventSchemas); // Inter-process event bus for communication to the server


        // ====  Systems  ============================================
        this.onTickSystems = this.OnTickSystems.map(System => new System());
        this.realtimeSystems = this.RealtimeSystems.map(System => new System(localBus));
        // =======================================================

        // Unique Systems that create the changes that all other systems react to
        this.userInput        = new this.UserInput()
        this.aiBrain          = new this.AiBrain()
        this.networkInterface = new this.NetworkInterface(localBus, networkBus)

        // Event buffers take an event bus and stores a history of events with timestamps. can be polled to read and clear the buffer
        this.keyDownEventBuffer = new EventBuffer(localBus, eventSchemas.localEventBuffer)       // keydowns buffer
        this.aiBrainEventBuffer = new EventBuffer(localBus, eventSchemas.aiBrainEventBuffer)   // slow thinking ai so that the game does not need to wait for it
        this.networkEventBuffer = new EventBuffer(networkBus, eventSchemas.networkEventBuffer)   // server updates buffer

        this.cameraManager = new CameraManager(localBus, camera)

        networkBus.emit(eventSchemas.userSetup, true)
    }

    // starts when the host clicks start game
    // lobby data populates the managers with the quantity of components they need to create
    // and which internal systems they need to be assigned to
    // decoded Lobby Data Example:
    // [{ id, vehicle: "boat", ownerId, teamId, location, rotation, initiallyActive }]
    // lobby data contains the the heightmap if is one if not it is created on the spot
    // the host just needs to have started before all of the others so this step can finish and the others can get their heightmap externally
    start(lobbyData) {
        this.world.apply(lobbyData)

        for (const simulationSystem of this.simulationSystems) {
            simulationSystem.start?.(decodedLobbyData);
        }
        for (const reactionarySystems of this.reactionarySystems) {
            reactionarySystems.start?.(decodedLobbyData);
        }
        
        window.addEventListener("resize", () => {
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
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        });

        window.dispatchEvent(new Event("resize"));
        this.renderer.setAnimationLoop(loop)
    }

    loop = (time) => {
        const frameTime = Math.min(((time - this.previousTime) * 0.001), 0.25)  // clamp so tab switch does not spiral the system
        this.previousTime = time;
        this.accumulator += frameTime;
        while (this.accumulator >= FIXED_DT) {
            this.tick(this.world, FIXED_DT);
            this.accumulator -= FIXED_DT;
        }
        this.render()
    };

    tick(world, dt) {
        this.aiBrain.update(world)
        const userIntents  = this.keyDownEventBuffer.poll()
        const aiIntents    = this.aiEventBuffer.poll()
        const networkUpdates = this.networkEventBuffer.poll();


        this.networkInterface.send(userIntents, aiIntents);

        const changes = [];
        for (const system of this.simulationSystems) {
            changes.push(system.simulate(dt, world, intents)); 
        }

        world.apply(changes); 

        world.reconcile(networkUpdates);
    }

    render() {
        this.graphics.update(this.world.getState()) 
        this.renderer.render(this.scene, this.camera);
    }


    stop() {
        this.renderer.setAnimationLoop(null);
    }
}
function createRenderer(canvas, WebRenderer) {
    const renderer = new WebGLRenderer({
        canvas: this.canvas,
        antialias: true
    });
    return renderer 
}

// these are the systems equivilent to coordinators for the managers

//=================


// systems need data in and then data out the data comes from these buffer reads and then outputs to intents that are then passed in through update(intents) intents group local and ai changes
// also receives a reconcile from the network buffer. there are two buffers that send data to each the systems. 


// the managers also need data in and data out but their data comes from the buses.emit() and received by busses.on()
// the managers can have many bus reader classes that emit to a specific mamanger this happens async of the game loop that is why this has to be done this way.
// these systems do do not need to be reconciled nore do the updates that they operate on and compare to components need to be sent to the server

//=====================



// directors read from buffer "emit" to systems the data "emitted" here

// coordinators read from emit update




// for the AI Brain this is why it needs a buffer the promise will result in feeding the buffer

//  1. Define the heavy or slow asynchronous calculation
// async function heavyCalculation() {
//   console.log(" Calculation started in the background...");
  
//    Simulating a 3-second delay (like a fetch or heavy crypto calculation)
//   await new Promise(resolve => setTimeout(resolve, 3000)); 
  
//   const result = 42; 
//   console.log(` Calculation finished! Result is: ${result}`);
//   return result;
// }

// 2. Main execution flow
// function main() {
//   console.log(" Main program starting...");

//    Call the function WITHOUT 'await'. It runs in the background.
//   heavyCalculation(); 

//    The engine immediately moves to these lines without waiting 3 seconds
//   console.log(" Moving onto other things immediately...");
//   console.log(" User interface remains responsive!");
  
//    You can run any other code here
//   doOtherWork();
// }

// function doOtherWork() {
//   console.log("" Doing other important work...");
// }
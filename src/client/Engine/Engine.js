import WorldData from "./WorldData.js"

import { LocalEventBus, NetworkEventBus } from './EventBus.js';
import { createEventBuffers } from './EventBuffer.js';
import { FIXED_DT } from './Constants.js'


export class Engine {
    
    setup(Game, canvas, socket = null) {

        // ============ Components and Entity initalization =========
        //  Components are where they can be filtered by the system that require them. 
        //  WorldData is updated on each game tick by systems
        this.worldData = new WorldData(Game.Components.name);
        // ===========================================================


        const simulationLocalBus   = new LocalEventBus(Game.simulationEvents);             // Intra-process bus for events in the same process like mouse and keyboard
        const simulationNetworkBus = new NetworkEventBus(socket, Game.networkEvents);   // Inter-process bus for events to and from the server
        const frameLocalBus        = new LocalEventBus(Game.frameEvents);
        const syncLocalBus         = new LocalEventBus(Game.syncEvents)


        //this.buses = [simulationLocalBus, simulationNetworkBus, frameLocalBus, syncLocalBus];


        // ============ Event Buffers ==============================
        //  Event buffers take an event bus and store a history of events with timestamps to be polled each game tick.
        //  simulation Buffer's purpose is when event triggered and its result must wait for the game loop to reach its next tick 
        //  NetworkBuffers's purpose is when events arrive from the server out of sync with the game loop or out of order.
        //  These are the input that game systems read from so that systems produce can a change that the world data will apply at once 
        this.simulationLocalEventBuffer   = createEventBuffers(simulationLocalBus); // keydowns buffer
        this.simulationNetworkEventBuffer = createEventBuffers(simulationNetworkBus);       // server updates buffer
        this.frameEventBuffer             = createEventBuffers(frameLocalBus);           // takes dom input and reads once per AFr frame
        // ==========================================================

        
        // ============ Interfaces =================================
        //  keyboard, mouse, network, touch, gamepad, browser etc.
        this.simulationInterfaces  = Game.SimulationInterfaces.map(Interface => new Interface(simulationLocalBus));
        this.networkInterfaces     = Game.NetworkInterfaces.map(Interface => new Interface(simulationNetworkBus));
        this.frameInterfaces       = Game.FrameInterfaces.map(Interface => new Interface(frameLocalBus));
        this.syncInterfaces        = Game.SyncInterfaces.map(Interface => new Interface(syncLocalBus));
        // ==========================================================


        // ====  Systems  ============================================
        //  Systems act on the new information polled from buffers sent by interfaces and current world data
        //  They calculate and return the delta change for world data to apply changes to after they are updated
        this.simulationSystems = Game.SimulationSystems.map(System => new System());
        this.networkSystems    = Game.NetworkSystems.map(System => new System());
        this.frameSystems      = Game.FrameSystems.map(System => new System());
        // ==========================================================

        // Can manipulate world data should be used sparingly can only manipulate changes.events world data
        this.syncSystems = Game.SyncSystems.map(SyncEvent => new SyncEvent(syncLocalBus, this.worldData))



        this.sceneManager  = new Game.SceneManager(syncLocalBus)
        this.cameraManager = new Game.CameraManager(syncLocalBus)
        this.renderManager = new Game.RenderManager(syncLocalBus, canvas);


        // ======= Engine Services ===================================
        //  Services hold the actual rendering and graphics libray.
        //  They read from world data and actually display the data on the screen.
        //  They do not manipulate world data. These are read only
        this.services = Game.Services.map(Service => new Service(this.sceneManager.get()));
        // ===========================================================
    }


    animationLoop = (time) => {
        const frameTime = Math.min((time - this.previousTime) * 0.001, 0.25);
        this.previousTime = time;
        this.accumulator += frameTime;

        // Simulation loop called 0, 1 or mulitple times per amimation frame request
        while (this.accumulator >= FIXED_DT) {
            this.simulation(FIXED_DT, this.worldData);
            this.accumulator -= FIXED_DT;
        }
    
        // Presentation loop called every Animation Frame request. Updates every frame. This is for items like camera movement 
        this.presentation(frameTime, this.worldData);


        // animationLoop
        for (const service of this.services) {
            service.update(this.worldData);          // mutate scene only
        }
        
        this.renderManager.draw(this.sceneManager.get(), this.cameraManager.get())   
    };

    simulation(dt, worldData) {
        const changes = [];
        const timestamp = performance.now()
        
        // Keyboard Input / ai brain / Collison
        const simulationEvents = this.simulationLocalEventBuffer.poll();
        console.log(simulationEvents);
        for (const system of this.simulationSystems) {
            changes.push(...(system.update(dt, worldData, simulationEvents) ?? []));
        }

        for (const networkInterface of this.networkInterfaces) {
            networkInterface?.send(timestamp, changes.filter(change => change.component));
        }

        // Network Input / reconciliation
        const networkEvents = this.simulationNetworkEventBuffer.poll();
        for (const system of this.networkSystems) {
            changes.push(...(system.update(dt, worldData, networkEvents) ?? []));
        }

        for (const syncInterface of this.syncInterfaces) {
            syncInterface?.send(timestamp, changes.filter(change => change.syncEvent));
        }

        worldData.apply(changes)
    }



    presentation(dt, worldData) {
        const changes = [];

        const frameEvents = this.frameEventBuffer.poll();
        for (const system of this.frameSystems) {
            changes.push(...(system.update(dt, worldData, frameEvents) ?? []));
        }

        worldData.apply(changes);
    }





    start(lobbyData = null) {
        this.worldData.start(lobbyData);

        // One off event to resize the screen to cover case if screen resized while loading
        window.dispatchEvent(new Event("resize"));
        this.previousTime = null;
        this.accumulator = 0;

        this.renderManager.setAnimationLoop(this.animationLoop);
    }






    // temp stop pause resume methods
    stop()   { this.renderManager.stopAnimation(); }
    pause()  { this.renderManager.stopAnimation(); }
    resume() { 
        this.previousTime = null;
        this.renderManager.startAnimation(this.animationLoop);
    }





    destroy() {
        // this.stop();
        // this.services?.forEach(s => s.dispose?.());
        // [this.simulationInterfaces, this.networkInterfaces, this.frameInterfaces, this.syncInterfaces]
        //     .forEach(list => list?.forEach(i => i.dispose?.()));
        // [this.simulationLocalEventBuffer, this.simulationNetworkEventBuffer, this.frameEventBuffer]
        //     .forEach(b => b?.dispose());
        // this.renderManager?.dispose(); 
    }
}


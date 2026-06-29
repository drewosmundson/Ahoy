


// receives buffer snapshots from inputSource ansny via eventHandler
// it is this way so that all controllers accept the same API structure

// flatten into bitmask to be sent to the server and controller
class NetworkEventCoordinator  {
    constructor(events, networkInterface) {
        this.network = networkInterface
        this.actionBuffer = [];
        this.toggleBuffer = [];

        this.events.on('action', (actionSnapshot) => {
            this.actionBuffer.push(actionSnapshot);
        });
        this.events.on('toggle', (toggleSnapshot) => {
            this.toggleBuffer.push(toggleSnapshot);
        });
        this.events.on("camera", (cameraSnapshot) => {
            this.cameraBuffer.push(cameraSnapshot)
        });
    }

    // send to server 
    // send recived to managers authoratativly 
    update() {
        
    
    } 
}



// event handler does not know about sockets
export class EventHandler {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return {
            unsubscribe: () => {
                this.off(event, callback);
            },
            // pause: () => {} 
        };
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        
        if (!callbacks) return;
        
        const index = callbacks.indexOf(callback);
        
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
            this.listeners.delete(event);
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (!callbacks) return;
        for (const callback of callbacks) {
            callback(data);
        }
    }

    attach(subscribe) {
        return subscribe((event, data) => {
            this.emit(event, data);
        });
    }
}


export function createSender(socket, eventSchemas) {
    return function send(event, data, lobby) {
        if (!(event in eventSchemas)) {
            throw new Error(`Unknown event: ${event}`);
        }

        if (!eventSchemas[event](data)) {
            throw new Error(`Invalid payload`);
        }

        socket.emit(event, { ...data, lobby });
    };
}


export function createReceiver(socket, eventSchemas) {
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
                cleanup.forEach(fn => fn());
            }
        };
    };
}


export class NetworkInterface {
    constructor(socket, eventSchemas) {
        this.events = new EventHandler();
        this.send = createSender(socket, eventSchemas);
        this.recive  = createReceiver(socket, eventSchemas);
        this.subscription = this.events.attach(recive);
    }

    on(event, callback) {
        return this.events.on(event, callback);
    }

    sendEvent(event, data, lobby) {
        this.send(event, data, lobby);
    }

    disconnect() {
        this.subscription?.unsubscribe();
    }
}


/*
// ----------------------
// Usage
// ----------------------

const network = new NetworkInterface(socket, eventSchemas);


// Receive network events
const sub = network.on(
        "playerJoined",
      data => {
            console.log(
                "Player joined:",
                data
            );
        }
    );


// Send network events
network.sendEvent(
    "move",
    {
        x: 10,
        y: 20
    },
    "room-1"
);


// Stop listening locally
sub.unsubscribe();


// Stop receiving socket events
network.disconnect();


*/
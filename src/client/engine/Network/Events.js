
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




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




// event handler does not know about sockets
// can be used locally for ascync updates like user input 
export class EventHandler {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback)
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

    attach(subscribe) {
        return subscribe((event, data) => {
            this.emit(event, data);
        });
    }
}





export class NetworkInterface {
    constructor(socket, eventSchemas) {
        this.events = new EventHandler();
        this.send = createSender(socket, eventSchemas);
        this.receive = createReceiver(socket, eventSchemas);
        this.subscription = this.events.attach(this.receive);
    }

    on(event, callback) {
        return this.events.on(event, callback);
    }

    sendEvent(event, data) {
        this.send(event, data);
    }

    disconnect() {
        this.subscription?.unsubscribe();
    }
}


/*
---- Local Events----
const events = new EventHandler();

events.on("modalOpened", data => {
    console.log("Open modal:", data.id);
});

events.on("scoreChanged", score => {
    console.log("Score:", score);
});

events.emit("modalOpened", { id: "settings" });

events.emit("scoreChanged", 100);

class Player {
    constructor(events) {
        this.events = events;
        this.health = 100;
    }

    damage(amount) {
        this.health -= amount;
        this.events.emit("playerDamaged", { health: this.health });
    }
}

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
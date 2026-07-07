

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


export class NetworkEvents {
    constructor(socket, eventSchemas) {
        const listeners = new Map(); // event -> Set<callback>

        this.send = createSender(socket, eventSchemas);
        this.receive = createReceiver(socket, eventSchemas);

        this.disconnect = this.receive((event, data) => {
            const callbacks = listeners.get(event);
            if (!callbacks) return;
            for (const callback of [...callbacks]) {
                try {
                    callback(data);
                } catch (err) {
                    console.error(err);
                }
            }
        }).unsubscribe;

        this.on = (event, callback) => {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event).add(callback);
            return {
                unsubscribe: () => {
                    const callbacks = listeners.get(event);
                    if (!callbacks) return;
                    callbacks.delete(callback);
                    if (callbacks.size === 0) listeners.delete(event);
                },
            };
        };
    }

    sendEvent(event, data) {
        this.send(event, data);
    }
}



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
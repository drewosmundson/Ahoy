

class ConnectionSystem {
    constructor({ networkBus, engineBus, eventSchemas }) {
        this.engineBus = engineBus;
        this.subscription = networkBus.on(
            eventSchemas.serverShutdown,
            this.onServerShutdown
        );
    }

    onServerShutdown = (data) => {
        this.engineBus.emit("stop", {
            reason: "server_shutdown"
        });
    };
}
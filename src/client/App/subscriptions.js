





export function registerSubscriptions(engine, socket, eventSchemas) {
    const network = new NetworkEventBus(socket, eventSchemas);
    const subscriptions = [];

    function add(event, handler) {
        const sub = network.on(event, handler);
        subscriptions.push(sub);
        return sub;
    }

    function destroy() {
        for (const sub of subscriptions) sub.unsubscribe();
        subscriptions.length = 0;
    }

    add('engine:start', () => engine.start());
    add('engine:stop', () => engine.stop());
    add('engine:pause', () => engine.pause());
    add('engine:resume', () => engine.resume());

    return {
        add,
        destroy
    };
}
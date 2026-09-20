





export function registerSubscriptions(bus) {
    const subscriptions = [];

    function add(event, handler) {
        const sub = bus.on(event, handler);
        subscriptions.push(sub);
        return sub;
    }

    function destroy() {
        for (const sub of subscriptions) sub.unsubscribe();
        subscriptions.length = 0;
    }

    return {
        add,
        destroy
    };
}
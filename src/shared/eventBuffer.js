


class EventBuffer {
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


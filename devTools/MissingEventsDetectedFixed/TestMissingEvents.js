import { MissingEventTracker } from './MissingEventTracker.js';

const eventRegistry = [
    'playerJoined',
    'playerLeft',
    'playerMoved'
];

const mockBus = {
    events: eventRegistry,

    emit(event, ...args) {
        console.log('Emit:', event, args);
    },

    publish(event, data) {
        console.log('Publish:', event, data);
    },

    on(event, callback) {
        console.log('Listen:', event);
        return { unsubscribe() {} };
    }
};


const bus = new MissingEventTracker(mockBus, {
    events: eventRegistry,
    file: './missing-strings.json'
});

bus.emit('playerSpawnd', { id: 1 });       // typo -> recorded
bus.publish('playerJoined', { id: 1 });    // valid -> forwarded (not a typo)
bus.on('inventoryUpdatd', () => {});       // typo -> recorded
bus.on('inventpdatd', () => {});           // typo -> recorded
bus.emit('playerJoined', { id: 1 });       // valid -> forwarded

await bus.flush();
console.log('Done. See missing-strings.json');
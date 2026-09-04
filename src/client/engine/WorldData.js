


class WorldData {
    constructor() {
        this.nextEntityId = 0;
        this.components = new Map();
    }

    createEntity() {
        return this.nextEntityId++;
    }
    // Adds a new component to the storage so they can be allocated from the engine and not hardcoded in this class.
    // This is to make adding new components trivial.
    register(component) {
        const storage = new Map()
        this.components.set(component, storage);
        return storage
    }

    destroyEntity(entity) {
        for (const storage of this.components.values()) {
            storage.delete(entity);
        }
    }
    
    update(){}

}

// =================================================
// USAGE
// world.position.set(2, new Position(100, 20, 50));
// world.rotation.set(2, new Rotation());
// world.velocity.set(2, new Velocity());
// world.controller.set(2, new Controller("ai"));

// Always iterate over the smaller and more relevant component
// for (const [entity, position] of world.position) {
//     const velocity = world.velocity.get(entity);

//     if (!velocity) continue;

//     position.x += velocity.x;
//     position.y += velocity.y;
//     position.z += velocity.z;
// }


// Use Sets if a flag is needed like isAlive == true
// world.hasVelocity = new Set();
// world.hasVelocity.add(42);
// world.hasVelocity.add(57);
// world.hasVelocity.has(42); // true
// =====================================================





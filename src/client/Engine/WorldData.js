class WorldData {
    #components = new Map();
    #nextEntityId = 0;

    constructor(components = []) {
        this.register(components)
    }

    // components: array of string component names, e.g. ["Position", "Health"]
    register(components) {
        for (const name of components) {
            if (this.#components.has(name)) {
                throw new Error(`Component already registered: ${name}`);
            }
            this.#components.set(name, new Map());
        }
    }


    // lobby data shape
    // {
    //     entities: [
    //         {
    //         components: {
    //             "Position": { x: 0, y: 0 },
    //             "Health":   { hp: 100 }
    //         }
    //         },
    //         {
    //         components: {
    //             "Position": { x: 10, y: 10 }
    //         }
    //         }
    //     ]
    // }


    start(lobbyData) {
        if (!lobbyData) return;
        for (const entitySpec of lobbyData.entities) {
            const entity = this.createEntity();

            for (const [name, value] of Object.entries(entitySpec.components)) {
                this.add(entity, name, value);
            }
        }
    }


    // Map<entity, value> for the given component name
    #storage(name) {
        const storage = this.#components.get(name);
        if (!storage) {
            throw new Error(`Component not registered: ${name}`);
        }
        return storage;
    }


    // Creates the next entity always increasing. The Game is short lived enough that this should not be an issue through normal gameplay.
    // This would eventually fail and cause a crash but that would take many hours of gameplay for at most 30 minute matches.
    // TODO: Prevent this. Find a way to reuse destroyed entities and have all networked clients agree. 
    #createEntity() {
        return this.#nextEntityId++;
    }

    // Removes an entity from all associated components
    #destroyEntity(entity) {
        for (const storage of this.#components.values()) {
            storage.delete(entity);
        }
    }

    // Adds an entity to the specified component name with the given value.
    // Value must be provided by the caller - WorldData has no notion of defaults/factories.
    #addComponentToEntity(entity, name, value) {
        this.#storage(name).set(entity, value);
    }

    // removes and entity from a specific component
    #removeComponentFromEntity(entity, name) {
        return this.#storage(name).delete(entity);
    }

    apply(changes) {
        for (const change of changes) {
            switch (change.type) {
                case 'newEntity': {
                    const entity = this.#createEntity();
                    for (const { name, value } of change.components) {
                        this.add(entity, name, value);
                    }
                    break;
                }
                case 'addComponentToEntity':
                    this.#addComponentToEntity(change.entity, change.name, change.value);
                    break;

                case 'removeComponentFromEntity':
                    this.#removeComponentFromEntity(change.entity, change.name);
                    break;

                case 'updateEntityComponents': {

                    this.#updateEntityComponents(change.entity, )
                    break;
                }



                case 'destroyEntity':
                    this.#destroyEntity(change.entity);
                    break;

                default:
                    throw new Error(`Unknown change type: ${change.type}`);
            }
        }
    }


    // Returns an iterator over all entity IDs that have this component.
    getEntityKeys(name) {
        return this.#storage(name).keys();
    }

    // Returns an iterator over [entity ID, component value] pairs for this component.
    getEntityKeysAndValues(name) {
        return this.#storage(name).entries();
    }


    // Returns the value of the specified component for an entity.
    // Returns undefined if the entity does not have the component.
    // world.get(42, "Position");
    // { x: 10, y: 20 }

    // world.get(42, "Health");
    // 100

    // world.get(42, "Velocity"); (if does not have component)
    // undefined
    get(entity, name) {
        return this.#storage(name).get(entity);
    }


    // Returns whether the entity has the specified component.
    hasComponent(entity, name) {
        return this.#storage(name).has(entity);
    }
}







// basic example in a system
// class Position {
//     static factory() {
//         return { x: 10, y: 10 };
//     }
// }


// caller resolves the value, WorldData just stores it
// worldData.add(entity, "Position", Position.factory());




[
    {
        type: "createEntity",
        components: [
            { name: "Position", value: { x: 0, y: 0 } },
            { name: "Health", value: { hp: 100 } }
        ]
    },
    {
        type: "addComponent",
        entity: 42,
        name: "Velocity",
        value: { x: 1, y: 0 }
    },
    {
        type: "removeComponent",
        entity: 42,
        name: "Velocity"
    },
    {
        type: "destroyEntity",
        entity: 42
    }
]

worldData.apply(changes)

export default WorldData;
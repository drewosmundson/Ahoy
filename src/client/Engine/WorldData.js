


// to modify world data

    // case 'newEntity'

    // case 'addComponentToEntity':

    // case 'removeComponentFromEntity'

    // case 'updateEntityComponents'

    // case 'destroyEntity'



// getEntitiesWithComponent(name)
// getEntitiesWithComponentData(name)
// getComponent(entity, name)
// hasComponent(entity, name)



export class WorldData {
    #components = new Map();
    #nextEntityId = 0;

    constructor(components = {}) {
        this.register(Object.keys(components));
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

    start(entities) {
        if (!entities) return;
        for (const spec of entities) this.#spawn(spec);
    }


    apply(changes) {
        for (const change of changes) {
            switch (change.type) {
                case 'newEntity':
                    this.#spawn(change.components);
                    break;

                case 'addComponentToEntity':
                    this.#addComponentToEntity(change.entity, change.name, change.value);
                    break;

                case 'removeComponentFromEntity':
                    this.#removeComponentFromEntity(change.entity, change.name);
                    break;

                case 'updateEntityComponents':
                    this.#setComponents(change.entity, change.components);
                    break;

                case 'destroyEntity':
                    this.#destroyEntity(change.entity);
                    break;

                default:
                    throw new Error(`Unknown change type: ${change.type}`);
            }
        }
    }


    /**
     * Returns an iterator of entity IDs that contain the specified component.
     *
     * @param {string} name - Registered component name.
     * @returns {MapIterator<number>}  Iterator of entity IDs.
     */
    getEntitiesWithComponent(name) {
        return this.#storage(name).keys();
    }

    /**
     * Returns an iterator of [entity ID, component value] entries for all
     * entities containing the specified component.
     *
     * @param {string} name - Registered component name.
     * @returns {MapIterator<[number, any]>} Iterator of entity-component entries.
     */
    getEntitiesWithComponentData(name) {
        return this.#storage(name).entries();
    }

    /**
     * Returns the value of a specific component belonging to an entity.
     *
     * Returns undefined if the entity does not have the specified component.
     * Throws an error if the component is not registered.
     *
     * @param {number} entity - Entity ID.
     * @param {string} name - Registered component name.
     * @returns {*} Component value, or undefined if the entity does not have it.
     *
     * @example
     * world.get(42, 'Position'); // { x: 10, y: 20 }
     * world.get(42, 'Health');   // 100
     * world.get(42, 'Velqspoocity'); // undefined
     */
    getComponent(entity, name) {
        return this.#storage(name).get(entity);
    }

    /**
     * Checks whether an entity contains the specified component.
     *
     * Throws an error if the component is not registered.
     *
     * @param {number} entity - Entity ID.
     * @param {string} name - Registered component name.
     * @returns {boolean} True if the entity has the component; otherwise false.
     */
    hasComponent(entity, name) {
        return this.#storage(name).has(entity);
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

    // Creates an entity from a { [componentName]: value } object.
    #spawn(spec) {
        const entity = this.#createEntity();
        this.#setComponents(entity, spec);
        return entity;
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

    // Sets every component in a { [componentName]: value } object on an entity.
    #setComponents(entity, spec) {
        for (const [name, value] of Object.entries(spec)) {
            this.#addComponentToEntity(entity, name, value);
        }
    }
}



export default WorldData;







/**
 * WorldData manages entity-component storage.
 *
 * Usage:
 *
 * const world = new WorldData({
 *     Position: {},
 *     Health: {},
 *     Velocity: {},
 * });
 *
 * // Initialize entities
 * world.start([
 *     {
 *         Position: { x: 10, y: 20 },
 *         Health: 100,
 *     },
 * ]);
 *
 * // Query components
 * world.get(0, 'Position');       // { x: 10, y: 20 }
 * world.hasComponent(0, 'Health'); // true
 * 
 * // Iterate over entities with a component
 * for (const [entity, position] of world.getEntityKeysAndValues('Position')) {
 *     console.log(entity, position);
 * }
 * 
 * // Apply changes
 * world.apply([
 *     {
 *         type: 'addComponentToEntity',
 *         entity: 0,
 *         name: 'Velocity',
 *         value: { x: 1, y: 0 },
 *     },
 *     {
 *         type: 'updateEntityComponents',
 *         entity: 0,
 *         components: { Health: 90 },
 *     },
 *     {
 *         type: 'removeComponentFromEntity',
 *         entity: 0,
 *         name: 'Velocity',
 *     },
 *     {
 *         type: 'newEntity',
 *         components: { Health: 100 },
 *     },
 *     {
 *         type: 'destroyEntity',
 *         entity: 0,
 *     },
 * ]);
 *
 */
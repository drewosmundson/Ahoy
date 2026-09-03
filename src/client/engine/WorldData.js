



export class WorldData {
    constructor(initalData) {
        this.data = {
            0: {
                Team:      0,
                Group:     0,
                pitch:     0 ,
                yaw:       0,
                xLocation: 0,
                yLocation: 0,
                zLocation: 0,
                controller: "null", // user, ai, server, null
                type:       "null", // plane, boat, projectile
            },
        }
    }

    update() {


    } 
    getSnapshot() {
        return structuredClone(this.data);
    }
    
    // "give entity 0 a location compoment vector3 xyz" 
    // controller component 
    // plane component
    // boatComponent ect 
    // the boat class knows what composnnts to give to the enrtiy amd sends them here in a stream 
    addNewComponent(component ) {
    
    } 
        

    getIdsByIndex(snapshot, index) {
        return Object.entries(snapshot)
            .filter(([id, entity]) => controllers.includes(entity.controller))
            .map(([id]) => Number(id))
    }
    applyChanges() {

        
    } 
    
} 

class World {
    constructor() {
        this.positions = new Map();
        this.rotations = new Map();
        this.controllers = new Map();
    }
}



world.positions.set(42, new Position());
world.rotations.set(42, new Rotation());
world.controllers.set(42, new Controller("ai"));


class World {
    constructor() {
        this.nextEntityId = 0;

        this.position = new Map();
        this.rotation = new Map();
        this.velocity = new Map();
        this.controller = new Map();
        this.health = new Map();
    }

    createEntity() {
        return this.nextEntityId++;
    }
}
const plane = world.createEntity();

world.position.set(plane, new Position(100, 20, 50));
world.rotation.set(plane, new Rotation());
world.velocity.set(plane, new Velocity());
world.controller.set(plane, new Controller("ai"));


world.controller.set(42, new Controller("player", playerId));

for (const [entity, position] of world.position) {
    const velocity = world.velocity.get(entity);

    if (!velocity) continue;

    position.x += velocity.x;
    position.y += velocity.y;
    position.z += velocity.z;
}

world.hasVelocity = new Set();

world.hasVelocity.add(42);
world.hasVelocity.add(57);
world.hasVelocity.has(42); // true



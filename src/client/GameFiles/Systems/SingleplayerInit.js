
export class SingleplayerInit {
    constructor(components) {
        this.entities = [
            { 
                Heightmap: components.Heightmap.create({}),
                Water: components.Water.create()
            },
            {
                CameraState: components.CameraState.create({
                    targetEntity: 2,
                    followDistance: 12,
                    yaw: Math.PI,
                    pitch: 0.4,
                }),
            },
            {
                Position: components.Position.create({y: 40,}),
                Velocity: components.Velocity.create({ x: 2 }),
                Controlled: components.Controlled.create({ speed: 10 }),
            },
            {
                Position: components.Position.create({y: 40,}),
                Velocity: components.Velocity.create({ x: 4 }),
                Controlled: components.Controlled.create({ speed: 5 }),
            },
            {
                Position: components.Position.create({y: 40,}),
                Velocity: components.Velocity.create({ x: 3}),
                Controlled: components.Controlled.create({ speed: 5 }),
            },
        ]
    }


    start(lobbyData) {
        console.log("testObjectsInitialized")
        return this.entities.map(components => ({
            type: "newEntity",
            components,
        }));
    }
}
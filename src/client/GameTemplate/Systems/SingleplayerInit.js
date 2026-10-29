export class SingleplayerInit {
    constructor(components) {
        this.entities = [
            {
                Position: components.Position.create({}),
                Velocity: components.Velocity.create({ x: 2 }),
                Controlled: components.Controlled.create({ speed: 5 }),
            },
            {
                Position: components.Position.create({}),
                Velocity: components.Velocity.create({ x: 4 }),
                Controlled: components.Controlled.create({ speed: 5 }),
            },
            {
                Position: components.Position.create({}),
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
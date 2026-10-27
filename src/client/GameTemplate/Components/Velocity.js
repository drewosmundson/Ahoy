




export class Velocity {
    static create(initalSpeed) {
        return { 
            x: initalSpeed.x ?? 0,
            y: initalSpeed.y ?? 0,
            z: initalSpeed.z ?? 0,
        }
    }
}
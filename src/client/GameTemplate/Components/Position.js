



export class Position {
    static create(initalLocation) {
        return { 
            x: initalLocation.x ?? 0,
            y: initalLocation.y ?? 0,
            z: initalLocation.z ?? 0,
            pitch: initalLocation.pitch ?? 0,
            yaw: initalLocation.yaw ?? 0,
        }
    }
}
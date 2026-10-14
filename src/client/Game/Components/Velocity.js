




class Velocity {
    static createVelocityComponent(initalLocation) {
        return { 
            x: initalLocation.x ?? 0,
            y: initalLocation.y ?? 0,
            z: initalLocation.z ?? 0,
        }
    }
}
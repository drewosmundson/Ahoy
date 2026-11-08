



// Components/Velocity.js
export class Velocity {
    static create(initalSpeed) {
        return {
            x: initalSpeed.x ?? 0,
            y: initalSpeed.y ?? 0,
            z: initalSpeed.z ?? 0,
            yawRate: initalSpeed.yawRate ?? 0,   // radians per second
        }
    }
}



class Cannon {
    static create(data){ 
        return {
            // distance from the boat center point
            reletiveBoatLocation: data.reletiveBoatLocation ?? 0,
            xAngle: data.cannonRadians.x,
            yAngle: data.cannonRadians.y,
            zAngle: data.cannonRadians.z,
            size: data.cannonSize ?? 1,
            rotationSpeed: data.cannonRotationSpeed ?? 1 ,
        }
    }
} 
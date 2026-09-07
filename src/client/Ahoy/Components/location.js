


class LocationComponent {
    contructor(initalPos) {
        this.x = initialPos.x
        this.y = initialPos.y
        this.z = initialPos.z
        this.pitch = initalPos.pitch
        this.yaw = initalPos.yaw
    }
    getSnapshot(){
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            pitch: this.pitch,
            yaw: this.yaw,
        } 
    } 
        
    set(positionChanges) {
        for (const [key, value] of Object.keys(positionChanges)) {
            this[key] = value
        }
    } 
} 
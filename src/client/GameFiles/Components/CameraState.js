


export class CameraState {
    static create(initalData) {
        return {
            targetEntity: initalData.targetEntity ?? 0,
            followDistance: initalData.followDistance ?? 0,
            yaw: initalData.yaw ?? 0,
            pitch: initalData.pitch ?? 0,
        }
    }
}
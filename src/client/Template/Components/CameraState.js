


class CameraState {

    
    createCameraPositionComponent(initalData) {
        return {
            targetEntity: initalData.targetEntity ?? 0,
            distance: initalData.distance ?? 0,
            yaw: initalData.yaw ?? 0,
            pitch: initalData.pitch ?? 0,
        }
    }

}
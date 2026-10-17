export class CameraService {
    constructor(graphics) {
        this.cameraManager = graphics.cameraManager;
        this.fallbackTarget = { x: 0, y: 0, z: 0 };
    }

    update(worldData) {
        const cameraEntity = worldData.getEntityKeys("CameraPosition").next().value;
        if (cameraEntity === undefined) return;

        const { targetEntity, distance, yaw, pitch } = worldData.get(cameraEntity, "CameraPosition");
        const target = worldData.hasComponent(targetEntity, "Position")
            ? worldData.get(targetEntity, "Position")
            : this.fallbackTarget;

        this.cameraManager.setOrbit(target, distance, yaw, pitch);
    }
}
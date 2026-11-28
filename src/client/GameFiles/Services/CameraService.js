const HEIGHT = 5;
// top of the file

export class CameraService {
    constructor(graphics) { this.graphics = graphics; }

    update(worldData) {
        for (const [, cam] of worldData.getEntitiesWithComponentData("CameraState")) {
            if (!worldData.hasComponent(cam.targetEntity, "Position")) return;
            const t  = worldData.getComponent(cam.targetEntity, "Position");
            const d  = cam.followDistance;
            const cp = Math.cos(cam.pitch);

            const camera = this.graphics.camera;
            camera.position.set(
                t.x + Math.sin(cam.yaw) * cp * d,
                t.y + Math.sin(cam.pitch) * d + HEIGHT,
                t.z + Math.cos(cam.yaw) * cp * d,
            );
            camera.lookAt(t.x, t.y, t.z);
                                                      
            return;
        }
    }
}
const HEIGHT = 5;
// top of the file
let lastLog = 0;


export class CameraService {
    constructor(graphics) { this.graphics = graphics; }

    update(worldData) {
        for (const [, cam] of worldData.getEntityKeysAndValues("CameraState")) {
            if (!worldData.hasComponent(cam.targetEntity, "Position")) return;
            const t  = worldData.get(cam.targetEntity, "Position");
            const d  = cam.followDistance;
            const cp = Math.cos(cam.pitch);

            const camera = this.graphics.camera;
            camera.position.set(
                t.x + Math.sin(cam.yaw) * cp * d,
                t.y + Math.sin(cam.pitch) * d + HEIGHT,
                t.z + Math.cos(cam.yaw) * cp * d,
            );
            camera.lookAt(t.x, t.y, t.z);
            const now = performance.now();
            if (now - lastLog > 500) {
                lastLog = now;
                console.log(
                    "yaw", cam.yaw.toFixed(3),
                    "| camera x,z", camera.position.x.toFixed(1), camera.position.z.toFixed(1),
                    "| target x,z", t.x.toFixed(1), t.z.toFixed(1),
                    "| locked", document.pointerLockElement !== null
                );
            }
            return;
        }
    }
}
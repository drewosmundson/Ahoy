const LOOK_SENSITIVITY = 0.0025;
const ZOOM_SENSITIVITY = 0.01;
const MIN_DISTANCE     = 2;
const MAX_DISTANCE     = 50;
const MIN_PITCH        = -0.2;                 // slightly below horizon
const MAX_PITCH        = Math.PI / 2 - 0.05;

export class CameraSystem {
    update(dt, worldData, events) {
        let dYaw = 0, dPitch = 0, dZoom = 0;

        for (const { dx, dy } of events.mouseMoved ?? []) {
            dYaw   -= dx * LOOK_SENSITIVITY;
            dPitch += dy * LOOK_SENSITIVITY;    // no 0.5 pitch factor
        }
        for (const { delta } of events.wheel ?? []) {
            dZoom += delta * ZOOM_SENSITIVITY;  // proportional, not fixed steps
        }

        if (dYaw === 0 && dPitch === 0 && dZoom === 0) return [];

        const changes = [];
        for (const [entity, cam] of worldData.getEntityKeysAndValues("CameraState")) {
            changes.push({
                type: "updateEntityComponents",
                entity,
                components: {
                    CameraState: {
                        ...cam,
                        yaw: cam.yaw + dYaw,
                        pitch: Math.max(MIN_PITCH, Math.min(MAX_PITCH, cam.pitch + dPitch)),
                        followDistance: Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, cam.followDistance + dZoom)),
                    },
                },
            });
        }
        return changes;
    }
}
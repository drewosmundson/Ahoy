// Systems/CameraInputSystem.js

const CAMERA_ACTIONS = {
    cameraLeft:      [ 1,  0,  0],
    cameraRight:     [-1,  0,  0],
    cameraUp:        [ 0,  1,  0],
    cameraDown:      [ 0, -1,  0],
    cameraZoomIn:    [ 0,  0, -1],
    cameraZoomOut:   [ 0,  0,  1],
};

const ROTATION_SPEED = 2;
const ZOOM_SPEED = 10;

const MIN_DISTANCE = 2;
const MAX_DISTANCE = 100;

const MIN_PITCH = -Math.PI / 2 + 0.01;
const MAX_PITCH = Math.PI / 2 - 0.01;

export class CameraInputSystem {
    constructor() {
        this.held = new Set();
    }

    update(dt, worldData, events) {
        for (const { action } of events.keyDown ?? []) {
            this.held.add(action);
        }

        for (const { action } of events.keyUp ?? []) {
            this.held.delete(action);
        }

        let yawInput = 0;
        let pitchInput = 0;
        let zoomInput = 0;

        for (const action of this.held) {
            const direction = CAMERA_ACTIONS[action];

            if (!direction) continue;

            yawInput += direction[0];
            pitchInput += direction[1];
            zoomInput += direction[2];
        }

        if (
            yawInput === 0 &&
            pitchInput === 0 &&
            zoomInput === 0
        ) {
            return [];
        }

        const cameraEntity = worldData
            .getEntityKeys("CameraPosition")
            .next()
            .value;

        if (cameraEntity === undefined) {
            return [];
        }

        const camera = worldData.get(
            cameraEntity,
            "CameraPosition"
        );

        const yaw = camera.yaw + yawInput * ROTATION_SPEED * dt;

        const pitch = Math.max(
            MIN_PITCH,
            Math.min(
                MAX_PITCH,
                camera.pitch + pitchInput * ROTATION_SPEED * dt
            )
        );

        const distance = Math.max(
            MIN_DISTANCE,
            Math.min(
                MAX_DISTANCE,
                camera.distance + zoomInput * ZOOM_SPEED * dt
            )
        );

        return [
            {
                type: "updateEntityComponents",
                entity: cameraEntity,
                components: {
                    CameraPosition: {
                        ...camera,
                        yaw,
                        pitch,
                        distance,
                    },
                },
            },
        ];
    }
}
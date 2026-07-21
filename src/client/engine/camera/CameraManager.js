





// ----------------------------------------------------------------------------
// CameraManager: consumes mouse deltas directly off the EFFECTS bus, every
// frame, completely outside VehicleManager's tick. Nothing here is buffered
// and nothing here is ever sent to the server — nothing here even has a
// reference to a vehicle id. This is intentionally a dead end for the data:
// it exists purely to make local camera/aim feel instant regardless of
// network tick rate or server updates.
// ----------------------------------------------------------------------------

class CameraManager {
    constructor(effectsBus) {
        this.yaw = 0;
        this.pitch = 0;

        effectsBus.on("mouseMove", (data) => {
            const SENSITIVITY = 0.002;
            this.yaw += data.deltaYaw * SENSITIVITY;
            this.pitch += data.deltaPitch * SENSITIVITY;
            // In the real client: apply directly to the camera/reticle
            // transform right here, same frame, no buffering.
        });
    }
}

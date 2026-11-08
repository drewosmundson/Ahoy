// Systems/PlayerInputSystem.js
const TURN_RATE = 1.2;   // radians per second

export class PlayerInputSystem {
    constructor() {
        this.held = new Set();
    }

    update(dt, worldData, events) {
        let dirty = false;
        for (const { action } of events.keyDown ?? []) {
            if (!this.held.has(action)) { this.held.add(action); dirty = true; }
        }
        for (const { action } of events.keyUp ?? []) {
            if (this.held.delete(action)) dirty = true;
        }

        // Heading changes every tick while turning, so velocity must be
        // recomputed every tick while any key is held (plus once on release to stop).
        if (!dirty && this.held.size === 0) return [];

        const thrust = (this.held.has("moveForward") ? 1 : 0) - (this.held.has("moveBackward") ? 1 : 0);
        const turn   = (this.held.has("moveLeft")    ? 1 : 0) - (this.held.has("moveRight")    ? 1 : 0);

        const changes = [];
        for (const [entity, { speed }] of worldData.getEntityKeysAndValues("Controlled")) {
            const pos = worldData.get(entity, "Position");
            if (!pos) continue;

            const s = thrust * speed;
            changes.push({
                type: "updateEntityComponents",
                entity,
                components: {
                    Velocity: {
                        x: Math.sin(pos.yaw) * s,
                        y: 0,
                        z: Math.cos(pos.yaw) * s,
                        yawRate: turn * TURN_RATE,
                    },
                },
            });
        }
        return changes;
    }
}
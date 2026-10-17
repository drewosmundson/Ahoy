// Systems/PlayerInputSystem.js
const DIRS = {
    moveForward:  [ 0,  0, -1],  // -z is "away from camera" in Three.js
    moveBackward: [ 0,  0,  1],
    moveLeft:     [-1,  0,  0],
    moveRight:    [ 1,  0,  0],
    moveUp:       [ 0,  1,  0],
    moveDown:     [ 0, -1,  0],
};

export class PlayerInputSystem {
    constructor() {
        this.held = new Set();
    }

    update(dt, worldData, events) {
        if (events.keyDown?.length) console.log("keyDown:", events.keyDown);
        let dirty = false;

        for (const { action } of events.keyDown ?? []) {
            if (!this.held.has(action)) { this.held.add(action); dirty = true; }
        }
        for (const { action } of events.keyUp ?? []) {
            if (this.held.delete(action)) dirty = true;
        }

        if (!dirty) return [];

        let x = 0, y = 0, z = 0;
        for (const action of this.held) {
            const d = DIRS[action];
            if (!d) continue;
            x += d[0]; y += d[1]; z += d[2];
        }

        // normalize so diagonals aren't faster
        const len = Math.hypot(x, y, z);
        if (len > 0) { x /= len; y /= len; z /= len; }

        const changes = [];
        for (const [entity, { speed }] of worldData.getEntityKeysAndValues("Controlled")) {
            changes.push({
                type: "updateEntityComponents",
                entity,
                components: [{
                    name: "Velocity",
                    value: { x: x * speed, y: y * speed, z: z * speed },
                }],
            });
        }
        return changes;
    }
}
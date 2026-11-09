

export class MovementSystem {
    update(dt, worldData, events) {
        const changes = [];

        for (const [entity, vel] of worldData.getEntityKeysAndValues("Velocity")) {
            if (!worldData.hasComponent(entity, "Position")) continue;
            if (vel.x === 0 && vel.y === 0 && vel.z === 0 && !vel.yawRate) continue;

            const pos = worldData.get(entity, "Position");

            changes.push({
                type: "updateEntityComponents",
                entity,
                components: {
                    Position: {
                        ...pos,
                        x: pos.x + vel.x * dt,
                        y: pos.y + vel.y * dt,
                        z: pos.z + vel.z * dt,
                        yaw: pos.yaw + (vel.yawRate ?? 0) * dt,
                    },
                },
            });
        }
        return changes;
    }
}
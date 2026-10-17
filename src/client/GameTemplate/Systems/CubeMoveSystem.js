// Systems/CubeMoveSystem.js
export class CubeMoveSystem {
    update(dt, worldData, events) {
        const changes = [];

        // Every entity that has Velocity; skip those without Position
        for (const [entity, vel] of worldData.getEntityKeysAndValues("Velocity")) {
            if (!worldData.hasComponent(entity, "Position")) continue;
            if (vel.x === 0 && vel.y === 0 && vel.z === 0) continue; // nothing to do

            const pos = worldData.get(entity, "Position");

            changes.push({
                type: "updateEntityComponents",
                entity,
                components: [{
                    name: "Position",
                    // new object, so we never mutate current world data
                    value: {
                        ...pos,
                        x: pos.x + vel.x * dt,
                        y: pos.y + vel.y * dt,
                        z: pos.z + vel.z * dt,
                    },
                }],
            });
        }

        return changes;
    }
}



class boatControllerSystem {
    update(input, world, dt) {
        const changes = [];

        for (const entity of world.getEntityKeys("Boat")) { 
            if (!world.hasComponent(entity, "Velocity")) { 
                continue;
            }
            if (!world.hasComponent(entity, "Position")) { 
                continue;
            }
            if (!world.hasComponent(entity, "Rotation")) { 
                continue;
            }


            const position = world.getComponent(entity, "Position");
            const velocity = world.getComponent(entity, "Velocity");



            VelocityX = 


            changes.push({
                type: "updateEntity",
                entity,
                components: {
                    Velocity: {


                    }

                    Position: {
                        x: position.x + velocity.x * dt,
                        y: position.y + velocity.y * dt
                    }
                }
            });
        }

        return changes;
    }
}




class MovementSystem { 
    update(input, world, dt) {
        const changes = [];

        for (const entity of world.getEntityKeys("Velocity")) { 
            if (!world.hasComponent(entity, "Position")) { 
                continue;
            }

            const position = world.getComponent(entity, "Position");
            const velocity = world.getComponent(entity, "Velocity");

            changes.push({
                type: "updateEntity",
                entity,
                components: {
                    Position: {
                        x: position.x + velocity.x * dt,
                        y: position.y + velocity.y * dt
                    }
                }
            });
        }

        return changes;
    }
}
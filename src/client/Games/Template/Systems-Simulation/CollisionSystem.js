







class CollisionSystem {
  update(dt, world, localEvents) {
    const changes = [];
    for (const { a, b } of detectCollisions(world)) {
      changes.push({ type: 'component', entity: a, component: Components.Velocity, value: bounced(a) });
      changes.push({ type: 'event', name: 'collision', entityA: a, entityB: b, point: contactPoint(a, b) });
    }
    return changes;
  }


    detectCollisions() {}




}
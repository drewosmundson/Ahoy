// math
export function pushApart(a, b, penetration) {
    const dx = a.position.x - b.position.x;
    const dz = a.position.z - b.position.z;
    const dist = Math.hypot(dx, dz) || 1; // avoid divide-by-zero if exactly overlapping
    const nx = dx / dist, nz = dz / dist;
    const half = penetration >> 2;

    a.position.x += nx * half;
    a.position.z += nz * half;
    b.position.x -= nx * half;
    b.position.z -= nz * half;
}

export function clampToGround(entity, groundHeight) {
    if (entity.position.y < groundHeight) entity.position.y = groundHeight;
}




function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}



function shortestAngleDelta(from, to) {
    let delta = (to - from) % (Math.PI * 2);
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
}

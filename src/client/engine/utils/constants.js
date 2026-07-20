



export const GAME_CONFIG = {
  HEIGHTMAP,
  SOUNDS,
  COLORS,
  WATER,
  ANIMATION,
  FIXED_DT,
  HITBOX_SIZE,
}

const HEIGHTMAP = {
  mapSize: 512,
  multiplier: 90,
  addition: 0.2,
  base: {
    scale: 0.015,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    falloff: true,
    falloffStrength: 4,
    falloffScale: 0.9,
 
    barrierWidth: 0.1,
    barrierHeight: 0.6,
    barrierFalloff: 0.5,
    barrierNoise: true,
    barrierNoiseScale: 0.04
  },
  overlays: [
    {
      scale: 0.01,
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2,
      falloff: false,
      falloffStrength: 4,
      falloffScale: 0.9,
 
      mountainBarrier: true,
      barrierWidth: 0.4,
      barrierHeight: 0.9,
      barrierFalloff: 2.0,
      barrierNoise: true,
      barrierNoiseScale: 0.04
    },
    // {},
    // {},
  ]
};

const SOUNDS = {
  MUSIC_VOLUME: 0.05,
  AMBIENT_VOLUME: 0.07,
}

const COLORS = {
  ENEMY_SAIL_COLOR:  0xFF6B6B,
}

const WATER = {
  WATER_HEIGHT: 10,
  // WATER_COLOR:
}

const ANIMATION = {
  LERP_DURATION: 100,
}

const DIFFICULTY = {
  MAX_ENEMIES: 10
}

const FIXED_DT = 1 / 60;


const HITBOX_SIZE = {
    BOAT: 5,
    PLANE: 10, 
    PROJECTILE: 2,
}
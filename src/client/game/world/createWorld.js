import { createLighting } from "./Lighting.js"
import { createSkybox } from "./Skybox.js"
import { createTerrain } from "./Terrain.js"
import { createWater } from "./Water.js"


export function createWorld(scene, heightmap) {
    return {
        lighting: createLighting(scene),
        terrain: createTerrain(scene, heightmap),
        water: createWater(scene),
        skybox: createSkybox(scene),
    }
}

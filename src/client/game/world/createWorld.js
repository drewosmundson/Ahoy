import { createLighting } from "./Lighting.js"
import { createSkybox } from "./Skybox.js"
import { createTerrain } from "./Terrain.js"
import { createWater } from "./Water.js"


export function createWorld(scene, heightmap) {
    const worldComponents = {
        lighting: createLighting(scene),
        terrain: createTerrain(scene, heightmap),
        water: createWater(scene),
        skybox: createSkybox(scene),
    }

    return worldComponents;

}





class World {

    constructor(worldComponents) {


    }

}
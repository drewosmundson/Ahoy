import { createLighting } from "./Lighting.js"
import { createSkybox } from "./Skybox.js"
import { createTerrain } from "./Terrain.js"
import { createWater } from "./Water.js"


export function createSceneComponents(scene, heightmap) {
    const sceneComponents = {
        lighting: createLighting(scene),
        terrain: createTerrain(scene, heightmap),
        water: createWater(scene),
        skybox: createSkybox(scene),
    }
    return sceneComponents;
}


class SceneManager {
    constructor() {

    }
}
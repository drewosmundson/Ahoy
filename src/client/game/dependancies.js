// temp file to use debugging tool Quokka 


// will add this back to the main game class when I am getting close unless i find another reason to require dependancy injection.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';
import { createHeightmap } from "./utils/heightmap.js"
import { createRenderer } from "./utils/renderer.js"

import { createWorld } from "./world/World.js"




function loadDependancies () {
    const dependacies = {
        THREE, 
        utils = {
            createHeightmap,
            createRenderer,
        },
        world
    }
    return dependancies;
}
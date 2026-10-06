
import * as THREE from 'three';


export class SceneManager {
    constructor(bus) {
        this.threeScene = new THREE.Scene();
    }

    get() {
        return this.threeScene
    }
}

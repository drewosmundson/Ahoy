
import * as THREE from 'three';


export class SceneManager {
    constructor() {
        this.threeScene = new THREE.Scene();
    }

    get() {
        return this.threeScene
    }
}




import * as THREE from 'three';

export class SceneWrapper {
    constructor(){
        this.scene = new THREE.Scene();
    }

    add(mesh) {
        this.scene.add(mesh);
    }
}
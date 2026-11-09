import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.threeScene = new THREE.Scene();

        this.threeScene.background = new THREE.Color(0x87CEEB);

        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        this.threeScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(10, 20, 10);
        this.threeScene.add(directionalLight);
    }

    get() {
        return this.threeScene;
    }
}
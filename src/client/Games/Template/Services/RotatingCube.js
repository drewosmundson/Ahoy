import * as THREE from 'three';

export class RotatingCube {
    constructor(scene) {

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshNormalMaterial({ wireframe: true })
        );
        
        scene.add(this.mesh);
        this.clock = new THREE.Clock();
    }

    update(worldData) {
        this.mesh.rotation.y += this.clock.getDelta();
    }



    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
import * as THREE from 'three';

export class RotatingCube {
    constructor(context) {

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshNormalMaterial({ wireframe: false})
        );
        
        context.scene.add(this.mesh);
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
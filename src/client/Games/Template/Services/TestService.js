import * as THREE from 'three';

export class TestRendererService {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10);
        this.camera.position.z = 1.5;

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshNormalMaterial({ wireframe: true })
        );
        this.scene.add(this.mesh);
        this.clock = new THREE.Clock();
    }

    update(worldData) {
        this.mesh.rotation.y += this.clock.getDelta();
    }

    // Called by RendererManager on resize
    setAspect(aspect) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
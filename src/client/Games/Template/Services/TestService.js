import * as THREE from 'three';

export class TestRendererService {
    // renderer is the shared WebGLRenderer owned by RendererManager
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10);
        this.camera.position.z = 1.5;

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshNormalMaterial({ wireframe: true })
        );
        this.scene.add(this.mesh);

        this.clock = new THREE.Clock();
        this.size = new THREE.Vector2();
    }

    update(worldData) {
        // Keep aspect in sync with whatever size the manager set
        this.renderer.getSize(this.size);
        const aspect = this.size.x / this.size.y;
        if (aspect && aspect !== this.camera.aspect) {
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
        }

        this.mesh.rotation.y += this.clock.getDelta();
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        // Renderer is owned by RendererManager, so not disposed here
    }
}
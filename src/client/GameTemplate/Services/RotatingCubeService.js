import * as THREE from 'three';

export class RotatingCubeService {
    constructor(context) {
        this.context = context;
        this.meshes = new Map(); // entityId -> mesh
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshNormalMaterial();
    }

    update(worldData) {
        for (const [entity, pos] of worldData.getEntityKeysAndValues("Position")) {
            let mesh = this.meshes.get(entity);
            if (!mesh) {
                mesh = new THREE.Mesh(this.geometry, this.material);
                this.context.scene.add(mesh);
                this.meshes.set(entity, mesh);
            }
            mesh.position.set(pos.x, pos.y, pos.z);
        }

        // remove meshes for destroyed entities
        for (const [entity, mesh] of this.meshes) {
            if (!worldData.hasComponent(entity, "Position")) {
                this.context.scene.remove(mesh);
                this.meshes.delete(entity);
            }
        }
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}
import * as THREE from 'three';

export class RotatingCubeService {
    constructor(context) {
        this.context = context;
        this.meshes = new Map(); // entityId -> mesh
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshNormalMaterial();
    }

    update(worldData) {
        console.log("update")
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






export class BoatService {
    constructor(context) {
        this.context = context;
        this.meshes = new Map(); // entityId -> boat model
    }

    update(worldData) {
        // Create or update boats for entities with Position
        for (const [entity, pos] of worldData.getEntityKeysAndValues("Position")) {
            let boat = this.meshes.get(entity);

            if (!boat) {
                boat = this.createBoatModel();

                this.context.scene.add(boat);
                this.meshes.set(entity, boat);
            }

            // Update boat position
            boat.position.set(pos.x, pos.y, pos.z);
        }

        // Remove boats for destroyed entities
        for (const [entity, boat] of this.meshes) {
            if (!worldData.hasComponent(entity, "Position")) {
                this.context.scene.remove(boat);
                this.meshes.delete(entity);
            }
        }
    }

    createBoatModel() {
        const boat = new THREE.Group();

        // Hull
        const hullGeometry = new THREE.BoxGeometry(3, 1, 6);
        const hullMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513
        });

        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 0.5;
        boat.add(hull);

        // Cabin
        const cabinGeometry = new THREE.BoxGeometry(2, 1, 2);
        const cabinMaterial = new THREE.MeshStandardMaterial({
            color: 0xA0522D
        });

        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 1, -1.5);
        boat.add(cabin);

        // Cannons
        const cannonGeometry = new THREE.CylinderGeometry(
            0.4,
            0.4,
            2,
            8
        );

        const cannonMaterial = new THREE.MeshStandardMaterial({
            color: 0x000420
        });

        const cannonLeft = new THREE.Mesh(
            cannonGeometry,
            cannonMaterial
        );

        cannonLeft.position.set(1.5, 1, 0);
        cannonLeft.rotation.z = Math.PI / 2;

        boat.add(cannonLeft);

        const cannonRight = new THREE.Mesh(
            cannonGeometry,
            cannonMaterial
        );

        cannonRight.position.set(-1.5, 1, 0);
        cannonRight.rotation.z = Math.PI / 2;

        boat.add(cannonRight);

        // Mast
        const mastGeometry = new THREE.CylinderGeometry(
            0.1,
            0.1,
            4,
            8
        );

        const mastMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513
        });

        const mast = new THREE.Mesh(
            mastGeometry,
            mastMaterial
        );

        mast.position.set(0, 3, 0);
        boat.add(mast);

        // Sail
        const sailGeometry = new THREE.PlaneGeometry(2, 3);

        const sailMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });

        const sail = new THREE.Mesh(
            sailGeometry,
            sailMaterial
        );

        sail.rotation.y = Math.PI;
        sail.position.set(0, 3, 0);

        boat.add(sail);

        return boat;
    }

    dispose() {
        // Remove boats from scene
        for (const boat of this.meshes.values()) {
            this.context.scene.remove(boat);
        }

        this.meshes.clear();
    }
}
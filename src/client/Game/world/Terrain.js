export function createTerrain(scene, heightmap, GraphicsLib) {

    const terrain = new Terrain(heightmap.length, GraphicsLib );

    terrain.updateHeightmap(heightmap);

    scene.add(terrain.getMesh());

    return {
        update(newHeightmap) {
            terrain.updateHeightmap(newHeightmap);
        },

        getMesh() {
            return terrain.getMesh();
        },

        destroy() {
            scene.remove(terrain.getMesh());
            terrain.dispose();
        }
    };
}



export class Terrain {
    constructor(size, GraphicsLib) {
        this.size = size;
        this.GraphicsLib = GraphicsLib;

        this.isLowPoly = true;
        this.wireframe = false;

        const segmentCount = this.isLowPoly
            ? Math.floor(size / 4)
            : size - 1;

        this.geometry = new GraphicsLib.PlaneGeometry(
            size,
            size,
            segmentCount,
            segmentCount
        );

        this.geometry.rotateX(-Math.PI / 2);

        this.material = new GraphicsLib.MeshStandardMaterial({
            color: 0x3d8c40,
            flatShading: this.isLowPoly,
            wireframe: this.wireframe,
        });

        this.mesh = new GraphicsLib.Mesh(
            this.geometry,
            this.material
        );
    }

    updateHeightmap(heightmap) {
        const vertices =
            this.geometry.attributes.position.array;

        const size = this.size;

        const segmentCount = this.isLowPoly
            ? Math.floor(size / 4)
            : size - 1;

        for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
            const x = this.isLowPoly
                ? Math.floor((j % (segmentCount + 1)) * (size / segmentCount))
                : Math.floor(j % size);

            const y = this.isLowPoly
                ? Math.floor(Math.floor(j / (segmentCount + 1)) *(size / segmentCount))
                : Math.floor(j / size);

            if (x < size && y < size) {
                vertices[i + 1] = heightmap[y][x];
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();
    }

    getMesh() {
        return this.mesh;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}












export class TerrainService {
    constructor(scene, heightmap) {
        this.scene = scene;
        this.lowPoly = true;

        if(!heightmap) {
            this.heightmap = []
        }
        else {
            this.heightmap = heightmap
        }

        this.mapSize = this.heightmap.length

        this.mesh = this.createTerrainMesh();
        this.scene.add(this.mesh);
        this.underMesh = this.createUnderMesh();
        this.scene.add(this.underMesh);
    }
    
    update(worldData) {
        
        //datashape heightmapChanges {x, y, change}

        const x = worldData.heightmapChanges.x 
        const y = worldData.heightmapChanges.y
        const change = worldData.heightmapChanges
        worldData.heightmap[x][y] += change
        
    }

    createUnderMesh() {
        const size = this.mapSize ;
        const segmentCount = this.lowPoly ? Math.floor(size / 4) : size - 1;
        const geometry = new THREE.PlaneGeometry(size, size, segmentCount, segmentCount);
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
        color: 0x3d8c40,
        });

        return new THREE.Mesh(geometry, material);
    }

    createTerrainMesh() {
        const size = this.mapSize;
        const segmentCount = this.lowPoly ? Math.floor(size / 4) : size - 1;
        const geometry = new THREE.PlaneGeometry(this.mapSize, this.mapSize, segmentCount, segmentCount);
        geometry.rotateX(-Math.PI / 2);

        const vertices = geometry.attributes.position.array;

        for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
        const x = this.lowPoly
            ? Math.floor((j % (segmentCount + 1)) * (size / segmentCount))
            : Math.floor(j % size);
        const y = this.lowPoly
            ? Math.floor(Math.floor(j / (segmentCount + 1)) * (size / segmentCount))
            : Math.floor(j / size);
        
            if (x < size && y < size) {
            vertices[i + 1] = this.heightmap[y][x];
            }
        }
        
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
        color: 0x3d8c40,
        flatShading: this.lowPoly,
        wireframe: false,

        });

        return new THREE.Mesh(geometry, material);
    }

    toggleTerrainMode() {
        this.lowPoly = !this.lowPoly;
        this.scene.remove(this.mesh);
        this.mesh = this.createTerrainMesh();
        this.scene.add(this.mesh);
        return this.lowPoly ? 'Low Poly' : 'Regular';
    }

    getHeightAt(x, z) {
        const normalizedX = (x + this.mapSize / 2) / this.mapSize;
        const normalizedZ = (z + this.mapSize / 2) / this.mapSize;

        const heightmapX = Math.floor(normalizedX * (this.mapSize - 1));
        const heightmapZ = Math.floor(normalizedZ * (this.mapSize - 1));

        if (
        heightmapX >= 0 && heightmapX < this.mapSize &&
        heightmapZ >= 0 && heightmapZ < this.mapSize
        ) {
        const height = this.heightmap[heightmapZ][heightmapX];
        return height
        }

        return 0;
    }
}


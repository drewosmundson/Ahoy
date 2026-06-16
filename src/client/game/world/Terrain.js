


export function createTerrain(scene, heightmap, material, plane) {
    const size = heightmap.length
    const terrain = new Terrain(material, size)
    scene.add(terrain.generateMesh(size))
    scene.add(terrain.generateMesh(size, heightmap))
    return terrain
  }


class Terrain {
  constructor(Material, Plane) 
    this.plane = Plane; 
    this.material = Material;
    isLowPoly = true; 
  }
  
  generateMesh(size, heightmap = null) 
    if ( heightmap == null ) { 
      
    } 
    
    const segmentCount = this.lowPoly ? Math.floor(size / 4) : size - 1 ;
    const geometry = new Plane(size, size, segmentCount, segmentCount);
    geometry.rotateX(-Math.PI / 2);
    const material = new StandardMaterial()
     
}








// recveives terrain data from the server and displays this terrain to the user with 3js

// Terrain.js - Handles terrain generation and rendering
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';

// NoiseGenerator.js - Utility for generating noise-based heightmaps with mountain barrier
export function createTerrain(){
    return;
}



class Terrain {
  constructor(scene, THREE, heightmap, heightmapOverlay) {
    this.scene = scene;
    this.mapSize = 512; // 512
    this.lowPoly = true;
    this.terrainSize = 512;
    this.heightMultiply = 90;
 
    this.mesh = this.createTerrainMesh();
    this.scene.add(this.mesh);
    this.underMesh = this.createUnderMesh();
    this.scene.add(this.underMesh);
  }


  createUnderMesh() {
    const size = this.mapSize ;
    const segmentCount = this.lowPoly ? Math.floor(size / 4) : size - 1;
    const geometry = new THREE.PlaneGeometry(this.terrainSize, this.terrainSize, segmentCount, segmentCount);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: 0x3d8c40,
    });

    return new THREE.Mesh(geometry, material);
  }

  createTerrainMesh() {
    const size = this.mapSize;
    const segmentCount = this.lowPoly ? Math.floor(size / 4) : size - 1;
    const geometry = new THREE.PlaneGeometry(this.terrainSize, this.terrainSize, segmentCount, segmentCount);
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
        const baseHeight = this.heightmap[y][x];
        const overlay = this.heightmapOverlay[y][x];
        const finalHeight = baseHeight * overlay  * this.heightMultiply + 0.2;
        vertices[i + 1] = finalHeight ;
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
    const normalizedX = (x + this.terrainSize / 2) / this.terrainSize;
    const normalizedZ = (z + this.terrainSize / 2) / this.terrainSize;

    const heightmapX = Math.floor(normalizedX * (this.mapSize - 1));
    const heightmapZ = Math.floor(normalizedZ * (this.mapSize - 1));

    if (
      heightmapX >= 0 && heightmapX < this.mapSize &&
      heightmapZ >= 0 && heightmapZ < this.mapSize
    ) {
      const height = this.heightmap[heightmapZ][heightmapX];
      const overlay = this.heightmapOverlay[heightmapZ][heightmapX];
      return height * overlay * this.heightMultiply;
    }

    return 0;
  }
}

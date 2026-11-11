
import { Heightmap }  from "./Heightmap.js"

export class Water {
    constructor() {
        this.waterLevel = 10
        this.waveVarience = 0.1
    } 
    
    static create() {
        if(!Heightmap.create) {
            console.log("[water component] create() -heightmap not available")
        } 
        let waterHeightmap = this.getWaterHeightmap()
        
        return {
            heightmap: waterHeightmap,
        } 
    } 
    static getWaterHeightmap() {
        const varience = this.waveVarience
        const height = this.waterlevel
        return Heightmap.create({height, varience})
    } 
} 
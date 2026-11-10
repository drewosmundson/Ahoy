
import heightmap from "./heightmap.js"
import CONSTANTS from "../utils/constants.js"

class Water {
    constructor() {
        this.waterLevel = 10
        this.waveVarience = 0.1
    } 
    
    static create() {
        if(!heightmap.create) {
            console.log("[water component] create() -heightmap not available")
        } 
        let waterHeightmap = getWaterHeightmap()
        
        return {
            heightmap: waterHeightmap,
        } 
    } 
    static getWaterHeightmap() {
        const varience = this.waveVarience
        const height = this.waterlevel
        return heightmap.create({height, varience}) ?? new Array(CONSTANTS.MAP_SIZE ).fill(0)
    } 
} 
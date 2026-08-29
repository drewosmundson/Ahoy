


export class WorldData {
    constructor(initalData) {
        this.data = {
            0: {
                Team:      0,
                Group:     0,
                pitch:     0 ,
                yaw:       0,
                xLocation: 0,
                yLocation: 0,
                zLocation: 0,
                controller: "null", // user, ai, server, null
                type:       "null", // plane, boat, projectile
            },
        }
    }

    update() {


    } 
    getSnapshot() {
        return structuredClone(this.data);
    }
    
    // "give entity 0 a location compoment vector3 xyz" 
    // controller component 
    // plane component
    // boatComponent ect 
    // the boat class knows what composnnts to give to the enrtiy amd sends them here in a stream 
    addNewComponent(component ) {
    
    } 
        

    getIdsByIndex(snapshot, index) {
        return Object.entries(snapshot)
            .filter(([id, entity]) => controllers.includes(entity.controller))
            .map(([id]) => Number(id))
    }
    applyChanges() {

        
    } 
    
} 
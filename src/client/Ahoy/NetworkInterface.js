
import CONSTANTS from "./Utils/Constants.js"


class NetworkInterface {
    constructor(localBus, networkBus) {
        this.subscriptions = [
            


        ]
        this.localBus = localBus;
        this.networkBus = networkBus;
    }
    // From Server




    // to server
    gameStart(){
        this.networkBus.emit(CONSTANTS.OKSTART, () => {


        });
    }









}





// const serverToClientPacketDecoding = {
//     ENTITY_ID: { 
//         offset: 0,
//         bits: 8,
//     },
//     CONTROLGROUP_ID: {
//         offset: 8,
//         bits: 8,
//     },
//     TEAM_ID: { 
//        offset: 16,
//        bits: 8,
//     },
//     VEHICLES: { 
//         offset: 24,
//         bits: 8,
//         values: [
//             "BOAT",
//             "PLANE",
//             "PROJECTILE",
//         ],
//     },
    
//     X_LOCATION: {
//        offset: 32,
//        bits: 32,
//     },
//     Y_LOCATION: {
//        offset: 64,
//        bits: 32,
//     },
//     Z_LOCATION: {
//        offset: 96,
//        bits: 32,
//     },
//     PITCH: {
//        offset: 128,
//        bits: 16,
//     },
//     YAW: {
//        offset: 132,
//        bits: 16,
//     },
//     HOW_CONTROLLED: {
//         offset: 148,
//         bits: 8,
//         values: [
            
//         ]
// }

// // dataPacketExample = [
// //     teamId playerId boatype, startinglocx y z  rotation lastaction
//     // ,10000000 1010 1001 11110000 10100000 10101010 1010101011
//     // ,10010010 10101010 10000101 101001000 1001010 1010100 00001010
// // ]

// function readField(value, offset, bits) {
//     const mask = (1n << BigInt(bits)) - 1n;
//     return Number((value >> BigInt(offset)) & mask);
// }







//     decodeData(dataPacket) {

    
// }


//     // return list
//     getIdsFromTypeGroup(type) { 
//         const offset = this.dataSchema.type.offest
//         const bits = this.dataSchema.type.bits
//         const entities = []
//         this.data.foreach((entity) => {
//             readFeild(entity, offset, bits) 
//         }
//         return 
//     } 

//     getDataFromIds(data, entityId) {
    
//         data.foreach((entity) => {
//             readFeild(entity, offset, bits) 
            
//         }
//         return 
//     }
// }

// // reading / updating from world data 
// // TURING THIS INTO FILTER CLASS IN AN ECS will be merged with world data
// class vehiclCoordinator{
//     constructor() {
    
        
        
//     }
    
    
//     getAiControlledVehicles(data) {
        
        
//     } 
    
//     getUserControlledVehicles(data) {
        
//     } 
    
//     getNetworkControlledVehicles(data) {
        
        
//     } 
// } 
    


// function reconcile(snapshot, dt) {
//         const t = clamp(this.reconcileLerpRate * dt, 0, 1);
 
//         this.location = {
//             x: lerp(this.location.x, snapshot.location.x, t),
//             y: lerp(this.location.y, snapshot.location.y, t),
//         };
 
//         this.rotation = lerpAngle(this.rotation, snapshot.rotation, t);
//         this.velocity = { ...snapshot.velocity };
//     }


class audioService {
    constructor(graphicsContext) {
        
        


camera.add(listener);
    }
    
}


export class AudioManager {

    constructor() {
        this.musicPath = resources.index.musicPath

        this.listeners = new Set()
        
    } 

    addListener(camera) {
        const listener = new THREE.AudioListener();
        camera.add(listener)
        
    } 
    
    playSoundForAllListeners() {
        const sound = new THREE.Audio(listener);
        
        const audioLoader = new THREE.AudioLoader();
        
        audioLoader.load(this.musicPath, function(buffer) {
          sound.setBuffer(buffer);
          sound.setLoop(true);
          sound.setVolume(0.5);
        
        
        
        return sound
        
        // sound.play
    }
    
}




// 1. Create a listener and attach it to the camera


// 2. Create a global audio source


// 3. Load a sound and set it as the Audio object's buffer

  // Note: Must be triggered after a user interaction (click/keydown)
  // sound.play(); 
});

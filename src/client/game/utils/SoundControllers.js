








class SoundController{
  
  #defaults = { 
    
    
    } 

  constructor(camera) {
    this.listener = new THREE.AudioListener();
    this.currentCamera = null;
    this.attachCamera(camera)
    
    this.masterVolume = this.#defaults.masterVolume;
    this.musicVolume = this.#defaults.musicVolume;
    this.sfxVolume = this.#defaults.sfxVolume;

  }
  attachCamera(camera){
   if(this.currentCamera){
      this.listener.remove(this.camera);
    }
    this.listener.add(camera);
  }
    
  
  resetToDefaults() {
    this.masterVolume = this.#defaults.masterVolume;
    this.musicVolume = this.#defaults.musicVolume;
    this.sfxVolume = this.#defaults.sfxVolume;
  }

  
  loadSoundEffect(){
    this.soundManager = new SoundManager(this.camera);
    this.soundManager.loadSoundEffect('mainTheme', 'resources/sounds/Lost_Sheep_Compressed.mp3');
    this.soundManager.loadSoundEffect('ambient', 'resources/sounds/waves.mp3');
    this.playBackgroundMusic();
  }
}
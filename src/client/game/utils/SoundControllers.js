








class SoundController{

  constructor(camera) {
    this.camera = camera
    this.listener = new THREE.AudioListener();

    this.masterVolume = 1.0;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;

  }
  loadSoundEffect(){

    this.soundManager = new SoundManager(this.camera);
    this.soundManager.loadSoundEffect('mainTheme', 'resources/sounds/Lost_Sheep_Compressed.mp3');
    this.soundManager.loadSoundEffect('ambient', 'resources/sounds/waves.mp3');
    this.playBackgroundMusic();

  }
}
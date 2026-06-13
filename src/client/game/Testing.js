 ClientButtonInput {
  constructor() {
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event.code);
    });
    document.addEventListener('keyup', (event) => {
      this.handleKeyUp(event.code);
    });
    document.addEventListener('mousedown', (event) => {
      this.handleKeyDown(event.button);
    });
    document.addEventListener('mouseup', (event) => {
      this.handleKeyUp(event.button);
    })
    document.addEventListener('mousemove', (event) => {
      this.handleMouseMove(event);
    });


    this.keyBindings = {
      0:          'fireProjectileLeft',
      2:          'fireProjectileRight',

      KeyW:       'moveForward',
      ArrowUp:    'moveForward',

      KeyS:       'moveBackward',
      ArrowDown:  'moveBackward',

      KeyA:       'moveLeft',
      ArrowLeft:  'moveLeft',

      KeyD:       'moveRight',
      ArrowRight: 'moveRight',

      KeyM:       'showMap',

      KeyC: 'toggleCamera',
      KeyP: 'toggleTerrain',
      KeyF: 'toggleFog',

      Escape: 'exitPointerLock',
    };

    this.actions = {
      moveForward:  false,
      moveBackward: false,
      moveLeft:     false,
      moveRight:    false,
      fireProjectileLeft:  false,
      fireProjectileRight: false,
    }

    this.toggles = {
      pointerLocked: false,
      toggleCamera:  false,
      toggleTerrain: false,
      toggleFog:     false,
    }

    this.mouseMovment = {
      lastYaw: 0,
      lastPitch: 0,
      deltaPitch: 0,
      deltaYaw:   0,
    }
  }

  handleKeyDown(eventType) {
    const buttonPressed = this.keyBindings[eventType];
    if (!buttonPressed) return;
    if (buttonPressed in this.actions) {
      this.actions[buttonPressed] = true;
    }
    if (buttonPressed in this.toggles) {
      this.toggles[buttonPressed] = !this.toggles[button];
    }
  }

  handleKeyUp(eventType) {
    const buttonReleased = this.keyBindings[eventType];
    if (!buttonReleased) return;
    if (buttonReleased in this.actions) {
      this.actions[buttonReleased] = false;
    }
  }

  handleMouseMove(event) {
    if (!this.toggles.isPointerLocked) return;
    this.deltaPitch = event.movementX - this.mouseMovment.lastPitch;
    this.deltaYaw = event.movementY - this.mouseMovment.lastYaw;
    this.lastPitch = event.movementX;
    this.lastYaw = event.movementY;
  }

  getState(category, key) {
    if (!this[category]) return;
    return this[category][key];
  }
}
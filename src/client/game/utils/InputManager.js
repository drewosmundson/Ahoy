
export function createInputManager(canvas, emitter, OrbitControls, INPUT_CONFIG) {
  const inputManager = new InputManager(OrbitControls);
}


class InputManager {
  constructor(OrbitControls){

    


  }


  keyboardInput(){
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });

    window.addEventListener('keyup', (event) => {
      this.handleKeyUp(event);
    });
  }

  mouseButtonInput() {
    window.addEventListener('mousedown', (event) => {
      this.handleMouseDown(event);
    });
    
    // Prevent context menu on right click
    window.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  mousePointerInput(){



  }

  touchControls(){
    console.log("Touch controls not yet implemented");
  }



  update(){



  }




}






class mousePointerInput 
initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.5;
    this.controls.update();

  }
  
  initMouseLook() {
    this.canvas.addEventListener('click', () => {
      this.requestPointerLock();
      
    });
    
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
      if (this.isPointerLocked) {
        // Calculate current camera orientation when entering pointer lock
        this.preserveCameraOrientation();
        console.log('Pointer locked - mouse look enabled');
      } else {
        console.log('Pointer unlocked - mouse look disabled');
      }
    });
    
    document.addEventListener('mousemove', (event) => {
      if (this.isPointerLocked) {
        this.handleMouseMove(event);
      }
    });
    
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && this.isPointerLocked) {
        document.exitPointerLock();
      }
    });
  }


export class InputController {
    constructor(game) {
      this.game = game;
      // Boat movement state
      this.boatMovement = {
        forward: false,
        backward: false,
        left: false,
        right: false
      };
      // Initialize keyboard controls
      this.initKeyboardControls();
      // Initialize mouse controls
      this.initMouseControls();
    }
    
    initKeyboardControls() {
      // Add keydown event listener
      window.addEventListener('keydown', (event) => {
        this.handleKeyDown(event);
      });
      
      // Add keyup event listener
      window.addEventListener('keyup', (event) => {
        this.handleKeyUp(event);
      });
    }
    
    initMouseControls() {
      // Add mouse click event listener
      window.addEventListener('mousedown', (event) => {
        this.handleMouseDown(event);
      });
      
      // Prevent context menu on right click (optional)
      window.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });
    }
    handleMouseDown(event) {
      this.game.playerFiredProjectile(event.button);
    }
    
    handleKeyDown(event) {
      switch(event.key) {
        // Movement controls
        case 'w':
        case 'W':
        case 'ArrowUp':
          this.boatMovement.forward = true;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          this.boatMovement.backward = true;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          this.boatMovement.left = true;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          this.boatMovement.right = true;
          break;
          
        // Camera mode toggle
        case 'c':
          this.game.toggleCameraMode();
          break;
          
        // Terrain mode toggle
        case 'p':
          this.game.toggleTerrainMode();
          break;

        case 'f':
          this.game.toggleFog();
          break;
          
        // Removed Q and E key controls - now using mouse
        // case 'e':
        //   this.game.fireProjectile(this.right);
        //   break;
        // case 'q':
        //   this.game.fireProjectile(this.left);
        //   break;
      }
    }
    
    handleKeyUp(event) {
      switch(event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          this.boatMovement.forward = false;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          this.boatMovement.backward = false;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          this.boatMovement.left = false;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          this.boatMovement.right = false;
          break;
      }
    }
    
    // Add touch controls for mobile devices
    addTouchControls() {
      // This can be implemented later if needed
      console.log("Touch controls not yet implemented");
    }
    
    // Method to reset all movement states
    resetMovement() {
      this.boatMovement.forward = false;
      this.boatMovement.backward = false;
      this.boatMovement.left = false;
      this.boatMovement.right = false;
    }
  }
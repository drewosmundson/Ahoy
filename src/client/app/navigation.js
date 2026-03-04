
import CSS_HIDDEN_CLASS from "../../shared/constants.js"
import { ALL_SCREENS } from "../../shared/constants.js";
  
  export function initNavigation() {


  }

  export function navigateToScreen(screen) {
    hideAllScreens(ALL_SCREENS);
    showScreen(screen);
    updateTitle(screen)
    updateNavigationHistory(screen)
  }


  function showScreen(screen) {
    screen.classList.remove(CSS_HIDDEN_CLASS);
  }

  function hideScreen(screen) {
    screen.classList.add(CSS_HIDDEN_CLASS);
  }

  function hideAllScreens(allScreens){
    Object.values(allScreens).forEach(screen), () => {
      if (screen) hideScreen(screen);
    }
  }

  function updateNavigationHistory(screen) {
    history.pushState();
  }

  function updateTitle(screen){
    
  }



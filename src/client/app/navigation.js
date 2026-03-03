

  const HIDDEN_CLASS = "hidden";
  
  export function initNavigation() {


  }

  export function navigateToScreen(allScreens, screen) {
    hideAllScreens(allScreens);
    showScreen(screen);
    updateTitle(screen)
    updateNavigationHistory(screen)
  }


  function showScreen(screen) {
    screen.classList.remove(HIDDEN_CLASS);
  }

  function hideScreen(screen) {
    screen.classList.add(HIDDEN_CLASS);
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



import { CSS_HIDDEN } from "./constants.js";


export function navigation(dom) { 
  
  return { initalize, toScreen };
  
  // Allows for the forward and back buttons in the browser
// always puts the user back to the home screen if they leave the site and come back they can rejoin their lobby from there if they were in one
  function initalize() { 
    window.addEventListener("popstate", (event) => {
      const screenId = event.state?.screen;
      const screen = screenId ? document.getElementById(screenId) : dom.screens.mainMenu;
      if (screen) navigateToScreen(screen);
      });
    navigation.toScreen(dom.screens.mainMenu);
  }

  function toScreen(screen) {
    hideAllScreens(dom);
    showScreen(screen);
    updateTitle(screen)
    updateNavigationHistory(screen);
  }
}
function hideAllScreens(dom){
  Object.values(dom.screens).forEach((screen) => {
    if (screen) { 
      screen.classList.add(CSS_HIDDEN);
    }
    if (screen === dom.screens.game) {
      dom.canvas.game.style.display = 'none';
    }
  });
}

function showScreen(screen) {
  screen.classList.remove(CSS_HIDDEN);
  if ( screen === dom.screens.game ) {
    dom.canvas.game.style.display = 'block'
  }
}

function updateNavigationHistory(screen) {
  history.pushState({ screen: screen.id }, screen.title, `#${screen.id}`);
}

function updateTitle(screen){
  document.title = screen.title;
}



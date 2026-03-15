
import { CSS_HIDDEN_CLASS } from "../../shared/constants.js";
import { dom } from "./dom.js";

export function initNavigation() { 

  // Allows for the forward and back buttons in the browser
  window.addEventListener("popstate", (event) => {
    const screenId = event.state?.screen;
    const screen = screenId ? document.getElementById(screenId) : dom.screens.mainMenu;
    if (screen) navigateToScreen(screen);
  });

  // This line always puts the user back to the home screen if they leave the site and come back they can rejoin their lobby from there if they were in one
  navigateToScreen(dom.screens.mainMenu);
}

export function navigateToScreen(screen) {
  hideAllScreens(dom.screens);
  showScreen(screen);
  updateTitle(screen)
  updateNavigationHistory(screen);
}


function hideAllScreens(allScreens){
  Object.values(allScreens).forEach((screen) => {
    if (screen) { 
      screen.classList.add(CSS_HIDDEN_CLASS);
    }
  });
}

function showScreen(screen) {
  screen.classList.remove(CSS_HIDDEN_CLASS);
}

function updateNavigationHistory(screen) {
  history.pushState({ screen: screen.id }, screen.title, `#${screen.id}`);
}

function updateTitle(screen){
  document.title = screen.title;
}



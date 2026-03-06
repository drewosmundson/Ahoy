





// grab DOM
// wire modules together
// start navigation
// start socket layer


import { Game } from './Game.js';
import { Home } from './Home.js';


document.addEventListener('DOMContentLoaded', () => {
  // ---- Dom Elements ----
  const socket = io();

  initNavigation();

});



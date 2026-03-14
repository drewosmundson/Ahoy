





// grab DOM
// wire modules together
// start navigation
// start socket layer
// ( inits app )
           

// DOM and user interactions is not aware of sockets

// single player 
// create friend room
// join friend room
// join mmo room



// Eventually as this list becomes large or I am looking to break up this file
// one idea I have is to create a features folder in this layer that will contain
// singleplayer.js mmo.js multiplayer.js so ownership of those features become more 
// independant. This would be a page/feature module archetecture.


document.addEventListener('DOMContentLoaded', () => {


  // ---- Initialization ----
  const socket = io();


  initDom();
  initNavigation();


  // ---- Features & Main Menu Options ----
  initSingleplayer()
});



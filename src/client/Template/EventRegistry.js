// EventRegistery.js
export const EVENTS = Object.freeze({
    KEY_DOWN: "keyDown",
    KEY_UP:   "keyUp",
    
    MOUSE_MOVE:     "mouseMoved",

    WINDOW_RESIZED: "windowResized",
});


export const events = Object.values(EVENTS);

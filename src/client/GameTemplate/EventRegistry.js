// EventRegistery.js
export const EVENTS = Object.freeze({
    KEY_DOWN: "keyDown",
    KEY_UP:   "keyUp",
    
    MOUSE_MOVE:     "mouseMoved",

    MOUSE_WHEEL:  "wheel",
    CAMERA_DRAG_START: "cameraDragStart", 
    CAMERA_DRAG_END: "cameraDragEnd",

});


export const events = Object.values(EVENTS);

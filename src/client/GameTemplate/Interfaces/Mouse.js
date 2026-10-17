import { EVENTS } from "./EventRegistery.js";

export class MouseFrameInterface {
    constructor(eventBus) {
        this.onDown = (e) => { if (e.button === 2) eventBus.emit(EVENTS.CAMERA_DRAG_START, {}); };
        this.onUp   = (e) => { if (e.button === 2) eventBus.emit(EVENTS.CAMERA_DRAG_END, {}); };
        this.onMove = (e) => eventBus.emit(EVENTS.MOUSE_MOVE, { dx: e.movementX, dy: e.movementY });
        this.onWheel = (e) => {
            e.preventDefault();
            eventBus.emit(EVENTS.MOUSE_WHEEL, { deltaY: e.deltaY });
        };
        this.onContext = (e) => e.preventDefault();

        document.addEventListener("mousedown", this.onDown);
        document.addEventListener("mouseup", this.onUp);
        document.addEventListener("mousemove", this.onMove);
        document.addEventListener("wheel", this.onWheel, { passive: false });
        document.addEventListener("contextmenu", this.onContext);
    }

    dispose() {
        document.removeEventListener("mousedown", this.onDown);
        document.removeEventListener("mouseup", this.onUp);
        document.removeEventListener("mousemove", this.onMove);
        document.removeEventListener("wheel", this.onWheel);
        document.removeEventListener("contextmenu", this.onContext);
    }
}
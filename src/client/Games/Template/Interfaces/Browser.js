
import { EVENTS } from "../EventRegistry.js"

export class BrowserInterface {
    constructor(bus) {
        this.bus = bus
        window.addEventListener("resize", () => this.resize())
    }
    resize() {
        console.log("resized")
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let width = windowWidth;
        let height = (width * 9) / 16;

        if (height > windowHeight) {
        height = windowHeight;
        width = (height * 16) / 9;
        }

        this.bus.emit(EVENTS.WINDOW_RESIZED, { width, height })
    }
}
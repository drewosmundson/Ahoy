



class BrowserInterface {
    constructor(bus) {
        this.bus = bus
        window.addEventListener("resize", resize)
    }
    resize() {
        this.bus.emit(resize)
    }
}
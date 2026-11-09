export class MouseInterface {
    constructor(eventBus, canvas) {
        const isLocked = () => document.pointerLockElement === canvas;

        canvas.addEventListener("click", () => {
            if (!isLocked()) canvas.requestPointerLock();
        });

        document.addEventListener("pointermove", (e) => {
            if (!isLocked()) return;
            console.log("EMIT", e.movementX, e.movementY);
            eventBus.emit("mouseMoved", { dx: e.movementX, dy: e.movementY });
        });

        document.addEventListener("mousemove", e => console.log("move, buttons =", e.buttons));

        canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            eventBus.emit("wheel", { delta: e.deltaY });
        }, { passive: false });
    }
}

export class KeypressInterface {
    constructor(eventBus) {
        this.keyBindings = {
            KeyW: "moveForward",
            KeyS: "moveBackward",
            KeyA: "moveLeft",
            KeyD: "moveRight",
            Space: "moveUp",
            ShiftLeft: "moveDown",
        };

        const downActionHandler = (event) => {
            const data = this.handleActionEvent(event);
            if (data) eventBus.emit("keyDown", data);
        };
        ["keydown", "mousedown"].forEach(type => {
            document.addEventListener(type, downActionHandler);
        });

        const upActionHandler = (event) => {
            const data = this.handleActionEvent(event);
            if (data) eventBus.emit("keyUp", data);
        };
        ["keyup", "mouseup"].forEach(type => {
            document.addEventListener(type, upActionHandler);
        });

        document.addEventListener("mousemove", (event) => {
            // One object: EventBuffer only stores the first argument
            eventBus.emit("mouseMoved", { dx: event.movementX, dy: event.movementY });
        });
    }

    handleActionEvent(event) {
        if (event.repeat) return null;
        // keyboard events have .code, mouse events have .button
        const action = this.keyBindings[event.code] ?? this.keyBindings[event.button];
        if (!action) return null;
        // New object per event: the buffer stores references
        return { timestamp: event.timeStamp, action };
    }
}
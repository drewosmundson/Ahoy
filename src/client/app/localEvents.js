




// Event System does not know about sockets
// is used locally for async updates like user from user input the manager that receives this can 
// choose if it wants to process the input then and there or buffer the input and update on tick/frame
export class LocalEvents {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return {
            unsubscribe: () => {
                this.off(event, callback);
            },
        };
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);

        if (!callbacks) return;

        callbacks.delete(callback);

        if (callbacks.size === 0) {
            this.listeners.delete(event);
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (!callbacks) return;
        for (const callback of [...callbacks]) {
            try {
                callback(data);
            } catch (err) {
                console.error(err);
            }
        }
    }

    attach(subscribe) {
        return subscribe((event, data) => {
            this.emit(event, data);
        });
    }
}


/*
---- Local Events----
const events = new EventHandler();

events.on("modalOpened", data => {
    console.log("Open modal:", data.id);
});

events.on("scoreChanged", score => {
    console.log("Score:", score);
});

events.emit("modalOpened", { id: "settings" });

events.emit("scoreChanged", 100);

class Player {
    constructor(events) {
        this.events = events;
        this.health = 100;
    }

    damage(amount) {
        this.health -= amount;
        this.events.emit("playerDamaged", { health: this.health });
    }
}


// ---- Two separate buses, same class ----
export const fxEvents = new EventSystem();   // presentation lane — fire and forget
export const simEvents = new EventSystem();  // intent lane — feeds the pull pipeline

// Naming convention as a second guardrail, even though they're separate objects:
// fxEvents:  "cameraShake", "footstepSound", "modalOpened"
// simEvents: "playerInput", "abilityRequested", "chatMessageSent"

class Player {
    constructor() {
        this.health = 100;
    }

    // Authoritative mutation happens directly, NOT via emit.
    // emit is purely "tell the outside world this happened."
    applyDamage(amount) {
        this.health -= amount;
        fxEvents.emit("cameraShake", { intensity: amount / 100 });
        fxEvents.emit("damageNumberPopup", { amount, entityId: this.id });
    }
}

// Camera listens, reacts, never writes back to anything authoritative
fxEvents.on("cameraShake", ({ intensity }) => {
    camera.shake(intensity); // purely visual, runs every frame regardless of net state
});



// Capture: input handlers just emit, they don't decide anything
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        simEvents.emit("playerInput", { action: "jump", t: performance.now() });
    }
});

// Buffer: a queue that intent emits into, instead of acting immediately
class IntentBuffer {
    constructor() {
        this.queue = [];
        simEvents.on("playerInput", (input) => this.queue.push(input));
    }

    drain() {
        const items = this.queue;
        this.queue = [];
        return items;
    }
}

const playerIntent = new IntentBuffer();

// Consume: PlayerController pulls during its step in the ordered loop,
// at a point where rollback/resimulation can still happen cleanly
class PlayerController {
    update(entity) {
        const inputs = playerIntent.drain();
        for (const input of inputs) {
            if (input.action === "jump") entity.jump(); // mutates authoritative state here
        }
    }
}
*/
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);



// Usage in Engine

        // for testing
        // const simulationLocalBus = new MissingEventTracker(new LocalEventBus(Game.events), {
        //     events: Game.events,
        //     file: './missing-strings.json'
        // });

        // const simulationNetworkBus = new MissingEventTracker(new NetworkEventBus(socket, Game.events), {
        //     events: Game.events,
        //     file: './missing-strings.json'
        // });

        // const frameLocalBus = new MissingEventTracker(new LocalEventBus(Game.events), {
        //     events: Game.events,
        //     file: './missing-strings.json'
        // });

        // const syncLocalBus = new MissingEventTracker(new LocalEventBus(Game.events), {
        //     events: Game.events,
        //     file: './missing-strings.json'
        // });







/**
 * Wraps an event bus and records event names that are not in the registry.
 * Unknown events are suppressed (not forwarded) and written to a JSON file.
 */
export class MissingEventTracker {
    /**
     * @param {object} bus  Underlying bus (LocalEventBus, NetworkEventBus, ...)
     * @param {object} [options]
     * @param {string[]} [options.events]       Registered event names (defaults to bus.events)
     * @param {string}   [options.file]         JSON output path (default: missing-strings.json)
     * @param {boolean}  [options.trackSource]  Record the calling file with each event
     * @param {boolean}  [options.strict]       Throw on unknown events instead of suppressing
     */
    constructor(bus, {
        events = bus.events ?? [],
        file = 'missing-strings.json',
        trackSource = false,
        strict = false
    } = {}) {
        this.bus = bus;
        this.events = new Set(events);
        this.file = path.resolve(file);
        this.trackSource = trackSource;
        this.strict = strict;
        this.missing = new Set();
        this.queue = Promise.resolve();

        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.publish = this.publish.bind(this);
        this.track = this.track.bind(this);
    }

    /** Record an unregistered event name (deduplicated, writes are queued). */
    track(event) {
        const source = this.trackSource ? this.#getCallerFile() : null;
        const key = source ? `${event}@${source}` : event;

        if (this.events.has(event) || this.missing.has(key)) return;
        this.missing.add(key);

        this.queue = this.queue.then(async () => {
            let stored = [];

            try {
                stored = JSON.parse(await fs.readFile(this.file, 'utf8'));
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
            }

            const exists = stored.some(item =>
                source
                    ? item.event === event && item.file === source
                    : item === event
            );

            if (!exists) {
                stored.push(source ? { event, file: source } : event);
                await fs.writeFile(
                    this.file,
                    JSON.stringify(stored, null, 2) + '\n'
                );
            }

            console.warn(
                `[Missing event] ${event}${source ? ` (${source})` : ''}`
            );
        }).catch(err => {
            this.missing.delete(key);
            console.error('Failed to save missing event:', err);
        });
    }

    /** Resolves once all queued file writes have finished. */
    flush() {
        return this.queue;
    }

    on(event, callback) {
        if (!this.#isKnown(event)) {
            return { unsubscribe() {} };
        }
        return this.bus.on(event, callback);
    }

    emit(event, ...args) {
        if (!this.#isKnown(event)) return;
        return this.bus.emit(event, ...args);
    }

    publish(event, data) {
        if (!this.#isKnown(event)) return;
        return this.bus.publish(event, data);
    }

    #isKnown(event) {
        if (this.events.has(event)) return true;

        this.track(event);

        if (this.strict) {
            throw new Error(`Unregistered event: "${event}"`);
        }
        return false;
    }

    #getCallerFile() {
        const lines = new Error().stack?.split('\n').slice(1) ?? [];

        for (const line of lines) {
            const match = line.match(/\(?((?:file:\/\/)?[^\s()]+?):\d+:\d+\)?$/);
            if (!match) continue;

            let location = match[1];
            if (location.startsWith('node:')) continue;
            if (location.startsWith('file://')) {
                location = fileURLToPath(location);
            }
            if (location === SELF) continue;

            return path.relative(process.cwd(), location);
        }

        return 'unknown';
    }
}


// client side no node imports 

// export class MissingEventTracker {
//     constructor(bus, { events = bus.events ?? [], endpoint = '/dev/missing-event', strict = false } = {}) {
//         this.bus = bus;
//         this.events = new Set(events);
//         this.endpoint = endpoint;
//         this.strict = strict;
//         this.reported = MissingEventTracker.reported ??= new Set(); // shared across all instances
//     }

//     track(event) {
//         if (this.events.has(event) || this.reported.has(event)) return;
//         this.reported.add(event);
//         console.warn(`[Missing event] ${event}`);
//         fetch(this.endpoint, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ event })
//         }).catch(() => this.reported.delete(event));
//     }

//     #isKnown(event) {
//         if (this.events.has(event)) return true;
//         this.track(event);
//         if (this.strict) throw new Error(`Unregistered event: "${event}"`);
//         return false;
//     }

//     on(event, cb)       { return this.#isKnown(event) ? this.bus.on(event, cb) : { unsubscribe() {} }; }
//     emit(event, ...a)   { if (this.#isKnown(event)) return this.bus.emit(event, ...a); }
//     publish(event, d)   { if (this.#isKnown(event)) return this.bus.publish(event, d); }
// }
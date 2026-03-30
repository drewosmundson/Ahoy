


import { EventSchemas } from './schemas.js';

export function createEmitter(socket)  {
  return function emit(event, data) {
    if (!(event in EventSchemas)) {
        throw new Error(`Unknown event: ${event}`);
    }

    const isValid = EventSchemas[event](data);

    if (!isValid) {
        throw new Error(`Invalid payload for ${event}`);
    }

    socket.emit(event, data);
    }
}
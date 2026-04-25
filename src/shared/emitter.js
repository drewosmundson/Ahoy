

export function createEmitter(socket, eventSchemas)  {
  return {
    emit
  }
  
  function emit(event, data, lobby) {
    if (!(event in eventSchemas)) {
        throw new Error(`Unknown event: ${event}`);
    }

    const isValid = eventSchemas[event](data);

    if (!isValid) {
        throw new Error(`Invalid payload for ${event}`);
    }
    socket.emit(event, {...data, lobby});
  }
}
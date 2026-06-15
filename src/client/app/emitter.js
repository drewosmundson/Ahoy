

export function createEmitter(socket, eventSchemas)  {
  return {
    emit,
    nullEmit
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
    // Intentionally does nothing. 
  // The purpose of this function is to be passed into a singleplayer games
  // That way no logic needs to change and no additional data has to be attempted 
  // to be passed to the server. 
    function nullEmit() {}
}
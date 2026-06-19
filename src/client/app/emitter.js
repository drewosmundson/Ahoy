

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

export function createEmitter(socket, eventSchemas) {
    return function emit(event, data, lobby) {
        if (!(event in eventSchemas)) {
            throw new Error(`Unknown event: ${event}`);
        }

        if (!eventSchemas[event](data)) {
            throw new Error(`Invalid payload`);
        }

        socket.emit(event, {
            ...data,
            lobby
        });
    };
}

export function createReceiver(socket, eventSchemas) {
    return function subscribe(handler) {
        for (const event in eventSchemas) {
            socket.on(event, data => {
                if (!eventSchemas[event](data)) {
                    return;
                }

                handler(event, data);
            });
        }
    };
}


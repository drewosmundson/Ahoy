








// ----------------------------------------------------------------------------
// eventSchemas: required by NetworkEventBus — createSender validates outgoing
// publish() calls against these, and createReceiver only wires up
// socket.on(...) for events listed here (so unknown/unexpected socket
// messages are ignored rather than silently trusted). Only events that
// actually cross the client<->server boundary belong here — effects-only
// events (cameraShake, damageNumberPopup, mouseMove, etc.) never do, since
// those stay on LocalEventBus and never touch NetworkEventBus.
// ----------------------------------------------------------------------------

export const eventSchemas = {
    // Sent client -> server -> other clients: "here's where my vehicles are now."
    vehicleState: (data) =>
        !!data &&
        typeof data.id !== "undefined" &&
        !!data.location && typeof data.location.x === "number" && typeof data.location.y === "number" &&
        typeof data.rotation === "number" &&
        !!data.velocity && typeof data.velocity.x === "number" && typeof data.velocity.y === "number",

    // Sent server -> client: "here's every vehicle in the lobby, this tick."
    worldSnapshot: (data) => Array.isArray(data?.vehicles),
};
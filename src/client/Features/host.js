


export function host({ dom, navigate, subscriptions, Engine }) {
    let engine = null;

    return {
        initEventListeners,
    };

    function initEventListeners() {
        dom.buttons.host?.addEventListener('click', toMenuScreen);
        dom.buttons.hostStart?.addEventListener('click', start);
        dom.buttons.hostStart?.addEventListener('click', startHosting);
    }

    function toMenuScreen() {
        navigate.toScreen(dom.screens.host);
    }
    function startHosting() {
        subscriptions.add('player-joined', handlePlayerJoined);
        subscriptions.add('engine:start', () => engine.start());
        subscriptions.add('engine:stop', () => engine.stop());
        subscriptions.add('engine:pause', () => engine.pause());
        subscriptions.add('engine:resume', () => engine.resume());
        navigate.toScreen(dom.screens.lobby);
    }

    function handlePlayerJoined(player) {

    }
}



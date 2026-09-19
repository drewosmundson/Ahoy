


export function host({ dom, navigate, socket, subscriptions }) {
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
        navigate.toScreen(dom.screens.lobby);
    }

    function handlePlayerJoined(player) {

    }
}




export function singleplayer({ dom, navigate, games, Engine }) {
    let engine = null;
    function initEventListeners() {
        dom.buttons.mainToSingleplayer?.addEventListener('click', toMenuScreen);
        dom.buttons.templateStart?.addEventListener('click', () => startEngine(games.template));
        dom.buttons.ahoyStart?.addEventListener('click', () => startEngine(games.ahoy));
    }

    function toMenuScreen() {
        navigate.toScreen(dom.screens.singleplayer)
    }

    function startEngine(selectedGame) {
        engine?.destroy();
        engine = new Engine()
        const canvas = dom.canvas.game;
        engine.setup(selectedGame, canvas);
        navigate.toScreen(dom.screens.game);
        engine.start();
    }

    return {
        initEventListeners,
        toMenuScreen,
        startEngine,
    };
}
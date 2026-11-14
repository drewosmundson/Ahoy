






export function singleplayer({ dom, navigate, games, Engine, GraphicsContext}) {
    
    let engine = null;
    
    function initEventListeners() {
        dom.buttons.mainToSingleplayer?.addEventListener('click', toMenuScreen);
        dom.buttons.singleplayerStart?.addEventListener('click', () => startEngine(games.Template));
    }

    function toMenuScreen() {
        navigate.toScreen(dom.screens.singleplayer)
        const canvas = dom.canvas.game;
        engine?.destroy();
        engine = new Engine();
        engine.setup(selectedGame, canvas, GraphicsContext);
    }

    function startEngine(selectedGame) {
        navigate.toScreen(dom.screens.game);
        engine.start()
    }

    return {
        initEventListeners,
        toMenuScreen,
        startEngine,
    };
}
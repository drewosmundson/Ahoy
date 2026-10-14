






export function singleplayer({ dom, navigate, games, Engine, GraphicsContext}) {
    let engine = null;
    function initEventListeners() {
        dom.buttons.mainToSingleplayer?.addEventListener('click', toMenuScreen);
        dom.buttons.singleplayerStart?.addEventListener('click', () => startEngine(games.Template));
        //dom.buttons.ahoyStart?.addEventListener('click', () => startEngine(games.ahoy));
    }

    function toMenuScreen() {
        navigate.toScreen(dom.screens.singleplayer)
    }



    function startEngine(selectedGame) {
        const canvas = dom.canvas.game;

        console.log("Canvas:", canvas);
        console.log("Is canvas:", canvas instanceof HTMLCanvasElement);
        console.log("Connected:", canvas?.isConnected);
        console.log("Game:", selectedGame);

        engine?.destroy();
        engine = new Engine();

        engine.setup(selectedGame, canvas, GraphicsContext);
        navigate.toScreen(dom.screens.game);
        engine.start();
    }



    return {
        initEventListeners,
        toMenuScreen,
        startEngine,
    };
}

export function singleplayer({ dom, navigate, socket, Game }) {
    return {
        initEventListeners,
        toMenuScreen,
        start,
    };

    function initEventListeners() {
        dom.buttons.mainToSingleplayer?.addEventListener('click', toMenuScreen);
        dom.buttons.singleplayerStart?.addEventListener('click', start);
    }

    function toMenuScreen() {
        navigate.toScreen(dom.screens.singleplayer)
    }

    function start() {
        const canvas = dom.canvas.game;
        const game = new Game();
        game.setup(canvas, game.heightmap, socket);
        navigate.toScreen(dom.screens.game);
        game.start();
    }
}
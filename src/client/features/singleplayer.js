
export function singleplayer({ dom, navigate, socket, games, Engine, }) {
    return {
        initEventListeners,
        toMenuScreen,
        start,
    };

    function initEventListeners() {
        dom.buttons.mainToSingleplayer?.addEventListener('click', toMenuScreen);
        dom.buttons.templateStart?.addEventListener('click', template);
        dom.buttons.ahoyStart?.addEventListener('click', ahoy)
    }

    function toMenuScreen() {
        navigate.toScreen(dom.screens.singleplayer)
    }

    function ahoy(){
        start(games.ahoy)
    }

    function template() {
        start(games.template)
    }

    function start(selectedGame) {
        const canvas = dom.canvas.game;
        const game = new Engine(selectedGame);
        game.setup(canvas);
        navigate.toScreen(dom.screens.game);
        game.start();
    }
}
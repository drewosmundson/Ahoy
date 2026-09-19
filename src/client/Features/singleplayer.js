
export function singleplayer({ dom, navigate, games, engine }) {
    function initEventListeners() {
        dom.buttons.mainToSingleplayer?.addEventListener('click', toMenuScreen);
        dom.buttons.templateStart?.addEventListener('click', template);
        dom.buttons.ahoyStart?.addEventListener('click', ahoy)
    }

    function toMenuScreen() {
        navigate.toScreen(dom.screens.singleplayer)
    }

    function ahoy(){
        startEngine(games.ahoy)
    }

    function template() {
        startEngine(games.template)
    }

    function startEngine(selectedGame) {
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
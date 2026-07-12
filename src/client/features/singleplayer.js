import { useEffect } from "react";


export function singleplayer({ dom, navigate, Game, CONSTANTS }) {
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
    game.setup(canvas, game.heightmap, effectsBus, simulationBus, networkBus);
    navigate.toScreen(dom.screens.game);
    game.start();
  }
}
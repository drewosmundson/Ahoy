
// Game.js
import { GAME_CONFIG } from './config.js';
import { RenderManager } from './services/RenderManager.js';
import { Components } from './components/index.js';
import { PresentationComponents } from './presentationComponents/index.js';
import { Interfaces } from './interfaces/index.js';
import { SimulationSystems } from './systems/simulation/index.js';
import { NetworkSystems } from './systems/network/index.js';
import { EffectSystems } from './systems/effect/index.js';
import { PresentationSystems } from './systems/presentation/index.js';
import { Services } from './services/index.js';

export const Game = {
  GAME_CONFIG,
  Renderer: RenderManager,
  Components,
  PresentationComponents,
  Interfaces,
  SimulationSystems,
  NetworkSystems,
  EffectSystems,
  PresentationSystems,
  Services,
};


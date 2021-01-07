import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import {entity} from './entity.js'
import {gltf} from './gltf.js'
import {spatial_grid_controller} from './spatial-grid-controller.js'

export class npc_factory{
  constructor() {
    
  }
  newNPC(params) {
      const e = new entity.Entity();
      e.addComponent(new gltf.StaticModelComponent(params.gltf_comp));
      e.addComponent(
          new spatial_grid_controller.SpatialGridController({grid: params.grid}));
      e.setPosition(params.pos);
      return e;
  }
}
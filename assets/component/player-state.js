import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';


export const player_state = (() => {

  class State {
    constructor(parent) {
      this._parent = parent;
    }
  
    enter() {}
    exit() {}
    update() {}
  };      
  class WalkState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'walk';
    }
  
    enter(prevState) {
      const curAction = this._parent._proxy._animations['walk'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
  
        curAction.enabled = true;
  
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
  
        curAction.crossFadeFrom(prevAction, 0.1, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    exit() {
    }
  
    update(timeElapsed, input) {
      if (input._keys.forward || input._keys.backward) {        
        return;
      }  
      this._parent.setState('idle');
    }
  };
    
  class IdleState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'idle';
    }
  
    enter(prevState) {
      const idleAction = this._parent._proxy._animations['idle'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.25, true);
        idleAction.play();
      } else {
        idleAction.play();
      }
    }
  
    exit() {
    }
  
    update(_, input) {
      if (input._keys.forward || input._keys.backward) {
        this._parent.setState('walk');
      }
    }
  };

  return {
    State: State,
    IdleState: IdleState,
    WalkState: WalkState,
  };

})();
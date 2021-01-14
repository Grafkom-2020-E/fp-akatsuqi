import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

import {entity} from './entity.js';
import {finite_state_machine} from './finite-state-machine.js';
import {player_state} from './player-state.js';
import {api_manager} from './api.js';
import { ui_controller } from './ui-controller.js';

export const player_entity = (() => {

  class CharacterFSM extends finite_state_machine.FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this.init();
    }
  
    init() {      
      this.addState('idle', player_state.IdleState);
      this.addState('walk', player_state.WalkState);
    }
  };
  
  class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }
  
    get animations() {
      return this._animations;
    }
  };


  class BasicCharacterController extends entity.Component {
    constructor(params) {
      super();
      this.init(params);
    }

    init(params) {
      this._params = params;
      this.uiController = new ui_controller.UiController();
      this.apiManager = new api_manager.ApiManager();
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.125, 50.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
      this._position = new THREE.Vector3();
  
      this._animations = {};
      this._stateMachine = new CharacterFSM(
          new BasicCharacterControllerProxy(this._animations));
  
      this.loadModals();
    }

    initComponent() {
      // this.registerHandler('health.death', (m) => { this.onDeath(m); });
    }

    onDeath(msg) {
      // this._stateMachine.setState('death');
    }

    loadModals() {
      const loader = new FBXLoader();
      loader.setPath('../../model/player/');
      loader.load('remy.fbx', (fbx) => {
        this._target = fbx;
        this._target.scale.setScalar(0.035);
        this._params.scene.add(this._target);
  
        this._bones = {};

        for (let b of this._target.children[1].skeleton.bones) {
          this._bones[b.name] = b;
        }

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });

        this.broadcast({
            topic: 'load.character',
            model: this._target,
            bones: this._bones,
        });

        this._mixer = new THREE.AnimationMixer(this._target);

        const onLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
    
          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.setState('idle');
        };
  
        const loader = new FBXLoader(this._manager);
        loader.setPath('../../model/player/');
        loader.load('Breathing Idle.fbx', (a) => { onLoad('idle', a); });
        loader.load('Standard Walk.fbx', (a) => { onLoad('walk', a); });
      });
    }

    findIntersection(pos) {      
      const grid = this.getComponent('SpatialGridController');
      const nearby = grid.FindNearbyEntities(5)
      const collisions = [];
      // console.log(pos)
      const apiData = this.apiManager.getData();
      const collision_exception = ['big_gate', 'floor','dirt'];

      const input = this.getComponent('BasicCharacterControllerInput');
      for (let i = 0; i < nearby.length; ++i) {
        const e = nearby[i].entity;              
        console.log(e._position.x,e._position.z)
        const d = ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;
        if (d<5 && !collision_exception.includes(e.getType())) {
          this.uiController.displayInteraction();
          const data = apiData.filter( data => data.id === e.getId())[0]
          if (input._keys.f) {
            if (this.uiController.isDisplayedAnimalInformation()) {
              this.uiController.hideAnimalInformation();
            }else{
              this.uiController.displayAnimalInformation(data)
            }
          }
          collisions.push(nearby[i].entity)
        }
        // HARDCODED
        // if (e_type != '') {
        //   console.log(e_range)
        //   console.log(pos)
        //   if(((pos.x > e_range.batas_bawah[0] && pos.z > e_range.batas_bawah[1]) && (pos.x < e_range.batas_atas[0] && pos.z < e_range.batas_atas[1] )))
        //   collisions.push(nearby[i].entity);
        // }
      }
      return collisions;
    }

    update(timeInSeconds) {
      if (!this._stateMachine._currentState) {
        return;
      }

      const input = this.getComponent('BasicCharacterControllerInput');
      this._stateMachine.update(timeInSeconds, input);

      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }

      // HARDCODED
      if (this._stateMachine._currentState._action) {
        this.broadcast({
          topic: 'player.action',
          action: this._stateMachine._currentState.Name,
          time: this._stateMachine._currentState._action.time,
        });
      }

      const currentState = this._stateMachine._currentState;
      if (currentState.Name != 'walk' &&          
          currentState.Name != 'idle') {
        return;
      }
    
      const velocity = this._velocity;
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this._decceleration.x,
          velocity.y * this._decceleration.y,
          velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
      frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
          Math.abs(frameDecceleration.z), Math.abs(velocity.z));
  
      velocity.add(frameDecceleration);
  
      const controlObject = this._target;
      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = controlObject.quaternion.clone();
  
      const acc = this._acceleration.clone();
      if (input._keys.shift) {
        acc.multiplyScalar(2.0);
      }
  
      if (input._keys.forward) {
        velocity.z += acc.z * timeInSeconds;
      }
      if (input._keys.backward) {
        velocity.z -= acc.z * timeInSeconds;
      }
      if (input._keys.left) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
        _R.multiply(_Q);
      }
      if (input._keys.right) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
        _R.multiply(_Q);
      }
  
      controlObject.quaternion.copy(_R);
  
      const oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
  
      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();
  
      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);
  
      const pos = controlObject.position.clone();
      pos.add(forward);
      pos.add(sideways);

      const collisions = this.findIntersection(pos);      
      if (collisions.length > 0) {
        return;
      }

      controlObject.position.copy(pos);
      this._position.copy(pos);
      if (input._keys.f) {
        if (this.uiController.isDisplayedAnimalInformation()) {
          this.uiController.hideAnimalInformation();
        }
      }
      if (this.uiController.isDisplayInteraction()) {
        this.uiController.hideInteraction();
      }
      this._parent.setPosition(this._position);
      this._parent.setQuaternion(this._target.quaternion);
    }
  };
  
  return {
      BasicCharacterControllerProxy: BasicCharacterControllerProxy,
      BasicCharacterController: BasicCharacterController,
  };

})();
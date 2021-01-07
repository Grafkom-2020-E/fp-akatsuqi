import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

import {entity} from './entity.js';


export const gltf = (() => {

  class StaticModelComponent extends entity.Component {
    constructor(params) {
      super();
      this.init(params);
    }
  
    init(params) {
      this._params = params;
  
      this.loadModels();
    }
  
    initComponent() {
      this.registerHandler('update.position', (m) => { this.onPosition(m); });
    }

    onPosition(m) {
      if (this._target) {
        this._target.position.copy(m.value);
      }
    }

    loadModels() {
      if (this._params.resourceName.endsWith('glb') || this._params.resourceName.endsWith('gltf')) {
        this.loadGLB();
      } else if (this._params.resourceName.endsWith('fbx')) {
        this.loadFBX();
      }
    }

    onLoaded(obj) {
      this._target = obj;
      this._params.scene.add(this._target);

      this._target.scale.setScalar(this._params.scale);
      if (this._params.rotation) {
        this._target.rotation.x = this._params.rotation[0];
        this._target.rotation.y = this._params.rotation[1];
        this._target.rotation.z = this._params.rotation[2];
      }
      this._target.position.copy(this._parent._position);

      let texture = null;
      if (this._params.resourceTexture) {
        const texLoader = new THREE.TextureLoader();
        texture = texLoader.load(this._params.resourceTexture);
        texture.encoding = THREE.sRGBEncoding;
      }

      this._target.traverse(c => {
        let materials = c.material;
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }

        for (let m of materials) {
          if (m) {
            if (texture) {
              m.map = texture;
            }
            if (this._params.specular) {
              m.specular = this._params.specular;
            }
            if (this._params.emissive) {
              m.emissive = this._params.emissive;
            }
          }
        }
        if (this._params.receiveShadow != undefined) {
          c.receiveShadow = this._params.receiveShadow;
        }
        if (this._params.castShadow != undefined) {
          c.castShadow = this._params.castShadow;
        }
        if (this._params.visible != undefined) {
          c.visible = this._params.visible;
        }
      });
    }

    loadGLB() {
      const loader = new GLTFLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceName, (glb) => {
        this.onLoaded(glb.scene);
      });
    }

    loadFBX() {
      const loader = new FBXLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceName, (fbx) => {
        this.onLoaded(fbx);
      });
    }

    Update(timeInSeconds) {
    }
  };


  class AnimatedModelComponent extends entity.Component {
    constructor(params) {
      super();
      this.init(params);
    }
  
    initComponentModel() {
      this.registerHandler('update.position', (m) => { this._OnPosition(m); });
    }

    onPosition(m) {
      if (this._target) {
        this._target.position.copy(m.value);
        this._target.position.y = 0.35;
      }
    }

    init(params) {
      this._params = params;
  
      this.loadModels();
    }
  
    loadModels() {
      if (this._params.resourceName.endsWith('glb') || this._params.resourceName.endsWith('gltf')) {
        this.loadGLB();
      } else if (this._params.resourceName.endsWith('fbx')) {
        this.loadFBX();
      }
    }

    onLoaded(obj, animations) {
      this._target = obj;
      this._params.scene.add(this._target);

      this._target.scale.setScalar(this._params.scale);      
      this._target.position.copy(this._parent._position);

      this.broadcast({
        topic: 'update.position',
        value: this._parent._position,
      });

      let texture = null;
      if (this._params.resourceTexture) {
        const texLoader = new THREE.TextureLoader();
        texture = texLoader.load(this._params.resourceTexture);
        texture.encoding = THREE.sRGBEncoding;
      }

      this._target.traverse(c => {
        let materials = c.material;
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }

        for (let m of materials) {
          if (m) {
            if (texture) {
              m.map = texture;
            }
            if (this._params.specular) {
              m.specular = this._params.specular;
            }
            if (this._params.emissive) {
              m.emissive = this._params.emissive;
            }
          }
        }
        if (this._params.receiveShadow != undefined) {
          c.receiveShadow = this._params.receiveShadow;
        }
        if (this._params.castShadow != undefined) {
          c.castShadow = this._params.castShadow;
        }
        if (this._params.visible != undefined) {
          c.visible = this._params.visible;
        }
      });

      const onLoad = (anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
  
        action.play();
      };

      const loader = new FBXLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceAnimation, (a) => { onLoad(a); });

      this._mixer = new THREE.AnimationMixer(this._target);

      this._parent._mesh = this._target;
      this.broadcast({
          topic: 'load.character',
          model: this._target,
      });
    }

    loadGLB() {
      const loader = new GLTFLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceName, (glb) => {
        this.onLoaded(glb.scene, glb.animations);
      });
    }

    loadFBX() {
      const loader = new FBXLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceName, (fbx) => {
        this.onLoaded(fbx);
      });
    }

    Update(timeInSeconds) {
      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }
    }
  };


  return {
      StaticModelComponent: StaticModelComponent,
      AnimatedModelComponent: AnimatedModelComponent,
  };

})();
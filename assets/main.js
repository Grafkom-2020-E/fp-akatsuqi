import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import { entity } from './component/entity.js';
import { entity_manager } from './component/entity-manager.js';
import { math } from './component/math.js';
import { gltf } from './component/gltf.js';

const _VS = `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;


const _FS = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 vWorldPosition;

void main() {
  float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;


class Main {
    constructor(){
        this.initialize();
    }

    initThreeJS(){
        this._threeJS = new THREE.WebGLRenderer({
            antialias: true,
        });
        this._threeJS.outputEncoding = THREE.sRGBEncoding;
        this._threeJS.gammaFactor = 2.2;
        this._threeJS.shadowMap.enabled = true;
        this._threeJS.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threeJS.setPixelRatio(window.devicePixelRatio);
        this._threeJS.setSize(window.innerWidth, window.innerHeight);
        this._threeJS.domElement.id = 'threejs';
        document.getElementById('container').appendChild(this._threeJS.domElement);
        window.addEventListener('resize', () => {
            this.onWindowResize();
        }, false);
    }

    initCamera(){
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 10000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(25, 10, 25);        
    }

    initScene(){
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0xFFFFFF);
        this._scene.fog = new THREE.FogExp2(0x89b2eb, 0.002);
    }

    initLight(){
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(-10, 500, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 1000.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this._scene.add(light);
        return light;
    }

    initPlane(){
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(5000, 5000, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0x1e601c,
            })
        );
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);
    }
    
    initialize(){        
        this.initThreeJS();
        this.initCamera();
        this.initScene();
        const light = this.initLight();
        this._sun = light;
        this.initPlane();
        this._entityManager = new entity_manager.EntityManager();
        this.loadClouds();
        this.loadSky();
        this._previousRAF = null;
        this.requestAnimation();
    }

    loadClouds() {
        for (let i = 0; i < 20; ++i) {
            const index = math.rand_int(1, 3);
            const pos = new THREE.Vector3(
                (Math.random() * 2.0 - 1.0) * 500,
                100,
                (Math.random() * 2.0 - 1.0) * 500
            );    
            const e = new entity.Entity();
            e.addComponent(new gltf.StaticModelComponent({
                scene: this._scene,
                resourcePath: './model/nature2/GLTF/',
                resourceName: 'Cloud' + index + '.glb',
                position: pos,
                scale: Math.random() * 5 + 10,
                emissive: new THREE.Color(0x808080),
            }));
            e.setPosition(pos);
            this._entityManager.addEntity(e);
            e.setActive(false);
        }
    }

    loadSky() {
        const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFFF, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        this._scene.add(hemiLight);
    
        const uniforms = {
          "topColor": { value: new THREE.Color(0x0077ff) },
          "bottomColor": { value: new THREE.Color(0xffffff) },
          "offset": { value: 33 },
          "exponent": { value: 0.6 }
        };
        uniforms["topColor"].value.copy(hemiLight.color);
    
        this._scene.fog.color.copy(uniforms["bottomColor"].value);
    
        const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            side: THREE.BackSide
        });
    
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this._scene.add(sky);
    }

    onWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threeJS.setSize(window.innerWidth, window.innerHeight);
    }

    requestAnimation(){
        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
              this._previousRAF = t;
            }      
            this.requestAnimation();      
            this._threeJS.render(this._scene, this._camera);
        });
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Main();
});

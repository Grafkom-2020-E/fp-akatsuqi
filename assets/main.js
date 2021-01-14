import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import { entity } from './component/entity.js';
import { entity_manager } from './component/entity-manager.js';
import { math } from './component/math.js';
import { gltf } from './component/gltf.js';
import { player_input } from './component/player-input.js';
import { player_entity } from './component/player-entity.js';
import { third_person_camera } from './component/third-person-camera.js';
import { spatial_hash_grid } from './component/spatial-hash-grid.js';
import { spatial_grid_controller } from './component/spatial-grid-controller.js';
import { npc_factory } from './component/npc-factory.js';

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
        this.initMusic();        
        this.initLoading();
        this.initialize();
    }
    initMusic(){
        this.audio = new Audio ('assets/sounds/mainsound.mp3');
        this.audio.play()
    }    
    initLoading(){
        this.loadingDuration = 5000;
        this.loadingBarElement = null;
        this.loadingTime = 0;
        this.loadingBarElement = document.getElementById('lg-loading-bar');
        this.isLoading = true;
    }
    updateLoadingBar(time) {        
        this.loadingTime += time;
        document.getElementById('loading-percent').innerHTML = Math.round(this.loadingTime/this.loadingDuration * 100) ;
        this.loadingBarElement.style.transform = `scaleX(${this.loadingTime/this.loadingDuration})`;
        if (this.loadingTime >= this.loadingDuration){
            this.isLoading = false
            const bgMain = document.querySelector('.bg-main');
            bgMain.style.display = 'none'
            const container = document.getElementById('container');
            container.style.display = 'block';            
        }
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
        const aspect = window.innerWidth / window.innerHeight;
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
        this._grid = new spatial_hash_grid.SpatialHashGrid(
            [[-1000, -1000], [1000, 1000]], [100, 100]);
        this._npcFactory = new npc_factory();
        this.loadPlayer();
        this.loadFloor();
        this.loadDeer();
        this.loadGate();
        this.loadTembokKiri();
        this.loadTembokKanan();
        this.loadTembokBelakang();
        this.loadPohonKeliling();
        this.loadPohonTengah();
        this.loadElephant();
        this.loadArmadillo();
        this.loadGiraffe();
        this.loadTiger();
        this.loadTortoise();
        this.loadHorse();
        this.loadGorilla();             
        this.loadBear();
        this.loadClouds();
        this.loadSky();
        this.loadBoard();
        this.loaddirt();
        this._previousRAF = null;
        this.requestAnimation();
    }

    loadFloor(){
        let xposisib = -10;
        let zposisib = -5;
        for(let i = 0; i < 11 ; i ++){
            let pos = new THREE.Vector3(
                xposisib,
                -0.4,
                zposisib+=20
            );
            const e = new entity.Entity();
            e.setType('floor');
            e.addComponent(new gltf.StaticModelComponent({
                scene: this._scene,
                resourcePath: './model/stone_floor (1)/',
                resourceName: 'scene.gltf',
                scale: 19,
                emissive: new THREE.Color(0x000000),
                specular: new THREE.Color(0x000000),
                receiveShadow: true,
                castShadow: true,
                rotation: [0, 3.14, 0],

            }));
            e.addComponent(
                new spatial_grid_controller.SpatialGridController({grid: this._grid}));
            e.setPosition(pos);
            this._entityManager.addEntity(e);
            e.setActive(false);
        }
    }

    loadBoard(){
        // buat deer
        let pos = new THREE.Vector3(
            30,
            0,
            10
        );
        const e6 = new entity.Entity();
        e6.setType('deer');
        e6.setId('5ffff56abfb6bacaaf78df52');
    
        e6.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, -1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e6.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e6.setPosition(pos);
        this._entityManager.addEntity(e6);
        e6.setActive(false);
        
        // buat arma
        pos = new THREE.Vector3(
            30,
            0,
            67
        );
        const e1 = new entity.Entity();
        e1.setType('armadillo');
        e1.setId('5ffff743bfb6bacaaf78df53');
    
        e1.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, -1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e1.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e1.setPosition(pos);
        this._entityManager.addEntity(e1);
        e1.setActive(false);

        // buat kura
        pos = new THREE.Vector3(
            30,
            0,
            108
        );
        const e7 = new entity.Entity();
        e7.setType('tortoise');
        e7.setId('5ffff81dbfb6bacaaf78df54');
    
        e7.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, -1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e7.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e7.setPosition(pos);
        this._entityManager.addEntity(e7);
        e7.setActive(false);
    
        // buat kuda
        pos = new THREE.Vector3(
            30,
            0,
            150
        );
        const e2 = new entity.Entity();
        e2.setType('horse');
        e2.setId('5ffff8b6bfb6bacaaf78df55');
    
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, -1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);
    
        // buat jerapah
        pos = new THREE.Vector3(
            -10-10,
            0,
            232
        );
        const e3 = new entity.Entity();
        e3.setType('giraffe');
        e3.setId('5ffff95bbfb6bacaaf78df56');
    
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, 3.14/2 +1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);
    
        // buat gajah
        pos = new THREE.Vector3(
            10-10,
            0,
            255
        );
        const e4 = new entity.Entity();
        e4.setType('elephant');
        e4.setId('5ffff1ccbfb6bacaaf78df51');
    
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, 3.14/2 -1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        // buat macan
        pos = new THREE.Vector3(
            -65,
            0,
            170
        );
        const e5 = new entity.Entity();
        e5.setType('tiger');
        e5.setId('5ffffa09bfb6bacaaf78df57');
    
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);

        // buat beruang
        pos = new THREE.Vector3(
            -65,
            0,
            120
        );
        const e8 = new entity.Entity();
        e8.setType('bear');
        e8.setId('5ffffaae1fc2ecf90c474676');
    
        e8.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e8.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e8.setPosition(pos);
        this._entityManager.addEntity(e8);
        e8.setActive(false);

        // buat gorila
        pos = new THREE.Vector3(
            -65,
            0,
            40
        );
        const e9 = new entity.Entity();
        e8.setType('gorilla');
        e8.setId('5ffffbb91fc2ecf90c474677');
    
        e9.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/wooden_board/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.5, 0],
            scale: 12,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e9.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e9.setPosition(pos);
        this._entityManager.addEntity(e9);
        e9.setActive(false);

    }

    loaddirt(){
        //dirt rusa
        let pos = new THREE.Vector3(
            35,
            -0.2,
            29
        );
        const e1 = new entity.Entity();
        e1.setType('dirt');
        e1.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 1.5, 0],

        }));
        e1.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e1.setPosition(pos);
        this._entityManager.addEntity(e1);
        e1.setActive(false);

        pos = new THREE.Vector3(
            18.5,
            -0.2,
            27.8
        );
        const e2 = new entity.Entity();
        e2.setType('dirt');
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 1.5, 0],

        }));
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        //dirt gorilla
        pos = new THREE.Vector3(
            -62,
            -0.2,
            29
        );
        const e3 = new entity.Entity();
        e3.setType('dirt');
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);

        pos = new THREE.Vector3(
            -40.5,
            -0.2,
            27.8
        );
        const e4 = new entity.Entity();
        e4.setType('dirt');
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        //dirt arma
        pos = new THREE.Vector3(
            35,
            -0.2,
            82
        );
        const e5 = new entity.Entity();
        e5.setType('dirt');
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);

        pos = new THREE.Vector3(
            18.5,
            -0.2,
            82
        );
        const e6 = new entity.Entity();
        e6.setType('dirt');
        e6.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e6.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e6.setPosition(pos);
        this._entityManager.addEntity(e6);
        e6.setActive(false);

        //dirt bear
        pos = new THREE.Vector3(
            -62,
            -0.2,
            110
        );
        const e7 = new entity.Entity();
        e7.setType('dirt');
        e7.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e7.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e7.setPosition(pos);
        this._entityManager.addEntity(e7);
        e7.setActive(false);

        pos = new THREE.Vector3(
            -40.5,
            -0.2,
            110
        );
        const e8 = new entity.Entity();
        e8.setType('dirt');
        e8.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e8.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e8.setPosition(pos);
        this._entityManager.addEntity(e8);
        e8.setActive(false);

        //dirt tortoise
        pos = new THREE.Vector3(
            35,
            -0.2,
            120
        );
        const e9 = new entity.Entity();
        e9.setType('dirt');
        e9.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e9.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e9.setPosition(pos);
        this._entityManager.addEntity(e9);
        e9.setActive(false);

        pos = new THREE.Vector3(
            18.5,
            -0.2,
            120
        );
        const e10 = new entity.Entity();
        e10.setType('dirt');
        e10.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e10.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e10.setPosition(pos);
        this._entityManager.addEntity(e10);
        e10.setActive(false);

        //dirt horse
        pos = new THREE.Vector3(
            35,
            -0.2,
            165
        );
        const e11 = new entity.Entity();
        e11.setType('dirt');
        e11.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e11.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e11.setPosition(pos);
        this._entityManager.addEntity(e11);
        e11.setActive(false);

        pos = new THREE.Vector3(
            18.5,
            -0.2,
            165
        );
        const e12 = new entity.Entity();
        e12.setType('dirt');
        e12.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e12.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e12.setPosition(pos);
        this._entityManager.addEntity(e12);
        e12.setActive(false);

        //dirt horse
        pos = new THREE.Vector3(
            -62,
            -0.2,
            175
        );
        const e13 = new entity.Entity();
        e13.setType('dirt');
        e13.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e13.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e13.setPosition(pos);
        this._entityManager.addEntity(e13);
        e13.setActive(false);

        pos = new THREE.Vector3(
            -40.5,
            -0.2,
            175
        );
        const e14 = new entity.Entity();
        e14.setType('dirt');
        e14.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/stone_floor (1)/',
            resourceName: 'scene.gltf',
            scale: 10,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }));
        e14.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e14.setPosition(pos);
        this._entityManager.addEntity(e14);
        e14.setActive(false);
    }

    loadDeer(){
        let pos = new THREE.Vector3(
            30+40,
            0,
            25
        );
        const e6 = new entity.Entity();

        e6.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/rusa/',
            resourceName: 'scene.gltf',
            scale: 2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }));
        e6.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e6.setPosition(pos);
        this._entityManager.addEntity(e6);
        e6.setActive(false);

        pos = new THREE.Vector3(
            40+40,
            0,
            15
        );
        const e7 = new entity.Entity();
        e7.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/rusa/',
            resourceName: 'scene.gltf',
            rotation: [0, -1.5, 0],
            scale: 1,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e7.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e7.setPosition(pos);
        this._entityManager.addEntity(e7);
        e7.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            1
        );
        const e = new entity.Entity();
        e.setType('rusa');
        e.setId('5ffff56abfb6bacaaf78df52');
        e.setRange({
            batas_bawah:[41.55,3.02],
            batas_atas: [42.55, 20.82],
        })
        e.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e.setPosition(pos);
        this._entityManager.addEntity(e);
        e.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            20
        );
        const e2 = new entity.Entity();
        e2.setType('rusa');
        e2.setId('5ffff56abfb6bacaaf78df52');
        e2.setRange({
            batas_bawah:[41.55,21.82],
            batas_atas: [42.55, 39.82],
        })
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        })
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            40
        );
        const e3 = new entity.Entity();
        e3.setType('rusa');
        e3.setId('5ffff56abfb6bacaaf78df52');
        e3.setRange({
            batas_bawah:[41.55,41.01],
            batas_atas: [42.55, 59.82],
        })
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            60
        );
        const e4 = new entity.Entity();
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        pos = new THREE.Vector3(
            65,
            0,
            60
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);

        pos = new THREE.Vector3(
            85,
            0,
            60
        );
        const e8 = new entity.Entity();
        e8.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e8.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e8.setPosition(pos);
        this._entityManager.addEntity(e8);
        e8.setActive(false);
    }

    loadElephant(){
        let pos = new THREE.Vector3(
            -60,
            0,
            280
        );
        const e = new entity.Entity();
        e.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/elephant/',
            resourceName: 'scene.gltf',
            scale: 0.04,
            rotation: [0, 3, 0],
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) );
        e.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e.setPosition(pos);
        this._entityManager.addEntity(e);
        e.setActive(false);

        pos = new THREE.Vector3(
            -10,
            -17,
            250
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/metal_fence/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.5, 0],
            scale: 0.025,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);
    }

    loadArmadillo(){
        let pos = new THREE.Vector3(
            60+30,
            1,
            90
        );
        const e = new entity.Entity();
        e.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/armadillo/',
            resourceName: 'scene.gltf',
            rotation: [0, -1, 0],
            scale: 1,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e.setPosition(pos);
        this._entityManager.addEntity(e);
        e.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            60
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            80
        );
        const e3 = new entity.Entity();
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);

        pos = new THREE.Vector3(
            65,
            0,
            100
        );
        const e4 = new entity.Entity();
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        pos = new THREE.Vector3(
            85,
            0,
            100
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            100
        );
        const e6 = new entity.Entity();
        e6.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e6.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e6.setPosition(pos);
        this._entityManager.addEntity(e6);
        e6.setActive(false);
    }

    loadGiraffe(){
        let pos = new THREE.Vector3(
            40,
            0,
            280
        );
        const e = new entity.Entity();
        e.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/girafe/',
            resourceName: 'scene.gltf',
            rotation: [0, 3.5, 0],
            scale: 4,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e.setPosition(pos);
        this._entityManager.addEntity(e);
        e.setActive(false);

        //BABY JERAPAH
        pos = new THREE.Vector3(
            45,
            0,
            270
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/girafe/',
            resourceName: 'scene.gltf',
            rotation: [0, 3.5, 0],
            scale: 2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);
    }

    loadTiger(){
        let pos = new THREE.Vector3(
            -70-30,
            0,
            150
        );
        const e = new entity.Entity();
        e.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tiger/',
            resourceName: 'scene.gltf',
            rotation: [0, -1.5, 0],
            scale: 20,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e.setPosition(pos);
        this._entityManager.addEntity(e);
        e.setActive(false);

        pos = new THREE.Vector3(
            -40-40,
            0,
            217
        );
        const e4 = new entity.Entity();
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fencewire/',
            resourceName: 'scene.gltf',
            rotation: [0, 3.14/2, 0],
            scale: 1.7,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        pos = new THREE.Vector3(
            -55-40,
            0,
            215,5
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);

        // pos = new THREE.Vector3(
        //     -53,
        //     30,
        //     210
        // );
        // const e5 = new entity.Entity();
        // e5.addComponent(new gltf.StaticModelComponent({
        //     scene: this._scene,
        //     resourcePath: './model/fencehorse/',
        //     resourceName: 'scene.gltf',
        //     scale: 30,
        //     emissive: new THREE.Color(0x000000),
        //     specular: new THREE.Color(0x000000),
        //     receiveShadow: true,
        //     castShadow: true,
        //     rotation: [0, 0, 3.14],

        // }) 
        // );
        // e5.addComponent(
        //     new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        // e5.setPosition(pos);
        // this._entityManager.addEntity(e5);
        // e5.setActive(false);

        // pos = new THREE.Vector3(
        //     -53,
        //     10,
        //     210
        // );
        // const e6 = new entity.Entity();
        // e6.addComponent(new gltf.StaticModelComponent({
        //     scene: this._scene,
        //     resourcePath: './model/fencehorse/',
        //     resourceName: 'scene.gltf',
        //     scale: 30,
        //     emissive: new THREE.Color(0x000000),
        //     specular: new THREE.Color(0x000000),
        //     receiveShadow: true,
        //     castShadow: true,
        //     rotation: [0, 0, 0],

        // }) 
        // );
        // e6.addComponent(
        //     new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        // e6.setPosition(pos);
        // this._entityManager.addEntity(e6);
        // e6.setActive(false);
    }

    loadTortoise(){
        let pos = new THREE.Vector3(
            70,
            2.4,
            125
        );
        const e = new entity.Entity();
        e.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tortoise/',
            resourceName: 'scene.gltf',
            rotation: [0, -1, 0],
            scale: 6,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e.setPosition(pos);
        this._entityManager.addEntity(e);
        e.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            100
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            120
        );
        const e3 = new entity.Entity();
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);

        pos = new THREE.Vector3(
            65,
            0,
            140
        );
        const e4 = new entity.Entity();
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        pos = new THREE.Vector3(
            85,
            0,
            140
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            140
        );
        const e6 = new entity.Entity();
        e6.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e6.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e6.setPosition(pos);
        this._entityManager.addEntity(e6);
        e6.setActive(false);
    }

    loadHorse(){
        let pos = new THREE.Vector3(
            70,
            0,
            165
        );
        const e = new entity.Entity();
        e.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/horse/',
            resourceName: 'scene.gltf',
            rotation: [0, 0, 0],
            scale: 0.025,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e.setPosition(pos);
        this._entityManager.addEntity(e);
        e.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            140
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            160
        );
        const e3 = new entity.Entity();
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            180
        );
        const e4 = new entity.Entity();
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, -0.4, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        pos = new THREE.Vector3(
            85,
            0,
            200
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);

        pos = new THREE.Vector3(
            65,
            0,
            200
        );
        const e6 = new entity.Entity();
        e6.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e6.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e6.setPosition(pos);
        this._entityManager.addEntity(e6);
        e6.setActive(false);

        pos = new THREE.Vector3(
            45,
            0,
            200
        );
        const e7 = new entity.Entity();
        e7.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fence_wood/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.2, 0],
            scale: 5,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e7.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e7.setPosition(pos);
        this._entityManager.addEntity(e7);
        e7.setActive(false);
    }

    loadGorilla(){
        let pos = new THREE.Vector3(
            -55-40,
            2.7,
            35
        );
        const e1 = new entity.Entity();
        e1.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/gorilla/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.5, 0],
            scale: 0.025,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e1.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e1.setPosition(pos);
        this._entityManager.addEntity(e1);
        e1.setActive(false);

        // pos = new THREE.Vector3(
        //     -50,
        //     0,
        //     10
        // );
        // const e2 = new entity.Entity();
        // e2.addComponent(new gltf.StaticModelComponent({
        //     scene: this._scene,
        //     resourcePath: './model/gorilla/',
        //     resourceName: 'scene.gltf',
        //     rotation: [0, 1, 0],
        //     scale: 0.01,
        //     emissive: new THREE.Color(0x000000),
        //     specular: new THREE.Color(0x000000),
        //     receiveShadow: true,
        //     castShadow: true,
        // }) 
        // );
        // e2.addComponent(
        //     new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        // e2.setPosition(pos);
        // this._entityManager.addEntity(e2);
        // e2.setActive(false);

        // pos = new THREE.Vector3(
        //     -60,
        //     3,
        //     25
        // );
        // const e3 = new entity.Entity();
        // e3.addComponent(new gltf.StaticModelComponent({
        //     scene: this._scene,
        //     resourcePath: './model/gorilla/',
        //     resourceName: 'scene.gltf',
        //     rotation: [0, 2, 0],
        //     scale: 0.028,
        //     emissive: new THREE.Color(0x000000),
        //     specular: new THREE.Color(0x000000),
        //     receiveShadow: true,
        //     castShadow: true,
        // }) 
        // );
        // e3.addComponent(
        //     new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        // e3.setPosition(pos);
        // this._entityManager.addEntity(e3);
        // e3.setActive(false);

        pos = new THREE.Vector3(
            -40-40,
            0,
            110
        );
        const e4 = new entity.Entity();
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/fencewire/',
            resourceName: 'scene.gltf',
            rotation: [0, 3.14/2, 0],
            scale: 1.7,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        pos = new THREE.Vector3(
            -55-40,
            0,
            72
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);
    }

    loadBear(){
        let pos = new THREE.Vector3(
            -50-40,
            0,
            100
        );
        const e = new entity.Entity();
        e.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/bear/',
            resourceName: 'scene.gltf',
            rotation: [0, 1.5, 0],
            scale: 0.09,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
        }) 
        );
        e.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e.setPosition(pos);
        this._entityManager.addEntity(e);
        e.setActive(false);

        pos = new THREE.Vector3(
            -55-40,
            0,
            143
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);
    }

    loadGate(){
        //tembok kanan 1
        let pos = new THREE.Vector3(
            -10,
            28,
            0
        );
        const e1 = new entity.Entity();
        e1.setType('big_gate');
        e1.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/gate2/',
            resourceName: 'scene.gltf',
            scale: 40,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }) 
        );
        e1.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e1.setPosition(pos);
        this._entityManager.addEntity(e1);
        e1.setActive(false);

        pos = new THREE.Vector3(
            -55,
            0,
            0
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        pos = new THREE.Vector3(
            -55,
            15,
            0
        );
        const e3 = new entity.Entity();
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);

        //tembok kanan 2
        pos = new THREE.Vector3(
            -95,
            0,
            0
        );
        const e6 = new entity.Entity();
        e6.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }) 
        );
        e6.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e6.setPosition(pos);
        this._entityManager.addEntity(e6);
        e6.setActive(false);

        pos = new THREE.Vector3(
            -95,
            15,
            0
        );
        const e7 = new entity.Entity();
        e7.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e7.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e7.setPosition(pos);
        this._entityManager.addEntity(e7);
        e7.setActive(false);
        
        //tembok kiri 1
        pos = new THREE.Vector3(
            35,
            0,
            0
        );
        const e4 = new entity.Entity();
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }) 
        );
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);

        pos = new THREE.Vector3(
            35,
            15,
            0
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);
        
        //tembok kiri 2
        pos = new THREE.Vector3(
            75,
            0,
            0
        );
        const e8 = new entity.Entity();
        e8.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 0, 0],

        }) 
        );
        e8.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e8.setPosition(pos);
        this._entityManager.addEntity(e8);
        e8.setActive(false);

        pos = new THREE.Vector3(
            75,
            15,
            0
        );
        const e9 = new entity.Entity();
        e9.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok2/',
            resourceName: 'scene.gltf',
            scale: 0.2,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e9.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e9.setPosition(pos);
        this._entityManager.addEntity(e9);
        e9.setActive(false);
    }

    loadTembokKanan(){
        let pos = new THREE.Vector3(
            -148,
            0,
            105
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok4/',
            resourceName: 'scene.gltf',
            scale: 14,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14/2, 0],

        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        //tembokkiri 2
        pos = new THREE.Vector3(
            -148,
            0,
            200
        );
        const e3 = new entity.Entity();
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok4/',
            resourceName: 'scene.gltf',
            scale: 14,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14/2, 0],

        }) 
        );
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);
    }

    loadTembokBelakang(){
        let pos = new THREE.Vector3(
            -20,
            0,
            350
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok4/',
            resourceName: 'scene.gltf',
            scale: 14,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);
    }

    loadTembokKiri(){
        let pos = new THREE.Vector3(
            60,
            0,
            105
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok4/',
            resourceName: 'scene.gltf',
            scale: 14,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14/2, 0],

        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        //tembokkiri 2
        pos = new THREE.Vector3(
            60,
            0,
            200
        );
        const e3 = new entity.Entity();
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/tembok4/',
            resourceName: 'scene.gltf',
            scale: 14,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14/2, 0],

        }) 
        );
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);
    }

    loadPohonTengah(){

        let pos = new THREE.Vector3(
            20,
            0,
            190
        );
        const e2 = new entity.Entity();
        e2.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/pohon6/',
            resourceName: 'scene.gltf',
            scale: 40,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e2.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e2.setPosition(pos);
        this._entityManager.addEntity(e2);
        e2.setActive(false);

        pos = new THREE.Vector3(
            -40,
            0,
            90
        );
        const e3 = new entity.Entity();
        e3.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/pohon6/',
            resourceName: 'scene.gltf',
            scale: 40,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e3.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e3.setPosition(pos);
        this._entityManager.addEntity(e3);
        e3.setActive(false);

        pos = new THREE.Vector3(
            19,
            0,
            50
        );
        const e4 = new entity.Entity();
        e4.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/pohon6/',
            resourceName: 'scene.gltf',
            scale: 40,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e4.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e4.setPosition(pos);
        this._entityManager.addEntity(e4);
        e4.setActive(false);
        
        pos = new THREE.Vector3(
            -40,
            0,
            140
        );
        const e5 = new entity.Entity();
        e5.addComponent(new gltf.StaticModelComponent({
            scene: this._scene,
            resourcePath: './model/pohon6/',
            resourceName: 'scene.gltf',
            scale: 40,
            emissive: new THREE.Color(0x000000),
            specular: new THREE.Color(0x000000),
            receiveShadow: true,
            castShadow: true,
            rotation: [0, 3.14, 0],

        }) 
        );
        e5.addComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        e5.setPosition(pos);
        this._entityManager.addEntity(e5);
        e5.setActive(false);
    }

    loadPohonKeliling(){
        let xposisi = 155;
        let zposisi = 0;
        let xposisib = 140;
        let zposisib = 400;
        for(let i = 0; i < 17 ; i ++){
            let pos = new THREE.Vector3(
                xposisi-=1,
                0,
                zposisi+=20
            );
            const e2 = new entity.Entity();
            e2.addComponent(new gltf.StaticModelComponent({
                scene: this._scene,
                resourcePath: './model/pohon6/',
                resourceName: 'scene.gltf',
                scale: 40,
                emissive: new THREE.Color(0x000000),
                specular: new THREE.Color(0x000000),
                receiveShadow: true,
                castShadow: true,
                rotation: [0, 3.14, 0],

            }) 
            );
            e2.addComponent(
                new spatial_grid_controller.SpatialGridController({grid: this._grid}));
            e2.setPosition(pos);
            this._entityManager.addEntity(e2);
            e2.setActive(false);

            pos = new THREE.Vector3(
                xposisi*-1,
                0,
                zposisi
            );
            const e3 = new entity.Entity();
            e3.addComponent(new gltf.StaticModelComponent({
                scene: this._scene,
                resourcePath: './model/pohon6/',
                resourceName: 'scene.gltf',
                scale: 40,
                emissive: new THREE.Color(0x000000),
                specular: new THREE.Color(0x000000),
                receiveShadow: true,
                castShadow: true,
                rotation: [0, 3.14, 0],

            }) 
            );
            e3.addComponent(
                new spatial_grid_controller.SpatialGridController({grid: this._grid}));
            e3.setPosition(pos);
            this._entityManager.addEntity(e3);
            e3.setActive(false);

            pos = new THREE.Vector3(
                xposisib-=25,
                0,
                zposisib
            );
            const e4 = new entity.Entity();
            e4.addComponent(new gltf.StaticModelComponent({
                scene: this._scene,
                resourcePath: './model/pohon6/',
                resourceName: 'scene.gltf',
                scale: 40,
                emissive: new THREE.Color(0x000000),
                specular: new THREE.Color(0x000000),
                receiveShadow: true,
                castShadow: true,
                rotation: [0, 3.14, 0],

            }) 
            );
            e4.addComponent(
                new spatial_grid_controller.SpatialGridController({grid: this._grid}));
            e4.setPosition(pos);
            this._entityManager.addEntity(e4);
            e4.setActive(false);
        }
    }

    addPlayerCamera(){
        const camera = new entity.Entity();
        camera.addComponent(
            new third_person_camera.ThirdPersonCamera({
                camera: this._camera,
                target: this._entityManager.getEntities('player')}));
        this._entityManager.addEntity(camera, 'player-camera');
    }

    loadPlayer() {
        const params = {
            camera: this._camera,
            scene: this._scene,
        };
        const player = new entity.Entity();
        player.addComponent(new player_input.BasicCharacterControllerInput(params));
        player.addComponent(new player_entity.BasicCharacterController(params));
        player.addComponent(new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        this._entityManager.addEntity(player, 'player');

        this.addPlayerCamera();
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

    updateSun() {
        const player = this._entityManager.getEntities('player');
        const pos = player._position;
    
        this._sun.position.copy(pos);
        this._sun.position.add(new THREE.Vector3(-10, 500, -10));
        this._sun.target.position.copy(pos);
        this._sun.updateMatrixWorld();
        this._sun.target.updateMatrixWorld();
      }

    requestAnimation(){
        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
                this._previousRAF = t;
            }      
            if (this.isLoading) {
                this.updateLoadingBar(t - this._previousRAF)
            }
            if (this.audio.paused){
                this.audio.play();
            }
            this.requestAnimation();
            this._threeJS.render(this._scene, this._camera);
            this.step(t - this._previousRAF);
            this._previousRAF = t;
        });
    }

    step(timeElapsed) {
        const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);
        this.updateSun();
        this._entityManager.update(timeElapsedS);
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementsByClassName('button')[0];
  btn.addEventListener('click', e =>{    
    const landingLogo = document.querySelector('#landing-logo');
    landingLogo.style.visibility = 'hidden'

    const loading = document.querySelector('#lg-loading');
    loading.style.visibility = 'visible'
    _APP = new Main();
  })
});

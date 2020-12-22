import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export const entity = (() => {

  class Entity {
    constructor() {
      this._name = null;
      this._components = {};

      this._position = new THREE.Vector3();
      this._rotation = new THREE.Quaternion();
      this._handlers = {};
      this._parent = null;
    }

    registerHandler(n, h) {
      if (!(n in this._handlers)) {
        this._handlers[n] = [];
      }
      this._handlers[n].push(h);
    }

    setParent(p) {
      this._parent = p;
    }

    setName(n) {
      this._name = n;
    }

    getName() {
      return this._name;
    }

    setActive(b) {
      this._parent.setActive(this, b);
    }

    addComponent(c) {
      c.setParent(this);
      this._components[c.constructor.name] = c;

      c.initComponent();
    }

    getComponent(n) {
      return this._components[n];
    }

    findEntity(n) {
      return this._parent.getEntities(n);
    }

    broadcast(msg) {
      if (!(msg.topic in this._handlers)) {
        return;
      }

      for (let curHandler of this._handlers[msg.topic]) {
        curHandler(msg);
      }
    }

    setPosition(p) {
      this._position.copy(p);
      this.broadcast({
          topic: 'update.position',
          value: this._position,
      });
    }

    setQuaternion(r) {
      this._rotation.copy(r);
      this.broadcast({
          topic: 'update.rotation',
          value: this._rotation,
      });
    }

    update(timeElapsed) {
      for (let k in this._components) {
        this._components[k].update(timeElapsed);
      }
    }
  };

  class Component {
    constructor() {
      this._parent = null;
    }

    setParent(p) {
      this._parent = p;
    }

    initComponent() {}

    getComponent(n) {
      return this._parent.getComponent(n);
    }

    findEntity(n) {
      return this._parent.findEntity(n);
    }

    broadcast(m) {
      this._parent.broadcast(m);
    }

    update(_) {}

    registerHandler(n, h) {
      this._parent.registerHandler(n, h);
    }
  };

  return {
    Entity: Entity,
    Component: Component,
  };

})();
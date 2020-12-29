export const entity_manager = (() => {
    class EntityManager {
        constructor(){
            this._ids = 0;
            this._entitiesMap = {};
            this._entities = [];
        }

        generateName(){
            this._ids += 1;
            return '__name__' + this._ids;
        }

        getEntities(n) {
            return this._entitiesMap[n];
        }

        filterEntities(entity) {
            return this._entities.filter(entity);
        }

        setActive(e, b) {
            const i = this._entities.indexOf(e);
            if (i < 0) {
            return;
            }
    
            this._entities.splice(i, 1);
        }

        addEntity(entity, name) {
            if(!name){
                name = this.generateName();
            }
            this._entitiesMap[name] = entity;
            this._entities.push(entity);
            entity.setParent(this);
            entity.setName(name);
        }

        update(timeElapsed) {
            for (let e of this._entities) {
                e.update(timeElapsed);
            }
        }
    }

    return {
        EntityManager: EntityManager
    };
    
})();
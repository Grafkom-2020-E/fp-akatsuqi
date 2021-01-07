

export const finite_state_machine = (() => {

  class FiniteStateMachine {
    constructor() {
      this._states = {};
      this._currentState = null;
    }

    addState(name, type) {
      this._states[name] = type;
    }

    setState(name) {
      const prevState = this._currentState;
      
      if (prevState) {
        if (prevState.Name == name) {
          return;
        }
        prevState.exit();
      }

      const state = new this._states[name](this);

      this._currentState = state;
      state.enter(prevState);
    }

    update(timeElapsed, input) {
      if (this._currentState) {
        this._currentState.update(timeElapsed, input);
      }
    }
  };

  return {
    FiniteStateMachine: FiniteStateMachine
  };

})();
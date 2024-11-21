import Trigger from './trigger';
class StatesStore {
  constructor(name, defaultState) {
    this.name = name;
    this._store = {};
    this._defaultState = defaultState;
    this._trigger = new Trigger(name + '-trigger');
  }
  setDefaultState(states, isMerge) {
    this._defaultState = isMerge
      ? { ...this._defaultState, ...states }
      : states;
  }
  getDefaultState() {
    return this._defaultState;
  }
  // getStateConfig(key) {
  //   return this._store[key];
  // }
  setStates(key, states, isMerge) {
    // 当状态为null时，清空所有状态
    if (states == null) {
      delete this._store[key];
      return;
    }
    // 默认为merge模式
    if (isMerge !== false) {
      const oldStates = this.getStates(key) || {};
      this._store[key] = { ...oldStates, ...states };
    } else {
      this._store[key] = { ...states };
    }
  }
  getStates(key) {
    return this._store[key];
  }
  getState(key, stateName) {
    const states = this.getStates(key) || this._defaultState;
    return states && states[stateName];
  }
  onStateChange(stateName, name, onChange) {
    this._trigger.add(stateName, name, onChange);
    return this;
  }
  isEmpty() {
    return this._store == null || Object.keys(this._store).length == 0;
  }
  clear(states) {
    this._store = states || {};
  }
}

export default StatesStore;

import Configuration from '../../common/configuration';
import Decorator from '../../common/decorator';
import StatesStore from '../../services/state';
/**
 * 数据状态处理
 */
const DataState = Decorator.create({
  init(options) {
    this._dataStates = new StatesStore('DataStates', options.defaultItemState);
  },
  setDataState(stateName, state, data, options) {
    let states = {};

    states[stateName] = state;
    return this.setDataStates(states, data, options);
  },
  setDataStates(states, data, options) {
    const key = getStateKey(this, data);
    if (key) {
      const { apply, merge } = options || {};
      if (apply !== false) {
        const oldStates = this._dataStates.getStates(key);
        this.applyDataState(states, oldStates, data);
      }
      this._dataStates.setStates(key, states, merge);
    }
    return this;
  },
  getDataState(stateName, data) {
    const key = getStateKey(this, data);
    return key && this._dataStates.getState(key, stateName);
  },
  getDataStates(data) {
    const key = getStateKey(this, data);
    return key && this._dataStates.getStates(key);
  },
  applyDataState(states, oldStates, data) {
    const DataStateHandler = Configuration.get('DataStateHandler');
    Object.entries(states).forEach(([key, state]) => {
      const handler = DataStateHandler[key];
      if (handler) {
        handler(this, state, oldStates && oldStates[key], data);
      }
    });
  },
  getFieldDataState(stateName, data, field) {
    const key = getStateKey(this, data);
    if (key) {
      const state = this._dataStates.getState(key, stateName);
      if (state) {
        if (Array.isArray(state)) {
          return state.find((item) => item.field.name === field.name);
        } else {
          return state[field.name];
        }
      }
    }
  },
  // onDataStateChange(stateName, onChange) {
  //   this._dataStates.onStateChange(stateName, onChange);
  //   return this;
  // },
});

const DataListState = Decorator.create({
  init(options) {
    this._selectItems = [];
  },
  selectItems(items) {
    this._selectItems = items;
    return this;
  },
  getSelectedKeys(key) {
    key = key || this.getKey();
    return this._selectItems.map((item) => item[key]);
  },
  getSelectedItems() {
    return this._selectItems;
  },
});

function getStateKey(model, data) {
  if (typeof data === 'string') {
    return data;
  }
  return model.getItemVK ? model.getItemVK(data) : 'data';
}

export { DataListState, DataState };

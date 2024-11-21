/**
 * 模型上下文对象，主子模型共享
 */
export default class ModelContext {
  constructor(config) {
    this._context = {};
    this._triggers = {};

    config && this.set(config);
  }

  set(name, content) {
    let config;
    if(typeof name === 'object') {
      config = name;
    } else {
      config = {};
      config[name] = content;
    }
    
    Object.entries(config).forEach(([key, value]) => {
      const oldValue = this._context[key];
      this._context[key] = value;
      const trigger = this._triggers[key];
      if (trigger) {
        Object.entries(trigger).forEach(([name, callback]) => {
          callback(value, oldValue);
        });
      }
    });
    return this;
  }

  get(...keys) {
    if (keys.length > 1) {
      return keys.map(k => this._context[k]);
    }
    return this._context[keys[0]];
  }

  on(key, triggerName, callback) {
    if (key && triggerName && callback) {
      let trigger = this._triggers[key];
      if (trigger == null) {
        trigger = this._triggers[key] = {};
      }

      trigger[triggerName] = callback;
    }
  }

  off(key, triggerName) {
    if (key && triggerName) {
      let trigger = this._triggers[key];
      if (trigger && trigger[triggerName]) {
        delete trigger[triggerName];
      }
    }
  }
}

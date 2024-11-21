class Trigger {
  constructor(name) {
    this.name = name;
    this._store = {};
  }
  add(name, triggerName, callback) {
    let triggers = this._store[name];
    if(triggers == null) {
      triggers = this._store[name] = {};
    }
    triggers[triggerName] = callback;
    return this;
  }
  remove(name,triggerName) {
    if(triggerName) {
      let triggers = this._store[name];
      if(triggers) {
        delete triggers[triggerName];
      }
    } else {
      delete this._store[key];
    }
  }
  run(name, args, excludes ) {
    let triggers = this._store[name];
    if(triggers) {
      Object.entries(triggers).forEach(([triggerName, callback]) => {
        if(excludes && excludes.includes(triggerName)) {
          return;
        }
        callback.apply(null, args);
      });
    }
  }
}

export default Trigger;
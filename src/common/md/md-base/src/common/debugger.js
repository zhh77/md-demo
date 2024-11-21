let _debugger = {
    model: null,
    field: null,
    trigger: null,
  },
  _debuggerType;

const DebuggerTypes = {
  ModelTrigger: 'ModelTrigger',
  FieldTrigger: 'FieldTrigger',
  Model: 'Model',
  Field: 'Field',
};

const ModelDebugger = {
  isDebug() {
    return _debuggerType != null;
  },
  debugModel(model) {
    return isDebugModel(model) && _debuggerType === DebuggerTypes.Model;
  },
  debugField(field) {
    return this.debugModel(field.model) && field.name === _debugger.field;
  },
  debugModelTrigger(model, triggerName) {
    return this.debugModel(model) && triggerName === _debugger.trigger;
  },
  debugFieldTrigger(field, triggerName) {
    return this.debugField(field) && triggerName === _debugger.trigger;
  },
  start(options) {
    this.set(options);
  },
  end() {
    this.set();
  },
  set(options) {
    _debugger = options;
    if (_debugger) {
      const { model, trigger, field } = _debugger;
      if (model) {
        if (trigger) {
          _debuggerType = field ? DebuggerTypes.FieldTrigger : DebuggerTypes.ModelTrigger;
        } else {
          _debuggerType = field ? DebuggerTypes.Field : DebuggerTypes.Model;
        }
      }
    } else {
      _debugger = _debuggerType = null;
    }
  },
};
function isDebugModel(model, type) {
  return _debuggerType && model._originName === _debugger.model;
}

export default ModelDebugger;

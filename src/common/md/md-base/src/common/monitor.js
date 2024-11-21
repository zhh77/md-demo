import ModelDebugger from './debugger';
import RunningMap from './runningMap';
import GlobalVariable from './global';

const Monitor = {
  onModelCreate(model) {
    if (ModelDebugger.debugModel(model)) {
      debugger;
    }
  },
  onDataModelInit() {
    
  },
  onFieldCreate(field) {
    if (ModelDebugger.debugField(field)) {
      debugger;
    }
  },
  onFieldEndInit(field) {},
  onModelEndInit(model) {
    RunningMap.addModel(model);
  },
  onTrigger(trigger) {
    RunningMap.addTrigger(trigger);

    if (ModelDebugger.isDebug()) {
      const { target } = trigger;
      if (ModelDebugger[target.__mdField ? 'debugFieldTrigger' : 'debugModelTrigger'](target, name)) {
        debugger;
      }
    }
  },
  onLinkTrigger(field, name, linkFields, args) {
    RunningMap.addFieldTrigger(field, name, linkFields, args);
    if (ModelDebugger.debugFieldTrigger(field, name)) {
      debugger;
    }
  },
  startRecord() {
    return RunningMap.start();
  },
  endRecord() {
    return RunningMap.end();
  },
  startDebug(options) {
    ModelDebugger.start(options);
    return 'MD动态调试--开启........';
  },
  endDebug() {
    ModelDebugger.end();
    return 'MD动态调试--关闭........';
  },
};

GlobalVariable.attach({
  startRecord: Monitor.startRecord,
  endRecord: Monitor.endRecord,
  startDebug: Monitor.startDebug,
  endDebug: Monitor.endDebug,
});

export default Monitor;

let _models, _isRecord, _links, _tree, _currentGroup;

const RunningMap = {
  start() {
    _isRecord = true;
    _models = [];
    _links = [];
    _tree = {};
  },
  end() {
    _isRecord = false;
    return {
      models: _models,
      trigger: _links,
    };
  },
  addModel(model) {
    if (_isRecord) {


      let modelRecord = {
        name: model._modelName,
        // path: model._path,
        id: model._mdId,
        paths: model._idPaths,
        title: model._modelTitle,
        origin: model._originName,
        type: model.getModelType(),
        fields: model._fields.map(field => ({
          name: field.name,
          title: field.title,
          dataType: field.dataType,
          bizType: field.bizType,
          fieldModel: field.fieldModel && field.fieldModel._mdId,
        })),
        rt: Date.now(),
      };

      if (model.filterModel) {
        modelRecord.filterModel = {
          id: model.filterModel._mdId,
          name: model.filterModel._modelName,
          title: model.filterModel._modelTitle,
        };
      }


      _models.push(modelRecord);
    }
  },
  addTrigger(trigger) {
    if (_isRecord) {
      const { target } = trigger;

      if (target.__mdField) {
        trigger.target = `${target.model._mdId}.${target.name}`;
        trigger.type = 'field';
      } else if (target.__mdModel) {
        trigger.target = `${target._mdId}`;
        trigger.type = 'model';
      }
      // delete trigger.target;

      // const value = trigger.value;
      // if (value != null && value.clone) {
      //   trigger.value = JSON.stringify(value.clone());
      // }
      trigger.rt = Date.now();
      _links.push(trigger);
    }
  },
  // addModelTrigger(model, name, path, type, value) {
  //   if (_isRecord) {
  //     this.addTrigger({
  //       model,
  //       name,
  //       path,
  //       trigger: model._mdId,
  //       triggerType: 'model',
  //       triggerMethod: type,
  //       value,
  //     });
  //   }
  // },
  addFieldTrigger(field, name, links, args) {
    if (_isRecord) {
      const model = field.model;
      const len = args.length;
      // const value = args && args.length > 3 && args.slice(args.length - 3);
      links = links.map(link => link.name || link);
      const changes = args[len - 2];

      this.addTrigger({
        target: field,
        name,
        path: `${model.getModelName()}.${name}`,
        changeFields: Object.keys(changes),
        event: 'fieldLink',
        value: {
          data: args[len - 4],
          changes: changes,
          oldData: args[len - 3],
        },
      });
    }
  },
};

class ModelTree{
  constructor(options) {
    this.parent = null;
    this.group = [];
    this.map = {};
  }

  input(model) {
    const scope = this.queue.length;

    this.group.push(model)
  }

  output() {

  }
}

export default RunningMap;

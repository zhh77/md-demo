
import { OriginModel, DataListModel, DataModel } from './model';
import { BaseField, DataField } from './field';
import TypeHandlerFactory from './field/typeHandler';

const Main = {
  create(options) {
    return new OriginModel(options);
  },
  // createModel(options) {
  //   return this.create(options);
  // },
  createDataModel(options, instantiation) {
    const model = this.create({ modelType: 'data', ...options });
    return instantiation ? model.create() : model;
  },
  createDataListModel(options, instantiation) {
    const model = this.create({ ...options, modelType: 'list' });
    return instantiation ? model.create() : model;
  },
  isModel(model) {
    return model instanceof OriginModel;
  },
  isDataModel(model) {
    return model instanceof DataModel || model instanceof DataListModel;
  },
  isBaseField(field) {
    return field instanceof BaseField;
  },
  isDataField(field) {
    return field instanceof DataField;
  },
  createBaseField(field) {
    const name = field.name || field.key;
    return new BaseField(name, field);
  },
  createDataField(field, model) {
    const name = field.name || field.key;
    return new DataField(name, field, model);
  },
  // getModelHandler(model) {
  //   return new ModelHandler(model);
  // },
  registerExtendType(types) {
    TypeHandlerFactory.register(types, 'extend');
  },
  registerBizType(types) {
    TypeHandlerFactory.register(types, 'biz');
  },
  getTypeHandler(type) {
    return TypeHandlerFactory.getTypeHandler(type);
  },
  getLoadPromise(promises) {
    const list = promises.map(p => {
      if(p == null || p.then) {
        return p;
      }
      return p.getLoadPromise ? p.getLoadPromise() : p.loadPromise;
    })
    return Promise.all(list);
  }
};

export default Main;

import { DataHelper } from '../common/help';
import { OriginModel } from '../model';

const extendKeys = ['fields', 'action'];

/**
 * 模型工厂，可以设置基类和子类模型，可以根据不同类型获取子类模型
 */
class ModelFactory {
  constructor(base, models) {
    this.baseModel = base instanceof OriginModel ? base : new OriginModel(base);
    this.modelsConfig = models;
  }
  getModel(name, extend) {
    if (name) {
      const modelConfig = this.modelsConfig[name];
      let model = this.baseModel.extend(modelConfig);

      if (this._extend && this._extend[name]) {
        model = model.extend(this._extend[name]);
      }
      return model.create(extend);
    }

    return this.baseModel.create(extend);
  }

  extendBase(extend) {
    this.baseModel = this.baseModel.extend(extend);
  }
  extendModels(extend) {
    if (this._extend == null) {
      this._extend = { ...extend };
    } else {
      Object.entries(extend).forEach(([name, extendConfig]) => {
        if (extendConfig == null) {
          return;
        }
        let modelConfig = this._extend[name];
        if (modelConfig == null) {
          this._extend[name] = extendConfig;
        } else {
          DataHelper.mergeChildren(modelConfig, extendConfig, extendKeys);

          extendKeys.forEach((key) => {
            const childExtend = extendConfig[key];
            if (childExtend) {
              let childConfig = modelConfig[key];
              if (childConfig == null) {
                modelConfig[key] = childExtend;
                return;
              }
              DataHelper.mergeChildren(childConfig, childExtend);
            }
          });
          // // 字段的扩展
          // if (extendConfig.fields && modelConfig.fields) {
          //   let extendFields = { ...extendConfig.fields };

          //   modelConfig.fields.forEach((field) => () => {
          //     const extendField = extendFields[field.name];
          //     if (extendField) {
          //       delete extendFields[field.name];
          //       DataHelper.mergeChildren(filed, extendField);
          //     }
          //   });

          //   Object.entries(extendFields).forEach(([name, extendField]) => {
          //     extendField && modelConfig.fields.push({ name, ...extendField });
          //   });
          // }
        }
      });
    }
  }
}

export default ModelFactory;

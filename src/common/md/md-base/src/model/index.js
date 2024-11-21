import { DataHelper, ModelHelper } from '../common/help';
import BaseModel from './base';
import DataModel from './data';
import ModelDecorator from './decorator';
import DataListModel from './list';
/**
 * 元模型
 */
export class OriginModel extends BaseModel {
  constructor(options) {
    super(options);
    this._initOptions = { ...options, fields: null };
  }

  init(options) {
    ModelDecorator.attach(this, options);
  }

  getModelType() {
    return 'Origin';
  }

  getOptions() {
    return this._initOptions;
  }

  /**
   * 扩展元模型
   * @param {*} options 模型配置
   * @param {*} additionalFields 新添加的字段
   * @returns
   */
  extend(options, additionalFields) {
    let newOptions = extendOptions(this, options);
    if (additionalFields && additionalFields.length) {
      additionalFields.forEach((field) => {
        if (Array.isArray(field)) {
          newOptions.fields = [...newOptions.fields, ...field];
        } else {
          newOptions.fields.push(field);
        }
      });
    }
    return new OriginModel(newOptions);
  }

  extendFields(fields) {
    return ModelHelper.getExtendFields(this, fields);
    // 数组模式时，是替换模式，会用新的fileds替换原有的field
    // if (Array.isArray(fields)) {
    //   return ModelHelper.mapFields(fields, (name, extend) => {
    //     const field = this[name];
    //     return field ? field.extend(extend) : { ...extend, name };
    //   });
    // } else {
    //   // 对象模式时，是扩展模式，在原有的模型上面扩展和追加
    //   const newFields = ModelHelper.mapFields(this.getFields(), (name, field) =>
    //     field.extend(fields && fields[name])
    //   );

    //   if (fields) {
    //     // 追加新字段
    //     ModelHelper.mapFields(fields, (name, extend) => {
    //       if (this[name] == null) {
    //         newFields.push({ ...extend, name });
    //       }
    //     });
    //   }

    //   return newFields;
    // }
  }

  create(options) {
    let ops = extendOptions(this, options);
    const modelType = ops.modelType && ops.modelType.toLowerCase();

    // ops.originModel = this;
    switch (modelType) {
      // case 'tree':
      case 'list':
        if (this._initOptions.filter) {
          ops.filter = Object.assign(ops.filter, this._initOptions.filter);
        }
        // ops.filterFields = copyModelFields(this, ops.filterFields);
        // ops.itemFields = copyModelFields(
        //   this,
        //   ops.itemFields || (ops.itemModel && this.cloneFields())
        // );
        return new DataListModel(ops);
      default:
        return new DataModel(ops);
        break;
    }
  }

  /**
   * 创建数据模型
   * @param {object} options
   * @returns
   */
  createDataModel(options) {
    return this.create({ ...options, modelType: 'data' });
    // return this.buildDataModel(options).create();
  }
  /**
   * 创建数据模型
   * @param {object} options
   * @returns
   */
  createListModel(options) {
    return this.create({ ...options, modelType: 'list' });
  }

  getFields(options) {
    // nameMode 只获取名字，
    let { fields, excludeFields, nameMode } = options || {};

    let filterFields = [],
      filter;
    if (fields) {
      filter = (field) => fields.includes(field.name);
    } else if (excludeFields) {
      filter = (field) => !excludeFields.includes(field.name);
    }

    if (filter) {
      this._fields.forEach((field) => {
        if (filter(field)) {
          filterFields.push(field);
        }
      });
    } else {
      filterFields = [...this._fields];
    }

    return nameMode ? filterFields.map((field) => field.name) : filterFields;
  }

  extendAction(action) {
    if(action) {
      if(this._initOptions.action == null) {
        this._initOptions.action = action
      } else {
        DataHelper.mergeChildren(this._initOptions.action, action);
      }
    }
  }
}

function extendOptions(model, options) {
  let ops,
    originOps = model._initOptions,
    fields;
  if (options) {
    let props = originOps.props;
    if (options.props) {
      props = props ? { ...props, ...options.props } : options.props;
    }

    fields = options.fields;

    ops = DataHelper.deepClone({
      ...originOps,
      ...options,
      props,
      fields: null,
    });
    if(originOps.action && options.action) {
      ops.action = {...originOps.action};
      DataHelper.mergeChildren(ops.action, options.action);
    }
    // 合并action
    // options.action && DataHelper.mergeChildren(ops.action, originOps.action);
  } else {
    ops = originOps;
  }

  if (fields == null) {
    ops.fields = model.cloneFields();
  } else if (options.replaceFields === true) {
    ops.fields = copyModelFields(model, fields);
  } else {
    ops.fields = model.extendFields(fields);
  }
  return ops;
  //添加扩展字段
  // if (ops.extendFields) {
  //   mergeExtendFields(ops.fields, ops.extendFields);
  // }
}

const copyModelFields = (model, fields) => {
  if (fields && fields.length) {
    return fields.map((field) => {
      return typeof field === 'string' ? model.getField(field) : field;
    });
  }
  return fields;
};

function mergeExtendFields(originFields, extendFields) {
  let fieldsObj = {};
  originFields.forEach((field) => {
    fieldsObj[field.name] = field;
  });
  extendFields.forEach((extendField) => {
    let field = fieldsObj[extendField.name];
    if (field) {
      Object.assign(field, extendField);
    } else {
      originFields.push(field);
    }
  });
}

export { DataListModel, DataModel };

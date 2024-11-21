import { DataHelper, ModelHelper, ModelLogger } from "../common/help";
import Monitor from "../common/monitor";
import FieldFactory from "../field";
import { ITypeHandler } from "../interface";
import ModelContext from "../services/context";
import ModelDecorator from "./decorator";

let id = 0;
/**
 * 模型基类
 */
export default class BaseModel extends ITypeHandler {
  constructor(options) {
    super();
    this.__inited = false;

    const {
      fields,
      title,
      name,
      props,
      onInit,
      enableLink = true,
      enableValidate,
      originName,
      path,
      parentPaths,
      dynamicField,
    } = options;

    let model = this;
    this._fields = [];
    this._modelName = name;
    this._originName = originName || name;
    this._modelTitle = title;
    this._mdId = id++;
    this._path = `${path ? path + "." : ""}${name}(${this._mdId})`;
    this._idPaths = parentPaths ? [...parentPaths, this._mdId] : [this._mdId];
    this._enableValidate = enableValidate;
    this.__mdModel = this.getModelType();
    // 动态字段模式，开启后，字段变更会重新渲染
    if (dynamicField) {
      this._dynamicField = dynamicField;
    }

    // 内部控制器, enableLink:是否开启字段联动，loaded是否已经使用query加载数据
    this.__controller = { enableLink, loaded: false };

    // 是否开启严格模式,默认开启，会对store的数据进行convert并剔除不包含field的数据
    this._strictMode = options.strictMode ? options.strictMode : null;
    this._triggerTime = options.triggerTime || 100;

    // 当时field创建的fieldModel时，会记录关联信息
    // if (bindField) {
    //   this._bindField = `${bindField.model.getModelName()}.${bindField.name}`;
    // }

    // 是否元模型
    const isNotOrigin = this.getModelType() !== "Origin";
    this.init(options);

    // 创建模型上下文对象，如果是子模型时会传递上下文对象
    const mdContext = isNotOrigin ? options.mdContext : null;
    this.mdContext =
      mdContext instanceof ModelContext
        ? mdContext
        : new ModelContext(mdContext);
    // 当没有父模型，且没有设置根模型时，将当前模型设置为根模型
    if (this._idPaths.length === 1 && this.mdContext.get("rootModel") == null) {
      this.mdContext.set("rootModel", this);
    }

    // 添加装饰器
    ModelDecorator.attach(this, options);

    Monitor.onModelCreate(this);

    if (isNotOrigin) {
      // 记录元模型
      // if(options.originModel) {
      //   this._originModel = options.originModel;
      // }
      // 初始化事件， 此时只完成了model的基础初始化，字段还未初始化
      onInit && onInit.call(this, options);
      props && this.addProps(props);
    }

    // 初始化字段
    if (fields) {
      ModelHelper.mapFields(fields, (name, fieldOps) => {
        if (name == null) {
          ModelLogger.warn("CreateModel", model, fieldOps, "name为空");
          return;
        }

        if (fieldOps == null) {
          ModelLogger.warn("CreateModel", model, name, "字段配置为空");
          return;
        }

        if (fieldOps.key == null) {
          fieldOps.key = fieldOps.name || name;
        }

        let field = model.createField(name, fieldOps, false);

        //注册到模型上
        model[name] = field;

        //设置主键
        if (model._keyField == null && field.isKey) {
          model._keyField = field;
        }

        if (field.dataType === "children") {
          model._childrenField = field;
        }

        // fields数组，记录字段顺序
        model._fields.push(field);
      });

      // 执行字段初始化完成事件
      if (isNotOrigin) {
        ModelHelper.mapFields(fields, (name, fieldOps) => {
          const field = model[name];
          field && field._innerInit();
        });
      }
    }

    // 执行初始化事件
    // options.onInit && options.onInit(this, options);
    this._innerInit(options);
    this.__inited = true;
  }

  init() {}

  _innerInit() {}

  getModelName() {
    return `${this._modelName}(${this._mdId})`;
  }
  // 获取根模型
  getRootModel() {
    return this.mdContext.get("rootModel") || this;
  }
  /**
   * 根据路径获取当前模型下的子模型
   * @param {*} path
   * @returns
   */
  getModel(path) {
    if (!path) {
      return;
    }
    let targetModel = this;
    const paths = path.split(".");
    const root = paths[0];

    // 根节点模式
    if (root === "root") {
      paths.shift();
      targetModel = this.getRootModel();
    }
    // todo，父级查询
    // else if(root === 'parent') {

    // }

    const result = targetModel.getField(paths);
    // if (Array.isArray(result)) {
    //   return [result[0] && result[0].fieldModel, result[1]];
    // }
    return result && result.fieldModel;
  }

  /**
   * 根据路径获取模型内联字段，包括模型字段或者子模型字段
   * @param {String} field 字段名或者路径
   * @param {Object} options  配置项，item:列表项数据，列表传入时，可以获取动态渲染字段, chain:链模式，如果路径模式会返回创建一个新的带chain模式的field
   * @returns {MDField} 当有data参数时返回匹配的字段和数据数组[field, value];
   */
  getField(field, options) {
    if (field.__mdField) {
      return field;
    }

    const { item, chain } = options || {};

    let paths;
    if (typeof field === "string") {
      paths = field.split(".");
    } else if (Array.isArray(field)) {
      paths = field;
    }

    if (paths) {
      if (paths.length === 1) {
        field = this[paths[0]];
        if (FieldFactory.isField(field)) {
          // 如果是列表模型,传入数据时，会优先获取动态渲染字段
          return item ? field.getRenderField(item) || field : field;
        }
      } else {
        const chainConfig = ModelHelper.getFieldChain(this, paths, item, true);

        return chain ? chainConfig.chainField : chainConfig.field;
        // let current = this,
        // idx = 0,
        // len = paths.length,
        // keys = [];

        // while (current && idx < len) {
        //   // 为模型对象时
        //   if (current.__mdModel) {
        //     current = current[paths[idx]];
        //   } else if (current.fieldModel) {
        //     // 为字段子模型时
        //     current = current.fieldModel[paths[idx]];
        //   }
        //   idx++;
        // }
        // field = current;
      }
    }

    return null;
  }

  /**
   * 获取模型字段，
   * @param {*} fields 空：获取全员；数组：获取在模型中的字段数组，不在模型中则会过滤掉；字符：获取单个；
   * @param {*} options  配置项，item:列表项数据，列表传入时，可以获取动态渲染字段, chain:链模式，如果路径模式会返回创建一个新的带chain模式的field
   * @returns
   */
  getFields(fields, options) {
    let model = this;
    if (fields == null) {
      fields = model._fields;

      if (options?.item == null) {
        return fields;
      }
    }
    let result = [];
    if (Array.isArray(fields)) {
      fields.forEach((field) => {
        let resultField = this.getField(field, options);
        // // 如果是否为模型字段
        // if (field.model === model) {
        //   resultField = field;
        // } else {
        //   resultField = model[field.name || field];
        // }
        // // 如果是列表模型，且存在动态渲染字段时
        // if (item && model.getItemVK && field._renderFields) {
        //   const vk = model.getItemVK(item);
        //   if (vk) {
        //     resultField = field._renderFields[vk] || resultField;
        //   }
        // }
        resultField && result.push(resultField);
      });
    }
    return result;
    // return model[fields.name || fields];
  }

  /**
   * 克隆字段，可扩展字段
   * @param {Array|Object} fields
   * @returns
   */
  cloneFields(fields) {
    if (fields == null) {
      return this.getFields().map((field) => field.extend());
    }

    let cloneFields;
    if (Array.isArray(fields)) {
      cloneFields = [];
      fields.forEach((field) => {
        const cloneField = this.getField(field);
        cloneField &&
          cloneFields.push(
            cloneField.extend(typeof field === "object" ? field : null)
          );
      });
      // const fieldList = this.getFields(fields);
      // return fieldList.map((field) =>
      //   field.extend(fieldsExtends && fieldsExtends[field.name])
      // );
    } else {
      cloneFields = {};
      Object.entries(fields).forEach(([name, extend]) => {
        const field = this.getField(name);
        if (field) {
          const cloneField = field.extend(extend);
          // 当字段名变更后，更新字段的key
          if (extend && extend.key == null && cloneField.name != field.name) {
            cloneField.key = cloneField.name;
          }
          cloneFields[cloneField.name] = cloneField;
        }
      });
    }
    return cloneFields;
  }

  getKey() {
    // 如果有设置虚拟key，优先返回
    return this._vk || (this._keyField && this._keyField.key);
  }

  getKeyField() {
    return this._keyField;
  }

  /**
   * 创建字段方法，根据不同类型的模型，重载创建不同类型的字段
   * @param {*} name
   * @param {*} field
   * @param {boolean} isModelCreate
   * @returns
   */
  createField(name, field, isModelCreate) {
    if (typeof name === "object" && name.name) {
      field = name;
      name = field.name;
    }

    const mdField = FieldFactory.create(name, field, this);
    if (!isModelCreate && mdField) {
      mdField._innerInit();
    }
    return mdField;
  }

  addProps(props) {
    Object.assign(this, props);
    return this;
  }

  /**
   * 运行模型的原型链方法，在扩展了模型props后可以通过此方法调用原方法
   * @param {*} name
   * @param  {...any} args
   * @returns
   */
  callBase(name, ...args) {
    const fn = this.__proto__[name];
    return fn && fn.apply(this, args);
  }

  /**
   * 获取默认的数据，在reset和list insert时会生效
   * @param {*} options
   * @returns
   */
  getDefaultData(options) {
    const { initData, params } = options || {};
    let newData = {};
    this._fields.forEach((field) => {
      let value;
      //有关联字段时
      if (field._linkField) {
        value = field._linkField.getValue();
      } else {
        value = field.getDefaultValue(params);
      }

      value != null && field.setValue(value, newData);
    });
    return initData ? Object.assign(newData, initData) : newData;
  }
}

/**
 * 数据模型基类
 */
export class DataBaseModel extends BaseModel {
  constructor(options) {
    super(options);

    // 验证结果
    this._validateResult = [];

    // 如果开启应用默认数据，则进行赋值
    if (options.enableInitData) {
      const defaultData = this.getDefaultData();
      if (defaultData != null) {
        this.setStore(defaultData);
      }
    }

    if (options.data) {
      // 初始化数据作为原始数据保存，在reset中会使用
      this.setData(options.data);
      this.setOriginData(options.data);
    }

    // 执行字段初始化完成事件
    this._fields.forEach((field) => {
      if (field.onEndInit) {
        const result = field.onEndInit();
        // 根据返回值更新模型
        if (result) {
          field.update(result, false);
        }
      }
    });

    // 初始化完成事件，只有数据模型有初始化完成
    options.onEndInit && options.onEndInit.call(this, options);
    Monitor.onModelEndInit(this);
  }

  getModelType() {
    return "DataBase";
  }

  init(options) {
    // // 创建模型上下文对象，如果是子模型时会传递上下文对象
    // const mdContext = options.mdContext;
    // this.mdContext = mdContext instanceof ModelContext ? mdContext : new ModelContext(mdContext);
    // // 当没有父模型，且没有设置根模型时，将当前模型设置为根模型
    // if (this._idPaths.length === 1 && this.mdContext.get('rootModel') == null) {
    //   this.mdContext.set('rootModel', this);
    // }
    // // 添加装饰器
    // ModelDecorator.attach(this, options);
  }

  _innerInit() {}

  // async query(params, config, isStore) {
  //   let data = await this._storeHandler.query(params, config);
  //   if (isStore != null) {
  //     this.setData(data);
  //     this.__controller.loaded = true;
  //   }
  //   return data;
  // }

  /**
   * 获取模型数据，如果有行为配置，会自动执行query，会等待联动计算和监听事件处理完
   * @param {Object|Array|Boolean}} options 配置项，fields：指定字段，reload：是否强制重新加载数据
   * @returns {Object}
   */
  async getData(options) {
    let fields,
      reload = false;

    if (Array.isArray(options)) {
      fields = options;
    } else if (typeof options === "boolean") {
      fields = options;
    } else if (typeof options == "object") {
      fields = options.fields;
      reload = options.reload;
    }

    if (typeof fields === "boolean") {
      fields = this._fields;
    }

    // 手动更新或者，当没有数据时且有行为配置且没有进行query时，先query，然后通过setData赋值
    if (
      reload ||
      (this.isEmpty() &&
        this._dataAction.config &&
        this.__controller.loaded === false)
    ) {
      let data = await this.query();
      this.setData(data);
    }
    await this.watcher.pending;
    let data = this.getStore(fields);

    return fields ? data : this.convert(data);
  }

  /**
   * 获取模型存储的数据，keys获取的
   * @param {*} fields 是否根据字段获取，true为根据模型字段获取，[]为指定的字段
   * @returns {Object}
   */
  getStore(fields) {
    // 为true时会根据字段获取数据
    if (typeof fields === "boolean") {
      fields = this._fields;
    }
    return this._storeHandler.getStore(fields);
  }

  /**
   * 设置模型数据
   * @param {object|array} data
   * @param {object} options
   * @returns
   */
  async setData(data, options) {
    const result = this.setStore(data, options);
    await this.refresh();
    return result;
  }

  // /**
  //  *
  //  * @param {*} actionName
  //  * @param {*} params
  //  * @returns
  //  */
  // getActionParams(actionName, params) {
  //   // if (params == null && (actionName === 'query' || actionName === 'delete')) {
  //     // const keyField = this.getKeyField();
  //     // if (keyField != null) {
  //     //   const value = keyField.getValue();
  //     //   if (value != null) {
  //     //     let paramData = {};
  //     //     keyField.setValue(value, paramData);
  //     //     return paramData;
  //     //   }
  //     // }

  //     return this._storeHandler.getActionParams(actionName, params);
  //   // }

  // }

  /**
   * 数据验证
   * @param {*} options
   * @returns
   */
  async validate(options) {
    if (this._enableValidate === false) {
      return {};
    }

    let { data, fields, checkAll, openState } = options || {};

    let validMe = false,
      errorFields = {},
      hasError = false;

    if (data == null) {
      data = this.getStore();
      validMe = true;
    }

    let checkFields = this.getFields(fields, data);
    let fieldValid, fieldValue;
    for (let i = 0, fld; (fld = checkFields[i]); i++) {
      if (fld.isValid != false) {
        fieldValue = fld.getValue(data);
        fieldValid = await fld.validateValue(fieldValue, data, {
          openState: validMe || openState,
          checkAll,
        });
        if (typeof fieldValid === "boolean") {
          if (fieldValid.success === false) {
            hasError = true;
            errorFields[fld.name] = {
              field: fld,
              success: false,
              message: `【${fld.title}】验证失败！`,
              ruleValue: fieldValue,
              success: false,
            };
          }
        } else if (fieldValid && fieldValid.success !== true) {
          hasError = true;
          if (fieldValid.faults) {
            Object.assign(errorFields, fieldValid.faults);
            // validResult = validResult.concat(fieldValid.faults);
          } else {
            errorFields[fld.name] = fieldValid;
            // validResult.push(fieldValid);
          }

          // return checkAll ? false : true;
        }

        if (hasError && !checkAll) {
          break;
        }
      }
    }
    // this.getFields().find(fld => {

    // });

    // 当验证模型内数据时，记录验证状态
    if (validMe || openState) {
      this._validateResult = errorFields;
      this.setDataState("error", errorFields, data);
    }

    return {
      success: !hasError,
      faults: hasError ? errorFields : null,
    };
  }

  /**
   * 模型刷新方法，不执行具体动作，主要对外做监控和触发控制
   * @param {boolean} ignoreValidator 是否忽略验证
   * @returns {boolean} 是否刷新成功
   */
  refresh(ignoreValidator) {
    // const result = ignoreValidator || this._validateResult == null ? true : this._validateResult.length === 0;
    return this.throttleTrigger("refresh", () => {
      return ignoreValidator || this._validateResult == null
        ? true
        : this._validateResult.length === 0;
    });
  }

  /**
   * 注册监听模型内容刷新的方法
   * @param {*} name
   * @param {*} callback
   * @param {boolean} isBefore 是否在执行之前触发
   * @param {*} mode
   */
  onRefresh(name, callback, isBefore, mode) {
    if (callback) {
      const method = isBefore ? "onBefore" : "on";
      const path = `${this.getModelName()}-${name}{onRefresh}`;
      const key = "refresh";
      this[method](
        key,
        name,
        () => {
          const data = this.getStore();
          Monitor.onTrigger({
            target: this,
            name,
            path,
            event: `onRefresh-${method}`,
            value: data,
          });
          callback(data);
        },
        mode
      );
      return { key, name };
    }
    return [];
  }
  offRefresh(name) {
    return this.off("refresh", name);
  }
  /**
   * 触发字段更新联动
   */
  _triggerChange() {
    return this.throttleTrigger("_triggerChange");
  }
  /**
   * 注册监听模型store数据变更的方法
   * @param {*} name
   * @param {*} callback
   * @param {*} mode
   */
  onChange(name, callback, mode) {
    if (callback) {
      const path = `${this.getModelName()}-${name}{onChange}`;
      const key = "_triggerChange";
      this.on(
        key,
        name,
        () => {
          const data = this.getStore();
          Monitor.onTrigger({
            target: this,
            name,
            path,
            event: "onChange",
            value: data,
          });
          callback(data);
        },
        mode
      );
      return { key, name };
    }
    return [];
  }

  offChange(name) {
    return this.off("_triggerChange", name);
  }

  format(data) {
    return data;
  }

  convert(data, force) {
    const type = DataHelper.getDataType(data);
    if (data && (force || this._strictMode)) {
      const fields = this.getFields();
      if (type === "array") {
        return data.map((item) => ModelHelper.convertByFields(fields, item));
      } else if (type === "object") {
        return ModelHelper.convertByFields(fields, data);
      }
      return null;
    }
    return data;
  }
  /**
   * 清除内部标识数据
   * @param {*} data
   * @returns
   */
  trim(data) {
    if (data == null) {
      data = this._store;
    }

    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item._mKey) {
          delete item._mKey;
        }
      });
    } else if (data._mKey) {
      delete data._mKey;
    }
    return data;
  }

  // watch(name, fields, callback, mode) {
  //   this.watcher.on(name, fields, callback, mode);
  //   return this;
  // }

  // syncWatch(name, fields, callback, mode) {
  //   this.watcher.syncOn(name, fields, callback, mode);
  //   return this;
  // }

  // offWatch(name, isSync) {
  //   this.watcher.off(name, isSync);
  //   return this;
  // }

  // applyChange() {
  //   this.watcher.apply();
  // }

  getKeyValue(data) {
    if (this._keyField) {
      return this._keyField.getValue(data);
    }
  }
  isEmpty() {
    return this._store == null;
  }

  // 设置原始数据，原始数据会在reset中使用
  setOriginData(data) {
    this.__originData = data && { ...data };
  }

  reset() {
    this.setData(this.__originData || this.getDefaultData());
  }

  /**
   * 值应用，会取到传入的字段数据，执行callback方法，返回callback的值
   * @param {} fields
   * @param {*} callback
   * @param {*} data
   * @returns
   */
  valueApply(fields, callback, data) {
    return applyFields(this, "getValue", fields, callback, data);
  }

  /**
   * 值应用，会取到传入的字段格式化的数据，执行callback方法，返回callback的值
   * @param {} fields
   * @param {*} callback
   * @param {*} data
   * @returns
   */
  formatApply(fields, callback, data) {
    return applyFields(this, "formatByData", fields, callback, data);
  }

  /**
   * 使用值，根据fields参数，返回值数组
   * @param {array} fields
   * @param {object} data
   * @returns {array}
   */
  useValues(fields, data) {
    const isSingle = !Array.isArray(fields);
    if (isSingle) {
      fields = [fields];
    }
    const values = applyFields(this, "getValue", fields, null, data);
    return isSingle ? values[0] : values;
  }

  /**
   * 设置字段的值
   * @param {object} values
   * @param {object} data
   */
  setFieldsValue(values, data) {
    if (values == null || (data == null && this.getModelType() === "List")) {
      return;
    }

    Object.entries(values).forEach(([name, value]) => {
      const field = this.getField(name);
      if (field) {
        field.setValue(value, data);
      } else if (!this._strictMode) {
        DataHelper.setValue(data, name, value);
      }
    });
  }

  /**
   * 识别新增和保存，进行操作，需设置keyField
   * @param {*} data
   * @returns
   */
  async save(data) {
    data = data || this.getStore();
    return this.isNew(data) ? this.insert(data) : this.update(data);
  }

  /**
   * 判断是否新增数据，需设置keyField
   * @param {*} data
   * @returns
   */
  isNew(data) {
    data = data || this.getStore();
    const keyField = this.getKeyField();
    if (keyField) {
      return keyField.getValue(data) == null;
    }
    return true;
  }

  // 更新字段配置，对应field的update方法
  updateFields(fields, triggerChange) {
    if (fields) {
      Object.entries(fields).forEach(([name, config]) => {
        const field = model.getField(name);
        if (field) {
          field.update(config, triggerChange);
        }
      });
    }
  }
}

function applyFields(model, type, fields, callback, data) {
  const values = fields.map((field) => {
    if (typeof field === "string") {
      field = model.getField(field);
    }

    if (field && field[type]) {
      return field[type](data);
    }
    return field.getValue(data);
  });

  return callback ? callback(...values) : values;
}

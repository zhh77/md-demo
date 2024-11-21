import AOP from "../common/aop";
import { DataHelper, ModelHelper } from "../common/help";
import Monitor from "../common/monitor";
import FieldValidator from "../services/validator";
import { FieldType } from "./fieldType";
import TypeHandlerFactory from "./typeHandler";

const FieldRenderProps = ["renders", "renderState"];
const FieldPrivateProps = ["links", "getRenderOptions", ...FieldRenderProps];

// let id = 0;

class BaseField {
  constructor(name, options, model) {
    let field = this;

    // 当为字段类型时，通过原始属性复制
    if (options.__op) {
      options = options.__op;
    }

    // 当有设置初始化渲染状态时，将渲染字段作为主字段创建
    if (options.renderState && options.renders) {
      const renderOptions = options.renders[options.renderState];
      if (renderOptions) {
        options = { ...options, ...renderOptions };
      }
    }

    Object.assign(field, DataHelper.deepClone(options));

    // 设置属性名称,
    field.name = name;
    field.model = model;
    // 执行初始化
    field.onInit && field.onInit();
    // field._mdId = id++;

    // 当key为多级时
    const keyPaths = field.key.split(".");
    if (keyPaths.length > 1) {
      field.__pathKey = keyPaths[0];
    }
    // 真实路径
    // field._realPath = field.keyPath ? field.keyPath + "." + field.key : null;

    field.fieldType = new FieldType(field);
    field.__mdField = true;
    field.__op = options;

    AOP.bind(field);

    // field.buildValidator();
    Monitor.onFieldCreate(field);
    // this._updateHandlers = {};
  }

  buildValidator() {
    if (
      this.isValid !== false &&
      (this.dataType !== "modal" || this.dataType !== "modelList")
    ) {
      this.validator = new FieldValidator(this);
    }
  }

  _innerInit() {}

  /**
   * 扩展字段，返回新的字段
   * @param {*} extend
   * @param {Boolean|Object} options 配置参数，有两种类型， boolean: 是否创建字段；object: 配置对象
   * @returns
   */
  extend(extend, options) {
    if (typeof options === "boolean") {
      options = { create: options };
    }
    const { create, clearPrivate, renderField } = options || {};
    // 清楚私有属性，如果是渲染字段会清除渲染属性
    let newProps = clearPrivate
      ? DataHelper.copyByFilter(this.__op, FieldPrivateProps)
      : renderField
        ? DataHelper.copyByFilter(this.__op, FieldRenderProps)
        : { ...this.__op };

    Object.assign(newProps, { name: this.name }, extend);

    // 如果扩展字段都是同一个子模型，且都有modelExtend配置，则会合并字段配置
    if (newProps.modelExtend && this.modelConfig && this.modelExtend) {
      if (newProps.modelExtend.fields && this.modelExtend.fields) {
        const model = this.modelConfig.extend(this.modelExtend);
        newProps.modelExtend.fields = ModelHelper.getExtendFields(
          model,
          newProps.modelExtend.fields,
          null,
          clearPrivate
        );
      }
    }

    return create
      ? this.model.createField(this.name, newProps, true)
      : newProps;
  }

  //字段引用时，设定别名key或者更改配置
  as(options) {
    if (typeof options === "string") {
      options = { key: options };
    }
    return this.extend({ ...options, linkField: this }, true);
  }

  getKeyPath(isTarget) {
    if (isTarget && this.targetKey) {
      return this.targetKey;
    }
    return this.key;
  }

  getKeyValue(data) {
    const keyField = this.getKeyField();
    return keyField && keyField.getValue(data);
  }
  // getKeyParams() {
  //   let params = {};
  //   const keyField = this.getKeyField();
  //   if (keyField) {
  //     const value = keyField.getValue();
  //     if(value != null) {
  //       params = {};
  //       keyField.setActionValue(value, actParams);
  //     }
  //   }
  //   return;
  // }

  getValue(data) {
    return ModelHelper.getFieldValue(this, data);
  }

  setValue(value, data) {
    if (data) {
      //有目标数据时，直接给对象赋值
      DataHelper.setValue(data, this.getKeyPath(), this.convertValue(value));
    }
  }

  formatValue(value, data) {
    // 表达式格式化时
    if (this.formatByExpression && this.__inExpression !== true) {
      return this.formatByExpression(value, data);
    }
    // return super.formatValue(value === void 0 ? this.getValue(data) : value);
    return value == null
      ? null
      : getFieldHandler(this.fieldType, value).formatValue(value, this);
  }

  formatByData(data) {
    return this.formatValue(this.getValue(data), data);
  }

  // convertValue(value) {
  //   return value == null ? null : this.fieldType.handler.convertValue(value, this);
  // }

  async validateValue(value, data, options) {
    if (this.validator) {
      const { updateState } = options || {};
      if (value == null && data != null) {
        value = this.getValue(data);
      }
      const result = await this.validator.valid(value, data);
      if (updateState) {
        this.model.setDataState("error", {
          [this.name]: result.success ? null : result,
        });
      }
      return result;
    }
    return { success: true };
  }

  convertValue(value) {
    // 先判断是否匹配storeType
    // if (this.fieldType.actDataTypeHandler && this.storeType === DataHelper.getDataType(value)) {
    //   value = this.getActionValue(value);
    // }
    return this.fieldType.handler.convertValue(value, this);
  }

  // /**
  //  * 根据dataAction进行转换，在进行dataAction操作的时候使用，比如：发送请求时，需要转换成后端格式使用
  //  * @param {*} data
  //  * @returns
  //  */
  // convertActionValue(value, data) {
  //   return this.dataAction ? this.dataAction.convertValue(value, data) : value;
  // }
  getActionValue(data) {
    return this.dataAction && this.dataAction.getValue(data);
  }

  setActionValue(value, data) {
    return (this.dataAction || this).setValue(value, data);
  }
  /**
   * 更新字段自身配置
   * @param {*} attrs
   */
  update(attrs) {
    if (attrs) {
      const uiStates = this.uiConfig && this.uiConfig.ui_states;
      Object.assign(this, attrs);
      if (uiStates) {
        if (this.uiConfig) {
          this.uiConfig.ui_states = uiStates;
        } else {
          this.uiConfig = {
            ui_states: uiStates,
          };
        }
      }
    }
    // if (type) {
    //   if (typeof type === 'string') {
    //     this.dataType = type;
    //   } else {
    //     Object.assign(this, type);
    //   }
    this.fieldType = new FieldType(this);
    this.fieldType.createFieldModel(this);
    this.buildValidator();
    return this;
  }

  // reset(attrs) {

  // }

  /**
   * 触发字段更新联动
   */
  _triggerUpdate(attrs) {
    return this.throttleTrigger("_triggerUpdate", attrs);
  }

  /**
   * 字段更新事件，当字段结构变动时触发
   * @param {function} handler
   */
  onUpdate(name, handler) {
    const path = `${this.model.getModelName()}.${this.name}-${name}{onUpdate}`;
    handler &&
      this.on("_triggerUpdate", name, (e) => {
        Monitor.onTrigger({
          target: this,
          name,
          path,
          type: `onUpdate`,
        });
        handler.call(this, e.result);
      });
  }

  offUpdate(name) {
    name = `${this.model.getModelName()}.${this.name}-${name}{onUpdate}`;
    this.off("_triggerUpdate", name);
  }

  callBase(name, ...args) {
    const fn = this.__proto__[name];
    return fn && fn.apply(this, args);
  }

  getDefaultValue(...args) {
    let value;
    if (this.defaultValue != null) {
      const type = typeof this.defaultValue;
      if (type === "function") {
        value = this.defaultValue(...args);
      } else {
        value = DataHelper.deepClone(this.defaultValue);
      }
    }
    return value == null ? null : this.convertValue(value);
  }

  isEmpty(value) {
    return getFieldHandler(this.fieldType, value).isEmpty(value, this);
  }

  loadTypeHandler(type, isBizType) {
    const typeHandler = isBizType
      ? TypeHandlerFactory.getBizTypeHandler(type)
      : TypeHandlerFactory.get(type);

    typeHandler && typeHandler.onCreate && typeHandler.onCreate(this);
    return typeHandler;
  }

  clearLinks(name) {
    this.offChange(name);
    this.offUpdateUI(name);
    this.offUpdate(name);
  }

  getOptions() {
    return this.__op;
  }

  setVisible(visible) {
    return this.update({ visible });
  }
}

function getFieldHandler(fieldType, value) {
  let handler = fieldType.handler;

  if (fieldType.bizHandler) {
    return { ...handler, ...fieldType.bizHandler };
  }
  return handler;
}

export default BaseField;

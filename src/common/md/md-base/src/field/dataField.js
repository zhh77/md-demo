import { DataHelper } from '../common/help';
// import { FieldType } from "./fieldType";
import BaseField from './baseField';
import FieldValidator from '../services/validator';
import FieldDecorator from './decorator';
import Monitor from '../common/monitor';
/**
 * 数据字段
 */
export default class DataField extends BaseField {
  constructor(name, field, model) {
    super(name, field, model);
    let me = this;
    // me.model = model;

    // 初始化的渲染状态已作为主字段，清除渲染状态
    if (this.renderState) {
      delete this.renderState;
    }

    this.fieldType.createFieldModel(this);

    // 设置初始值
    // if (model.getModelType() !== 'List') {
    //   let value = me.defaultValue;
    //   if (value != null) {
    //     if (typeof value === 'function') {
    //       value = value.call(field);
    //     }
    //     this.setValue(value);
    //   }
    // }

    // 字段高级功能初始化
    // enhanceField(me);
  }

  _innerInit() {
    Monitor.onFieldEndInit(this);

    // 编译格式化表达式
    this.formatExpression && compileExpression(this.formatExpression, this);

    // const enableLink = this.model.__controller.enableLink || this.enableLink;

    // 当参数field为其他数据模型的字段时，则关联到field
    this.linkField && this.bindField(this.linkField);
    // 绑定联动设置
    bindFieldLinks(this);

    //添加模型装饰器
    FieldDecorator.attach(this);

    this.buildValidator();
    this.onEndInit && this.onEndInit();
  }

  // clone(extend) {
  //   const options = { ...this, ...extend };
  //   options._tag = `${options.name}-fieldClone`;
  //   return this.model.createField(options.name, options, this.model);
  // }

  getValue(data) {
    // 如果是渲染字段时且data为空时，使用list模型的item更新
    if (this._vRender && data == null && this._renderItem) {
      data = this._renderItem;
    }

    // 如果有值代理器时候，通过代理器返回
    if (this.valueProxy && this.valueProxy.get) {
      const params = [data || this.model._store];
      // 虚拟字段时，参数传入虚拟字段的值
      if (this.isStore === false) {
        params.push(this.__value);
      }
      return this.valueProxy.get.apply(this, params);
    }

    if (this.isStore === false) {
      return this.__value;
    }
    return super.getValue(data || this.model._store);
  }

  setValue(value, data) {
    // 如果是渲染字段时且data为空时，使用list模型的item更新
    if (this._vRender && data == null && this._renderItem) {
      data = this.model.findItem(this._renderItem);
      if (data) {
        super.setValue(value, data);
        this.model.updateItem(data, { refresh: false });
        this.update();
        // this.model.updateItem(data);
      }
      return;
    }

    // 如果有值代理器时候，通过代理器返回
    if (this.valueProxy && this.valueProxy.set) {
      value = this.valueProxy.set.apply(this, [value, data || this.model._store]);
    }

    if (data) {
      //有目标数据是，直接给对象赋值
      super.setValue(value, data);
    } else {
      if (this.isStore === false) {
        // 不做store存储,存放到字段本身
        value = this.convertValue(value);
        if (this.__value != value) {
          this.__value = value;
          // 添加监听变化
          this.model.watcher.addChange(this, value);
          this.model.watcher.apply();
          if (this.triggerChange) {
            this.model._triggerChange();
          }
        }
        return;
      }

      let changeStore = {};
      // 判断是否值是否有多级，有则取第一个对象作为变化数据
      if (this.__pathKey) {
        changeStore[this.__pathKey] = DataHelper.getValue(data || this.model._store, this.__pathKey);
      }

      super.setValue(value, changeStore);
      this.model.setStore(changeStore, {
        partUpdate: true,
        safeMode: true,
      });
    }
  }

  /**
   * 获取模型数据，兼容listItem的获取（需开启渲染字段）
   * @returns
   */
  getModelStore() {
    if (this._vRender && this._renderItem) {
      return this._renderItem;
    }
    return this.model.getStore();
  }

  // getRealValue(value) {
  //   return super.getRealValue(value === void 0 ? this.getValue() : value);
  // }

  /**
   * 关联到其他字段，其他字段更新时会，会同步更新。一个字段有且只能绑定一个关联字段
   * @param {*} field
   */
  bindField(field, handler) {
    if (field.model.getModelType() === 'Data') {
      // 断开原有连接
      if (this._linkField) {
        this._linkField.model.offWatch(this._linkField.name + '-' + this.name);
      }
      // 新增连接
      field.model.syncWatch(field.name + '-' + this.name, [field.name], value => {
        if (handler) {
          value = handler(value);
        }
        value != void 0 && this.setValue(value);
      });

      // 初始化值
      this.copyWith(field, handler);
      // this.setValue(field.getValue());
      this._linkField = field;
    }
  }

  /**
   * 从另外一个字段复制值
   * @param {*} field
   * @param {*} data
   * @param {*} handler
   */
  copyWith(field, data, handler) {
    if (typeof data === 'function') {
      handler = data;
      data = null;
    }

    // 初始化值
    const fieldValue = field.getValue(data);
    this.setValue(handler ? handler(fieldValue) : fieldValue);
  }

  update(attrs, triggerUpdate) {
    const dataType = this.dataType;
    super.update(attrs);

    // 类型变化后重新赋值
    if (dataType !== this.dataType) {
      this.setValue(this.getValue());
    }

    triggerUpdate !== false && this._triggerUpdate(attrs);
  }

  onChange(name, handler) {
    handler && this.model.watch && this.model.watch(`${this.name}-${name}{onChange}`, [this.name], handler);
  }

  offChange(name) {
    this.model.offWatch && this.model.offWatch(`${this.name}-${name}{onChange}`);
  }
}

function bindFieldLinks(field) {
  // 联动，只有开启了联动模式后才会开启（避免在view场景下的无谓开销），先看字段设置，在看模型设置
  let openLink = field.enableLink != null ? field.enableLink : field.model.__controller.enableLink;

  if (!openLink) {
    return;
  }
  const isList = field.model.getModelType() === 'List';
  // 列表模型下，只有开启了虚拟key且是渲染字段时关联才会生效
  if (isList && (field._vRender == null || field.model._vk == null)) {
    return;
  }

  let links = field.links;
  if (links) {
    if (!Array.isArray(field.links)) {
      links = [links];
    }

    links.forEach((link, i) => {
      if (link.onChange) {
        const fields = link.fields || [field];

        let linkChange = link.onChange.bind(field);
        // 添加其他字段的监听
        // fieldWatch(field, `${field.name}-links-[${link.fields.join(',')}]`, link.fields, (...values) => {
        //   linkChange(...addFieldValue(field, values));
        // });

        // 触发模式，默认为valueChange，both：都执行, dataChange：整体数据变更时 ；valueChange：只有字段值变化时
        // 注意list只有valueChange一个模式
        const triggerMode = link.triggerMode || 'both';

        fieldWatch(field, i,fields, (...values) => {
          const len = values.length;
          const {partUpdate} = values[len - 1];
          const data = values[len - 2];

          // 判断触发模式
          if (triggerMode !== 'both') {
            if (triggerMode === 'dataChange') {
              if (partUpdate) {
                return;
              }
            } else if (!partUpdate) {
              return;
            }
          }

          const result = linkChange(...values);
          // 存在返回时的时候，更新字段值
          if (result !== void 0) {
            field.setValue(result);
          }
        });
      }
    });
  }
}

function compileExpression(expression, field) {
  let tmpl = [],
    pos = 0,
    model = field.model;
  expression.replace(/\${([\s\S]*?)}/g, function (slot, key, i) {
    let formatField;

    // 添加静态字符
    i > pos && tmpl.push(expression.substring(pos, i));

    // 当为子模型字段时
    if (field.fieldModel && key.indexOf('this.') === 0) {
      formatField = field.fieldModel[key.substring(5)];
    } else {
      formatField = key === 'this' ? field : model[key];
    }

    if (formatField) {
      tmpl.push(formatField);
    } else {
      // todo 异常提示
    }
    pos = i + slot.length;
  });

  if (pos < expression.length) {
    tmpl.push(expression.substring(pos));
  }

  if (tmpl.length) {
    field.formatByExpression = function (value, data) {
      if (value != null) {
        // 记录当前在表达式中
        this.__inExpression = true;
        const result = tmpl
          .map(item => {
            return item.formatByData ? item.formatByData(data) : item;
          })
          .join('');
        this.__inExpression = false;
        return result;
      }
    };
  }
}

function fieldWatch(field, idx, linkFields, callback) {
  const name = `${field.name}-link(${idx})`;
  const watchCallback = (...args) => {
    Monitor.onLinkTrigger(field, name, linkFields, args);
    callback.apply(this, args);
  };

  if (field.model.getModelType() === 'Data') {
    // 添加其他字段的监听
    field.model.watch(name, linkFields, watchCallback);
  } else {
    field.model.watchItem(field._renderItem, name, linkFields, watchCallback);
  }
}

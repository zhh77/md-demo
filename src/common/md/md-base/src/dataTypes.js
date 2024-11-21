import { DataHelper } from './common/help';
import { BaseField } from './field/index';
import TypeHandlerFactory from './field/typeHandler';

// 基础类型
const BaseTypes = {
  any: {
    convertValue(value, field) {
      return value;
    },
    formatValue(value, field) {
      if (value != null) {
        const handler = BaseTypes[DataHelper.getDataType(value)];
        if (handler) {
          return handler.formatValue(value, field);
        }
        return value + '';
      }
      return '';
    },
  },
  string: {
    convertValue(value, field) {
      if (value != null) {
        const type = DataHelper.getDataType(value);
        if(type != 'string') {
          if (type === 'object') {
            return JSON.stringify(value);
          } else if(type === 'array') {
            return value.join(',');
          }
        }
        return (value + '').trim();
      }
      return null;
    },
    formatValue(value, field) {
      if (value != null) {
        return value + '';
      }
      return '';
    },
    isEmpty(value) {
      return value == null || value.toString() === '';
    },
  },
  date: {
    format: 'YYYY-MM-DD',
    convertValue(value) {
      if (value) {
        value = new Date(value);
        return isNaN(value) ? null : value;
      }
      return null;
    },
    formatValue(value, field) {
      if (value != null) {
        value = new Date(value);

        return DataHelper.formatDate(value, field.format || this.format);
      }
      return null;
    },
  },
  boolean: {
    format: ['否', '是'],
    convertValue(value) {
      return !!value;
    },
    formatValue(value, field) {
      if (value != null) {
        let format = field.format || this.format;
        if (format) {
          return format[value ? 1 : 0];
        }
        return this.convertValue(value) + '';
      }
      return '';
    },
  },
  number: {
    convertValue(value) {
      if (value != null) {
        value = parseFloat(value);
        return isNaN(value) ? null : value;
      }
      return null;
    },
    formatValue(value, field) {
      if (value == null) return '';
      value = this.convertValue(value);

      if (value && value.toFixed) {
        const decimal = field.decimal == null ? this.decimal : field.decimal;
        if (decimal != null) {
          value = value.toFixed(decimal) * 1;
        }
      }
      return value + '';
    },
  },
  array: {
    onCreate(field) {
      if (field.itemType) {
        field.itemTypeHandler = field.loadTypeHandler(field.itemType);
      }
    },
    convertValue(value, field) {
      if (value != null) {
        if (!Array.isArray(value)) {
          if (typeof value === 'string') {
            value = value.split(this.format);
          } else {
            return [];
          }
        }
        if (field.itemTypeHandler) {
          return value.map((item) => {
            return field.itemTypeHandler.convertValue(item);
          });
        }
      }
      return value;
    },
    formatValue(value, field) {
      if (Array.isArray(value)) {
        if (field.itemType !== 'object') {
          return value.join(field.format || ',');
        }
        return JSON.stringify(value);
        // if (Array.isArray(value)) {
        //   if (field.itemTypeHandler) {
        //     value = value.map((item) => {
        //       return field.itemTypeHandler.formatValue(item);
        //     });
        //   }

        //   return value.join(this.format);
        // }
        // return value;
      }
      return '';
    },
    isEmpty(value) {
      return value == null || value.length === 0;
    },
  },
  object: {
    convertValue(value) {
      let result = null;
      if (typeof value === 'string') {
        try {
          result = JSON.parse(value);
        } catch (e) {}
        return result;
      }

      return value;
    },
    formatValue(value) {
      if (typeof value !== 'string') {
        let result = '';
        try {
          result = JSON.stringify(value);
        } catch (e) {}
        return result;
      }
      return value;
    },
  },
};

function getArrayItemField(field) {
  let item = field.item;

  //合并类型处理器的配置
  const handler = field.fieldType.handler;
  const handlerItem = handler && handler.item;

  if (item || handlerItem) {
    item = Object.assign({}, handlerItem, item);
    return new BaseField(
      field.name + '-item',
      Object.assign({}, handlerItem, item),
    );
  }
  return null;
}

const FieldModelHandler = {
  convertValue(value, field) {
    return field.fieldModel.convert(value);
  },
  formatValue(value, field) {
    return field.fieldModel.format(value);
  },
};

// 扩展类型
const ExtendTypes = {
  // datenum: {
  //   baseType: 'date',
  //   dataAction: {
  //     dataType: 'number',
  //   },
  //   format: 'YYYY-MM-DD hh:mm:ss',
  //   formatValue(value, field) {
  //     return BaseTypes.date.formatValue(value, field);
  //   },
  // },
  datetime: {
    baseType: 'date',
    format: 'YYYY-MM-DD hh:mm:ss',
  },
  daterange: {
    baseType: 'array',
    item: {
      dataType: 'date',
      format: 'YYYY-MM-DD hh:mm:ss',
    },
  },
  // time: {
  //   baseType: 'date',
  // },
  integer: {
    baseType: 'number',
    decimal: 0,
  },
  int: {
    baseType: 'number',
    decimal: 0,
  },
  text: {
    baseType: 'string',
  },
  url: {
    baseType: 'string',
  },
  arrayObject: {
    baseType: 'array',
    ...FieldModelHandler,
  },
  model: {
    baseType: 'object',
    ...FieldModelHandler,
  },
  modelList: {
    baseType: 'array',
    ...FieldModelHandler,
  },
  children: {
    baseType: 'array',
  },
  // treeChildren: {
  //   baseType: "array",
  //   convertValue(value, field) {
  //     return field.fieldModel.convert(value);
  //   },
  //   formatValue(value, field) {
  //     return field.fieldModel.format(value);
  //   },
  // },
};

// 业务类型
const BizTypes = {
  enum: {
    formatValue(value, field) {
      if (value == null) {
        return value;
      }

      if (Array.isArray(value)) {
        const arrValue = value.map((v) => {
          return field.getSourceLabel(v) || v;
        });

        return BaseTypes.array.formatValue(arrValue, field);
      }
      const label = field.getSourceLabel(value);
      return label || value;
    },
  },
};

// 注册默认基础类型
TypeHandlerFactory.register(BaseTypes, 'base');

// 注册默认扩展类型
TypeHandlerFactory.register(ExtendTypes, 'extend');

// 注册业务扩展类型
TypeHandlerFactory.register(BizTypes, 'biz');

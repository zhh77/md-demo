// import { ModelLogger } from "../common/help";
import { ITypeHandler } from '../interface';

/**
 * 类型处理器抽象类
 */
class TypeHandler extends ITypeHandler {
  constructor(options) {
    super();
    Object.assign(this, options);
  }

  convertValue(value) {
    return value;
  }
  formatValue(value) {
    return value == null ? '' : value.toString();
  }
  validateValue() {
    return true;
  }

  isEmpty(value) {
    return value == null;
  }
}

let defaultTypeHandler = new TypeHandler();

let BaseTypeHandlers = {};
let ExtendTypeHandlers = {};
let BizTypeHandlers = {};

const TypeHandlerFactory = {
  register(types, handlerType) {
    registerHandler(types, handlerType);
  },
  getTypeHandler(type) {
    return (
      ExtendTypeHandlers[type] ||
      BaseTypeHandlers[type] ||
      BaseTypeHandlers.string ||
      defaultTypeHandler
    );
  },
  getBizTypeHandler(type) {
    return BizTypeHandlers[type];
  },
  get(type) {
    return this.getBizTypeHandler(type) || this.getTypeHandler(type);
  },
  isBaseType(type) {
    return BaseTypeHandlers[type] != null;
  },
};

function registerHandler(types, handlerType) {
  Object.entries(types).forEach(([name, options]) => {
    if (options) {
      let handlerStore;

      if (handlerType === 'base') {
        //注册基础类型
        handlerStore = BaseTypeHandlers;
      } else if (handlerType === 'biz') {
        handlerStore = BizTypeHandlers;
      } else {
        // 扩展类型必须指定正确的基础类型
        if (options.baseType) {
          let baseHandler = BaseTypeHandlers[options.baseType];
          if (baseHandler) {
            options = Object.assign({}, baseHandler, options);
          } else {
            // ModelLogger.console.error();
            console.error(`模型驱动-[${name}]类型注册失败,baseType指定错误`);
            return;
          }
        } else {
          console.error(`模型驱动-[${name}]类型注册失败,缺少baseType`);
          return;
        }

        handlerStore = ExtendTypeHandlers;
      }

      // 注册扩展类型
      handlerStore[name] = new TypeHandler(options);
    }
  });
}

export default TypeHandlerFactory;

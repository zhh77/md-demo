import Configuration from '../common/configuration';
import { DataHelper } from '../common/help';

class DataAction {
  constructor(model, options) {
    this.options = options;
    this.config = {};
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value != null) {
          if (key === 'mock') {
            this.mock = value;
          } else {
            if (this[key] == null) {
              if (value.type && this[value.type])
                this[key] = function (model, params, options, config) {
                  this[value.type](model, params, options, config);
                };
            }
          }
          this.config[key] = value;
        }
      });
    }
  }
  /**
   * 判断是否存在action
   * @param {*} name Action Name
   * @returns
   */
  hasAction(name) {
    return this.config[name] != null;
  }

  getAction(name) {
    return this[name];
  }

  /**
   * 获取行为配置
   * @param {*} actionName
   * @returns
   */
  getConfig(actionName, model, params, config) {
    // 获取请求配置
    const baseConfig = this.config && this.config[actionName];

    if (baseConfig == null && config == null) {
      return;
    }
    config = Object.assign(
      baseConfig ? DataHelper.deepClone(baseConfig) : {},
      config,
    );

    // 在options中设置的参数，最后会合并到参数中
    const extendParams = config.options && config.options.data;
    if (params) {
      config.options = { ...config.options, data: params };
    }
    const { options, fields } = config;

    // 获取store的内置参数
    let paramData = model.getActionParams(
      config.actionType || actionName,
      // 如果有设置fields，则不用params驱动，否则用params来构建action默认参数
      fields ? null : options,
    );

    // 当行为的参数有定义字段且存在参数数据时，进行数据转换

    if (fields) {
      let paramsModel = model;
      // query行为使用filerModel
      if (actionName === 'query' && model.filterModel) {
        paramsModel = model.filterModel;
      }

      Object.assign(paramData, paramsModel.getActionData(fields, params));
    } else if (params) {
      Object.assign(paramData, params);
    }

    if (options) {
      options.data = { ...paramData, ...extendParams };
    } else {
      config.options = { data: paramData, ...extendParams };
    }
    this.mappingUrl(config);
    return config;
  }
  mappingUrl(config) {
    const urlMapping = this.config.urlMapping;
    const { url } = config;
    if (url && urlMapping) {
      const mapUrl = urlMapping[url];
      if (mapUrl) {
        config.url = mapUrl;
      }
    }
  }

  getValue(model, fields, data) {
    let store = fields ? {} : { ...data };

    if (fields == null) {
      fields = model.getFields();
    }

    if (fields) {
      fields.forEach((fld) => {
        let field = fld;
        if (!field.__mdField) {
          const isExtend = typeof field === 'object';
          const targetField = model.getField(isExtend ? field.name : field, {
            chain: true,
          });
          if (isExtend && targetField) {
            field = targetField.extend({ ...field, dataAction: null }, true);
          } else {
            field = targetField;
          }
        }
        let value;
        if (field) {
          // chainField模式
          if (field.getChainValue) {
            value = field.getChainValue(data);
            field.setChainValue(value, store, true);
          } else {
            value = field.getValue(data);
            if (field.dataAction || field.fieldModel) {
              // value = field.convertActionValue(value, data);
              if (value != void 0) {
                field.setActionValue(value, store);
              }
            } else if (value != void 0) {
              field.setValue(value, store);
              // DataHelper.setValue(
              //   store,
              //   field.getKeyPath(),
              //   field.convertValue(value),
              // );
            }
          }
        } else {
          value = DataHelper.getValue(data, fld);
          if (value != void 0) {
            DataHelper.setValue(store, fld, value);
          }
        }
      });
    }

    return store;
  }
  query(model, params, options, config) {
    return this.run('query', model, params, options, config);
  }
  update(model, params, options, config) {
    return this.run('update', model, params, options, config);
  }
  insert(model, params, options, config) {
    return this.run('insert', model, params, options, config);
  }
  delete(model, params, options, config) {
    return this.run('delete', model, params, options, config);
  }
  find(model, params, options, config) {
    return this.run('find', model, params, options, config);
  }
  async run(actionName, model, params, options, config) {
    if (config || options) {
      if (config == null) {
        config = {};
      }
      if (options) {
        config.options = options;
      }
    }

    config = this.getConfig(actionName, model, params, config);
    if (config) {
      return await runAction(actionName, model, config);
    } else {
      // 没有请求配置，执行model的刷新方法
      model.refresh();
    }
  }
}

async function runAction(actionName, model, config) {
  let result;

  //当发送请求时触发，用于干预请求配置, 对config进行修改；也可以直接返回结果
  if (config.onRequest) {
    result = await config.onRequest.call(model, config);
  }

  let { url, options, dataMapping, onResponse, proxyRequest } = config;

  const mapping = model._storeMapper.getMapping(actionName, dataMapping);

  if (result == null) {
    // 处理request的参数映射
    if (options.data) {
      options.data = DataHelper.applyMapping(options.data, mapping.request, {
        reverse: true,
      });
    }

    // 存在代理请求时，使用代理请求获取数据
    if (proxyRequest) {
      result = await proxyRequest.apply(model, [
        actionName,
        url,
        options,
        config,
      ]);
    } else if (url) {
      result = await excute(
        config.requestType || actionName,
        url,
        options,
        config,
        model,
      );
    }
  }

  // 处理response返回数据映射
  // if(actionName !=='query' || !Array.isArray(result)) {
  result = DataHelper.applyMapping(result, mapping.response, { merge: true });
  // }

  // 响应的时候触发，用于干预结果
  if (onResponse) {
    const customResult = await onResponse.apply(model, [
      result,
      options,
      config,
    ]);
    if (customResult !== void 0) return customResult;
  }

  return result;
}

async function excute(name, url, options, config, model) {
  const engine = getActionEngine(model, url);
  if (engine) {
    const excute = engine[name];
    if (excute) {
      return excute(url, options, model, config);
    } else if (engine.common) {
      return engine.common(name, url, options, model, config);
    }
    console.error(`MD-Error: 未配置【RequestEngine-${name}或者common】的设置`);
  } else {
    console.error('MD-Error: 未配置【RequestEngine】');
  }
}
function getActionEngine(model, url) {
  const ActionConfig = Configuration.get('DataAction');

  let engine = ActionConfig.Engine;

  let isMock = false;

  let mockTarget, mockEnabled;
  if (model._dataAction.mock && model._dataAction.mock.enable != null) {
    // mockTarget = model._dataAction.mock.target;

    mockEnabled = model._dataAction.mock.enable;
  } else {
    // mockTarget = ActionConfig.Mock.target;
    mockEnabled = ActionConfig.Mock.enable === true;
  }

  if (mockEnabled) {
    // if (mockTarget == null || mockTarget.includes(url)) {
    isMock = true;
    engine = ActionConfig.Mock.engine;
    // }
  }

  // 如果没有配置请求引擎，默认使用mock
  if (engine == null && !isMock) {
    engine = ActionConfig.Mock?.engine;
  }
  // todo 错误跟踪
  return engine;
}

class DataFieldAction {
  constructor(field) {
    this.field = field;
    if (field.dataAction) {
      const { dataType, key, convert } = field.dataAction;

      if (dataType) {
        this.typeHandler = field.loadTypeHandler(dataType);
      }
      if (convert) {
        this.convert = convert;
      }
      // if (key) {
      this.key = key || field.key;
      // }
    }
  }
  getValue(data) {
    return DataHelper.getValue(data, this.key || this.field.key);
  }

  convertValue(value, data) {
    if (this.convert) {
      value = this.convert(value, data);
    }
    if (this.typeHandler) {
      return this.typeHandler.convertValue(value, this.field);
    }
    return value;
  }

  setValue(value, data) {
    DataHelper.setValue(
      data,
      this.key || this.field.key,
      this.convertValue(value, data),
    );
  }
}

export default DataAction;

export { DataFieldAction };

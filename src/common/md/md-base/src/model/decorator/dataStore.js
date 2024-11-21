// import { DataHelper, ModelLogger, SuperHelper } from "../common/help";
import Configuration from '../../common/configuration';
import Decorator from '../../common/decorator';
import { ModelHelper } from '../../common/help';
import DataAction from '../../services/dataAction';

class DataMapping {
  constructor(storeMode, dataMapping) {
    //获取配置器中的数据源映射配置
    const config = Configuration.get('DataAction').DataMapping;

    if (config) {
      // 根据类型获取数据源映射配置
      const mappingConfig = config[storeMode];
      this.baseMapping = config.baseMapping || {};

      this.dataMapping = Object.assign({}, mappingConfig, dataMapping);
    }
  }

  getMapping(type, customMapping) {
    return Object.assign(
      {},
      this.dataMapping[type] || this.baseMapping[type],
      customMapping,
    );
  }
}

const Helper = {
  getFieldsValues(model, fields, data) {
    if (Array.isArray(fields)) {
      let result = {};
      if (fields.length > 0) {
        fields.forEach((key) => {
          const field = model.getField(key);
          field &&
            field.isStore !== false &&
            field.setValue(ModelHelper.getFieldValue(field, data), result);
        });
      } else {
        model._fields.forEach((field) => {
          field.isStore !== false &&
            field.setValue(ModelHelper.getFieldValue(field, data), result);
        });
      }
      return result;
    } else {
      return data && Object.assign({}, data);
    }
  },
};

const DataStore = Decorator.create({
  storeMode: 'Data',
  init(options) {
    // 行为处理器
    this._dataAction = new DataAction(this, options.action);

    // 设置映射处理器
    this._storeMapper = new DataMapping(this.storeMode, options.dataMapping);

    // 数据存储
    this._store = {};
  },
  getStore(fields) {
    return Helper.getFieldsValues(this, fields, this._store);
  },
  setStore(data) {
    //当原始值为空或者全部更新时，直接赋值
    this._store = data || {};
    return this;
  },
  hasAction(actionName) {
    return this._dataAction.hasAction(actionName);
  },
  getActionData(fields, data) {
    return this._dataAction.getValue(this, fields, data || this._store);
  },
  async runAction(name, params, options, config) {
    return this._dataAction.run(name, this, params, options, config);
  },
  async query(params, options, config) {
    return this._dataAction.query(this, params, options, config);
  },
  async find(params, options, config) {
    return this._dataAction.find(this, params, options, config);
  },
  async update(params, options, config) {
    return this._dataAction.update(this, params, options, config);
  },
  async insert(params, options, config) {
    return this._dataAction.insert(this, params, options, config);
  },
  async delete(params, options, config) {
    return this._dataAction.delete(this, params, options, config);
  },
  /**
   * 生成参数数据
   * @param {*} actionType
   * @param {*} options
   * @returns
   */
  getActionParams(actionType, options) {
    const data = options && options.data;
    let actParams = {};
    if (['find', 'delete'].includes(actionType)) {
      let value;
      const keyField = this.getKeyField();
      if (keyField) {
        // 当参数不为对象是，当做key参数
        if (data != null && typeof data !== 'object') {
          options.data = null;
          value = data;
        } else if (data == null) {
          value = keyField.getValue();
        }

        if (value != null) {
          keyField.setActionValue(value, actParams);
        }
      }
    }
    return actParams;
  },
});

const DataListStore = Decorator.create(
  {
    storeMode: 'List',
    init(options) {
      let me = this,
        pager;

      if (options) {
        DataStore.decorator.init.call(me, options);

        pager = typeof options.pager === 'object' ? options.pager : null;
        me._needPager = options.pager !== false;
      }
      this._store = [];
      me._pager = { pageSize: 10, total: 0, pageIndex: 1, ...pager };
    },
    setPager(pager, isSearch) {
      let _pager = this._pager;

      if (pager) {
        Object.entries(pager).forEach(([key, value]) => {
          if (value != null) {
            _pager[key] = value;
          }
        });
      }
      isSearch && this.load();
    },
    getPager() {
      return this._pager;
    },
    getStore(fields) {
      if (fields) {
        return this._store.map((item) => {
          return Helper.getFieldsValues(this, fields, item);
        });
      }
      return this._store;
    },
    setStore(data) {
      const { list, pageIndex, total } = data;

      // if (data != null) {
      //   if (Array.isArray(data)) {
      //     store = data;
      //   } else {
      //     const list = data.list;
      //     if (list && Array.isArray(list)) {
      //       store = list;
      //       pageIndex = data.pageIndex * 1;
      //       total = data.total * 1;
      //     }
      //   }
      // }

      this.setPager({ total, pageIndex });
      this._store = list;
    },

    parseData(data) {
      let list,
        pageIndex = 1,
        total = 0;
      if (Array.isArray(data)) {
        list = data;
        total = data.length;
      } else if (data && data.list) {
        list = data.list;
        pageIndex = data.pageIndex || 1;
        total = data.total || data.list.length || 0;
      }

      return { list: list || [], pageIndex, total };
    },

    // async update() {},
    // async delete() {},

    // getActionConfig(type) {
    //     let newConfig = Object.assign({}, this._actionConfig[type]);
    //     const extendData = newConfig.options && newConfig.options.data;
    //     const data = Object.assign({}, extendData);
    //     data.pageIndex = this._pager.pageIndex;
    //     data.pageSize = this._pager.pageSize
    //     newConfig.options = Object.assign({}, newConfig.options, { data })
    //     return newConfig;
    // },
    getActionParams(actionName) {
      let paramsData = {};
      // 当查询模式添加分页参数
      if (this._needPager !== false && actionName === 'query') {
        paramsData.pageIndex = this._pager.pageIndex;
        paramsData.pageSize = this._pager.pageSize;
      }
      return paramsData;
    },
  },
  {
    extend: DataStore,
  },
);

export { DataListStore, DataStore };

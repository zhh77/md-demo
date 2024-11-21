import { DataHelper, ModelHelper } from '../common/help';
import { DataBaseModel } from './base';
import DataModel from './data';
// import ModelDecorator from './decorator';

const ClearFilterProps = ['links', 'getRenderOptions'];

export default class DataListModel extends DataBaseModel {
  init(options) {
    super.init(options);
    // 默认开启虚拟key
    if (options.virtualKey !== false) {
      this._vk = '_mKey';
      this._vkId = 0;
    }
  }

  _innerInit(options, origin) {
    let me = this;
    // let { filterFields, itemModel } = options || {};

    // const modelName = this._modelName;

    const filter = options.filter;
    // 过滤模型，按需创建
    if (options.filter) {
      me.filterModel = createChildModel(this, 'filterModel', options.filter);
      // 开启绑定搜索
      if (filter.bindSearch) {
        me.filterModel.onChange('filterSearch', () => {
          me.load();
        });
      }
    }

    // 列表项模型，按需创建
    if (options.itemModel !== false) {
      me.itemModel = buildItemModel(
        this,
        options.itemModel === true ? {} : options.itemModel,
        options,
      );
    }

    // 当存在子项时,即树形结构
    if (options.childrenField) {
      me._childrenField = this[options.childrenField];
    }

    // 分页设置
    options.pager && this.setPager(options.pager);
  }

  getModelType() {
    return 'List';
  }

  // getStore(index) {
  //   const store = this._storeHandler.getStore();
  //   if (index != null) {
  //     return store && store[index];
  //   }
  //   return store;
  // }

  setStore(data) {
    const store = this._storeHandler.parseData(data);

    if (store.list) {
      if (this._vk) {
        // this.setDataVK(store.list);
        // 同步更新数据状态
        let states = this._dataStates.isEmpty() ? null : {};
        store.list.forEach((item) => this.setItemVK(item, null, states));
        // 清空渲染存储
        this.__renderStore = {};
        // // tree模式
        // if (this._childrenField) {
        //   eachTree(this, store.list, (item, parent) => this.setItemVK(item, parent));
        // } else {
        //   store.list.forEach(item => this.setItemVK(item));
        // }
        this._dataStates.clear(states);
        this.watcher.clear();
      }
      this._storeHandler.setStore(store);
      this._triggerChange();
      // super.setStore(data, isPartUpdate, safeMode);
    }

    return this;
  }

  setItemVK(item, parent, updateStates) {
    if (this._vk) {
      let vk = '' + this._vkId++;
      // tree模式
      if (this._childrenField && parent) {
        const pvk = this.getItemVK(parent);
        if (pvk) {
          vk = `${pvk}.${vk}`;
        }
      }
      // vk变更后，同步更新数据状态
      if (updateStates) {
        const oldVk = item[this._vk];
        if (oldVk) {
          const state = this._dataStates.getStates(oldVk);
          if (state) {
            updateStates[vk] = state;
          }
        }
      }
      item[this._vk] = vk;
      // 如果是tree模式, 对子项也进行vk设置
      if (this._childrenField) {
        let children = this._childrenField.getValue(item);
        if (children) {
          children.forEach((child) => {
            this.setItemVK(child, item, updateStates);
          });
        }
      }
    }
    return item;
  }

  getItemVK(item) {
    return item && item[this._vk];
  }
  /**
   * 通过vk查询列表项
   * @param {*} key
   * @param {object} options, needIndex:是否需要返回index，如果为true，返回的是{item,index}，否则返回item;data:查询的data，如果有设置则会在data中查询,未设置则使用模型数据;parentMode:为true时，data则是被认定为父数据，只会在data中查找，提升检索效率，tree模式下有效
   * @returns
   */
  findItem(key, options) {
    let { needIndex, data, parentMode } = options || {};

    if (typeof key === 'object') {
      key = this.getItemVK(key);
    }

    if (key) {
      let vks = key.split('.');

      // 父级下精准查找
      if (parentMode && data) {
        vks = [key];
      } else if (data == null) {
        data = this._store;
      }

      const result = findItem(this, data, vks, this._childrenField);

      return result && (needIndex ? result : result.item);
    }
  }

  getItemIndex(item, data) {
    const result = this.findItem(item, { needIndex: true, data });
    return result && result.index;
  }

  // handleRequestConfig(method, config) {
  //   return config;
  // }

  getActionParams(method) {
    let paramsData = this._storeHandler.getActionParams(method);
    if (method === 'query' && this.filterModel) {
      // 生成查询条件
      Object.assign(paramsData, this.filterModel.getActionData());
    }
    return paramsData;
  }

  // convert(data) {
  //   return data;
  //   // return data ? data.concat() : [];
  // }

  // convert(data, force) {
  //   // 严格模式下会,跟严格根据定义的字段组织数据
  //   if (data && (force || this._strictModel)) {
  //     const type = DataHelper.getDataType(data);
  //     if(type === 'array') {

  //     } else if(type === 'object') {

  //     } else {
  //       data = [];
  //     }
  //     return DataHelper.getDataType(data) === 'object' ? ModelHelper.convertByFields(this.getFields(), data) : {};
  //   }

  //   return data;
  // }

  format(data) {
    return data && data.toString();
  }

  async validate(options) {
    const data = options.data;
    // 列表数据默认不做验证，但支持单项的数据验证
    if (data && !Array.isArray(data)) {
      return await super.validate(options);
    }

    return {
      success: true,
    };
  }

  async validateItem(item, options) {
    return super.validate({ data: item, ...options });
  }

  async updateItem(item, options) {
    // let vk;

    // if (targetItem != null) {
    //   vk = this.getItemVK(targetItem);
    //   item[this._vk] = vk;
    // } else {
    //   vk = this.getItemVK(item);
    // }

    const { replace, watch, refresh, action, data } = options || {};

    if(action !== false) {
      this.save(data);
    } else {
      const target = this.findItem(item, { data, needIndex: true });
      if (target != null) {
        // const target = this.findItem(vk, true);
        if (target.item == null) {
          return;
        }
  
        let diffResult;
        if (watch !== false) {
          diffResult = this.watcher.diffItem(item);
        }
  
        item = this.convert(item);
  
        target.data[target.index] = replace
          ? item
          : Object.assign(target.item, item);
  
        // Object.assign(targetItem, item);
        if (diffResult) {
          await this.watcher.applyItem(item);
        }
        // 暂时对列表做全部刷新，后续可控制行内精准刷新
        if (refresh !== false) await this._triggerChange();
      } else if (autoInsert) {
        return await this.insertItem(item);
      }
    }
    
  }

  async deleteItem(item, data, isRefresh) {
    // 当配置了数据行为时；
    if (this.itemModel._dataAction.hasAction('delete')) {
      this.itemModel.setStore(item);
      const result = await this.itemModel.delete();
      if (isRefresh !== false && result?.success) {
        this.load();
      }
      return result;
    }

    let index,
      store = data || this.getStore();

    if (typeof item === 'object') {
      const vk = this.getItemVK(item);
      if (vk != null) {
        const itemInf = this.findItem(vk, {
          parentMode: data != null,
          data: store,
          needIndex: true,
        });
        if (itemInf) {
          index = itemInf.index;
          store = itemInf.data;
        }
      }
    } else {
      index = item;
    }

    if (index != null) {
      if (!Array.isArray(store) && this._childrenField) {
        store = this._childrenField.getValue(store);
      }

      if (isArray(store)) {
        store.splice(index, 1);
        if (isRefresh !== false) {
          await this._triggerChange();
        }
        return true;
      }
    }
    return false;
  }
  /**
   * 监听数据项
   * @param {*} item
   * @param {*} name
   * @param {*} fields
   * @param {*} callback
   * @param {*} mode
   * @returns
   */
  watchItem(item, name, fields, callback, mode) {
    // debugger
    item && this.watcher.onItem(item, name, fields, callback, mode, true);
    return this;
  }
  /**
   * 卸载监听数据项
   * @param {*} item
   * @param {*} name
   * @returns
   */
  offWatchItem(item, name) {
    item && this.watcher.offItem(item, name);
    return this;
  }

  reset() {
    return (this._store = []);
  }

  isEmpty() {
    return this._store == null || this._store.length === 0;
  }

  /**
   * 获取列表模型数据
   * @param {*} options
   * @param {Array} filterVK 过滤的vk数组
   * @returns {Object}
   */
  async getData(options, filterVK) {
    const data = await super.getData(options);
    // await this.watcher.pending;
    // const data = this.getStore(fields);
    if (filterVK && this._vk) {
      return data.filter((item) => DataHelper.copyByFilter(item, [this._vk]));
    }
    return data;
  }

  /**
   * 查询，重新进行request query并赋值到模型
   * @param {*} params 查询条件
   * @returns
   */
  load(params, options) {
    return this.loadPromise = new Promise(async (resove) => {
      let data = await this.query(params, options);
      await this.watcher.pending;
      await this.setData(data);
      resove();
    });
  }

  // /**
  //  * 在list模型中，onChange 等同于 onRefresh
  //  * @param {*} name
  //  * @param {*} callback
  //  * @param {*} mode
  //  */
  // onChange(name, callback, mode) {
  //   return this.onRefresh(name, callback, false, mode);
  // }

  // offChange(name) {
  //   return this.offRefresh(name);
  // }

  getChildrenField() {
    return this._childrenField;
  }
  _triggerChange() {
    return this.throttleTrigger('_triggerChange').then(() => {
      this.refresh();
    });
  }

  async updateItemField(field, value, item) {
    field.setValue(value, item);
    return this._triggerChange();
    // me._store[index] = field.model.getStore();
  }
  /**
   * tree模式下插入子项
   * @param {*} parent
   * @param {Object|Array} child
   * @param {*} index
   * @returns
   */
  async insertChild(parent, child, index, isRefresh) {
    if (this._childrenField) {
      if (child == null) {
        child = this.getDefaultData();
      }

      let children = this._childrenField.getValue(parent);
      if (children == null) {
        children = [];
      }

      this.setItemVK(child, parent);

      const result = insertItem(child, index, children, false);

      this._childrenField.setValue(children, parent);

      if (isRefresh !== false) await this._triggerChange();
      return result;
    }
  }
  async insertChildren(parent, children, index, isRefresh) {
    if (this._childrenField) {
      children.forEach((child) => {
        this.setItemVK(this.convert(child), parent);
      });

      let itemChildren = this._childrenField.getValue(parent);
      if (itemChildren == null) {
        this._childrenField.setValue(children, parent);
      } else {
        if (index == null || index < 0) {
          itemChildren.push(...children);
          index = itemChildren.length - 1;
        } else {
          itemChildren.splice(index, 0, parent, ...children);
        }
      }

      if (isRefresh !== false) await this._triggerChange();

      return {
        index,
        parent,
      };
    }
  }
  async insertItem(item, index, data, isRefresh) {
    const initData = this.getDefaultData();
    if (item == null) {
      item = initData;
    } else {
      item = Object.assign(initData, item);
    }

    this.setItemVK(item, data);
    item = this.convert(item);
    const result = insertItem(item, index, data || this.getStore());

    if (isRefresh !== false) await this._triggerChange();

    return result;
  }
  // async insertItems(items, index, data) {
  //   if (items == null || items.length === 0) {
  //     return;
  //   }
  //   items.forEach(item => {
  //     this.setItemVK(item);
  //   });
  //   let store = data || this.getStore();
  //   if (index == null || index < 0) {
  //     store.push(...items);
  //   } else {
  //     store.splice(index, item.length, items);
  //   }
  //   await this._triggerChange();
  //   return true;
  // },
  async deleteItemsByKeys(keys, data, key) {
    if (key == null) {
      key = this.getKey();
      if (key == null) {
        return;
      }
    }
    if (data == null) {
      data = this.getStore();
      if (data) {
        let keyList = keys.concat();
        for (
          let len = data.length - 1, item;
          (item = data[len]) && keyList.length > 0;
          len--
        ) {
          const index = keyList.indexOf(item[key]);
          if (index > -1) {
            keyList.splice(index, 1);
            data.splice(len, 1);
          }
        }
        this._triggerChange();
      }
    }
  }
  async deleteItems(items, data, key) {
    if (items == null || items.length === 0) {
      return;
    }

    // 当tree模式时
    if (this._childrenField) {
      items.forEach((item) => this.deleteItem(item, null, false));
      await this._triggerChange();
      return;
    } else {
      if (key == null) {
        key = this.getKey();
        if (key == null) {
          return;
        }
      }
      const keys = items.map((item) => item[key]);
      return this.deleteItemsByKeys(keys, data, key);
    }
  }
  storeEach(handlerFn, data) {
    // 当为tree模式时，会循环全部子项
    // if(this._childrenField) {

    // }
    handleListModel(this, handlerFn, 'forEach', data);
    return this;
  }
  storeMap(handlerFn, data) {
    return handleListModel(this, handlerFn, 'map', data);
  }
  storeFilter(filterFn, data) {
    return handleListModel(this, filterFn, 'filter', data);
  }
  storeFind(filterFn, data) {
    return handleListModel(this, filterFn, 'find', data);
  }
}

function findItem(model, data, vks, childrenField) {
  let index,
    item,
    vk = vks.shift();

  const children = Array.isArray(data)
    ? data
    : childrenField
    ? childrenField.getValue(data)
    : null;

  if (children && children.length) {
    item = children.find((child, i) => {
      if (model.getItemVK(child) === vk) {
        index = i;
        return true;
      }
    });

    if (item == null) {
      return null;
    }

    if (vks.length === 0) {
      return { item, index, data: children };
    }

    vks[0] = `${vk}.${vks[0]}`;

    return findItem(model, item, vks, childrenField);
  }
  return null;
}

function eachTree(model, data, handler, parent) {
  data.forEach((item) => {
    handler(item, parent);
    const children = model._childrenField.getValue(item);
    children && children.length && eachTree(model, children, handler, item);
  });
}
function handleListModel(model, handlerFn, method, data) {
  if (data == null) {
    data = model.getStore();
  }
  return data[method]((item, index) => {
    // model._renderModel.setItem(index, item);
    return handlerFn(item, index, data, model);
  });
}

function insertItem(item, index, data) {
  if (index == null || index < 0) {
    data.push(item);
    index = data.length - 1;
  } else {
    data.splice(index, 0, item);
  }
  return { item, index };
}

function createChildModel(model, name, config) {
  let fields;

  if (config.fields) {
    fields = ModelHelper.getExtendFields(model, config.fields, null, true);
  }

  const childOptions = {
    ...config,
    name: `${model._modelName}_${name}`,
    originName: model._modelName,
    parentPaths: model._idPaths,
    path: model.getModelName(),
    fields: fields || model.getFields(),
    mdContext: model.mdContext,
    modelType: 'Data',
  };

  const childModel = new DataModel(childOptions);
  childModel.mainModel = model;
  childModel._md = name;
  return childModel;
}

function buildItemModel(model, config, options) {
  //如果没有设置action，继承父模型的action
  const action = options.action;
  if (action) {
    if (config?.action == null) {
      config = { ...config, action: { ...action } };
    }
  }

  let itemModel = createChildModel(model, 'itemModel', config);
  Object.assign(itemModel, ItemModelProps);
  return itemModel;
}

const ItemModelProps = {
  equalItem(item) {
    const data = this.getStore();
    return this.mainModel.getItemVK(item) === this.mainModel.getItemVK(data);
  },
  updateItem(options) {
    const item = this.getStore();
    return this.mainModel.updateItem(item, options);
  },
  getItemIndex() {
    const item = this.getStore();
    return this.mainModel.getItemIndex(item);
  },
  deleteItem(options) {
    const { autoFill } = options;
    let item = this.getStore();
    const index = this.mainModel.getItemIndex(item);
    const result = this.mainModel.deleteItem(item);
    // 开启自动填充模式
    if (autoFill) {
      const data = this.mainModel.getStore();
      item = data[index] || data[index - 1];
    } else {
      item = null;
    }
    this.setStore(item);
    return result;
  },
};

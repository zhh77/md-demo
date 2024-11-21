import { DataBaseModel } from './base';
// import ModelDecorator from './decorator';

// import DataSourceFactory from "../services/dataSource";
// import DataModelWatcher from "./decorator/watcher";
// import EnhanceFields from "../services/enhanceFields";

export default class DataModel extends DataBaseModel {
  getModelType() {
    return 'Data';
  }

  // /**
  //  * 字段类型更换成对应的数据字段
  //  * @param {*} name
  //  * @param {*} field
  //  * @returns
  //  */
  // createField(name, field) {
  //   // const Field = field.dataType === "model" || field.dataType === "modelList" ? ModelField : DataField;
  //   // return new Field(name, field, this);
  //   return FieldFactory.create(name, field, this);
  // }
  setStore(data, options) {
    const { partUpdate, fieldMatch, triggerChange } = options || {};
    if (data == null) {
      data = {};
    }

    // if (fieldMatch === true) {
    // 记录原始数据
    if (!partUpdate) {
      this._originData = { ...data };
    }

    data = this.convert(data, fieldMatch);

    // }

    // 获取是否有监听的字段变更
    const watchChanged = this.watcher.diff(data, partUpdate);

    // 发生变更时
    if (partUpdate !== true) {
      this._storeHandler.setStore({ ...data });
      // 全部更新时清除数据状态
      this._dataStates.clear();
    } else {
      // 局部更新
      // this._store = DataHelper.deepMerge(this._store, data, { mode: 'new' });
      this._store = { ...this._store, ...data };
    }

    // 触发字段的监听
    watchChanged &&
      this.watcher.apply({
        partUpdate,
      });

    // 触发模型change事件
    if (triggerChange !== false) {
      return this._triggerChange();
    }
    // // 触发模型change事件
    // triggerChange !== false && this._triggerChange();
    // 返回是否有监听变更
    // return watchChanged;
  }

  // convert(data, force) {
  //   // 严格模式下会,跟严格根据定义的字段组织数据
  //   if (data && (force || this._strictMode)) {
  //     return DataHelper.getDataType(data) === 'object' ? ModelHelper.convertByFields(this.getFields(), data) : {};
  //   }

  //   return data;
  // }

  watch(name, fields, callback, mode) {
    this.watcher.on(name, fields, callback, mode);
    return this;
  }

  syncWatch(name, fields, callback, mode) {
    this.watcher.syncOn(name, fields, callback, mode);
    return this;
  }

  offWatch(name, isSync) {
    this.watcher.off(name, isSync);
    return this;
  }

  isEmpty() {
    return this._store == null || Object.keys(this._store).length === 0;
  }

  load(key, options) {
    return (this.loadPromise = new Promise(async (resove) => {
      let params;
      if (key) {
        const keyField = this.getKeyField();
        if (keyField) {
          const value = typeof key === 'object' ? keyField.getValue(key) : key;
          if (value != null) {
            params = {};
            keyField.setActionValue(value, params);
          }
        }
      }
      const res = await this.find(params, options);
      this.setData(res.data);
      this.__controller.loaded = true;
      resove();
    }));
  }

  // applyChange() {
  //   this.watcher.apply();
  // }
}

import { ModelHelper } from '../../common/help';

const WatchStatus = {
  // 未发生变更
  noChange: 'noChange',
  // 已变更
  changed: 'changed',
};

class DataModelWatcher {
  constructor(model, oldStore) {
    this.model = model;
    this.watchFields = {};
    this.watchList = [];
    this.syncWatchList = [];
    this.clear();
    this.buildOldStore(oldStore);
  }

  /**
   * 添加监听，高性能异步触发
   * @param {string} name
   * @param {[]:string} fields
   * @param {function} callback
   * @param {string} mode
   * @param {boolean} isApply 是否初始化就执行
   * @returns
   */
  on(name, fields, callback, mode, isApply) {
    return addWatch(
      this,
      this.watchList,
      name,
      fields,
      callback,
      mode,
      isApply,
    );
  }

  /**
   * 添加监听，实时触发
   * @param {string} name
   * @param {[]:string} fields
   * @param {function} callback
   * @param {string} mode
   * @param {boolean} isApply 是否初始化就执行
   * @returns
   */
  syncOn(name, fields, callback, mode, isApply) {
    return addWatch(
      this,
      this.syncWatchList,
      name,
      fields,
      callback,
      mode,
      isApply,
    );
  }

  addFields(fields) {
    fields &&
      fields.forEach((field) => {
        this.watchFields[field.name] = field;
      });
  }

  off(name, isSync) {
    let list = isSync ? this.syncWatchList : this.watchList;
    // eslint-disable-next-line
    list.find((item, i) => {
      if (item.name === name) {
        list.splice(i, 1);
        return true;
      }
    });
    return this;
  }

  addChange(field, value) {
    const name = field.name || field;
    this.changeData[name] = value;
    this.status = WatchStatus.changed;
  }

  diff(data, partUpdate) {
    let isChange = false;
    const oldStore = this._applyData || this.oldStore;
    // if (oldStore == null) {
    //   oldStore = this.oldStore || this.model._store;
    // }

    // eslint-disable-next-line
    Object.entries(this.watchFields).forEach(([name, field]) => {
      let oldValue, value;
      if (field.isStore === false) {
        oldValue = field.getValue(oldStore);
        value = field.getValue(data);
      } else {
        oldValue = ModelHelper.getFieldValue(field, oldStore);
        value = ModelHelper.getFieldValue(field, data);
      }

      // 局部更新时，判断是否存在值
      if (partUpdate && value === void 0) {
        return;
      }

      if (value != null || oldValue != null) {
        if (value !== oldValue || Array.isArray(value)) {
          isChange = true;
          this.addChange(field, value, oldStore);
        }
      }
    });
    // this.oldStore = { ...oldStore };
    return isChange;
  }

  apply(options) {
    const { partUpdate, force } = options || {};

    if (force || this.status === WatchStatus.changed) {
      // 设置当前应用的数据
      this._applyData = this.item || this.model.getStore();
      // 触发同步监听
      if (this.syncWatchList.length) {
        const syncChangeList = this.getChangeList(true);
        if (syncChangeList.length) {
          applyWatch(this, syncChangeList, partUpdate);
        }
      }

      // this.syncWatchList.length && applyWatch(this, true, index);

      // 如果监听更新已启动，则将当前变更更新到变更列表
      if (this.pending) {
        const changeList = this.getChangeList(false);
        // 如果在应用中，就直接执行
        // if (this.applying) {
        //   changeList.length && applyWatch(this, changeList, partUpdate);
        // } else {

        // }
      } else {
        const changeList = this.getChangeList(false);
        if (changeList.length) {
          this.pendingChanges = changeList;
          this.pending = new Promise((resolve) => {
            setTimeout(() => {
              // this.applying = true;
              const list = this.pendingChanges;
              const watcherData = {
                model: this.model,
                oldStore: this.oldStore,
                item: this.item,
              };
              this.pending = null;
              this.pendingChanges = null;
              this.endApply();
              applyWatch(watcherData, list, partUpdate);

              resolve();
            }, this.model._triggerTime);
          });
        } else {
          this.endApply();
        }
      }
    }
    this.changeData = {};
    return this.pending;
  }

  // applyByKey(name, options) {
  //     const { data, isSync } = options || {};
  //     let watch;

  //     if (isSync !== true) {
  //         watch = this.watchList.find(item => item.name === name);
  //     }

  //     if (watch == null && isSync !== false) {
  //         watch = this.syncWatchList.find(item => item.name === name);
  //     }

  //     watch && applyItem(data || this.model.getStore(), watch);
  // }

  clear() {
    this.changeData = {};
    this.status = WatchStatus.noChange;
    // this.pendingChanges = null;
    // this.applying = false;
    this.oldStore = null;
  }

  endApply() {
    // 清除变更
    this.clear();

    if (this._applyData) {
      this.buildOldStore(this.item || this.model.getStore());
      this._applyData = null;
    }
  }

  buildOldStore(store) {
    if (store) {
      this.oldStore = Array.isArray(store) ? [...store] : { ...store };
    } else {
      this.oldStore = null;
    }
  }

  getChangeList(isSync) {
    let watcher = this;
    // 如果异步监听已执行，则加入变更队列
    const list = isSync ? [] : this.pendingChanges || [];

    let watchList = isSync ? watcher.syncWatchList : watcher.watchList;

    if (watchList.length && Object.keys(watcher.changeData).length) {
      // 根据changelist来更新应用
      watcher[isSync ? 'syncWatchList' : 'watchList'] = watchList.filter(
        (item) => {
          if (
            item.fields.find((field) =>
              watcher.changeData.hasOwnProperty(field.name),
            )
          ) {
            // 将变化存储
            list.push({
              target: item,
              changeData: Object.assign({}, watcher.changeData),
            });
            return item.mode !== 'once';
          }
          return true;
        },
      );
    }

    return list;
  }
}

function addWatch(watcher, list, name, fields, callback, mode, isApply) {
  if (name && fields && callback) {
    const modelFields = watcher.model.getFields(fields);
    if (fields.length === modelFields.length) {
      watcher.addFields(modelFields);

      const watch = { name, fields: modelFields, callback, mode };
      //根据key进行检测，避免重复watch
      if (
        list.find((item, i) => {
          if (item.name === name) {
            list[i] = watch;
            return true;
          }
        }) == null
      ) {
        list.push(watch);
        isApply = true;
        // watcher.model.__inited && applyItem(watcher.model, watcher.item || watcher.model.getStore(), watcher.oldStore, watch);
      }
      if (isApply && watcher.model.__inited) {
        // 只有新增的时候和设置应用的时候,并且在模型初始化完成之后才会触发监听
        if (watcher.model._store) {
          // 当列表项监听初始化时，不做应用
          if (watcher.item && watcher.oldStore) {
            return;
          }
          applyItem(watcher, watch);
        }
      }
    } else {
      // todo 提示：onWatch失败，字段xxx不在模型中
    }
  }
}

function applyItem(
  watcherData,
  { fields, callback, mode },
  changeData,
  partUpdate,
) {
  const { model, oldStore, item } = watcherData;
  const data = item || model._store;

  let values = fields.map((field) => field.getValue(data));
  // 添加当前数据和变更之前数据
  values.push(data, { oldData:oldStore, changeData, partUpdate });
  callback.apply(model, values);

  // 将只触发一次的监听过滤掉
  return mode !== 'once';
}

function applyWatch(watcherData, changeList, partUpdate) {
  // const data = watcher.item || watcher.model._store;
  changeList.forEach((item) => {
    // applyItem(watcher.model, { ...item.changeData, ...data }, item.target);
    applyItem(watcherData, item.target, item.changeData, partUpdate);
  });
}

class DataListModelWatcher {
  constructor(model) {
    this.model = model;
    this.clear();
  }

  getKeyValue(item) {
    return this.model.getItemVK(item);
  }
  clear() {
    this.dataWatcher = {};
  }

  getDataWatcher(item) {
    const key = this.getKeyValue(item);
    let watcher = this.dataWatcher[key];
    if (watcher == null) {
      this.dataWatcher[key] = watcher = new DataModelWatcher(this.model, item);
      watcher.item = item;
    }
    return watcher;
  }

  /**
   * 添加监听，高性能异步触发
   * @param {object} item list的数据项
   * @param {string} name
   * @param {[]:string} fields
   * @param {function} callback
   * @param {string} mode
   * @param {boolean} isApply 是否初始化就执行
   * @returns
   */
  onItem(item, name, fields, callback, mode, isApply) {
    const watcher = this.getDataWatcher(item);
    watcher && watcher.on(name, fields, callback, mode, isApply);
    return this;
  }
  offItem(item, name) {
    if (name) {
      const watcher = this.getDataWatcher(item);
      watcher && watcher.off(name);
    } else {
      this.dataWatcher[key] = null;
    }
    return this;
  }

  diffItem(item) {
    const watcher = this.getDataWatcher(item);
    if (watcher) {
      // const oldStore = watcher.item;

      const result = watcher.diff(item);
      // if (result) {
      //   watcher.item = { ...item };
      // }
      return result;
    }
  }

  applyItem(item) {
    const watcher = this.getDataWatcher(item);
    watcher.item = item;
    return watcher.apply({ partUpdate: true });
  }
}

// const WatchDecorator = {
//   Data: {

//   }
// }

export { DataListModelWatcher, DataModelWatcher, WatchStatus };

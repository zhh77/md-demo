import { DataHelper } from 'md-base';
import DataMocker from './dataMocker';
function findFieldByKey(model, key) {
  return model._fields.find((field) => field.key === key);
}

class LocalStore {
  constructor(model) {
    const mock = model._dataAction.mock;
    const name = mock?.store || model._modelName;
    this.name = 'md-store-' + name;
    this.mockConfig = mock || {};

    this.model = model;
    let store = localStorage.getItem(this.name);
    if (store == null) {
      let initData = model._dataAction.mock?.initData;
      if (initData === true) {
        initData = DataMocker.mockList(model);
      }
      if (initData) {
        this.store = store = initData;
        this.save();
        // localStorage.setItem(this.name, JSON.stringify(store));
      }
    } else {
      store = JSON.parse(store);
    }

    this.store = store && Array.isArray(store) ? store : [];
  }

  getMockConfig(name) {
    return this.mockConfig[name];
  }

  filter(params, filterModel, handler) {
    let data = this.store;
    if (data.length && params) {
      return data.filter((item, i) => {
        let result = true;
        Object.entries(params).find(([key, value]) => {
          if (value != null && value != '') {
            const field = findFieldByKey(filterModel || this.model, key);
            // 字段存在时进行过滤
            if (field) {
              if (field.filterKey) {
                // if(!Array.isArray(field.filterKey)) {
                result = compare(
                  DataHelper.getValue(item, field.filterKey),
                  value,
                );
                // }
              } else {
                result = compare(field.getValue(item), value);
              }
            }

            if (handler) {
              const handlerResult = handler(result, key, field, value, item, i);
              if (handlerResult !== void 0) {
                result = handlerResult;
              }
            }
          }

          return !result;
        });

        return result;
      });
    }
    return data;
  }

  getKeyField() {
    const keyField = this.model.getKeyField();
    if (keyField == null) {
      console.error(
        `MD-Mock: 模型【${this.model._modelName}】未指定主键字段, Mock操作失败!`,
      );
      return;
    }

    return keyField;
  }

  getKeyParams(data) {
    const keyField = this.getKeyField();
    if (keyField) {
      let params = {};
      keyField.setValue(
        keyField.getActionValue(keyField.getValue(data), data),
        params,
      );
      return params;
    }
  }

  setKey(data) {
    const keyField = this.getKeyField();
    if (keyField) {
      keyField.setValue(Date.now(), data);
    }
  }

  query(data) {
    const mockConfig = this.getMockConfig('query');
    let fnHanlder;
    if (mockConfig) {
      if (mockConfig.fields) {
        let handlerFields = {};
        Object.entries(mockConfig.fields).forEach(([name, config]) => {
          handlerFields[name] = (result, field, value, item, i) => {
            // 是否忽略
            if (config.ignore) {
              return true;
            }
            // 指定key
            if (config.key) {
              const compareValue = DataHelper.getValue(item, config.key);

              return compare(compareValue, value);
            }
          };
        });

        fnHanlder = (result, key, field, value, item, i) => {
          const handler =
            (field && handlerFields[field.name]) || handlerFields[key];
          if (handler) {
            return handler(result, field, value, item, i);
          }
        };
      }
    }

    return this.filter(data, this.model.filterModel, fnHanlder);
  }

  find(data) {
    // 查询
    let result = this.filter(data, this.model);
    return result && result[0];
  }
  insert(data) {
    if (data) {
      this.setKey(data);
      DataMocker.extendData(this.model, data);
      this.store.push(data);
      this.save();
    }
    return data;
  }

  update(data) {
    const params = this.getKeyParams(data);
    if (params) {
      let updateData = this.filter(params);
      if (updateData?.length) {
        DataMocker.extendData(this.model, data);
        Object.assign(updateData[0], data);
        this.save();

        return updateData[0];
      }
    }
  }

  delete(data) {
    let newStore = [];
    this.filter(data, null, (isMatch, key, field, value, item, i) => {
      if (!isMatch) {
        newStore.push(item);
      }
    });
    this.store = newStore;
    this.save();
  }

  save() {
    localStorage.setItem(this.name, JSON.stringify(this.store));
  }
}

// const ActionEngine() {
//   common(type, url, options, model) {
//     const store = new DataStore(model);
//     const data = options.data;

//     if(store[type]) {
//       return store[type](options?.data);
//     }

//     return null;
//   }
// }

// function compareFieldValue(field, compareValue, value) {
//   if (field.dataType === 'string' && field.bizType != 'enum' && typeof value === 'string') {
//     return compareValue ? compareValue.indexOf(value) > -1 : !!value;
//   }
//   return compareValue == value;
// }

function compare(value, compareValue) {
  if (typeof value === 'string' && typeof compareValue === 'string') {
    return compareValue.indexOf(value) > -1;
  }

  return compareValue == value;
}

export default LocalStore;

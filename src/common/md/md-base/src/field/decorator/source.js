import Decorator from '../../common/decorator';
import { DataHelper } from '../../common/help';

// 字段数据源插件
const FieldSource = Decorator.create({
  init() {
    const { source, sourceConfig } = this;

    let sourceModel,
      sourceField,
      dataHandler,
      filterField,
      dataEnum,
      isAsync = false;

    if (sourceConfig) {
      let { valueKey, labelKey, model, field } = sourceConfig;
      dataEnum = sourceConfig.dataEnum;

      if (source == null) {
        // 设置模型数据源时
        if (model) {
          //关联自身时
          if (model === 'self') {
            sourceModel = this.model;
          } else {
            // 初始化数据源模型
            sourceModel =
              typeof model === 'function'
                ? model(this)
                : model.createListModel
                ? model.createListModel(sourceConfig.modelExtend)
                : model;
          }

          if (sourceModel) {
            // 关联模型数据变化更新数据源
            sourceModel.onChange(`updateSource(${this.name})`, () => {
              this.updateSource();
            });

            let { valueField, labelField } = sourceConfig;
            if(valueField) {
              valueField = sourceModel.getField(valueField);
              if(valueField) {
                valueKey = valueField.key;
              }
            }

            if(labelField) {
              labelField = sourceModel.getField(labelField);
              if(labelField) {
                labelKey = labelField.key;
              }
            }
          }
        } else if (field) {
          const type = typeof field;
          // 当设置有字段数据源时
          if (type === 'string') {
            field = this.model.getField(field);
          } else if (type === 'function') {
            field = field(this);
          }

          if (field && field.__mdField) {
            sourceField = field;
            field.onChange(`updateSource(${this.name})`, () => {
              this.updateSource();
            });
          }
        } else if (dataEnum) {
          if (typeof dataEnum === 'function') {
            dataEnum = dataEnum(this);
          }
          if (dataEnum.__mdEnum) {
            dataEnum.onChange(`updateSource(${this.name})`, () => {
              this.updateSource();
            });
          } else {
            dataEnum = null;
          }
        }
      } else if (typeof source === 'function') {
        // 记录是否异步获取source
        isAsync = DataHelper.isAsyncFunction(source);
      }

      // 数据源处理器，进行字段转换
      if (valueKey || labelKey) {
        dataHandler = (data) => {
          return DataHelper.getData(data, (sourceData) => {
            if (sourceData) {
              sourceData.forEach((item) => {
                if (valueKey) {
                  item.value = getSourceField(valueKey, item, sourceModel);
                }
                if (labelKey) {
                  item.label = getSourceField(
                    labelKey,
                    item,
                    sourceModel,
                    true,
                  );
                }
              });
            }
            return source;
          });
        };
      }

      // filterField = sourceConfig.filterField;
    }
    this._source = { dataHandler, isAsync };
    if (sourceModel) {
      this._source.model = sourceModel;
    } else if (sourceField) {
      this._source.field = sourceField;
    } else if (dataEnum) {
      this._source.dataEnum = dataEnum;
    }
  },
  /**
   * 获取配置的数据源
   */
  getSource() {
    const { model, dataHandler, loadData, field, dataEnum } = this._source;
    // 当正在加载时，返回加载的promise数据
    if (loadData) {
      return loadData;
    }

    let sourceData;
    if (this.source) {
      if (typeof this.source === 'function') {
        sourceData = this.source();
      } else if (Array.isArray(this.source)) {
        sourceData = this.source;
      }
    } else if (model) {
      sourceData = model.isEmpty() ? model.getData() : model._store;
    } else if (field) {
      sourceData = field.getValue();
    } else if (dataEnum) {
      sourceData = dataEnum.getData();
    }

    if (sourceData && dataHandler) {
      if (sourceData.then) {
        this._source.loading = sourceData;

        return new Promise((resolve) => {
          sourceData.then((data) => {
            sourceData = data || [];
            dataHandler(sourceData);
            this._source.loading = null;
            cacheSource(this, sourceData, dataEnum);
            resolve(sourceData);
          });
        });
      } else {
        cacheSource(this, sourceData ? sourceData : [], dataEnum);
        dataHandler(sourceData);
      }
    } else {
      cacheSource(this, sourceData ? sourceData : [], dataEnum);
    }

    return sourceData || [];
  },
  /**
   * 获取字段source的缓存数据，非异步处理使用此方法
   * @returns {Array}
   */
  getSourceCache() {
    let source = this._source.cache;
    if (source) {
      return source;
    }
    source = this.getSource();
    if (Array.isArray(source)) {
      return source;
    }
    return [];
  },
  /**
   * 获取字段source的item对象, 默认值只返回缓存的
   * @param {*} value
   * @param {Boolean} dynamic 是否动态获取，如果匹配不到则会在动态获取
   * @returns
   */
  getSourceItem(value, dynamic) {
    if (value == null) {
      value = this.getValue();
    }
    if (value != null) {
      const { dataEnum, mapping, isAsync } = this._source;
      if (dataEnum) {
        return dataEnum.getItem(value);
      }

      // 已经存在映射直接返回
      let item = mapping && mapping[value];
      if (item) {
        return item;
      }
      // 如果是异步的则需要开启动态执行
      if (isAsync || dynamic) {
        return DataHelper.getData(this.getSource(), () => {
          return this._source.mapping[value];
        });
      }

      // 如果是同步的执行获取，在返回
      this.getSource();
      return this._source.mapping && this._source.mapping[value];
    }
  },
  getSourceLabel(value, dynamic) {
    const item = this.getSourceItem(value, dynamic);
    return item && item.label;
  },
  getSourceModel() {
    return this._source.model;
  },
  /**
   * 触发数据源更新，应用于手动更新数据源
   */
  updateSource(key) {
    if (key == null) {
      key = Date.now();
    }

    if (this.__sourceTriggerKey != key) {
      this.__sourceTriggerKey = key;
      this._triggerUpdate();
      return true;
    }
  },
});

function getSourceField(key, item, model, isLabel) {
  if (typeof key === 'function') return key(item, model);

  let value;
  if (model) {
    const field = model.getField(key);
    value = field.getValue(item);
    return isLabel ? field.formatValue(value, item) : value;
  }

  return item[key];
}

function cacheSource(field, source, dataEnum) {
  // dataEnum 用自己本身的缓存
  if (dataEnum == null) {
    field._source.cache = source;
    field._source.mapping = DataHelper.arrayToObj(source, 'value');
  }
}
export default FieldSource;

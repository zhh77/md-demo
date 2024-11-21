import Main from '../main';

const BaseDataEnum = Main.create({
  name: 'BaseDataEnum',
  title: '基础数据枚举',
  modelType: 'list',
  pager: false,
  fields: [
    {
      name: 'value',
      title: '枚举值',
      dataType: 'any',
      isKey: true,
    },
    {
      name: 'label',
      title: '枚举显示名称',
      dataType: 'string',
    },
  ],
  onEndInit(options) {
    this._mdName = 'dataEnum';
    const { labelKey, valueKey } = options;
    this.onChange('设置映射', (list) => {
      this.enumMapping = {};
      this.enumData = list.map((item) => {
        const value = item[valueKey],
          label = item[labelKey];

        const enumItem = {
          label,
          value,
        };
        this.enumMapping[value] = enumItem;
        return enumItem;
      });

      options.onChange && options.onChange(this.enumData, list);
    });

    // 缓存
    this._caches = {};

    // 触发加载的字段
    if (options.filter && this.filterModel) {
      const cacheField = options.filter.cacheField
        ? this.filterModel.getField(options.filter.cacheField)
        : null;
      if (cacheField) {
        this._cacheField = cacheField;
      }

      this.filterModel.onChange('filterLoad', () => {
        if (cacheField) {
          const key = cacheField.getValue();
          if (key != null) {
            const cache = this._caches[key];
            if (cache) {
              this.setData(cache);
            } else {
              this.load().then(() => {
                this._caches[key] = this.getStore();
              });
            }
          }
        } else {
          this.load();
        }
      });
    }

    options.onCreated && options.onCreated(options);
  },
  props: {
    setCache(key, data) {
      this._caches[key] = data;
    },
    getCache(key) {
      return this._caches[key];
    },
  },
});

class DataEnum {
  __mdEnum = true;
  constructor(options) {
    const { props, onChange, autoLoad } = options;

    let modelOption = { ...options };
    delete modelOption.props;
    if (onChange) {
      modelOption.onChange = onChange.bind(this);
    }

    this.model = BaseDataEnum.create(modelOption);

    props && Object.assign(this, props);
    autoLoad && this.model.load();
  }

  load(params) {
    return this.model.load(params);
  }
  getData(key) {
    const model = this.model;
    let enumData = model.enumData;
    if (key) {
      enumData = model.getCache(key);
      // if (enumData == null && model._cacheField) {
      //   model._cacheField.setValue(key);
      // }
    }
    return enumData || [];
  }
  getItem(value) {
    return this.model.enumMapping[value];
  }
  getLabel(value) {
    return this.model.enumMapping[value]?.label;
  }

  getKey(data) {
    if(this.model._cacheField) {
      return this._cacheField.getValue(data);
    }
  }
  getLoadPromise() {
    return this.model.loadPromise;
  }
  onChange(name, handle) {
    handle && this.model.onChange(name, () => {
      let key;
      if(this.model._cacheField) {
        key = this.model._cacheField.getValue();
      }
      handle(this.getData(key), key);
    })
  }
}

// const DataEnumBuilder = (options) => {

// };

export default DataEnum;

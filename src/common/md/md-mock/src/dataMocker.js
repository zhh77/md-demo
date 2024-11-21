// import moment from "moment";
import Mock from 'mockjs';
import { DataHelper } from '../../md-base/src/common/help';
import BizBuilder from './bizBuilder';

const Random = Mock.Random;

const DataMocker = {
  mock(model) {
    return model.getModelType() === 'Data'
      ? this.mockData(model)
      : this.mockList(model);
  },
  mockList(model) {
    let list = [];

    const pager = model.getPager
      ? model.getPager()
      : { count: 5, pageSize: 10, pageIndex: 1 };
    const count = pager.count || Random.integer(1, 100),
      residue = count - pager.pageSize * pager.pageIndex,
      len = residue > pager.pageSize ? pager.pageSize : Math.abs(residue);

    for (let i = 0; i < len; i++) {
      list.push(this.mockData(model, list));
    }

    // model.setPager && model.setPager({ count });

    return list;
  },
  mockData(model, listData) {
    let data = {};

    model.getFields().forEach((field) => {
      if (field) {
        let value = field.getValue(data);
        if (value != null) {
          return;
        }
        this.mockFieldValue(field, model, data, listData);
        // // 如果是业务类型，先从业务库中取
        // if (field.bizType) {
        //   value = BizBuilder.mockData(
        //     field.bizType,
        //     field,
        //     model,
        //     data,
        //     listData,
        //     this,
        //   );
        // }

        // // 在使用类型生成器
        // if (value == null) {
        //   value = mockByTypeBuilder(field, model);
        // }

        // field.setValue(value, data);
      }
    });
    // 扩展mock数据
    this.extendData(model, data);
    return data;
  },
  extendData(model, data) {
    const extendFields = model._dataAction.mock?.fields;
    if (extendFields) {
      Object.entries(extendFields).forEach(([name, config]) => {
        if (config) {
          const field = config.field || model.getField(name);
          if (field) {
            this.mockFieldValue(field, model, data, [], config);
          } else {
            const value = this.getMockValue(config, data, model);
            value != void 0 && DataHelper.setValue(data, name, value);
          }
        }
      });
    }
  },
  mockFieldValue(field, model, data, listData, config) {
    let value,
      bizType = field.bizType;
    if (config) {
      if (config.mockType) {
        bizType = config.mockType;
      }
      if (config.value) {
        value = config.value(data);
      }
      if (config.random) {
        value = config.random[Random.integer(0, config.random.length - 1)];
      }
    } else {
      value = BizBuilder.mockData(bizType, field, model, data, listData, this);
    }

    // 在使用类型生成器
    if (value == null) {
      value = mockByTypeBuilder(field, model, bizType);
    }

    field.setValue(value, data);
  },
  getMockValue(config, data, model) {
    let value;
    if (config.value) {
      value = config.value.call(model, data);
    } else if (config.random) {
      value = config.random[Random.integer(0, config.random.length - 1)];
    }
    return value;
  },
};

function mockByTypeBuilder(field, model, bizType) {
  const { dataType } = field;

  // 先取业务类型
  let value,
    builder = field.fieldType.bizHandler?.buildValue;

  if (builder == null) {
    builder = BizDataBuilder[bizType];
  }

  if (builder == null) {
    //在通过真实类型和数据类型去获取
    builder = field.fieldType.handler.buildValue;
  }

  if (builder == null) {
    builder = ExtendDataBuilder[dataType] || BaseDataBuilder[dataType];
  }

  // 默认获取基础类型
  if (builder == null) {
    builder = BaseDataBuilder[field.fieldType.baseType];
  }

  if (builder) {
    // 生成mock数据
    value = builder(field, model);

    // 当存在扩展类型和真实字段和数据字段不同时
    if (bizType || field.fieldType.realHandler) {
      value = field.fieldType.handler.convertValue(value, field);
    }
  }
  return value;
}

const BaseDataBuilder = {
  string(field) {
    let { min, max, len } = field;
    return Random.cword(min || 1, max || len || 10);
  },
  date(field) {
    return new Date(Random.datetime());
  },
  number(field) {
    return Random.float(field.min || 0, field.max || 1000);
  },
  boolean(field) {
    return Random.boolean();
  },
  object(field) {
    // if(field.model) {
    //   return MDMock.mockData(field.model);
    // }
    return null;
  },
  array(field) {
    // if(field.item) {
    //   if(field.item.model) {
    //     return MDMock.mockList(field.model, DataHelper.Random(1,11));
    //   }
    // }
    return [];
  },
};

const ExtendDataBuilder = {
  url(field) {
    return Random.url('http');
  },
  integer(field) {
    return Random.integer(field.min || 0, field.max || 1000);
  },
  dateRange(field) {
    const start = BaseDataBuilder.date(field),
      end = new Date(start + Random.integer(100000, 100000000000));

    return [start, end];
  },
  model(field) {
    if (field.modelConfig?.model) {
      return MDMock.mockData(field.modelConfig?.model);
    }
    return null;
  },
  modelList(field) {
    if (field.modelConfig?.model) {
      return MDMock.mockList(field.modelConfig?.model);
    }
    return null;
  },
};

const BizDataBuilder = {
  enum(field) {
    const source = field.getSource ? field.getSource() : field.source;
    let value = null;

    if (source && source.length) {
      const isArray = field.dataType === 'array';

      value = isArray
        ? new Array(
            Random.integer(field.min || 1, field.max || source.length || 3),
          )
        : [''];

      value.forEach((item, index) => {
        value[index] = source[Random.integer(0, source.length - 1)].value;
      });

      return isArray ? value : value[0];
    }
    return value;
  },
  cnName(field) {
    // 中文名
    return Random.cname();
  },
  email(field) {
    return Random.email();
  },
  id(field) {
    // return Random.increment();
    return Random.integer(field.min || 0, field.max || 1000);
  },
  guid(field) {
    return Random.guid();
  },
  image(field) {
    return Random.image(
      field.size ? `${field.size.width}x${field.size.height}` : null,
    );
  },
};

export default DataMocker;

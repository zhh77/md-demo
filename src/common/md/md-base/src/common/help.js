const copyDataTypes = ['Object', 'Array'];

export const ModelLogger = {
  getLog(postion, model, field, log) {
    const modelName = typeof model === 'string' ? model : model._modelName;
    let fieldLog = '';

    if (field) {
      const filedName =
        typeof field === 'string' ? field : field.name || field.title;
      fieldLog = `-字段[${filedName}]`;
    }

    return `ModelDriver - ${postion} ： 模型[${modelName}]${fieldLog} : ${log}!`;
  },
  log(postion, model, field, log) {
    console.log(this.getLog(postion, model, field, log));
  },
  warn(postion, model, field, log) {
    console.warn(this.getLog(postion, model, field, log));
  },
  error(postion, model, field, log) {
    console.error(this.getLog(postion, model, field, log));
  },
};

export const DataHelper = {
  getDataType(data) {
    let type = (Object.prototype.toString
      .call(data)
      .match(/\[object (.*?)\]/) || [])[1];
    //增加自定义类型获取
    //    if(typeStr === 'Object'){
    //       typeStr += `:${o.constructor.name}`
    //    } else
    //    if(type === 'Number'){
    //        //判断为非数字 , NaN，Infinity
    //       if(!isFinite(o)){
    //           //判断为NaN类型
    //          type = isNaN(o) ? 'NaN' : 'Infinity'
    //       }
    //    }
    return type.toLowerCase();
  },
  getRandom: (start, end) => {
    // 当根据长度进行生成时
    if (end == null) {
      const len = start;
      start = '1';
      new Array(len - 1).fill(0).forEach(() => {
        start += '0';
      });
      start = start * 1;
      end = start * 10 - 1;
    }
    return Math.floor(Math.random() * (end - start) + start);
  },
  getValue: (obj, key) => {
    if (obj != null) {
      let value = obj;
      const keys = Array.isArray(key) ? key : key.split('.');
      for (let i = 0, k; (k = keys[i]); i++) {
        value = value[k];
        if (value == null) {
          break;
        }
      }
      return value;
    }
  },
  setValue: (obj, key, value) => {
    if (obj == null) {
      obj = {};
    }
    const keys = Array.isArray(key) ? key : key.split('.');
    let target = obj,
      tmpObj;

    keys.forEach((k, i) => {
      tmpObj = target[k];
      if (i === keys.length - 1) {
        target[k] = value;
      } else {
        if (tmpObj == null) {
          target[k] = tmpObj = {};
        }
        target = tmpObj;
      }
    });
    return obj;
  },
  deepClone(obj) {
    //进行深拷贝的对象，只能为Array和Object
    if (obj == null || !copyDataTypes.includes(obj.constructor.name)) {
      return obj;
    }

    let objClone;
    if (Array.isArray(obj)) {
      objClone = obj.map((item) => this.deepClone(item));
    } else if (typeof obj === 'object') {
      objClone = {};

      Object.entries(obj).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          objClone[key] = this.deepClone(value);
        } else {
          objClone[key] = value;
        }
      });

      return objClone;
    }
    return obj;
  },
  /**
   * 数据对象映射，将目标对象根据mapping映射成为新的结构
   * @param {*} target
   * @param {*} mapping
   * @param {Object} options {reverse , merge } reverse:是否反向映射,merge: merge模式，合并原有
   */
  applyMapping(target, mapping, options) {
    if (target && mapping) {
      const { reverse, merge } = options || {};
      let obj = merge ? {} : target;
      // let result = {};
      Object.entries(mapping).forEach((settings) => {
        let key = reverse ? settings[1] : settings[0];
        let path = reverse ? settings[0] : settings[1];

        const value = this.getValue(target, path);
        if (value !== void 0) {
          // merge模式下，会清除原来数据
          merge && this.setValue(target, path, undefined);
          this.setValue(obj, key, value);
        }
      });
      return obj;
      // return result;
    }
    return target;
  },
  template(tmpl, data) {
    if (tmpl && data) {
      return tmpl.replace(/\${([\s\S]*?)}/g, function (s, key) {
        return DataHelper.getValue(data, key);
      });
    }
    return '';
  },
  formatDate(date, format) {
    if (typeof date == 'string') {
      return date;
    }

    if (!format) format = 'YYYY-MM-DD hh:mm:ss';

    if (!date || date == null) return null;
    var o = {
      'M+': date.getMonth() + 1, // 月份
      'D+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds(), // 毫秒
    };
    if (/(Y+)/.test(format))
      format = format.replace(
        RegExp.$1,
        (date.getFullYear() + '').substr(4 - RegExp.$1.length),
      );
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(format))
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length),
        );
    }
    return format;
  },
  deepMergeForNew(target, source, mergeArray) {
    return this.deepMerge(target, source, { mergeArray, mode: 'new' });
  },
  deepMerge(target, source, options) {
    const { mergeArray, mode } = options || {};

    let obj = target;
    const type = this.getDataType(target);
    if (mode === 'new') {
      if (type === 'array') {
        obj = target.concat();
      } else if (type === 'object') {
        obj = { ...target };
      }
    }

    Object.entries(source).forEach(([key, value]) => {
      if (value !== void 0) {
        const item = obj[key];
        if (value === null) {
          obj[key] = value;
        } else if (this.getDataType(value) === 'object') {
          obj[key] =
            item == null
              ? Object.assign({}, value)
              : this.deepMerge(item, value, options);
        } else if (mergeArray && Array.isArray(value) && Array.isArray(item)) {
          obj[key] = [].concat(item, value);
        } else {
          obj[key] = value;
        }
      }
    });
    return obj;
  },
  /**
   * 合并当前空的数据(浅拷贝)，如果当前属性不为空则不会合并, 可以设置强制合并项
   * @param {object} target 合并的目标对象
   * @param {object} source 合并源对象
   * @param {array} deepMergeKeys 需要强制合并的项名称数组
   */
  mergeForEmpty(target, source, deepMergeKeys) {
    if (target == null) {
      target = { ...source };
    } else {
      Object.entries(source).forEach(([key, value]) => {
        if (value != void 0) {
          const item = target[key];
          if (item == null || !target.hasOwnProperty(key)) {
            target[key] = value;
          } else if (deepMergeKeys && deepMergeKeys.includes(key)) {
            this.deepMerge(item, value, { mergeArray: false });
          }
        }
      });
    }

    return target;
  },
  /**
   * 合并对象的子项
   */
  mergeChildren(source, extend, excludes) {
    if (extend && source) {
      Object.entries(extend).forEach(([key, value]) => {
        if (excludes && excludes.includes(key) || value == null) {
          return;
        }

        const originValue = source[key];
        if (originValue == null) {
          source[key] = value;
        } else if (
          DataHelper.getDataType(originValue) === 'object' &&
          DataHelper.getDataType(value) === 'object'
        ) {
          source[key] = { ...originValue, ...value };
        }
      });
    }
  },
  copy(target, fields) {
    let obj = {};
    Object.entries(target).forEach(([key, value]) => {
      if (value != null && fields.includes(key)) {
        obj[key] = value;
      }
    });
    return obj;
  },
  copyByFilter(target, filter) {
    let obj = {};
    Object.entries(target).forEach(([key, value]) => {
      if (value != null && !filter.includes(key)) {
        obj[key] = value;
      }
    });
    return obj;
  },
  // merge(target, source) {
  //   return Object.assign(target, source);
  // },
  // mergeDeep(target, source) {
  //   return Object.assign(target, source);
  // },
  /**
   * 获取数据，兼容同步和异步
   * @param {*} data
   * @param {*} handler
   * @returns
   */
  getData(data, handler) {
    if (data.then) {
      return data.then((result) => handler(result));
    } else {
      return handler(data);
    }
  },
  /**
   * map的增强方法，会剔除空值
   * @param {*} array
   * @param {*} handler
   */
  arrayMap(array, handler) {
    if (Array.isArray(array)) {
      let list = [];
      array.forEach((item, i) => {
        const result = handler(item, i);
        if (result != void 0) {
          list.push(result);
        }
      });
      return list;
    }
  },
  /**
   * 查找数据项，支持子项查询
   * @param {*} data
   * @param {*} filter
   * @param {*} childrenKey
   */
  findItem(data, filter, childrenKey) {
    let result;

    data.find((item) => {
      if (childrenKey) {
        const children = data[childrenKey];
        const isItem = filter(item);
        if (isItem) {
          result = item;
        } else if (Array.isArray(children)) {
          result = this.findItem(children, filter, childrenKey);
        }
        return result != null;
      }
    });

    return result;
  },
  arrayToObj(arr, key) {
    let obj = {};
    arr.forEach((item) => {
      let value = item[key];
      if (value != null) {
        obj[value] = item;
      }
    });
    return obj;
  },
  // 检查函数是否为 async 函数
  isAsyncFunction(func) {
    return func.constructor.name === 'AsyncFunction';
  },
};

export const ModelHelper = {
  /**
   * 循环字段并执行处理函数
   * @param {*} fields
   * @param {*} handler
   * @returns
   */
  mapFields(fields, handler) {
    if (Array.isArray(fields)) {
      return fields.map((field) => {
        return typeof field === 'string'
          ? handler(field, null)
          : handler(field.name, field);
      });
    } else if (typeof fields === 'object') {
      return Object.entries(fields).map(([name, field]) => {
        return handler(name, field);
      });
    }
  },
  /**
   * 获取字段的值
   * @param {*} field
   * @param {*} data
   * @returns
   */
  getFieldValue(field, data) {
    return DataHelper.getValue(data, field.getKeyPath());
  },
  /**
   * 转换对象的字段值，并返回转换结果
   * @param {*} fields
   * @param {*} data
   * @returns
   */
  convertByFields(fields, data) {
    let newData = {};
    fields.forEach((field) => {
      // 默认忽略掉不做store的字段
      if (field.isStore !== false) {
        const value = this.getFieldValue(field, data);
        if (value !== undefined) {
          field.setValue(value, newData);
        }
      }
    });
    return newData;
  },
  /**
   * 获取扩展的字段，跟根据fields来获取或者扩展model的字段
   * @param {*} model
   * @param {*} fields
   * @returns
   */
  getExtendFields(model, fields, handler, clearPrivate) {
    const fnHandler = (fieldOptions, extend) => {
      const result = handler && handler(fieldOptions, extend);
      return result || fieldOptions;
    };

    const exendOptions = {
      clearPrivate,
    };

    // 数组模式时，是替换模式，会用新的fileds替换原有的field
    if (Array.isArray(fields)) {
      return this.mapFields(fields, (name, extend) => {
        const field = model[name];
        return fnHandler(
          field ? field.extend(extend, exendOptions) : { ...extend, name },
          extend,
        );
      });
    } else {
      // 对象模式时，是扩展模式，在原有的模型上面扩展和追加
      const newFields = this.mapFields(model.getFields(), (name, field) => {
        const extend = fields && fields[name];
        return fnHandler(field.extend(extend, exendOptions), extend);
      });

      if (fields) {
        // 追加新字段
        this.mapFields(fields, (name, extend) => {
          if (model[name] == null) {
            newFields.push(fnHandler({ ...extend, name }));
          }
        });
      }

      return newFields;
    }
  },
  getFieldChain(model, paths, data, createChainField) {
    let chain = [],
      field;

    if (paths && paths.length > 0) {
      let current = model,
        i = 0,
        len = paths.length,
        keys = [];

      while (i < len) {
        if (current) {
          // 为模型对象时
          if (current.__mdModel) {
            current = current[paths[i]];
          } else if (current.fieldModel) {
            // 为字段子模型时
            current = current.fieldModel[paths[i]];
          }

          field = current;
          // 如果有渲染字段，会用渲染字段
          if (field.__mdField && data) {
            field = field.getRenderField(data) || field;
          }
        }

        chain.push(field);

        i++;
      }
    }
    let config = {
      chain,
      field: chain[chain.length - 1],
    };

    if (createChainField) {
      config.chainField = buildChainField(field, chain);
    }
    return config;
  },
};

function buildChainField(field, chain) {
  return field.extend({
    getChian() {
      return chain;
    },
    setChainValue(value, data, isAction) {
      let parentData = data,
        currentValue,
        end = chain.length - 1;

      const method = isAction ? 'setActionValue' : 'setValue';
      setChainValue(method, chain, 0, data, value);
      return data;
    },

    getChainValue(data) {
      let value = data;
      chain.find((nodeField) => {
        value = nodeField.getValue(value);
        if (value == null) {
          return true;
        }
      });
      return value;
    },
  });
}

function setChainValue(method, chain, i, data, value) {
  const nodeField = chain[i];
  if (nodeField) {
    if (i < chain.length - 1) {
      let currentValue = nodeField.getValue(data);
      if (currentValue == null) {
        currentValue = {};
        setChainValue(method, chain, i + 1, currentValue, value);
        nodeField[method](currentValue, data);
      }
    } else {
      nodeField[method](value, data);
    }
  }
}

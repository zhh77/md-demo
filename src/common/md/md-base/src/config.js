/**
 * Configuration 配置文件
 */

import Configuration from "./common/configuration";
import { DataHelper } from "./common/help";

// 验证器配置
Configuration.register("Validator", {
  BaseRule: {
    string: {
      required(field, value, ruleValue) {
        return ruleValue ? value != null && value !== "" : true;
      },
      max(field, value, ruleValue) {
        return value.length <= ruleValue;
      },
      min(field, value, ruleValue) {
        return value.length >= ruleValue;
      },
      len(field, value, ruleValue) {
        // eslint-disable-next-line
        return value.length == ruleValue;
      },
      regular(field, value, ruleValue) {
        let regular;
        const type = DataHelper.getDataType(ruleValue);
        if (type === "regexp") {
          regular = ruleValue;
        } else if (type === "string") {
          regular = new RegExp(ruleValue);
        }
        return regular ? regular.test(value) : false;
      },
    },
    number: {
      required(field, value, ruleValue) {
        return ruleValue ? value != null : true;
      },
      max(field, value, ruleValue) {
        return value * 1 <= ruleValue * 1;
      },
      min(field, value, ruleValue) {
        return value * 1 >= ruleValue * 1;
      },
      range(field, value, ruleValue) {
        return value * 1 >= ruleValue[0] * 1 && value <= ruleValue[1] * 1;
      },
    },
    date: {
      required(field, value, ruleValue) {
        return ruleValue ? value != null : true;
      },
      max(field, value, ruleValue) {
        return field.convertValue(value) <= field.convertValue(ruleValue);
      },
      min(field, value, ruleValue) {
        return field.convertValue(value) >= field.convertValue(ruleValue);
      },
    },
    boolean: {
      required(field, value, ruleValue) {
        return ruleValue ? value != null : true;
      },
    },
    array: {
      required(field, value, ruleValue) {
        return ruleValue ? value != null && value.length > 0 : true;
      },
      max(field, value, ruleValue) {
        return value.length <= ruleValue;
      },
      min(field, value, ruleValue) {
        return value.length >= ruleValue;
      },
      len(field, value, ruleValue) {
        // eslint-disable-next-line
        return value.length == ruleValue;
      },
    },
  },
});

// 验证器消息配置
/* eslint-disable */
Configuration.register("ValidatorMessage", {
  BaseRule: {
    string: {
      required: "【${field.title}】不能为空！",
      max: "【${field.title}】不能大于【${ruleValue}】个字符！",
      min: "【${field.title}】不能小于【${ruleValue}】个字符！",
      len: "【${field.title}】应为【${ruleValue}】个字符！",
      regular: "【${field.title}】格式不正确！",
      // regular(field, ruleValue) {
      //   const type = DataHelper.getDataType(field.regularMessage);
      //   if(type === 'function') {
      //     return ruleValue(field.getValue());
      //   }
      //   typeof field.regularMessage === 'string';
      //   return field.regularMessage;
      // },
    },
    number: {
      required: "【${field.title}】不能为空！",
      max: "【${field.title}】不能大于【${ruleValue}】！",
      min: "【${field.title}】不能小于【${ruleValue}】！",
    },
    date: {
      required: "【${field.title}】不能为空！",
      max: "【${field.title}】不能大于【${ruleValue}】！",
      min: "【${field.title}】不能小于【${ruleValue}】！",
    },
    boolean: {
      required: "【${field.title}】不能为空！",
    },
    array: {
      required: "【${field.title}】不能为空！",
      max: "【${field.title}】不能超过【${ruleValue}】条数据！",
      min: "【${field.title}】至少需要【${ruleValue}】条数据！",
      len: "【${field.title}】必须要有【${ruleValue}】条数据！",
    },
  },
});

// 请求配置
Configuration.register('DataAction', {
  // 请求的数据映射配置
  DataMapping: {
    Data: {
      // 基础映射规则，如没有配置，则默认会使用该规则
      baseMapping: {
        response: {
          data: ''
        },
      },
    },
    List: {
      query: {
         // request的映射是模型内部转出
         request: {
          pageSize: 'pageSize',
          pageIndex: 'currentPage',
        },
        // response的映射是数据转入模型
        response: {
          list: 'data',
          pageSize: 'data.pageSize',
          pageIndex: 'data.pageIndex',
          total: 'data.total',
        }
        // request: [
        //   { key: 'pageSize', path: 'pageSize' },
        //   { key: 'curPage', path: 'pageIndex' },
        // ],
        // response: [
        //   { key: 'list', path: 'data' },
        //   { key: 'pageSize', path: 'data.pageSize' },
        //   { key: 'pageIndex', path: 'data.pageIndex' },
        //   { key: 'total', path: 'data.total' },
        // ],
      },
    },
  },
  // 服务请求引擎配置，必须配置项，无内置请求
  Engine: {
    get(url, options) {},
    post(url, options) {},
    put(url, options) {},
    delete(url, options) {},
  }
});


// // 字段装饰器
// Configuration.register('Decorator.Field',{});
// // 元模型装饰器
// Configuration.register('Decorator.OriginModel',{});
// // 模型装饰器
// Configuration.register('Decorator.Model',{});

// // 属性中是ui的配置信息，在配置渲染中生效
// Configuration.register("configRenderer.PropUI",{});
// // ui装饰器配置
// Configuration.register('UIDecorator',{})

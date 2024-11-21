import UIService from 'md-antd';
import { Configuration } from 'md-base';
import MockEngine from 'md-mock';
import moment from 'moment';
import axios from 'axios';

// 因为antd需要特殊的日期格式，所以需要将UIConfig的日期转换方案进行替换
function convertDate(value) {
  if (value) {
    if (value.isValid == null) {
      value = moment(value);
    }
    if (value && value.isValid && value.isValid()) {
      return value;
    }
  }
}

const UIConfig = {
  Date: {
    // fieldProps会通过field的属性未做组件的属性，此处Date组件，会使用field的format属性
    fieldProps: ['format'],
    // 属性转换方法，这里就将值和默认值转换成ui组件所需
    propsConvertor: {
      value: convertDate,
      defaultValue: convertDate,
    },
  },
};

// 设置UI的配置
UIService.setUIConfig({
  // antd各日期时间组件设置
  DatePicker: UIConfig.Date,
  'DatePicker.WeekPicker': UIConfig.Date,
  'DatePicker.RangePicker': UIConfig.Date,
  'DatePicker.MonthPicker': UIConfig.Date,
  // 设置Form的属性
  MDForm: {
    // 通过方法进行属性的干预，这里是设置search区的排版
    props(field, props) {
      if (props.scene !== 'search') {
        return {
          labelCol: { span: 6 },
        };
      }
    },
  },
  // 设置Table的默认属性，
  MDTable: {
    // 通过对象进行默认属性的设置
    props: {
      bordered: true,
      pagination: {
        size: 'small',
        showTotal(total) {
          return `共${total}条数据`;
        },
        showSizeChanger: true,
        showQuickJumper: true,
      },
    },
  },
  Operations: {
    props(field, props) {
      if(props.scene === 'table-row') {
        props.align = 'left';
      }
    }
  }
});

const commonRequest = async (type, url, options) => {
  let res;
  if (options.type === 'get') {
    options.params = options.data;
    delete options.data;
    res = await axios.get(url, options);
  } else {
    res = await axios.post(url, options);
  }
  return res;
};
// 设置配置
Configuration.setup({
  // 配置数据行为，
  DataAction: {
    // mock的全局设置
    Mock: {
      // 是否开启mock
      enable: true,
      // enable: window.location.search.indexOf('__mock__') > 0,
      // mock的引擎
      engine: MockEngine,
    },
    // 设置数据映射规则
    DataMapping: {
      // lit模型映射规则
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
            pageSize: 'page.pageSize',
            pageIndex: 'page.currentPage',
            total: 'page.total',
          },
        },
      },
    },
    //注册数据行为引擎(即数据请求)
    Engine: {
      common: commonRequest,
    },
  },
});

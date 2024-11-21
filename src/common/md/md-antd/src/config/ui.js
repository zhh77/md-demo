// import moment from "moment";

// const config = {
//   // 默认属性
//   props: {},
//   // 字段转换属性, 数据内字符是属性直接匹配，对象是属性转换
//   fieldProps: [{ maxLength: "max" }],
//   // 数据源绑定字段
//   sourceProp: "options",
//   属性转换器，会讲props属性进行转换
//   propsConvertor: {}
//   // 自定义初始化方法,复杂的处理可以放在这里
//   init(props) {},
//   // 布局占位，在表单自动布局中使用，数字：在平分布局中占据几格，默认为1个；-1：代表整行
//   layout: 1，//未启用
// };

const UIValueConvert = {
  convertDate(value) {
    if (value) {
      // value = moment(value);
      if (value && value.isValid && value.isValid()) {
        return value;
      }
    }
    return null;
  },
};

const BaseConfig = {
  Input: {
    fieldProps: [{ maxLength: 'max' }, 'placeholder'],
  },
  Date: {
    fieldProps: ['format', 'placeholder'],
    propsConvertor: {
      value: UIValueConvert.convertDate,
      defaultValue: UIValueConvert.convertDate,
    },
  },
};

const UIConfig = {
  Input: BaseConfig.Input,
  'Input.TextArea': Object.assign({ layout: -1 }, BaseConfig.Input),
  'Input.Search': BaseConfig.Input,
  'Input.Group': BaseConfig.Input,
  'Input.Password': BaseConfig.Input,
  AutoComplete: {
    sourceProp: 'options',
  },
  Checkbox: {
    fieldProps: [{ defaultChecked: 'defaultValue' }],
  },
  'Checkbox.Group': {
    sourceProp: 'options',
  },
  Cascader: {
    sourceProp: 'options',
  },
  DatePicker: BaseConfig.Date,
  'DatePicker.WeekPicker': BaseConfig.Date,
  'DatePicker.RangePicker': BaseConfig.Date,
  'DatePicker.MonthPicker': BaseConfig.Date,
  InputNumber: { fieldProps: ['max', 'min', 'precision'] },
  Rate: {},
  Mentions: {
    sourceProp: 'options',
  },
  Radio: {
    fieldProps: [{ defaultChecked: 'defaultValue' }],
  },
  'Radio.Group': {
    sourceProp: 'options',
  },
  Switch: {
    init(field, props) {
      const { format } = field;
      if (format) {
        props.checkedChildren = format[0];
        props.unCheckedChildren = format[1];
      }
      if (props.value != null) {
        props.checked = props.value;
      }
      delete props.value;
    },
  },
  Slider: {
    fieldProps: ['max', 'min'],
  },
  Select: {
    fieldProps: ['placeholder'],
    sourceProp: 'options',
    props: {
      style: {
        width: '100%',
      },
    },
  },
  TreeSelect: {
    sourceProp: 'treeData',
  },
  TimePicker: BaseConfig.Date,
  // Transfer: {},
  // Upload: {},
  // Form: {},
  // Button: {},
  // Row: {},
  // Col: {},
  // Affix: {},
  // Breadcrumb: {},
  // "Breadcrumb.Separator": {},
  // Dropdown: {},
  // "Dropdown.Button": {},
  // Menu: {},
  // "Menu.Item": {},
  // "Menu.SubMenu": {},
  // "Menu.ItemGroup": {},
  // Pagination: {},
  // Avatar: {},
  // Badge: {},
  // Comment: {},
  // Collapse: {},
  // "Collapse.Panel": {},
  // Carousel: {},
  // Card: {},
  // "Card.Grid": {},
  // "Card.Meta": {},
  // Calendar: {},
  // Descriptions: {},
  // Empty: {},
  // List: {},
  // Popover: {},
  // Statistic: {},
  // "Statistic.Countdown": {},
  // Tree: {},
  // Tooltip: {},
  // Timeline: {},
  // Tag: {},
  // Tabs: {},
  // Table: {},
  // "Table.Column": {},
  // rowSelection: {},
  // Alert: {},
  // Drawer: {},
  // Modal: {},
  // Message: {},
  // Notification: {},
  // Progress: {},
  // Popconfirm: {},
  // Result: {},
  // Spin: {},
  // Skeleton: {},
  // Anchor: {},
  // BackTop: {},
  // ConfigProvider: {},
  // Divider: {},
  // Layout: {},
  // "Layout.Sider": {},
  // 内置自动布局配置
  AutoLayout: {
    colNum: 2,
    type: 'fluid', // fluid | fixed
    props: {
      row: {
        gutter: 8,
      },
    },
  },
  MDTable: {
    props: {
      size: 'small',
    },
  },
  // Table: {
  //   propsConvertor: {
  //     model(modelSet,props) {
  //       if(modelSet == null && props.field && props.field.model) {
  //         return props.field.model;
  //       } else {
  //         return modelSet;
  //       }
  //     }
  //   }
  // }
};

export default UIConfig;

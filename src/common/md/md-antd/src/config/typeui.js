const TypeUIConfig = {
  // dataType: {
  //   // 输入组件配置，默认匹配edit场景，search场景如果没有配置则也会使用此配置
  //   input: {
  //     // 组件，字符时会自动在组件库中获取，也可以是具体封装的组件
  //     component: "Input",
  //     // 字段转换属性, 数据内字符是属性直接匹配，对象是属性转换
  //     fieldProps: [{ maxLength: "max" }],
  //     // 默认属性
  //     props: {},
  //     // 初始化方法
  //     init(props){}
  //   },
  //  // search场景配置，没有配置则会读取input的配置
  //  search:{}
  //  // view场景配置，
  //  view:{}
  // },
  string: {
    input: {
      component: 'Input',
    },
  },
  text: {
    input: {
      component: 'Input.TextArea',
    },
  },
  number: {
    input: {
      component: 'InputNumber',
    },
  },
  date: {
    input: {
      component: 'DatePicker',
    },
  },
  boolean: {
    input: {
      component: 'Switch',
    },
  },
  // boolean: {
  //   input: {
  //     component: "Radio.Group",
  //     props: {
  //       options: [
  //         { label: "是", value: true },
  //         { label: "否", value: false },
  //       ],
  //     },
  //   },
  // },
  enum: {
    input: {
      component: 'Select',
      init(field, props) {
        if (field.dataType === 'array') {
          props.mode = 'multiple';
        }
        props.allowClear = !field.required;
      },
    },
    uiScene: {
      hor(field) {
        let config = {
          // 支持的场景
          scenes: ['edit'],
        };

        if (field.dataType === 'array') {
          config.component = 'Checkbox.Group';
        } else {
          config.component = 'Radio.Group';
          config.props = {
            optionType: 'button',
          };
        }
        return config;
      },
      tree: {
        scenes: ['edit'],
        component: 'TreeSelect',
        init(field, props) {
          if (field.dataType === 'array') {
            props.treeCheckable = true;
          }
          props.allowClear = !field.required;
        },
      },
    },
  },
  dateRange: {
    input: {
      component: 'RangePicker',
    },
  },
  int: {
    input: {
      component: 'InputNumber',
      props: {
        precision: 0,
      },
    },
  },
  integer: {
    input: {
      component: 'InputNumber',
      props: {
        precision: 0,
      },
    },
  },
  array: {
    input: {
      component: 'Select',
      props: {
        mode: 'multiple',
      },
    },
  },
  object: {
    component: 'MDForm',
  },
  arrayObject: {
    component: 'MDTable',
  },
  model: {
    component: 'MDForm',
  },
  modelList: {
    component: 'MDTable',
  },
};

export default TypeUIConfig;

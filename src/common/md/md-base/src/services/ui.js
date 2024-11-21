const UIService = {
  createUI(name, component) {
    component._mui = name;
    component._muitype = 'UI';
    return component;
  },
  createTypeUI(name, component) {
    component._muitype = 'TypeUI';
    component._mui = name;
    return component;
  },
  registerTypeUI(config) {
    Object.assign(TypeUI, config);
  },
  getTypeUI(type) {
    if(typeof(type) == 'string') {
      return TypeUI[type];
    } else {
      let fieldType = type.fieldType;
      let config;
  
      if (fieldType) {
        config =
          TypeUI[fieldType.bizType] ||
          TypeUI[fieldType.extendType] ||
          TypeUI[fieldType.baseType];
      }
      return config || TypeUI.string;
    }
  },
  getTypeComponent(field,type) {
    let config = this.getTypeUI(field);
    if(config && config[type || 'input']) {
       return config[type].component
    }
    return null;
  },
  getInputComponent(field) {
    return this.getTypeComponent(field,'input');
  },
  inputFormatValue(field, value) {
    //当组件有自定义格式化时
    let config = this.getTypeUI(field);
    if (config && config.input && config.input.formatValue) {
      return config.formatValue(value);
    }
    return value;
  },
  inputConvertValue(field, value) {
    //当组件有自定义格式化时
    let config = UIService.getTypeUI(field);
    if (config && config.input && config.input.convertValue) {
      return config.input.convertValue(value);
    }
    return value;
  },
};

let TypeUI = {
  string: {
    input: {
      component: null,
      props: null
    },
    view: {
      component:null
    }
  },
  number: {
    input: {
      component: null,
    },
  },
  date: {
    input: {
      component: null,
    },
  },
  boolean: {
    input: {
      component: null,
    },
  },
  enum: {
    input: {
      component: null,
    },
  },
};

export default UIService;

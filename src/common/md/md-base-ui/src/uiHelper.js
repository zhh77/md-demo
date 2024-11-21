const UIStates = ['visible', 'disabled', 'hidden'];

const UIHelper = {
  /**
   * 构建UI属性
   * @param {*} uiConfig 系统配置的UI设置
   * @param {*} uiProps ui的属性
   * @returns
   */
  buildUIProps(uiConfig, uiProps) {
    let propsConvertor, fieldProps;
    const field = uiProps && uiProps.field;

    if (uiConfig != null) {
      fieldProps = uiConfig.fieldProps;
      propsConvertor = uiConfig.propsConvertor;

      let props = uiConfig.props;
      if (typeof props === 'function') {
        props = props(field, uiProps);
      }
      // 复制默认属性
      uiProps = Object.assign({}, props, uiProps);
    } else {
      uiProps = { ...uiProps };
    }

    if (field && uiProps.__mui == null) {
      // 首先转型系统UI配置中关联字段属性
      if (fieldProps) {
        const setUIProps = (prop, fieldProp) => {
          if (uiProps[prop] == null) {
            const value = field[fieldProp];
            if (value != null) {
              uiProps[prop] = value;
            }
          }
        };

        fieldProps.forEach((prop) => {
          if (typeof prop === 'object') {
            Object.keys(prop).forEach(([uiProp, fieldProp]) =>
              setUIProps(uiProp, fieldProp),
            );
          } else {
            setUIProps(prop, prop);
          }
        });
      }

      // 处理字段上设置的UIConfig
      if (field.uiConfig) {
        let config = field.uiConfig[uiProps.scene] || field.uiConfig;
        // 当字段有设置自定义属性时
        config.props && Object.assign(uiProps, config.props);
        //  let uiStates;
        //  // 状态设置
        //  UIStates.forEach((state) => {
        //   const value = config[state];
        //   if (value != null) {
        //     uiStates = uiStates || {};
        //     uiStates[state] = value;
        //   }
        // });

        // if (uiStates) {
        //   uiProps = uiProps || {};
        //   uiProps._states = uiStates;
        // }

        // 当存在字段UI设置存在属性转换器时
        if (config.propsConvertor) {
          propsConvertor = { ...propsConvertor, ...config.propsConvertor };
        }
      }
    }

    // 有自定义转换时，转换defalutValue和value的值；
    // if (uiConfig.convertValue) {
    //   let defaultValue =
    //     uiProps.defaultValue != null
    //       ? uiProps.defaultValue
    //       : field.defaultValue;

    //   if (defaultValue != null) {
    //     uiProps.defaultValue = uiConfig.convertValue(defaultValue);
    //   }
    //   if (field.value != null) {
    //     uiProps.value = uiConfig.convertValue(field.value);
    //   }
    // }
    // 执行属性转换器
    this.convertProps(uiProps, propsConvertor);

    // 执行扩展属性方法
    if (uiProps.extendProps) {
      uiProps.extendProps(uiProps);
      delete uiProps.extendProps;
    }

    // 最后系统配置中初始化方法
    uiConfig && uiConfig.init && uiConfig.init(field, uiProps);

    return uiProps;
  },
  convertProps(props, convertor) {
    if (convertor) {
      Object.entries(convertor).forEach(([name, convert]) => {
        props[name] = convert(props[name], props);
      });
    }
  },
  buildPlaceholder(field, scene) {
    if(field.placeholder) {
      return field.placeholder;
    }

    if (
      field.fieldType.bizType === 'enum' ||
      field.fieldType.baseType === 'array'
    ) {
      return scene === 'search' ?  `全部` : `请选择${field.title}`;
    }

    return `请输入${field.title}`;
  },
};

export default UIHelper;

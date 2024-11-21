import React, { forwardRef, useEffect, useState } from 'react';
import UIService from 'md-base-ui';
import './autoLayout';

const UIRenderer = {
  // 组件动态渲染，自动渲染使用（schema渲染）
  render(UI, props, children) {
    if (props && props._states) {
      if (props._states.visible === false) {
        return null;
      }
      delete props._states;
    }
    return <UI {...props}>{children || props?.children}</UI>;
  },
  wrapper(ui, WrapperUI, wrapperProps) {
    return <WrapperUI {...wrapperProps}>{ui}</WrapperUI>;
  },
  wrapperByEmpty(children) {
    return <>{children}</>;
  },
  build(UI, name, config) {
    return forwardRef(config && config.sourceProp ? this.buildSourceUI(UI, name, config.sourceProp) : this.buildUI(UI, name));
  },
  // 构建普通UI
  buildUI(UI, name) {
    return (props, ref) => {
      props = this.initProps(name, props);
      if (props != null) {
        const field = props.field;

        return <UI {...props} ref={ref} />;
      }

      return null;
    };
  },
  // 构建数据源UI
  buildSourceUI(UI, name, source) {
    return (props, ref) => {
      let field;
      props = this.initProps(name, props);

      if (props == null) {
        return null;
      }
      field = props.field;
      if (field == null) {
        return;
      }

      const initData = props[source];

      const [data, setData] = useState(initData || []);
      if (field) {
        props[source] = data;
      }

      useEffect(() => {
        if (field && field.fieldType.bizType === 'enum') {
          if (field.getSource) {
            (async function () {
              const res = await field.getSource(props);
              setData(res);
            })();
          } else if (Array.isArray(field.source)) {
            setData(field.source);
          }
        }
      }, [field?.__sourceTriggerKey]);

      return <UI {...props} ref={ref}/>;
    };
  },
  initProps(name, props) {
    props = UIService.initProps(name, props);

    // if (UIService.checkFieldVisible(props) === false) {
    //   return null;
    // }
    // if (props._states) {
    //   if (props._states.visible === false) {
    //     return null;
    //   }
    //   delete props._states;
    // }
    return props;
  },
  renderField(field, props, data, scene) {
    const FieldRenderer = UIService.getUI('FieldRenderer');
    return <FieldRenderer scene={scene} key={Date.now()} data={data} {...props} field={field} />;
  },
  renderModel(model, props, scene) {
    const type = model.getModelType();
    const Component = UIService.getUI(type === 'List' ? 'MDTable' : 'MDForm');
    if (Component) {
      return <Component scene={scene} key={Date.now()} {...props} model={model} />;
    }
  },
};

export default UIRenderer;

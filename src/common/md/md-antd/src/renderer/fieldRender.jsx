import React from 'react';
// import UIScene from "../config/scene";
import UIService from 'md-base-ui';
import { useState, useEffect } from 'react';
import MD, { DataHelper } from 'md-base';
import FieldTip from './fieldTip';

const FilterProps = ['_inform', '_index', 'data', 'bindChange', 'component', 'uiConfig'];
const FieldRender = props => {
  const field = props.field;
  if (field == null) {
    return null;
  }

  const { _inform, data, bindChange, renderKey, value } = props;
  // 优先获取数据的场景状态
  let scene = field.model.getDataState('scene', data) || props.scene;
  // let defaultValue;

  const [uiValue, setValue] = useState(() => {
    return field.getValueByUI(data);
  });

  const [mdKey, setMdKey] = useState(0);
  // const [uiConfig, setUIConfig] = useState(config);

  // 获取渲染字段
  const createRenderField = updateOptions => {
    const rdField = field.createRenderField(data, scene, updateOptions) || field;
    // 字段在不同场景多次渲染时，需要设置renderKey，list不需要
    const name = `fieldRender_${scene}_${renderKey || ''}`;
    rdField.onChange(name, value => {
      // if (value != uiValue) {
      // setChangeByField(true);
      setValue(value);
      // }
    });
    // 监听模型变更
    rdField.onUpdate(name, updateAttr => {
      if (updateAttr && updateAttr.renderState !== rdField._vRender) {
        changeField(createRenderField(updateAttr));
      } else {
        const value = rdField.getValueByUI(data);
        // 更新值
        setValue(value);
        setMdKey(Date.now());
      }
    });
    // 监听UI更新
    // rdField.onUpdateUI(name, setUIConfig, data);

    // rdField.onChangeRender(name, field => {
    //   createRenderField(field);
    //   changeField(field);
    // });
    return rdField;
  };

  const changeField = newField => {
    if (newField) {
      if (newField != renderField) {
        renderField.clearLinks(`fieldRender{${renderKey || ''}}`);
      }
      setRenderField(newField);
      const value = newField.getValueByUI(data);
      // 更新值
      setValue(value);
    }
  };

  const [renderField, setRenderField] = useState(createRenderField);

  // 当scene变更时，如果存在渲染字段，则会判断渲染字段是否变更，变化的话，会清除原有渲染字段的绑定
  useEffect(() => {
    if (renderField) {
      if (field.getRenderOptions || field.model._dynamicField) {
        const newField = createRenderField();
        changeField(newField);
        // if (newField) {
        //   if (newField != renderField) {
        //     renderField.clearLinks(`fieldRender{${renderKey || ''}}`);
        //   }
        //   setRenderField(newField);
        // }
      }
    }
  }, [scene, field]);

  if (UIService.checkFieldRender(renderField, uiValue) === false) {
    return;
  }

  let Component = props.component,
    uiProps = {},
    uiScene;

  const uiConfig = renderField.uiConfig;
  // 当有自定义UI时
  if (uiConfig) {
    let config = uiConfig[scene] || uiConfig || {};
    let configProps = config.props;

    if (Component == null && config.component) {
      Component = UIService.getUI(config.component);
    }
    if (Component && config.props) {
      if (typeof configProps === 'function') {
        configProps = configProps(renderField);
      }
      props = Object.assign({}, configProps, props);
    }
    // 自定义UI中场景定义
    if (configProps && configProps.scene) {
      uiScene = configProps.scene;
    }
    // uiScene = props.scene;
  }
  uiProps = DataHelper.copyByFilter(props, FilterProps);
  uiProps.field = renderField;
  // uiProps.field = void 0;

  if (Component == null && renderField.readonly !== true) {
    // 优先使用uiScene-指定样式来获取组件

    let [ui, newProps] = UIService.getTypeUI(renderField, uiScene || scene, uiProps, renderField.uiScene);
    uiProps = newProps;
    Component = ui;
  }

  // let renderValue = renderField != field ? renderField.getValueByUI(renderField._renderItem || data) : uiValue;
  let renderValue = uiValue;

  let ui;
  if (Component) {
    let onValueChange;
    const { onChange } = props;
    // if (!_inform) {
    if (bindChange !== false) {
      uiProps.onChange = async (e, modelChange) => {
        const changeValue = e && e.target ? e.target.value : e;
        const model = renderField.model;

        // 有报错状态时，进行验证，并设置状态
        // if (scene === 'edit' && renderField.isValid !== false && model._enableValidate !== false) {
        //   renderField.validateValue(changeValue).then(result => {
        //      model.applyDataState({ error: result.success ? null: result.faults }, data);
        //   });
        // }
        // 当存在错误状态时
        if (isErrorState(field, data)) {
          const result = await renderField.validateValue(changeValue);
          if (result.success) {
            // renderField.setUIDecorator({ tooltip: null }, false);
            const errors = model.getDataState('error', data);
            if (errors) {
              let newStates = { ...errors };
              delete newStates[field.name];
              model.setDataState('error', newStates, data);
            }
          }
        }

        // const errors = model.getDataState('error', data);
        // if(errors) {
        //   let errIdx;
        //   errors.find((item,i) => {
        //     if(item.field.name === renderField.name) {
        //       errIdx = i;
        //       return;
        //     }
        //   })
        // }
        // const tooltip = renderField.getUIDecorator('tooltip');
        // if (tooltip?.__name === 'errorTip') {
        //   const result = await renderField.validateValue(changeValue);
        //   if (result.success) {
        //     renderField.setUIDecorator({ tooltip: null }, false);

        //   }
        // }

        //不触发模型联动时，当字段绑定的ui内部存在模型change，则不触发模型联动，否则会引擎ui和模型联动死循环
        if (modelChange === false) {
          renderField.setValueByUI(changeValue, data || model._store);
          return;
        }
        renderField.setValueByUI(changeValue, data);

        // 当为列表模型的虚拟字段时
        if (model.getModelType() === 'List' && model._vk) {
          model.updateItem(data, { refresh: false });
        }

        onChange && onChange(changeValue);
        setValue(changeValue);
      };

      // renderField.onChange && renderField.onChange('fieldRender', setValue);
    } else {
      uiProps.onChange = onChange;
    }
    // }

    // if (renderValue == null) {
    //   defaultValue = props.defaultValue || renderField.defaultValue;
    // }

    if (isErrorState(renderField, data)) {
      uiProps.status = 'error';
    }

    ui = (
      <Component
        {...uiProps}
        // defaultValue={defaultValue}
        value={renderValue === void 0 ? value : renderValue}
        // value={value != null ? value : uiValue}
        field={renderField}
        // onChange={onValueChange || onChange}
        key={mdKey}
        modeldata={data}
        _inform={_inform}
      />
    );
  } else {
    // 未找到组件时，直接输出formatValue
    const text = renderField.formatValue(renderValue === void 0 ? value : renderValue, data);
    ui = (
      <span key={mdKey} {...props}>
        {text}
      </span>
    );
  }

  // 装饰器处理
  return <div className="md-field-renderer">
    {UIService.decorateUI(ui, renderField, {
      data,
      scene,
      value: renderValue,
      uiProps,
    })}
    <FieldTip field={renderField} data={data}></FieldTip>
  </div>;
};

function isErrorState(field, data) {
  const error = field.model.getFieldDataState('error', data, field);
  return error != null;
}

UIService.registerUI('FieldRenderer', FieldRender);
export default FieldRender;

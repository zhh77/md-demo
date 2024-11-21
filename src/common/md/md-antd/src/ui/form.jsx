import React from 'react';
import { DataHelper } from 'md-base';
import UIService, { UIBuilder, UIHelper } from 'md-base-ui';
import { createContext, useContext, useEffect, useState } from 'react';
import Helper from '../common/help';

import { Form as AForm } from 'antd';
import UIScene from '../config/scene';

const FormContext = createContext({});

const { Item } = AForm;

const PropsConfig = {
  Transfer: ['labelCol', 'wrapperCol', 'labelAlign'],
  ModelClear: [
    'model',
    'scene',
    'needValidate',
    'fieldsProps',
    'autoLayout',
    'placeholder',
  ],
  FieldClear: [
    'fields',
    'scene',
    'fieldsProps',
    'group',
    'autoLayout',
    'groupsProps',
    'placeholder',
  ],
};
// const TransferProps = ["labelCol", "wrapperCol", "labelAlign"];

let _index = 0;

let Form = (props, ref) => {
  let formRef = AForm.useForm(props.form)[0];
  const [mdKey, setMdKey] = useState(0);
  const { model } = props;
  const form = props.form || formRef;
  let {
    name: formName,
    children,
    needValidate,
    fieldsProps = {},
    scene = UIScene.Edit,
    autoLayout,
    placeholder,
  } = props;

  if (formName == null && model) {
    formName = `${model._mdId}-form[${_index++}]`;
  }

  useEffect(() => {
    if (model) {
      // model刷新的时候，更新form的值
      model.onRefresh(formName, (e) => {
        // 如果刷新成功则更新form的值
        // model.getData([]).then(data => {
        setMdKey(Date.now());
        // });
      });

      // model.onBefore('validate', formName, function formValidate(e) {
      //   const errors = formRef.getFieldsError();
      //   if(errors && errors.length) {
      //     formRef.setFields(errors.map(error => ({ name :error.name, errors: null})));
      //   }
      // })
      // linkDataModel(model, form, formName, props, needValidate);
    }
  }, [model?._mdId]);

  // 有设定模型时, 进入模型生成UI模式
  if (model) {
    props = Object.assign({}, props);
    // let { name: formName, model, children, needValidate, fieldsProps = {}, scene = UIScene.Edit, autoLayout } = props;

    props.form = form;

    Helper.clearProps(PropsConfig.FieldClear, props);

    // 如果为编辑场景，验证默认开启
    if (needValidate == null) {
      needValidate = scene === UIScene.Edit;
    }

    // if (MD.isDataModel(model)) {
    //   //将模型和form进行绑定，key通过模型获取和设置值
    //   linkDataModel(model, form, formName, props, needValidate);

    //   // 监听model的UI变化，重新渲染
    //   // model.onChangeUI(formName, () => {
    //   //   setMdKey(Date.now());
    //   // });
    // }

    if (children) {
      props.children = void 0;

      // 设置子组件配置传递
      let config = {
        model,
        formScene: scene,
        needValidate,
        fieldsProps,
        autoLayout,
        placeholder,
      };

      Helper.mergeProps(PropsConfig.Transfer, config, props);

      // 如果已经存在form上下文，则进入子表单模式
      const isChildMode = useContext(FormContext).model != null;
      if (isChildMode) {
        config._childmode = true;
        return (
          <div className="md-form-child" key={mdKey}>
            <FormContext.Provider value={config}>
              {children}
            </FormContext.Provider>
          </div>
        );
      }
      return (
        <AForm
          {...props}
          _key={mdKey}
          // onBlur={(e) => {
          //   needValidate !== false && model.validate();
          // }}
        >
          <FormContext.Provider value={config}>{children}</FormContext.Provider>
        </AForm>
      );
    }
  }

  return <AForm {...props} />;
};

const MDItem = (props) => {
  const formConfig = useContext(FormContext);
  // 系统初始化UI配置，未注册组件需添加
  props = UIService.initProps('Form.Item', props);

  let { fields } = props;

  // 有设定模型时
  if (fields) {
    props = Object.assign({}, props);

    let {
      formScene,
      model,
      needValidate,
      fieldsProps,
      data,
      autoLayout,
      _childmode,
      placeholder,
    } = formConfig;

    let { fieldsProps: options, children, scene = formScene, group } = props;

    Helper.mergeProps(PropsConfig.Transfer, props, formConfig).clearProps(
      PropsConfig.FieldClear,
      props,
    );
    // delete props.fields;
    // delete props.scene ;
    // delete props.fieldsProps;
    // delete props.group ;

    // 合并form和item上针对字段item的设置
    fieldsProps = Object.assign({}, fieldsProps, options);

    if (!Array.isArray(fields)) {
      fields = [fields];
    }

    let layoutBuilder =
      autoLayout &&
      UIBuilder.createLayoutBuilder(autoLayout === true ? null : autoLayout);

    if (layoutBuilder && group) {
      layoutBuilder.addGroup(group);
    }

    const buildItem = (field, mergeMode) => {
      let fieldPath,
        type = typeof field;
      if (type === 'string') {
        fieldPath = field;
        field = model.getField(fieldPath);
      } else if (type === 'function') {
        field = field(model, data, scene);
      } else if (!field.__mdField && field.name) {
        const targetField = model.getField(field.name);
        if (targetField) {
          field = targetField;
        }
      }

      if (field && field.__mdField) {
        // 自动布局下，会自动过滤不可见字段，如果visible变动，需要刷新
        if (field.visible === false && autoLayout) {
          return [];
        }

        let [itemProps, uiProps] = buildFieldItemProps(
          field,
          fieldPath,
          model,
          props,
          fieldsProps,
          scene,
          data,
          needValidate,
        );
        // 子form模式下，name会加上前缀，避免冲突
        if (_childmode) {
          itemProps.name = `${field.model._mdId}.${itemProps.name}`;
        }

        if (placeholder) {
          uiProps.placeholder =
            itemProps.placeholder || UIHelper.buildPlaceholder(field, scene);
        }
        const component = buildFieldItem(
          field,
          model,
          itemProps,
          uiProps,
          data,
          children,
          layoutBuilder,
          mergeMode,
        );

        return [component, field, itemProps];
      }
      // 非字段模式
      return [field];
    };
    const items = DataHelper.arrayMap(fields, (field) => {
      // 多字段在一个单元内
      if (Array.isArray(field)) {
        let mainField, mainItemProps;
        const fieldItems = field.map((fd, i) => {
          const [component, mField, itemProps] = buildItem(fd, true);
          if (i === 0) {
            mainField = mField;
            mainItemProps = itemProps;
          }
          return component;
        });

        if (mainField && mainField.visible !== false) {
          const name = mainField.name + '-m';
          const baseProps = {
            name: name,
            key: name,
            label: mainField.title || mainField.name,
          };

          if (layoutBuilder) {
            layoutBuilder.addItem({
              props: mainItemProps,
              render(props) {
                let iProps = { ...props, ...baseProps };
                delete iProps.itemGroup;

                return (
                  <FormItem
                    field={mainField}
                    itemProps={iProps}
                    itemGroup={props.itemGroup}
                    children={fieldItems}
                  ></FormItem>
                );
              },
            });
          } else {
            return (
              <FormItem
                field={mainField}
                itemProps={{ ...mainItemProps, ...baseProps }}
                itemGroup={props.itemGroup}
                children={fieldItems}
              ></FormItem>
            );
          }
        }
      } else {
        const [component] = buildItem(field);
        return component;
      }
      return null;
    });

    return layoutBuilder ? layoutBuilder.render() : items;
  } else {
    return <Item {...props} />;
  }
};

Form.Item = MDItem;

function buildFieldItemProps(
  field,
  fieldPath,
  model,
  props,
  fieldsProps,
  scene,
  data,
  needValidate,
) {
  let itemProps = {},
    value,
    itemScene,
    uiProps;

  // if (!fieldPath) {
  //   fieldPath = field.key;
  // }

  Object.assign(itemProps, props, fieldsProps[fieldPath || field.name]);

  itemProps.name = fieldPath || field.key;

  if (itemProps.visible === false) {
    return [];
  }

  itemScene = itemProps.scene || scene;
  const isInput = UIScene.isInput(itemScene);

  // ui设置,优先级item设置 > form设置 > 字段配置 > 组件默认配置
  uiProps = Object.assign({ scene: itemScene }, itemProps.props);

  // 设置值
  value = field.getValueByUI(data);

  if (value != null) {
    itemProps.initialValue = value;
  } else if (
    isInput &&
    itemProps.initialValue == null &&
    field.defaultValue != null
  ) {
    // view场景下没有初始值
    itemProps.initialValue = field.getDefaultValue();
  }

  //设置校验器
  if (
    isInput &&
    needValidate &&
    itemProps.rules == null &&
    field.validator?.rules
  ) {
    if (field.required && itemProps.required == null) {
      itemProps.required = true;
    }

    itemProps.rules = [
      {
        validator() {
          // field.validateValue(field.getValue(), field.model.getStore(), {
          //   updateState: true,
          // });
          // return true;
          // console.log('valid~~~~~')
          return new Promise((resolve, reject) => {
            field.validateValue(field.getValue(), field.model.getStore(), { updateState: true}).then(result => {
              if (result.success) {
                return resolve();
              } else {
                return reject(new Error(''));
                // return reject(new Error(result.message));
              }
            });
          });
        },
      },
    ];
  }

  return [itemProps, uiProps];
}

function buildFieldItem(
  field,
  model,
  itemProps,
  uiProps,
  data,
  children,
  layoutBuilder,
  mergeMode,
) {
  // 当字段是当前模型时，设置inform标识，通过form事件更新
  if (model[field.name] === field) {
    uiProps._inform = 'true';
  }

  const component =
    children || Helper.getFieldUI(field, itemProps, uiProps, data);

  if (mergeMode !== true && layoutBuilder) {
    layoutBuilder.addItem({
      props: itemProps,
      render(props) {
        return renderItem(field, component, props, mergeMode);
      },
    });
  } else {
    return renderItem(field, component, itemProps, mergeMode);
  }
}

// 渲染formitem
function renderItem(field, children, itemProps, mergeMode) {
  if (itemProps.tooltip == null || field.desc) {
    itemProps.tooltip = field.desc;
  }

  if (mergeMode) {
    return (
      <Item key={`merge-${field.name}`} name={field.key} noStyle {...itemProps}>
        {children}
      </Item>
    );
  }

  return (
    // <Item key={field.name} label={field.title} name={field.key} {...itemProps}>
    //   {children}
    // </Item>
    <FormItem
      key={field.name}
      field={field}
      children={children}
      itemProps={itemProps}
    ></FormItem>
  );
}

const FormItem = (props) => {
  const { field, children, itemGroup } = props;

  const [itemProps, setItemProps] = useState(props.itemProps);
  useEffect(() => {
    field.onUpdate('formItem', (updateAttrs) => {
      setItemProps(updateItemProps(itemProps, updateAttrs));
      // 更新值
      // setMdKey(Date.now());
    });
  }, []);

  if (field.visible === false) {
    return null;
  }

  if (itemGroup) {
    return (
      <Item {...itemProps} key={`group-${field.name}`}>
        <div
          style={{ display: 'flex', justifyContent: 'flex-start' }}
          {...itemGroup}
        >
          {children}
        </div>
      </Item>
    );
  }
  // const wrapperCol = field.title ? { span: 16 } : { span: 24 };
  return (
    <Item
      key={field.name}
      label={field.title || field.name}
      name={field.key}
      {...itemProps}
    >
      {children}
    </Item>
  );
};

function updateItemProps(itemProps, attrs) {
  let props = { ...itemProps };
  if (attrs) {
    if (attrs.title) {
      props.label = attrs.title;
    }
    if (attrs.desc) {
      props.tooltip = attrs.desc;
    }
    if (attrs.required != null) {
      props.required = attrs.required;
    }
  }

  return props;
}

// 关联数据模型
// function linkDataModel(model, form, formName, props, needValidate) {
//   needValidate &&
//     model.onBefore('validate', formName, function formValidate(e) {
//       e.stop();
//       return new Promise(resolve => {
//         form
//           .validateFields()
//           .then(data => {
//             // this.setStore(data, true);
//             resolve({
//               success: true,
//             });
//           })
//           .catch(errorInf => {
//             resolve({
//               success: false,
//               faults: errorInf.errorFields.map(error => {
//                 const name = error.name[0];
//                 return {
//                   field: model[name],
//                   name,
//                   message: error.errors[0],
//                 };
//               }),
//             });
//           });
//       });
//     });
// }

UIService.extendUI(Form, 'Form', AForm);
export default Form;
export { FormContext };

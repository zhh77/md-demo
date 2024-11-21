import UIService, { UIBuilder } from 'md-base-ui';
import React, { useEffect, useState } from 'react';
import Form from './form';
import Operations from './operations';

const DefaultOperations = {
  save: {
    title: '保存',
    onClick(e, { model, scene }) {
      model.update();
    },
  },
  reset: {
    title: '重置',
    onClick(e, { model, scene }) {
      model.reset();
    },
  },
};
const MDForm = (props) => {
  let { model, field, fields, groups, children, operations, scene } = props;

  if (field && field.fieldModel && model == null) {
    model = field.fieldModel;
  }

  const [mdKey, setMdKey] = useState(0);
  const [bindRefresh, setBindRefresh] = useState(false);

  const setBinding = (group) => {
    if (group.checkVisible) {
      bindRefresh || setBindRefresh(true);
    }
  };
  useEffect(() => {
    if (bindRefresh) {
      model.onRefresh('mdFrom', (e) => {
        // 如果刷新成功则更新form的值
        setMdKey(Date.now());
      });
    }
  }, [bindRefresh]);

  if (model) {
    fields = groups ? null : fields || model.getFields();

    const getItems = () => {
      let items = [];
      if (groups) {
        // 生成布局
        items = UIBuilder.buildGroup(model, groups, Form.Item, setBinding);
      } else if (fields) {
        items.push(<Form.Item fields={fields} key={0}></Form.Item>);
      }
      // 将form定义的children添加到item中
      if (children) {
        items.push(typeof children === 'function' ? children(props) : children);
      }
      return items;
    };

    return (
      <div className={`md-form md-form-${scene}`}>
        <Form
          {...props}
          onChange={null}
          fields={null}
          model={model}
          _mkey={mdKey}
        >
          {getItems()}
        </Form>
        {operations && (
          <Operations
            scene={scene}
            defaultItems={DefaultOperations}
            {...operations}
            eventArgs={{ model, scene }}
          ></Operations>
        )}
      </div>
    );
  }
};

// const GroupBuilder = {
//   build(model, groups, setBinding) {
//     return groups.map(group => {
//       if (group.checkVisible) {
//         setBinding(true);
//         if (group.checkVisible(model) === false) {
//           return;
//         }
//       }
//       const builder = this.builder[group.renderType] || this.builder.base;

//       return builder(model, group, setBinding);
//     });
//     // if(Array.isArray(groups)) {
//     //   return this.builder.base(model, groups, setBinding);
//     // } else {
//     //   return Object.entries(groups).map(([key, group]) => {
//     //     const builder = this.builder[key] || this.builder.base;
//     //     const props = groups[key + 'Props'];
//     //     return builder(model, group, setBinding, props);
//     //   });
//     // }
//   },
//   builder: {
//     base(model, config, setBinding) {
//       let items;
//       if (Array.isArray(config)) {
//         items = config;
//       } else {
//         items = config.items;

//         if (items == null) {
//           items = [
//             {
//               ...config,
//               checkVisible: null,
//             },
//           ];
//         }
//       }

//       return (
//         items &&
//         items.map((group, i) => {
//           if (group.checkVisible) {
//             setBinding(true);
//             if (group.checkVisible(model) === false) {
//               return;
//             }
//           }

//           let groupConfig;

//           if (group.colNum) {
//             groupConfig = { colNum: group.colNum };
//           }

//           return (
//             <>
//               {group.title && (
//                 <Divider key={i} className="md-form-group" orientation="left" {...group.props}>
//                   {group.title}
//                 </Divider>
//               )}
//               <Form.Item fields={group.fields} group={groupConfig} key={i}></Form.Item>
//             </>
//           );
//         })
//       );
//     },
//     tab(model, config, setBinding) {
//       const items = config.items.map((group, i) => {
//         if (group.checkVisible) {
//           setBinding(true);
//           if (group.checkVisible(model) === false) {
//             return;
//           }
//         }
//         return {
//           label: group.title,
//           key: i,
//           children: GroupBuilder.builder.base(model, group.items ? group.items : [{ fields: group.fields }], setBinding),
//         };
//       });
//       return <Tabs key="tab" {...config.props} items={items} />;
//     },
//   },
// };

UIService.addUI(MDForm, 'MDForm');
export default MDForm;

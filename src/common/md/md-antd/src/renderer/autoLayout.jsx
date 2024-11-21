import React from 'react';
import UIService, { UIBuilder } from 'md-base-ui';

// // const { Col, Row, Divider } = UIService.getUIStore();
// import * as ANT from 'antd';
// console.log('######ANT######', ANT, window.ANTD4, window.antd, window?.proxy?.antd);
import { Col, Row, Divider, Tabs } from 'antd';

let _index = 0;

const AutoLayout = {
  build(model, groups, RenderItem, handler) {
    return groups.map(group => {
      // 干预处理函数
      handler(group);

      if (group.checkVisible && group.checkVisible(model) === false) {
        return;
      }

      const builder = GroupBuilder[group.renderType] || GroupBuilder.base;

      return builder(model, group, RenderItem, handler);
    });
    // if(Array.isArray(groups)) {
    //   return this.builder.base(model, groups, setBinding);
    // } else {
    //   return Object.entries(groups).map(([key, group]) => {
    //     const builder = this.builder[key] || this.builder.base;
    //     const props = groups[key + 'Props'];
    //     return builder(model, group, setBinding, props);
    //   });
    // }
  },
  render(groups, config) {
    let ui = [],
      key = 0;

    if (config.props == null) {
      config.props = {};
    }
    groups.forEach(group => {
      const { title, colNum } = group;

      if (title) {
        ui.push(
          <Divider key={key++} orientation="left" {...config.props.group}>
            {group.title}
          </Divider>
        );
      }

      group.children.forEach(row => {
        const itemNum = config.type === 'fixed' || group.children.length === 1 ? row.length : colNum;
        const num = 24 / itemNum;
        let cols = row.map(item => {
          let itemProps = item.props;
          if (row.length !== colNum && itemProps.labelCol) {
            let span = (item.props.labelCol.span * itemNum) / colNum;
            itemProps = {
              ...itemProps,
              labelCol: { ...item.labelCol, span },
              // wrapperCol: { ...item.wrapperCol, span: 24 - span },
            };
            // itemProps.labelCol = Object.assign({}, itemProps.labelCol, {span});
          }

          return (
            <Col span={num} key={key++} {...config.props.col}>
              {item.render(itemProps)}
            </Col>
          );
        });

        ui.push(
          <Row key={key++} {...config.props.row}>
            {cols}
          </Row>
        );
      });
    });
    return ui;
  },
};

const GroupBuilder = {
  base(model, config, RenderItem, handler) {
    _index = 0;
    let items;
    if (Array.isArray(config)) {
      items = config;
    } else {
      items = config.items;

      if (items == null) {
        items = [
          {
            ...config,
            checkVisible: null,
          },
        ];
      }
    }

    return (
      items &&
      items.map((group, i) => {
        handler(group);

        if (group.checkVisible && group.checkVisible(model) === false) {
          return;
        }

        let groupConfig;

        if (group.colNum) {
          groupConfig = { colNum: group.colNum };
        }

        return (
          <>
            {group.title && (
              <Divider className="md-form-group" orientation="left" {...group.props}>
                {group.title}
              </Divider>
            )}
            <RenderItem fields={group.fields} group={groupConfig} key={_index++}></RenderItem>
          </>
        );
      })
    );
  },
  tab(model, config, RenderItem, handler) {
    const items = config.items.map((group, i) => {
      handler(group);
      if (group.checkVisible && group.checkVisible(model) === false) {
        return;
      }
      return {
        label: group.title,
        key: i,
        children: GroupBuilder.base(model, group.items ? group.items : [{ fields: group.fields }], RenderItem, handler),
      };
    });
    return <Tabs key="tab" {...config.props} items={items} />;
  },
};

UIBuilder.setRenderer({
  AutoLayout,
});

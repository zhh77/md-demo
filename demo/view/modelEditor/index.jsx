import React, { useState } from 'react';
import { Form, Button } from 'md-antd';
import BaseSettingModel, { BaseSettingFieldModel } from './models';
import { DataHelper } from 'md-base';

const EditSettingFieldModel = BaseSettingFieldModel.extend({
  name: 'SettingFieldEditModel',
  title: '配置字段编辑模型',
  fields: {
    defaultValue: {
      getRenderOptions(data) {
        return {};
      },
      links: {
        fields: ['bizType', 'dataType', 'source', 'min', 'max'],
        onChange(bizType, dataType, source, min, max) {
          this.update({ bizType, dataType, source, min, max });
        },
      },
    },
    max: {
      getRenderOptions(data) {
        return {};
      },
      links: {
        fields: ['dataType', 'min'],
        onChange(dataType, min) {
          const typeConfig = this.model.dataType.getSourceItem(dataType);
          this.update({ dataType: typeConfig.type === 'string' ? 'int' : dataType, min });
        },
      },
    },
    min: {
      getRenderOptions(data) {
        return {};
      },
      links: {
        fields: ['dataType', 'max'],
        onChange(dataType, max) {
          const typeConfig = this.model.dataType.getSourceItem(dataType);
          this.update({ dataType: typeConfig.type === 'string' ? 'int' : dataType, max });
        },
      },
    },
  },
  enableInitData: true,
  props: {
    getDefaultData(initData) {
      let data = this.callBase('getDefaultData', initData);
      data.id = DataHelper.getRandom(8);
      return data;
    },
    // getDefaultData() {
    //   let data = this.getDefaultData({
    //     name: 'id',
    //     title: 'ID',
    //     required: true,
    //   });

    //   // this.setItemScene(data, 'onlyView');
    //   return [data];
    // },
  },
});

const ModelEditor = props => {
  const mEditor = BaseSettingModel.use({
    fields: {
      fields: {
        modelConfig: EditSettingFieldModel,
      },
    },
  });

  return (
    <Form
      style={{ width: '1500px' }}
      model={mEditor}
      autoLayout={true}
      fieldsProps={{
        fields: {
          props: {
            columns: [
              { field: 'id', width: 100 },
              { field: 'name', width: 100 },
              { field: 'title', width: 100 },
              { field: 'bizType', width: 100 },
              { field: 'dataType', width: 100 },
              { field: 'required', width: 100 },
              { field: 'defaultValue', width: 100 },
              { field: 'max', width: 100 },
              { field: 'min', width: 100 },
            ],
            rowOperations: {
              width: 180,
              checkVisible({scene}) {
                return scene !== 'onlyView';
              },
              // items: [
              //   'edit',
              //   'delete',
              //   {
              //     checkVisible(scene) {
              //       return scene !== 'edit';
              //     },
              //     title: '编辑扩展配置',
              //     onClick() {},
              //   },
              // ],
            },
            pagination: false,
            scroll: { x: 1200 },
            operations: {
              items: [
                {
                  name: 'add',
                  title: '添加',
                },
                {
                  name: 'batchDelete',
                  title: '删除',
                },
              ],
            },
          },
        },
      }}
    >
      <Form.Item fields={['name', 'title']}></Form.Item>
      <Form.Item fields={['desc']}></Form.Item>
      <Form.Item fields={['fields']}></Form.Item>
    </Form>
  );
};

export default ModelEditor;

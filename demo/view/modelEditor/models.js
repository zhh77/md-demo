import MD, { DataHelper } from 'md-base';
import { DataTypes, BizTypes } from './constant';

const BaseSettingFieldModel = MD.create({
  title: '字段配置模型',
  name: 'SettingFieldModel',
  fields: [
    {
      name: 'id',
      title: '唯一标识',
      dataType: 'string',
      isKey: true,
      readonly: true,
    },
    {
      name: 'name',
      title: '字段名',
      desc: '',
      dataType: 'string',
      required: true,
      max: 20,
    },
    {
      name: 'title',
      title: '字段中文名',
      desc: '',
      dataType: 'string',
      required: true,
      max: 20,
    },
    {
      name: 'bizType',
      title: '业务类型',
      desc: '',
      bizType: 'enum',
      source: BizTypes,
    },
    {
      name: 'dataType',
      title: '数据类型',
      desc: '字段的数据类型，数据类型会影响值的设定',
      dataType: 'string',
      bizType: 'enum',
      source: DataTypes,
      required: true,
      defaultValue: 'string',
    },
    {
      name: 'desc',
      title: '字段描述',
      desc: '',
      dataType: 'text',
      max: 100,
    },
    {
      name: 'source',
      title: '枚举数据源',
      desc: '',
      bizType: 'object',
    },
    {
      name: 'required',
      title: '是否必须',
      dataType: 'boolean',
      defaultValue: false,
    },
    {
      name: 'defaultValue',
      title: '默认值',
      desc: '',
      bizType: 'object',
    },
    {
      name: 'min',
      title: '最小值/长度',
      desc: '',
      dataType: 'string',
    },
    {
      name: 'max',
      title: '最大值/长度',
      desc: '',
      dataType: 'string',
    },
    {
      name: 'regular',
      title: '自定义规则',
      desc: '',
      dataType: 'string',
    },
  ]
});

const BaseSettingModel = MD.create({
  name: 'BaseSettingModel',
  title: '基础模型配置',
  desc: '',
  fields: [
    {
      name: 'name',
      title: '模型名',
      desc: '',
      dataType: 'string',
      required: true,
      max: 20,
    },
    {
      name: 'title',
      title: '模型中文名',
      desc: '',
      dataType: 'string',
      required: true,
      max: 20,
    },
    {
      name: 'desc',
      title: '模型描述',
      desc: '',
      dataType: 'text',
      max: 1000,
    },
    {
      name: 'fields',
      title: '模型字段',
      desc: '',
      dataType: 'modelList',
      modelConfig: BaseSettingFieldModel,
      required: true,
    },
  ],
});

export default BaseSettingModel;
export { BaseSettingFieldModel };

const DataTypes = [
  {
    value: 'string',
    label: '字符',
    desc: '基础字符类型',
    type: 'string',
    config: {
      max: 10,
    },
  },
  // {
  //   value: 'desc',
  //   label: '描述文本',
  //   desc: '一段字符，进行描述',
  //   config: {
  //     dataType: 'string',
  //     max: 100,
  //   },
  // },
  {
    value: 'text',
    label: '长文本',
    desc: '一段较长的文本',
    type: 'string',
    config: {
      dataType: 'string',
      max: 1000,
    },
  },
  {
    value: 'richText',
    label: '富文本',
    desc: '带展示格式的文本',
    type: 'string',
    config: {
      dataType: 'string',
      max: 5000,
    },
  },
  {
    value: 'number',
    label: '数字',
    desc: '数字类型',
    type: 'number',
    config: {
      precision: 2,
    },
  },
  {
    value: 'int',
    label: '整数',
    desc: '整数',
    type: 'number',
    confine: {
      dataType: 'int',
      precision: 0,
    },
  },
  {
    value: 'percentage',
    label: '百分比',
    desc: '百分比',
    type: 'number',
    config: {
      dataType: 'number',
      precision: 4,
    },
    confine: {
      max: 1,
      min: 0,
    },
  },
  {
    value: 'money',
    label: '金额',
    desc: '金额',
    type: 'number',
    config: {
      dataType: 'number',
      precision: 2,
    },
  },
  {
    value: 'date',
    label: '日期',
    desc: '日期类型',
    type: 'date',
    config: {
      format: 'YYYY-MM-DD',
    },
  },
  {
    value: 'dateTime',
    label: '日期时间',
    desc: '日期时间',
    type: 'date',
    config: {
      format: 'YYYY-MM-DD hh:mm:dd',
    },
  },
  {
    value: 'dateRange',
    label: '日期区间',
    desc: '日期区间',
    type: 'date',
    config: {
      format: 'YYYY-MM-DD',
    },
  },
  {
    value: 'dateTimeRange',
    label: '日期时间区间',
    desc: '日期时间区间',
    type: 'date',
    config: {
      format: 'YYYY-MM-DD hh:mm:dd',
    },
  },
  {
    value: 'link',
    label: '链接',
    desc: '链接地址',
    type: 'link',
    confine: {
      regular: '',
    },
  },
];

const BizTypes = [
  {
    value: 'enum',
    label: '枚举',
  },
];

export { DataTypes, BizTypes };

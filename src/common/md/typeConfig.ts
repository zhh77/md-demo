import MD from 'md-base';

MD.registerExtendType({
  mail: {
    baseType: 'string',
    fieldProps: {
      regular:
        '^\\s*\\w+(?:\\.{0,1}[\\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\\.[a-zA-Z]+\\s*$',
      validationMessage: {
        regular: '请输入正确的邮箱地址!',
      },
    },
  },
  password: {
    baseType: 'string',
  },
});

MD.registerBizType({
  platform: {
    fieldProps: {
      title: '平台',
      dataType: 'string',
      bizType: 'enum',
      source: [
        {
          value: 'Amazon',
          label: '亚马逊',
        },
        {
          value: 'eBay',
          label: 'ebay',
        },
        {
          value: 'Temu',
          label: 'temu',
        },
        {
          value: 'AliExpress',
          label: '速卖通',
        },
        {
          value: 'Walmart',
          label: '沃尔玛',
        },
      ],
      getSourceKey(platform) {
        if (platform) {
          const item = this.source.find(
            (item) => item.value.toLowerCase() === platform.toLowerCase(),
          );
          return item?.value;
        }
      },
    },
  },
});

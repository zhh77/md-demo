import ManageLib from "./library/manage";
import Mock from "mockjs";
const Random = Mock.Random;

const BizBuilder = {
  mockData(bizType, field, model, data, listData, MDMock) {
    const { source, sourceConfig, __mocked } = field;

    const mockData = ManageLib.mockData[bizType];
    if (mockData) {
      const value = mockData[Random.integer(0, mockData.length - 1)];
      return typeof value === "string" ? value + (listData.length + 1) : value;
    }

    if (bizType === "enum" && source == null && sourceConfig && !__mocked) {
      field.source = this.buildSource(field, model,data, listData, MDMock);
      field.__mocked = true;
    }
  },
  buildSource(field, model,data, listData, MDMock) {
    const { sourceConfig } = field;
    if (sourceConfig) {
      switch (sourceConfig.type) {
        case "static":
          return sourceConfig.value;
        case "model":
          if (sourceConfig.value === "self") {
            return EnumHelper.getSelfModel(
              sourceConfig,
              field,
              listData
            );
          }
          return EnumHelper.getModelSource(sourceConfig, MDMock);
      }
    }
    return [];
  },
};

const EnumHelper = {
  getSelfModel(config, field, listData) {
    let { value, text } = config.mapping;
    field.getSource = () => {
        return listData.map((item) => {
            return { value: item[value], text: item[text] };
        })
    }
  },
  getModelSource(config, MDMock) {
    let data = MDMock.mockList(config.value);
    if (data && config.mapping) {
      let { value, text } = config.mapping;
      return data.map((item) => {
        return { value: item[value], text: item[text] };
      });
    }
    return data;
  },
};

export default BizBuilder;

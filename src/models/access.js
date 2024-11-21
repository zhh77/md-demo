import MD from "md-base";

const BaseAccessModel = MD.create("权限元模型", {
  name: "权限元模型",
  fields: [
    {
      key: "id",
      title: "权限ID",
      dataType: "number",
      isKey: true,
    },
    {
      key: "name",
      title: "权限名称",
      dataType: "string",
      max: 10,
    },
    {
      key: "code",
      title: "权限编码",
      dataType: "string",
      max: 30,
    },
  ],
});

const AccessModel = BaseAccessModel.extend({
  name: "权限模型",
  modelType: "List",
  request: {
    query: {
      mock: true,
    },
  },
  filterFields: [BaseAccessModel.name, BaseAccessModel.code],
  itemModel: true,
});

export { AccessModel };

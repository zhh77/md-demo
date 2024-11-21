import MD from "md-base";

const AccessModel = MD.create({
  name: "AccessModel",
  title: "权限模型",
  childrenField: "children",
  fields: [
    {
      name: "id",
      title: "权限ID",
      dataType: "integer",
      isKey: true,
    },
    {
      name: "title",
      title: "权限标题",
      dataType: "string",
      max: 10,
    },
    {
      name: "name",
      title: "权限名称",
      dataType: "string",
      // bizType: "accessName",
      max: 10,
    },
    {
      name: "type",
      title: "权限类型",
      dataType: "string",
      bizType: "enum",
    },
    {
      name: "children",
      title: "子权限",
      dataType: "array",
      // bizType: "enum",
      // sourceConfig: {
      //   model: "self",
      //   valueField: 'code',
      //   labelField: 'name',
      // },
    },
    {
      name: "parentId",
      title: "父权限ID",
      dataType: "integer",
    },
  ],
});

const AccessListModel = AccessModel.extend({
  name: "AccessListModel",
  title: "权限列表",
  modelType: "List",
  filter: {
    fields: ["name", "code"],
  },
  action: {
    insert: {
      url: "insertAccess",
    },
    update: {
      url: "updateAccess",
    },
    delete: {
      url: "deleteAccess",
    },
    query: {
      url: "queryAccess",
    },
    mock: {
      store: "access",
    },
  },
});

export { AccessModel };

export default AccessListModel;

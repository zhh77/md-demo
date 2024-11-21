import MD from "md-base";

const BaseAccessModel = MD.create("权限元模型", {
  name: "权限元模型",
  fields: [
    {
      key: "id",
      title: "权限ID",
      dataType: "integer",
      isKey: true,
    },
    {
      key: "name",
      title: "权限名称",
      dataType: "string",
      bizType: "accessName",
      max: 10,
    },
    {
      key: "code",
      title: "权限编码",
      dataType: "string",
      bizType: "randomNumber",
      len: 6,
      // initialValue: {
      //   type: "auto"
      // }
    },
    {
      key: "parent",
      title: "父权限",
      dataType: "string",
      bizType: "enum",
      sourceConfig: {
        type: "model",
        value: "self",
        mapping: { value: "code", text: "name" },
      },
    },
    {
      key: "parent",
      title: "父权限编码",
      dataType: "string",
    },
  ],
});

const BaseRoleModel = MD.create("角色元模型", {
  name: "角色元模型",
  fields: [
    {
      key: "id",
      title: "角色ID",
      dataType: "integer",
      isKey: true,
    },
    {
      key: "name",
      title: "角色名称",
      dataType: "string",
      bizType: "roleName",
      max: 10,
    },
    {
      key: "code",
      title: "权限名称",
      dataType: "string",
      bizType: "enum",
      sourceConfig: {
        type: "model",
        value: BaseAccessModel,
        mapping: { value: "code", text: "name" },
      },
    },
    {
      key: "code",
      title: "权限编码",
      dataType: "string",
    },
  ],
});

const AccessModel = BaseAccessModel.extend({
  title:"权限模型",
  modelType: "List",
  dataSource: {
    request: {
      query: {
        url: "mock",
      },
    },
  },
  filterFields: ["name", "code"],
});

const RoleModel = BaseRoleModel.extend({
  title:"角色模型",
  modelType: "List",
  dataSource: {
    request: {
      query: {
        url: "mock",
      },
    },
  },
  filterFields: [BaseRoleModel.name, BaseRoleModel.access],
});

export { AccessModel, RoleModel };

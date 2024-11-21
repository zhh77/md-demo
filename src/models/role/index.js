import MD from "md-base";

const RoleModel = MD.create({
  name: "RoleModel",
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
      max: 10,
    },
    {
      key: "code",
      title: "权限编码",
      dataType: "string",
      bizType: "accessCode",
    },
  ],
});



// const RoleListModel = BaseRoleModel.extend({
//   title:"角色模型",
//   modelType: "List",
//   dataSource: {
//     request: {
//       query: {
//         url: "mock",
//       },
//     },
//   },
//   filterFields: [BaseRoleModel.name, BaseRoleModel.access],
// });

// export { AccessModel, RoleModel };

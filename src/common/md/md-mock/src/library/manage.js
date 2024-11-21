// 后台管理
const ManageLib = {
  scene: ["manage"],
  mockData: { // 数据mock
    roleName: ["管理员", "模版管理员","超级管理员"],
    accessName: ["系统管理", "模块编辑","菜单配置","首页配置"],
  },
  // mockFields: {    // mock字段的解释，匹配推测规则等, 在自动匹配场景中，会根据配置进行推测
  //     mainpic: {
  //         datatype:"image"
  //     },
  //     type: {
  //         biztype:"enum"
  //     },
  //     type: {
  //         category:"enum"
  //     },
  // }
};

export default ManageLib;


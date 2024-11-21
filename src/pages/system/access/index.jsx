import React from "react";
import AccessListModel from "@/models/access/index";

const AccessPage = () => {
  const mAccessList = AccessListModel.use();

  return (
    <div>
      <h1>权限管理</h1>
      {mAccessList.render({
        // 自动加载，开启后，会自动执行模型的query并进行数据绑定
        autoLoad: true,
        scene: 'edit',
        // 开启过滤，生产查询表单
        filter: true,
        columns: ["name", "code"],
        rowOperations: {
          items: ["edit", "delete"],
        },
      })}
    </div>
  );
};

export default AccessPage;

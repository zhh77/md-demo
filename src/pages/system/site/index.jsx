import React from "react";
import SiteListModel from "@/models/site/index";

const SitePage = () => {
  const mSiteList = SiteListModel.use();

  return (
    <div>
      <h1>权限管理</h1>
      {mSiteList.render({
        // 自动加载，开启后，会自动执行模型的query并进行数据绑定
        autoLoad: true,
        scene: 'edit',
        // 开启过滤，生产查询表单
        filter: true,
        columns: ["name", "path" , "type"],
        rowOperations: {
          items: ["edit", "delete", 'addChild'],
        },
      })}
    </div>
  );
};

export default SitePage;

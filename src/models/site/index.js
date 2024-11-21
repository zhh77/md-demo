import MD from "md-base";

const PageModel = MD.create({
  name: "PageModel",
  title: "页面模型",
  childrenField: "children",
  fields: [
    {
      name: "id",
      title: "ID",
      dataType: "integer",
      isKey: true,
      visible: false,
    },
    {
      name: "name",
      title: "名称",
      dataType: "string",
      max: 10,
      required: true,
    },
    {
      name: "type",
      title: "类型",
      dataType: "string",
      bizType: "enum",
      source: [
        {
          label: "站点",
          value: "site",
          level: 0,
        },
        {
          label: "模块",
          value: "module",
          level: 1,
        },
        {
          label: "页面",
          value: "page",
          level: 2,
        },
        {
          label: "页面元素",
          value: "element",
          level: 3,
        },
      ],
      defaultValue(parent) {
        if (parent == null) {
          return "site";
        }
        const parentType = this.model.type.getValue(parent);

        switch (parentType) {
          case "site":
            return "module";
          case "module":
            return "page";
          case "page":
            return "element";
        }
      },
    },
    {
      name: "enableParentPath",
      title: "启用父路径",
      dataType: "boolean",
      defaultValue: true,
    },
    {
      name: "path",
      title: "路径",
      dataType: "string",
      required: true,
    },

    {
      name: "children",
      title: "子页面",
      dataType: "array",
    },
    {
      name: "parentId",
      title: "父Id",
      dataType: "number",
    },
    {
      name: "parentPath",
      title: "父路径",
      dataType: "string",
    },
  ],
  props: {
    getParentPath(data) {
      return (
        (this.enableParentPath.getValue(data) &&
          this.parentPath.getValue(data)) ||
        ""
      );
    },
  },
});

const SiteListModel = PageModel.extend({
  name: "SiteModel",
  title: "站点模型",
  modelType: "List",
  fields: {
    enableParentPath: {
      links: {
        fields: ["parentPath"],
        // triggerMode: "dataChange",
        onChange(parentPath) {
          this.setVisible(parentPath != null);
        },
      },
    },
    path: {
      links: {
        fields: ["enableParentPath"],
        onChange(enable) {
          this.update();
        },
      },
      uiDecorator: {
        wrapper: {
          isApply({ field, scene }) {
            if (scene === "edit") {
              return field.model.enableParentPath.getValue();
            }
          },
          renderBefore({ field, scene }) {
            return field.model.parentPath.getValue();
          },
        },
      },
      formatValue(value, item) {
        return `${this.model.getParentPath(item)}${value}`;
      },
    },
    children: {
      visible: false,
    },
    parentId: {
      visible: false,
      defaultValue(parent) {
        return parent && this.model.id.getValue(parent);
      },
    },
    parentPath: {
      visible: false,
      defaultValue(parent) {
        return parent && this.model.path.getValue(parent);
      },
    },
  },
  filter: {
    fields: ["name", "type"],
  },
  action: {
    insert: {
      url: "insertPage",
    },
    update: {
      url: "updatePage",
    },
    delete: {
      url: "deletePage",
    },
    query: {
      url: "queryPage",
    },
    mock: {
      store: "pages",
    },
  },
});

export { PageModel };

export default SiteListModel;

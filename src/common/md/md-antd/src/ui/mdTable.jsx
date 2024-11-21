import React from "react";
import { Configuration } from "md-base";
import { message } from "antd";
import UIService from "md-base-ui";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Operations from "./operations";
import Table from "./table";

let { Button } = UIService.getUIStore();

const DefaultOperations = {
  add: {
    title: "添加",
    type: "primary",
    onClick(e, { model, scene }) {
      const listModel = model.mainModel || model;
      listModel.insertItem().then((result) => {
        if (scene !== "view") {
          listModel.setDataStates({ scene: "edit" }, result.item);
        }
      });
    },
  },
  save: {
    title: "保存",
    onClick(e, { model, scene }) {
      const listModel = model.mainModel || model;
      listModel.refresh();
    },
  },
  search: {
    title: "查询",
    type: "primary",
    onClick(e, { model }) {
      const listModel = model.mainModel || model;
      listModel.load();
    },
  },
  reset: {
    title: "重置",
    onClick(e, { model }) {
      const listModel = model.mainModel || model;
      listModel.load();
    },
  },
  batchDelete: {
    title: "批量删除",
    onClick(e, { model }) {
      const listModel = model.mainModel || model;
      const selectItems = listModel.getSelectedItems();
      listModel.deleteItems(selectItems);
      // const { selectedKeys } = handler.getSelectedData();
      // if (selectedKeys && selectedKeys.length > 0) {
      //   model.deleteItemsByKeys(selectedKeys);
      // }
    },
  },
};

const validate = (model, item) => {
  model.validateItem(item, { checkAll: true }).then((result) => {
    if (result.success) {
      delete item.__old;
      model.updateItem(item);
      // model.setItemScene(item, "view").refresh();
      // model.setDataStates({ scene: 'view', error: null }, item).refresh();
    } else {
      model.setDataStates({ error: result.faults }, item);
      // model.applyDataState({ error: result.faults }, item);
      // result.faults.forEach(({ field, message }) => {
      //   if (field) {s

      //     field.setUIDecorator({
      //       tooltip: { title: message, color: 'red' },
      //     });
      //     field.update(
      //       {
      //         uiConfig: {
      //           props: { status: 'error' },
      //         },
      //       },
      //       item
      //     );
      //     // field.updateUI({ props: { status: 'error' } }, item);
      //   }
      // });
    }
  });
};

const DefaultRowOperations = {
  edit: {
    checkVisible({ scene }) {
      return scene === "view";
    },
    title: "编辑",
    onClick(e, { model, item, scene }) {
      // model.setItemScene(item, "edit").refresh();
      model
        .setDataStates({ oldData: { ...item }, scene: "edit" }, item)
        .refresh();
    },
    // 子级操作，即在一个操作中不同状态来控制展示
    children: {
      save: {
        checkVisible({ scene }) {
          return scene === "edit";
        },
        title: "保存",
        onClick(e, { model, item }) {
          validate(model, item);
        },
      },
      cancel: {
        checkVisible({ scene }) {
          return scene === "edit";
        },
        title: "取消",
        onClick(e, { model, item, scene }) {
          const oldData = model.getDataState("oldData", item);
          if (oldData) {
            model.updateItem(oldData, { replace: true, diff: false });
          } else {
            model.deleteItem(item);
          }
          model.setDataStates({ scene: "view", oldData: null }, item);
        },
      },
    },
  },
  view: {
    title: "查看",
  },
  delete: {
    title: "删除",
    confirm: {
      title: "请确认是否删除此项?",
    },
    onClick(e, args, operation) {
      const { model, item } = args;
      model.deleteItem(item).then((res) => {
        alertMsg(res, args, operation);
      });
    },
  },
  addChild: {
    title: "添加子项",
    onClick(e, { model, item }) {
      model.insertChild(item);
    },
    checkVisible({ model, item }) {
      return model.getChildrenField() != null;
    },
  },
};

const MDTable = (props) => {
  const editorRef = useRef();

  let {
    model,
    field,
    containerClass,
    columns,
    operations,
    rowSelection,
    rowOperations,
    editMode = "popup",
    searchProps,
    scene,
  } = props;
  if (field && field.fieldModel && model == null) {
    model = field.fieldModel;
  }
  if (model == null) {
    return null;
  }

  if (columns == null) {
    columns = model.getFields();
    const childrenField = model.getChildrenField();
    // 当存在children字段时，不在列中显示
    if (childrenField) {
      columns = columns.filter((field) => field !== childrenField);
    }
  }

  const eventArgs = { model, scene };

  // 行选择处理
  if (rowSelection) {
    if (rowSelection === true) {
      rowSelection = {};
    } else {
      rowSelection = { ...rowSelection };
    }

    const onChange = rowSelection.onChange;
    rowSelection.onChange = (selectedRowKeys, selectedRows) => {
      model.selectItems(selectedRows);
      onChange && onChange(selectedRowKeys, selectedRows);
    };
  }

  let baseRowOperations = DefaultRowOperations;
  let baseOperations = DefaultOperations;
  // 编辑模式处理
  if (editMode) {
    if (rowOperations == null) {
      rowOperations = {
        items: editMode === "cell" ? ["delete"] : ["edit", "delete"],
      };
    }

    if (editMode === "row" && model._dataStates) {
      const defaultStates = model._dataStates.getDefaultState();
      if (defaultStates == null || defaultStates.scene == null) {
        model._dataStates.setDefaultState({
          scene: editMode === "cell" ? "edit" : "view",
        });
      }
    } else if (editMode === "cell") {
      scene = "edit";
    } else if (editMode === "popup") {
      // 弹窗框编辑使用事件包装器来控制弹窗
      baseRowOperations = {
        ...baseRowOperations,
        edit: {
          title: "编辑",
          onClick(e, { model, item }, operation) {
            const itemModel = model.itemModel;
            if (itemModel) {
              if (operation?.actionLoad) {
                itemModel.load(itemModel.getKeyValue(item)).then((result) => {
                  editorRef?.current?.show("edit", operation);
                });
              } else {
                itemModel.setStore(item);
                editorRef?.current?.show("edit", operation);
              }
            }
          },
        },
        view: {
          title: "查看",
          onClick(e, { model, item }, operation) {
            const itemModel = model.itemModel;
            if (itemModel) {
              if (operation?.actionLoad) {
                itemModel.load(itemModel.getKeyValue(item)).then((result) => {
                  editorRef?.current?.show("view", operation);
                });
              } else {
                itemModel.setStore(item);
                editorRef?.current?.show("view", operation);
              }
            }
          },
        },
        addChild: {
          ...baseRowOperations.addChild,
          onClick(e, { model, item }, operation) {
            const child = model.getDefaultData({ params: item });
            model.itemModel.setStore(child);
            editorRef?.current?.show("edit", operation);
          },
        },
      };

      baseOperations = {
        ...baseOperations,
        add: {
          title: "添加",
          type: "primary",

          onClick(e, { model }, operation) {
            const mainModel = model.mainModel || model;
            if (mainModel.itemModel) {
              mainModel.itemModel.setStore(mainModel.itemModel.getDefaultData());
              editorRef?.current?.show("add", operation);
            }
          },
        },
      };
    }
  } else {
    scene = "view";
  }

  if (rowOperations) {
    rowOperations = { title: "操作", ...rowOperations };
    rowOperations.items = Operations.buildItems(
      rowOperations.items,
      baseRowOperations
    );
  }

  const OperationProps = operations && {
    ...operations,
    defaultItems: baseOperations,
    eventArgs,
  };

  const renderSearch = () => {
    if (props.filter && model.filterModel) {
      const searchOperations = {
        scene: "table-search",
        ...(searchProps?.operations || {
          items:
            scene == "edit" ? ["search", "reset", "add"] : ["search", "reset"],
        }),
        defaultItems: baseOperations,
        eventArgs,
      };

      return model.filterModel.render({
        scene: "search",
        layout: "inline",
        placeholder: true,
        // labelCol: { span: 6 },
        ...searchProps,
        operations: searchOperations,
      });
    }
  };

  const renderHeader = () => {
    if (OperationProps) {
      return (
        <Operations
          scene="table"
          style={{ padding: "4px" }}
          {...OperationProps}
        ></Operations>
      );
    }
  };

  const renderPopupEdit = () => {
    return (
      <PopupEditor
        title="编辑列表项"
        model={model}
        scene={scene}
        editorProps={props.editorProps}
        ref={editorRef}
      ></PopupEditor>
    );
  };

  return (
    <div className={containerClass || "md-table"}>
      {renderSearch()}
      {renderHeader()}
      <Table
        {...props}
        columns={columns}
        model={model}
        rowSelection={rowSelection}
        rowOperations={rowOperations}
        scene={editMode === "cell" ? "edit" : "view"}
      ></Table>
      {editMode === "popup" ? renderPopupEdit() : null}
    </div>
  );
};
function wrapEvent(event, setVisible) {
  return (e) => {
    if (event) {
      const result = event(e);
      if (result === true) {
        setVisible(false);
      }
      if (result.then) {
        result.then(() => {
          setVisible(false);
        });
      }
    } else {
      setVisible(false);
    }
  };
}
const PopupEditor = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [scene, setScene] = useState("edit");
  const [triggerOperation, setTrigger] = useState(null);

  useImperativeHandle(ref, () => ({
    show(scene, trigger) {
      setVisible(true);
      setScene(scene);
      setTrigger(trigger);
    },
    hide() {
      setVisible(false);
    },
  }));

  const Popup = UIService.getUI("Popup");
  if (Popup) {
    const { model } = props;
    let editorProps = triggerOperation?.editProps || props.editorProps || {};
    const itemModel = model.itemModel;
    // 动态参数处理
    if (typeof editorProps === "function") {
      editorProps = editorProps(scene, model);
    }

    itemModel.setDataState("popupScene", scene);

    const callback = (result, args) => {
      triggerOperation?.callback &&
        triggerOperation.callback(result, args, triggerOperation);
    };

    const operationProps = {
      align: "right",
      ...editorProps.operations,
      defaultItems: {
        cancel: {
          title: "取消",
          onClick(e, args, operation) {
            setVisible(false);
            callback(null, args);
          },
        },
        save: {
          title: "保存",
          async onClick(e, args, operation) {
            operation.setLoading(true);
            const validResult = await itemModel.validate({
              checkAll: true,
              openState: true,
            });
            if (!validResult.success) {
              operation.setLoading(false);
              return;
            }

            let res;
            if (
              triggerOperation?.modelAction &&
              itemModel.hasAction(triggerOperation.modelAction)
            ) {
              res = await itemModel.runAction(triggerOperation.modelAction);
            } else {
              res = await itemModel.save();
            }

            callback(res, args);
            alertMsg(res, args, triggerOperation);
            operation.setLoading(false);
            setVisible(false);
            model.load();
          },
          type: "primary",
        },
      },
      eventArgs: { model: itemModel, scene, setVisible },
    };

    return (
      <Popup
        width={editorProps.width}
        title={getPopupTitle(editorProps.title, scene, itemModel)}
        open={visible}
        size="middle"
        {...editorProps.popupProps}
        // onOk={onOk}
        // onCancel={onCancel}
        operations={operationProps}
        destroyOnClose={true}
      >
        {itemModel.render(
          editorProps.formProps,
          scene === "view" ? "view" : "edit"
        )}
      </Popup>
    );
  }
});

function getPopupTitle(title, scene, model) {
  const type = typeof title;
  if (type == "object") {
    return title[scene] || title.base;
  } else if (type == "function") {
    return title(scene, model);
  } else {
    const builder = Configuration.get("MDTable.buildPopupTitle");
    if (builder) {
      return builder(title, scene, model);
    }
  }
  return title;
}

function alertMsg(res, args, operation) {
  operation._alert && operation._alert(res, args);
}
MDTable.ItemEditor = PopupEditor;
UIService.addUI(MDTable, "MDTable");
export default MDTable;

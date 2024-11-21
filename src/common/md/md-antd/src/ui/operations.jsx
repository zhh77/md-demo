import React ,{ useState } from 'react';
import { Button, Modal, Popconfirm, Space, message } from 'antd';
import UIService from 'md-base-ui';

const AlignMapping = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};
const Operations = (props) => {
  props = UIService.initProps('Operations', props);

  const {
    space,
    items,
    defaultItems,
    eventArgs,
    className,
    checkVisible,
    align,
    renderWrapper,
  } = props;
  let style = props.style;

  if (checkVisible && checkVisible(eventArgs) === false) {
    return null;
  }
  const operationItems = buildItems(items, defaultItems, eventArgs || {});

  if (operationItems) {
    if (align) {
      if (style == null) {
        style = { display: 'flex', justifyContent: 'center' };
      }
      style.justifyContent = AlignMapping[align];
    }
    const renderButtons = () => {
      return operationItems.map((item, i) => {
        return renderButton(item, props, i);
      });
    };

    const renderOperations = () => {
      return (
        <div className={className || 'md-operations'} style={style}>
          {space !== false ? <Space>{renderButtons()}</Space> : renderButtons()}
        </div>
      );
    };

    return renderWrapper
      ? renderWrapper(renderOperations())
      : renderOperations();
  }
};

const renderButton = (item, props, i) => {
  const [loading, setLoading] = useState(false);
  if (item) {
    const { eventArgs } = props;
    if (item.checkVisible && item.checkVisible(eventArgs) === false) {
      return null;
    }

    if (item.render) {
      return item.render(eventArgs, item);
    }

    let type = item.type || props.itemType || 'default',
      title = item.title || item.name;

    if (typeof title === 'function') {
      title = title(eventArgs);
    }

    item.setLoading = function (loading) {
      item.loading !== false && setLoading(loading);
    };
    // if (type === 'dropdown') {
    //   return <Dropdown.Button {...item.props} key={i} onClick={item.onClick}></Dropdown.Button>;
    // }

    let button,
      onClick = item.onClick;

    if (item.confirm) {
      const confirmProps = buildConfirmProps(item.confirm, eventArgs);
      if (confirmProps) {
        // 当为popconfirm时
        if (item.confirmType !== 'modal') {
          button = (
            <Popconfirm {...confirmProps} key={i} onConfirm={onClick}>
              <Button loading={loading} {...item.props} type={type}>
                {title}
              </Button>
            </Popconfirm>
          );
        } else {
          let originEvent = onClick;
          onClick = (e, eventArgs, operation) => {
            const modal = Modal.confirm({
              onOk() {
                originEvent(e, eventArgs, operation, modal);
                modal.destory && modal.destory();
              },
              ...confirmProps,
            });
          };
        }
      }
    }

    if (button == null) {
      button = (
        <Button
          loading={loading}
          {...item.props}
          type={type}
          key={i}
          onClick={onClick}
        >
          {title}
        </Button>
      );
    }

    return button;
  } else {
    return (
      <Button type="default" key={i} onClick={props.onClick}>
        {title}
      </Button>
    );
  }
};

const buildItems = (items, defaultItems, args) => {
  if (defaultItems != null || args) {
    let isDefault = false;
    if (items == null && defaultItems) {
      isDefault = true;
      items = Object.values(defaultItems);
    }

    if (items) {
      let operationItems = [];
      items.forEach((item) => {
        const isMapping = typeof item == 'string';
        let operation, defaultChildren;

        if (isDefault) {
          operation = { ...item };
        } else if (defaultItems) {
          if (isMapping) {
            operation = { ...defaultItems[item] };
          } else {
            const defaultItem = defaultItems[item.targetOperation || item.name];
            operation = { ...defaultItem, ...item };
            if (item.children && defaultItem && defaultItem.children) {
              defaultChildren = defaultItem.children;
            }
          }
        } else if (!isMapping) {
          operation = { ...item };
        }

        if (operation.children) {
          const children = buildItems(
            Object.values(operation.children),
            defaultChildren,
            args,
          );
          children && operationItems.push(...children);
          delete operation.children;
        }

        if (args) {
          let onClick = operation && operation.onClick;
          const { model } = args;
          // 当onClick未设置时，自动匹配model的action
          if (onClick == null && model) {
            const modelAction = operation.modelAction || operation.name;
            if (model._dataAction.hasAction(modelAction)) {
              onClick = (e, args) => {
                operation.setLoading(true);
                model
                  .runAction(
                    modelAction,
                    operation.getActionParams &&
                      operation.getActionParams(args),
                  )
                  .then((res) => {
                    operation.callback && operation.callback(res, args);
                    operation._alert && operation._alert(res, args);
                    operation.setLoading(false);
                  });
              };
            }
          }

          if (onClick) {
            // 事件包装器
            if (operation.eventWrapper) {
              onClick = operation.eventWrapper(onClick);
            }
            operation.onClick = onClick
              ? (e) => {
                  onClick(e, args, operation);
                }
              : null;
          }
        }

        if (operation.message !== false) {
          operation._alert = function (res, args) {
            let msg;
            if (typeof operation.message === 'function') {
              msg = operation.message(res, args);
            } else if (res?.success) {
              msg = operation.message || `${operation.title}操作成功！`;
            }
            msg && message.success(msg);
          };
        }
        operationItems.push(operation);
      });
      return operationItems;
    }
  }

  return items;
};

const buildConfirmProps = (config, args) => {
  const type = typeof config;
  if (type === 'string') {
    config = { title: config };
  } else if (type === 'function') {
    config = config(args);
  }
  return config;
};

Operations.buildItems = buildItems;

UIService.addUI(Operations, 'Operations');

export default Operations;

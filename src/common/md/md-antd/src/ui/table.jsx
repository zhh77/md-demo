import { Table as ATable } from 'antd';
import MD from 'md-base';
import UIService from 'md-base-ui';
import React, { useEffect, useState } from 'react';
import Operations from './operations';
// let { operations } = UIService.getUIStore();

const Table = (props) => {
  const [loading, setLoading] = useState(false);

  props = Object.assign({}, props);

  let {
    model,
    columns,
    dataSource,
    autoLoad,
    fieldsProps = {},
    rowOperations,
    scene,
    field,
    loadPromises,
  } = props;

  if (field && field.fieldModel && model == null) {
    model = field.fieldModel;
  }
  const [data, setData] = useState(() => {
    return dataSource ? dataSource : model.getStore();
  });
  const [mdKey, setMdKey] = useState(0);

  const isModel = MD.isDataModel(model);

  useEffect(() => {
    if (isModel) {
      model.onBefore('load', 'bindTable', () => {
        setLoading(true);
      });

      model.on('load', 'bindTable', () => {
        setLoading(false);
      });
      model.onRefresh('bindTable', (data) => {
        // setMdKey(Date.now());
        // 前置依赖
        if(loadPromises) {
         MD.getLoadPromise(loadPromises).then(() => {
            setData(data.concat());
          })
        } else {
          setData(data.concat());
        }

      });

      if (autoLoad) {
        model.load();
      }
    }
  }, []);

  // 有设定模型时
  if (isModel) {
    if (columns == null) {
      columns = model.getFields();
    }

    props.columns = buildColumns(model, columns, fieldsProps, scene);

    if (props.rowKey == null) props.rowKey = model.getKey();
  }

  if (rowOperations) {
    props.columns.push({
      title: rowOperations.title,
      key: 'operations',
      width: rowOperations.width,
      align: rowOperations.align,
      render:
        rowOperations.render ||
        ((text, record, index) => {
          const itemScene = model.getDataState('scene', record) || scene;
          return (
            <Operations
              scene='table-row'
              model={model}
              space={false}
              itemType="link"
              {...rowOperations}
              eventArgs={{ model, item: record, index, scene: itemScene }}
            ></Operations>
          );
        }),
    });
    // props.columns = props.columns.concat(operations);
  }

  // 绑定分页
  if (model._needPager !== false && props.pagination !== false) {
    const pager = model.getPager();
    props.pagination = {
      current: pager.pageIndex,
      pageSize: pager.pageSize,
      total: pager.total,
      onChange(page, pageSize) {
        model.setPager(
          {
            pageSize,
            pageIndex: page,
          },
          true,
        );
      },
      ...props.pagination,
    };
  }
  return <ATable loading={loading} {...props} dataSource={data} _key={mdKey} />;
};

const EmptyColumn = {
  dataIndex: '',
  title: '错误设置列！',
};

function getColumnField(column, model) {
  let field, options;
  if (typeof column === 'string') {
    // 字符串格式时，根据字符串获取模型对应的模型字段
    field = model.getField(column);
  } else if (MD.isDataField(column)) {
    // 直接是模型字段时
    field = column;
  } else if (column.field) {
    // 字段+列配置
    field = model.getField(column.field);
    if (field) {
      options = { ...column };
      delete options.field;
    }
  }
  return [field, options];
}

function buildColumns(model, columns, fieldsProps, scene) {
  let cols = [];
  // 当有根据字段名称设置时
  if (columns && columns.length) {
    columns.forEach((column) => {
      if (column) {
        const isMergeMode = Array.isArray(column);
        let renderColumn = isMergeMode ? column[0] : column;

        let [field, options] = getColumnField(renderColumn, model);

        //有匹配字段时，通过字段生成
        if (field) {
          if (field.visible === false) {
            return;
          }
          options = Object.assign(options || {}, fieldsProps[field.name]);
          renderColumn = buildFieldColumn(
            field,
            options,
            options.scene || scene,
          );

          if (isMergeMode) {
            const renders = [renderColumn.render];
            let i = 1,
              mergeField,
              mergeFieldConfig;

            for (; (col = column[i]); i++) {
              let paths,
                colType = typeof col;
              if (colType === 'string') {
                mergeField = model.getField(col);
                if (mergeField) {
                  // 多级取值，获取路径
                  paths = col.split('.');
                  if (paths.length > 1) {
                    paths.pop();
                  }
                }
              } else if (col.__mdField) {
                mergeField = col;
              }

              if (mergeField) {
                mergeFieldConfig = fieldsProps[mergeField.name];
                let render = getRender(
                  mergeField,
                  mergeFieldConfig && mergeFieldConfig.props,
                  scene,
                );

                renders.push((value, record) => {
                  if (path && paths.length) {
                    record = DataHelper.getValue(paths, record);
                    value = mergeField.getValue(record);
                  }
                  return render(value, record);
                });
              } else if (colType === 'function') {
                renders.push(col);
              } else {
                // 自定义输出时，reactDom
                renders.push(() => col);
              }
            }
            renderColumn.render = (value, record) => {
              return renders.map((render) => render(value, record));
            };
          }
          column = renderColumn;
        } else if (typeof column !== 'object') {
          column = EmptyColumn;
        }
      }
      cols.push(column || EmptyColumn);
    });
  }

  return cols;
}

function buildFieldColumn(field, options, scene) {
  const render = options.render;
  if (render) {
    options.render = (value, record) => {
      return render(value, record, field);
    };
  } else {
    options.render = getRender(field, options.props, scene);
  }

  options.className = 'md-field-columns ' + (options.className || '');

  return {
    dataIndex: field.key,
    title: field.title || field.name,
    ...options,
  };
}

function getRender(field, props, scene) {
  if (field.readonly !== true && scene === 'edit' && field.render) {
    return (value, record) => {
      return field.render(props, record, scene);
    };
  }
  return (value, record) => {
    // return field.formatValue(field.getValue(record));
    return field.formatValue(value, record);
  };
}

UIService.extendUI(Table, 'Table', ATable);

export default Table;

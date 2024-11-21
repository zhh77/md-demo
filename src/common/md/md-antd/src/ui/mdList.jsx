import React, { useEffect, useState, useImperativeHandle,forwardRef,memo } from 'react';
import UIService from 'md-base-ui';

const MDList = memo(forwardRef((props, ref) => {
  const { model, renderItem, className, itemClass, listProps, itemProps, onItemSelect } = props;
  const [key, setKey] = React.useState(0);
  const [data, setData] = React.useState([]);

  useEffect(() => {
    model.onRefresh('mdList', () => {
      setKey(Date.now());
    });
  }, []);

  ref &&
    useImperativeHandle(ref, () => {
      return {
        selectItem(index) {
          const data = model.getStore(index);
          model._renderModel.setItem(index, data);
          selectItem(data, index, model._renderModel);
        },
      };
    });

  const selectItem = (item, i, data, listModel) => {
    // model.itemModel.setItem(data, i);
    onItemSelect && onItemSelect(item, i, data, listModel);
  };

  return (
    <div className={className} {...listProps} key={key}>
      {model.storeMap((item, i, data, listModel) => {
        return (
          <div className={itemClass} {...itemProps} key={i} tabIndex={1} onFocus={() => selectItem(item, i, data, listModel)}>
            {renderItem(item, i, data, listModel)}
          </div>
        );
      })}
    </div>
  );
}));

UIService.addUI(MDList, 'MDList');
export default MDList;

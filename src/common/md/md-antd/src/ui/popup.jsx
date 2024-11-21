import React from 'react';
import { Input, Modal, Drawer, Button } from 'antd';
import { useState } from 'react';
import UIService from 'md-base-ui';
import Operations from './operations';

const Sizes = {
  small: {
    width: '600px',
  },
  middle: {
    width: '900px',
  },
  large: {
    width: '1200px',
  },
};

function getSize(size, width, height) {
  let config = {};
  if (size == null) {
    config = Sizes.large;
  } else {
    config = typeof size === 'string' ? Sizes[size] : size;
  }
  config = { ...config };

  if (width != null) {
    config.width = width;
  }
  if (width != null) {
    config.height = height;
  }

  return config;
}

const Popup = (props, ref) => {
  const { size, mode, width, height, onOk, onCancel, operations } = props;

  const sizeConfig = getSize(size, width, height);

  const buildOperation = () => {
    return  <Operations {...operations}></Operations>
  };
  const buildModal = () => {
    let onCancel;
    if(props.onCancel == null && operations) {
      if(operations.items) {
        const cancelOperation = operations.items.find(item => item.name === 'cancel');
        if(cancelOperation?.onClick) {
          onCancel = cancelOperation.onClick;
        }
      }
      if(onCancel == null && operations.defaultItems?.cancel) {
        onCancel = operations.defaultItems.cancel.onClick
      }
    }
    return <Modal footer={buildOperation()} onCancel={onCancel} {...props} {...sizeConfig} ></Modal>;
  };

  const buildDrawer = () => {
    return (
      <Drawer placement="right" {...props} {...sizeConfig}>
        {porps.children}
        {buildOperation()}
        {/* <div style={{ marginTop: '10px', padding: '10px 16px', textAlign: 'right' }}>
          {onOk && (
            <Button onClick={onOk} type="primary">
              保存
            </Button>
          )}
          {onCancel && (
            <Button style={{ marginLeft: '10px' }} onClick={onCancel}>
              关闭
            </Button>
          )}
        </div> */}
      </Drawer>
    );
  };

  return mode === 'drawer' ? buildDrawer() : buildModal();
};
UIService.addUI(Popup, 'Popup');
export default Popup;

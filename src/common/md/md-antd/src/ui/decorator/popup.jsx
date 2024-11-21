import React from 'react';
import { Input, Modal, Drawer, Button } from 'antd';
import { useState } from 'react';
import UIService from 'md-base-ui';
const DecPopup = (props, ref) => {
  const {
    trigger = {
      text: 'open',
    },
    title,
    size,
    width,
    height,
    popupProps,
    containerProps,
    value,
    children,
    renderTrigger,
    onCancel,
    onOk,
    mode,
    buildPopup,
    field,
    // 原组件属性
    uiProps,
  } = props;

  const [showModal, setShowModal] = useState(false);
  const { status } = uiProps || {};

  let operations = {};

  if (onCancel || onOk) {
    operations = {
      onOk: async () => {
        const bool = onOk && (await onOk(props));
        if (bool === false) {
          return;
        }
        setShowModal(false);
      },
      onCancel: () => {
        onCancel && onCancel(props);
        setShowModal(false);
      },
    };
  } else {
    operations = { footer: null };
  }

  const onClose = operations.onCancel || (() => setShowModal(false));
  const onSave = operations.onOk || (() => setShowModal(false));

  const openModel = (e) => {
    const result = trigger.onClick && trigger.onClick(props);
    result !== false && setShowModal(true);
  };

  const Popup = UIService.getUI('Popup');

  return (
    <div {...containerProps} className={`${containerProps?.className || ''}${status ? ` md-field-${status}` : ''}`}>
      <Popup title={title} size={size} width={width} height={height} open={showModal} onCancel={onClose} {...operations} {...popupProps}>
      {showModal && children}
      </Popup>
      {renderTrigger ? (
        renderTrigger(setShowModal)
      ) : (
        <Button type="link" onClick={openModel}>
          {trigger.text}
        </Button>
      )}
    </div>
  );
};
UIService.addUI(DecPopup, 'DecPopup');
export default DecPopup;

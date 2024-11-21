import React,{useEffect, useState} from 'react';
// import { Tooltip } from 'antd';
// import UIService from 'md-base-ui';
const FieldTip = props => {
  const { field, data } = props;
  const [options, setOptions] = useState(null);
  useEffect(() => {
    field.onUpdateMessage('renderMessage', (config) => {
      setOptions(config);
    })
  }, []);

  // const error = field.model.getFieldDataState('error', data, field);

  // return <div className={`md-field-${state}`}>{render()}</div>;
  return options?.message ? <div className={`md-field-${options.type || 'error'} md-field-message`}>{options.message}</div> : null;
};

export default FieldTip;

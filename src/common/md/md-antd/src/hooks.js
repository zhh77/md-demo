import { useEffect } from 'react';
import { useState, useMemo } from 'react';

const Hooks = {
  useModel(model, config) {
    const { options, onInit } = config || {};
    const [dataModel, setDataModel] = useState(() => {
      let md = model.create(options);
      onInit && onInit(md);
      return md
    });

    // useEffect(() => {
    //   onInit && onInit(dataModel);
    // }, []);

    return dataModel;
  },
};

export default Hooks;

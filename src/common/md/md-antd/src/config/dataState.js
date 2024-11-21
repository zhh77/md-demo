// import UIService from 'md-base-ui';

const DataStateHandler = {
  error(model, state, oldState, data) {
    if (state) {
      Object.entries(state).forEach(([name, config]) => {
        if (config) {
          const oldConfig = oldState && oldState[name];
          if (oldConfig && oldConfig.message === config.message) {
            delete oldState[name];
            return;
          }
        }

        const field = model.getField(name);
        field && field.updateMessage({
          message: config?.message,
          type: 'error'
        });
      });
    }
  },
};

export default DataStateHandler;

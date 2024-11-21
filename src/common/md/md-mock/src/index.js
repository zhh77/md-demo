import { DataHelper } from 'md-base';
import LocalStore from './localStore';

const MockEngine = {
  common(type, url, options, model, config) {
    const mockConfig = model._dataAction.mock?.[type] || {};
    const { handler, delay = 100 } = mockConfig;
    return new Promise((resolve) => {
      setTimeout(() => {
        const store = new LocalStore(model);
        let result = null;
        const requestParams = options.data && { ...options.data };

        if (store[type]) {
          result = store[type](requestParams);
        }

        const isList = model.getModelType() === 'List';

        let res = {
          success: true,
        };
        if (isList && type === 'query') {
          buildListResult(res, result, type, model, config);
        } else {
          res.data = result;
        }

        //结果处理
        if (handler) {
          const handlerRes = handler.call(model, res);
          if (handlerRes) {
            res = handlerRes;
          }
        }
        console.log(
          `MD-Mock: 【${model._modelName}】模型 -【${type}】操作 -【${url}】 成功！`,
          {
            request: options.data && { ...options.data },
            response: { ...res },
          },
        );

        resolve(res);
      }, delay);
    });
  },
};

function buildListResult(res, result, type, model, config) {
  const mapping = model._storeMapper.getMapping(type, config.dataMapping);
  DataHelper.setValue(res, mapping.response.list || 'list', result);
  res.total = result.length;
}
export default MockEngine;

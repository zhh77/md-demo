import AOP from '../../common/aop';
// import ListHandler from './listHandler';
import { DataListStore, DataStore } from './dataStore';
import { DataModelWatcher, DataListModelWatcher } from './watcher';
import Configuration from '../../common/configuration';
import ExtendHandler from './handler';
import { DataState, DataListState } from './dataState';

const ModelDecorator = {
  attach(model, options) {
    //为模型字段时，附加模型装饰器
    // 基于事件的触发，使用方法的AOP扩展模式；
    const modelType = model.getModelType();
    if (modelType === 'Origin') {
      // 获取元模型自定义装饰器
      const originDecorator = Configuration.get('Decorator.OriginModel');
      originDecorator && originDecorator.forEach(decorator => decorator(model, options));
      return;
    }

    // 绑定aop能力
    AOP.bind(model);

    // const dsOptions = options.dataSource || {
    //   request: options.request,
    //   dataMapping: options.dataMapping,
    // };
    DataState.attach(model, options);

    if (modelType === 'List') {
      // 添加列表监听
      model.watcher = new DataListModelWatcher(model);
      model._storeHandler = DataListStore.attach(model, options);
      // ListHandler.attach(model, options);
      DataListState.attach(model, options);
    } else {
      // 添加单数据监听
      model.watcher = new DataModelWatcher(model);
      model._storeHandler = DataStore.attach(model, options);
    }

    // 自定义装饰器
    const customDecorator = Configuration.get('Decorator.Model');
    customDecorator && customDecorator.forEach(decorator => decorator(model, options));

    // ExtendHandler.attach(model, options);
  },
};

export default ModelDecorator;

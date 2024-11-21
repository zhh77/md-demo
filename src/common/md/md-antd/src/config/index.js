import { message } from 'antd';
import { Configuration, Monitor } from 'md-base';
import UIService from 'md-base-ui';
import Hooks from '../hooks';
import UIRenderer from '../renderer';
import DataStateHandler from './dataState';
import PropUI from './propUI';
import UIScene from './scene';
import TypeUIConfig from './typeui';
import UIConfig from './ui';

// 注册属性中是UI的配置
Configuration.set('configRenderer.PropUI', PropUI);

UIService.init(UIRenderer, UIConfig, TypeUIConfig, UIScene);

const ModelExtend = {
  updateUI(uiConfig) {
    Object.entries(uiConfig).forEach(([key, config]) => {
      const field = this[key];
      field && field.updateUI(config);
    });
  },
  // refreshUI() {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve(Date.now());
  //     });
  //   });
  // },
  // onChangeUI(key, callback, mode) {
  //   this.on('refreshUI', key, callback, mode);
  // },
  // use(options, onInit) {
  //   return Hooks.useModel(this, options, onInit);
  // },
  render(props, scene) {
    return UIRenderer.renderModel(this, props, scene);
  },
};

const OriginModelExtend = {
  use(options, onInit, type) {
    if (typeof options === 'function') {
      type = onInit;
      onInit = options;
      options = null;
    }
    if (type) {
      options = Object.assign({ modelType: type }, options);
    }

    return Hooks.useModel(this, { options, onInit });
  },
  useList(options, onInit) {
    if (typeof options === 'function') {
      onInit = options;
      options = null;
    }
    return this.use(options, onInit, 'list');
  },
};

// 扩展模型
Configuration.addItem('Decorator.Model', (model) => {
  Object.assign(model, ModelExtend);
});
// 扩展元模型
Configuration.addItem('Decorator.OriginModel', (model) => {
  Object.assign(model, OriginModelExtend);
});

const FieldExtend = {
  /**
   * 统一UI中field取值方法
   */
  getValueByUI(data) {
    return this.getValue(data);
  },
  /**
   * 统一UI中field取值方法
   */
  setValueByUI(value, data) {
    return this.setValue(value, data);
  },
  /**
   * 字段UI更新，会触发更新事件
   * @param {*} uiConfig
   * @param {*} item  更新的数据，在ListModel下可以精准更新到行
   */
  updateUI(uiConfig, item) {
    uiConfig = Object.assign(this.uiConfig || {}, uiConfig);
    this._triggerUpdateUI(uiConfig, item);
  },
  /**
   * 字段UI更新事件，当字段结构变动时触发
   * @param {string} name
   * @param {function} handler
   * @param {object} item
   */
  onUpdateUI(name, handler, item) {
    let vk;
    if (item && this.model.getItemVK) {
      vk = this.model.getItemVK(item);
      if (vk) {
        name += `(${vk})`;
      }
    }
    const path = `${this.model.getModelName()}.${
      this.name
    }-${name}{onUpdateUI}`;
    handler &&
      this.on('_triggerUpdateUI', name, (e) => {
        const [uiConfig, rowData] = e.args;
        if (rowData && vk && this.model.getItemVK(rowData) !== vk) {
          return;
        }
        Monitor.onTrigger({
          target: this,
          name,
          path,
          event: `onUpdateUI`,
        });
        handler(uiConfig, rowData);
      });
  },
  offUpdateUI(name) {
    name = `${this.model.getModelName()}.${this.name}-${name}{onUpdateUI}`;
    this.off('_triggerUpdateUI', name);
  },
  /**
   * 触发ui更新联动,
   */
  _triggerUpdateUI() {
    return this.throttleTrigger('_triggerUpdateUI');
  },
  /**
   * 设置UI装饰器
   * @param {object} decorator
   */
  setUIDecorator(decorator, isUpdate) {
    if (decorator) {
      const oldDecorator = this.__uiDecorator;
      if (oldDecorator) {
        decorator = Object.assign(oldDecorator, decorator);
      }
    }
    this.__uiDecorator = decorator;
    isUpdate !== false && this._triggerUpdate();
  },
  getUIDecorator(name) {
    return this.__uiDecorator && this.__uiDecorator[name];
  },
  render(props, data, scene) {
    return UIRenderer.renderField(this, props, data, scene);
  },
  /**
   * 更新消息
   * @param {*} config
   */
  updateMessage(config) {
    this._triggerMessage(config);
  },
  /**
   * 字段UI更新事件，当字段结构变动时触发
   * @param {string} name
   * @param {function} handler
   * @param {object} item
   */
  onUpdateMessage(name, handler, item) {
    let vk;
    if (item && this.model.getItemVK) {
      vk = this.model.getItemVK(item);
      if (vk) {
        name += `(${vk})`;
      }
    }
    const path = `${this.model.getModelName()}.${
      this.name
    }-${name}{onUpdateMessage}`;
    handler &&
      this.on('_triggerMessage', name, (e) => {
        const [error] = e.args;
        Monitor.onTrigger({
          target: this,
          name,
          path,
          event: `onError`,
        });
        handler(error);
      });
  },
  offMessage(name) {
    name = `${this.model.getModelName()}.${this.name}-${name}{onUpdateMessage}`;
    this.off('_triggerMessage', name);
  },
  /**
   * 触发ui更新联动,
   */
  _triggerMessage() {
    return this.throttleTrigger('_triggerMessage');
  },
  // setVisible(visible) {
  //   this.setUIDecorator({ visible });
  // },
  // 获取渲染配置，在非readonly渲染时,通过options来重新构建字段进行渲染来达到动态渲染
  // 不做扩展属性，只有定义了才会执行
  //getRenderOptions(data,scene) {}
};

// 扩展模型字段
Configuration.addItem('Decorator.Field', (field) => {
  Object.assign(field, FieldExtend);

  if (field.uiDecorator) {
    field.setUIDecorator(field.uiDecorator, false);
  }
});

// 设置UI装饰器
Configuration.set('UIDecorator', {
  loading: {
    component: 'Spin',
    props: {},
  },
  tooltip: {
    component: 'Tooltip',
    props: {},
  },
  wrapper: {
    component: 'Wrapper',
    props: {},
  },
  popup: {
    component: 'DecPopup',
    props: {},
  },
  // fieldState: {
  //   component: 'FieldState',
  //   props: {},
  // },
});

// 注册数据状态处理器
Configuration.set('DataStateHandler', DataStateHandler);

// 设置消息提示
Configuration.set('UIMessage', message);

const PopupTitlePre = {
  add: '添加',
  edit: '编辑',
  delete: '删除',
};

// 注册MDTable弹窗编辑器title生成器
Configuration.set('MDTable.buildPopupTitle', (title, scene, model) => {
  if(title == null && model.mainModel?._modelTitle) {
    title = model.mainModel._modelTitle.replace('模型', '').replace('列表', '');
  }
  const pre = PopupTitlePre[scene];
  return pre ? `${pre}${title}` : title;
});
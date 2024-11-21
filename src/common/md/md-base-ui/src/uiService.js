import UIHelper from './uiHelper';
import MD, { DataHelper, Configuration } from 'md-base';
import UIStore from './uiStore';
import ConfigRenderer from './configRenderer';
import UIDecorator from './uiDecorator';
import Message from './message';

let _UIConfigStore,
  _UIRenderer,
  // _UIDecorator,
  _TypeUIStore = {},
  _UIScene = {
    Base: 'base',
    List: 'list',
    Search: 'search',
    Edit: 'edit',
    View: 'view',
    Add: 'add',
    isInput(scene) {
      return scene === this.Edit || scene === this.Search || scene === this.Add;
    },
  };

const UIService = {
  Message,
  init(uiRenderer, uiConfig, typeUIConfig, uiScene) {
    _UIRenderer = uiRenderer;
    _UIConfigStore = uiConfig;
    _TypeUIStore = typeUIConfig;

    if (uiScene) {
      _UIScene = uiScene;
    }
    ConfigRenderer.setRenderer(uiRenderer);
  },
  /**
   * 注册BiType和对应的UI
   */
  registerBizTypeUI(config) {
    let typeConfig = {},
      uiConfig = {};
    Object.entries(config).forEach(([type, setting]) => {
      if (setting.type) {
        typeConfig[type] = setting.type;
      }
      if (setting.ui) {
        uiConfig[type] = setting.ui;
      }
    });
    MD.registerBizType(typeConfig);
    this.setTypeUI(uiConfig);
  },
  /**
   * 设置类型UI，默认会替换每个TypeUI，mergeMode为true的时候会按照typeUI项进行合并
   */
  setTypeUI(config, mergeMode) {
    mergeItem(_TypeUIStore, config, mergeMode, (item, oldItem, mergeConfig) => {
      if (oldItem.uiScene && mergeConfig.uiScene) {
        item.uiScene = mergeItem(oldItem.uiScene, mergeConfig.uiScene, true);
      }
    });
    // if(mergeMode) {
    //   Object.entries(config).forEach(([name,uiConfig]) => {
    //     let oldConfig = _TypeUIStore[name];
    //     if(oldConfig) {
    //       Object.assign(oldConfig, uiConfig);
    //     } else {
    //       _TypeUIStore[name] = uiConfig;
    //     }
    //   })
    // } else {
    //   Object.assign(_TypeUIStore, config);
    // }

    // Object.assign(_TypeUIStore, config);
    // _TypeUIStore = config;
  },
  /**
   * 添加输入的TypeUI
   * @param {*} type
   * @param {*} uiName
   * @param {*} UI
   * @param {*} props
   */
  addTypeInput(type, uiName, UI, props) {
    this.addUI(UI, uiName);
    const typeUIConfig = {};
    typeUIConfig[type] = {
      input: {
        component: uiName,
        props,
      },
    };
    this.setTypeUI(typeUIConfig);
  },
  setUIConfig(config, mergeMode) {
    mergeItem(_UIConfigStore, config, mergeMode);
  },
  setUIScene(config) {
    Object.assign(_UIScene, config);
  },
  getUIStore() {
    return UIStore;
  },
  /**
   * 添加MDUI，会使用通用扩展
   * @param {*} UI
   * @param {*} name
   * @param {*} children
   * @param {*} isChild
   * @returns
   */
  addUI(UI, name, children, isChild) {
    const config = this.getUIConfig(name);

    const tempUI = _UIRenderer.build(UI, name, config);

    // 复制原有属性
    let newUI = Object.assign({}, UI, tempUI);

    if (children) {
      children.forEach(childName => {
        let childUI = newUI[childName];
        if (childUI) {
          newUI[childName] = this.addUI(childUI, name + '.' + childName, null, true);
        }
      });
    }

    isChild !== true && this.registerUI(name, newUI);
    return newUI;
  },
  /**
   * 扩展UI，在原有UI上进行自定义扩展
   * @param {*} UI
   * @param {*} name
   * @param {*} originUI
   * @returns
   */
  extendUI(UI, name, originUI) {
    const config = this.getUIConfig(name);
    const tempUI = _UIRenderer.build(UI, name, config);
    let newUI = Object.assign({}, originUI, tempUI, UI);
    this.registerUI(name, newUI);
    return newUI;
  },
  getUI(name) {
    return typeof name === 'string' ? DataHelper.getValue(UIStore, name) : name;
  },
  /**
   * 初始化UI属性
   * @param {*} name
   * @param {*} props
   * @returns
   */
  initProps(name, props) {
    if (props) {
      return UIHelper.buildUIProps(this.getUIConfig(name), { ...props });
    }
  },
  registerUI(name, UI) {
    UI._mdUI = name;
    UIStore[name] = UI;
  },
  getUIConfig(name, extend) {
    let config = _UIConfigStore[name];
    return extend ? Object.assign({}, config, extend) : config;
  },
  /**
   * 获取TypeUI配置
   * @param {*} type
   * @param {*} scene
   * @returns
   */
  getTypeUIConfig(type, scene, uiScene) {
    let typeUI;
    if (typeof type == 'string') {
      typeUI = _TypeUIStore[type];
    } else {
      const fieldType = type.fieldType;
      if (fieldType) {
        typeUI = getTypeUI(
          [fieldType.bizType, fieldType.extendType, fieldType.baseType],
          scene,
          uiScene,
        );
      }
    }

    return typeUI || getTypeUI(['string'], scene);
  },
  /**
   * 获取TypeUI
   * @param {*} type
   * @param {*} scene
   * @param {*} props
   * @param {*} uiScene
   * @returns [UI,props]
   */
  getTypeUI(type, scene, props, uiScene) {
    let config = this.getTypeUIConfig(type, scene, uiScene);
    let Component;
    if (config) {
      if(typeof config === 'function') {
        config = config(type);
      }
      if (config && config.component) {
        Component = this.getUI(config.component);
        if (Component) {
          return [Component, UIHelper.buildUIProps(config, props)];
        }
      }
    }
    return [];
  },
  render(config) {
    return ConfigRenderer.render(config);
  },
  renderByType(type, scene, props) {
    const [Component, uiProps] = this.getTypeUI(type, scene, props);
    return _UIRenderer.render(Component, uiProps);
  },
  // checkFieldVisible(field) {
  //   const { _uiStates } = field;
  //   if (_uiStates) {
  //     if (_uiStates.visible === false) {
  //       return false;
  //     }
  //   }
  // },
  checkFieldVisible(field) {
    return UIDecorator.checkVisible(field.__uiDecorator || field);
  },
  decorateUI(ui, field, props) {
    return UIDecorator.decorate(field, ui, field.__uiDecorator, _UIRenderer, props);
  },
  /**
   * 判断字段是否进行渲染
   * @param {*} field
   * @param {*} value
   * @returns
   */
  checkFieldRender(field, value) {
    if (field == null || field.hidden || field.visible === false) {
      return false;
    }
    if (field.renderMode === 'value' && value == null) {
      return false;
    }

    return this.checkFieldVisible(field);
  },
  isInputSence(scene) {
    return _UIScene.isInput(scene);
  },
};

function getTypeUI(types, scene, uiScene) {
  let ui;

  types.find(type => {
    if (type == null) {
      return;
    }
    const typeUI = _TypeUIStore[type];
    if (typeUI && scene) {
      // 先根据uiScene获取
      if (uiScene && typeUI.uiScene) {
        const uiSceneUI = typeUI.uiScene[uiScene];
        if (uiSceneUI && (uiSceneUI.scenes == null || uiSceneUI.scenes.includes(scene))) {
          ui = uiSceneUI;
        }
      }
      if (ui == null) {
        ui = typeUI[scene];

        if (ui == null) {
          ui = _UIScene.isInput(scene) ? typeUI.input : typeUI.view;
        }
      }

      if (ui == null && typeUI.component) {
        ui = typeUI;
      }

      return ui != null;
    }
  });
  return ui;
}

// 合并配置项
function mergeItem(config, megreConfig, mergeMode, itemHandler) {
  if (mergeMode) {
    Object.entries(megreConfig).forEach(([name, mergeItem]) => {
      let item = config[name];
      if (item) {
        Object.assign(item, mergeItem);
      } else {
        config[name] = mergeItem;
      }
      itemHandler && itemHandler(config[name], item, mergeItem);
    });
  } else {
    Object.assign(config, megreConfig);
  }
}

export default UIService;

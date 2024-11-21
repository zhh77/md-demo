import { DataHelper } from './help';
// 应用配置
let _appConfig = {};
// 默认配置
let _defaultConfig = {};

/**
 * 配置器，全局统一管理注册默认配置和设置配置, 使用的话先注册默认配置
 * todo，区域配置（待确定区域策略）
 */
const Configuration = {
  /**
   * 注册默认配置
   * @param {string} key
   * @param {*} defaultConfig
   */
  register(key, defaultConfig) {
    _defaultConfig[key] = defaultConfig;
  },
  /**
   * 设置整体配置, 会合并原有配置，但不会影响默认配置
   * @param {*} config
   */
  setup(config, isReplace) {
    Object.entries(config).forEach(([key, configItem]) => {
      if (configItem) {
        let oldConfig = DataHelper.getValue(_appConfig, key);

        if (oldConfig) {
          if (isReplace === false) {
            return;
          }
        } else {
          oldConfig = DataHelper.getValue(_defaultConfig, key);
        }

        _appConfig[key] = { ...oldConfig, ...configItem };
      }
    });
  },

  /**
   * 根据路径获取配置
   * @param {*} path
   * @param {*} mixin
   * @returns
   */
  get(path, mixin) {
    const value = DataHelper.getValue(_appConfig, path) || DataHelper.getValue(_defaultConfig, path);
    // if(value === void 0) {
    //     console.log("MD-Configuration", `【 ${path} 】 未注册`);
    // }
    return mixin ? Object.assign({}, value, mixin) : value;
  },
  /**
   * 根据路径替换配置
   * @param {*} path
   * @param {*} config
   * @returns
   */
  set(path, config) {
    DataHelper.setValue(_appConfig, path, config);
    return this;
  },
  /**
   * 添加数组类型的子项配置
   * @param {*} key
   * @param {*} config
   */
  addItem(path, config) {
    let listConfig = this.get(path);
    if (listConfig == null) {
      listConfig = [];
      DataHelper.setValue(_appConfig, path, listConfig);
    } else if (!Array.isArray(listConfig)) {
      return;
    }

    listConfig.push(config);
  },
  /**
   * 根据path扩展配置
   * @param {*} path
   * @param {*} config
   */
  extend(path, config) {
    let oldConfig = this.get(path) || {};
    DataHelper.setValue(_appConfig, path, Object.assign(oldConfig, config));
  },
};

export default Configuration;

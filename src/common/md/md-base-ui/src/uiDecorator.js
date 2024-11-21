import { Configuration, DataHelper } from 'md-base';
import UIStore from './uiStore';

/**
 * UI装饰器，外部控制UI的状态或显示
 */
const UIDecorator = {
  checkVisible(config) {
    return config && config.visible === false ? false : true;
  },
  decorate(field, ui, config, uiRenderer, extend) {
    if (config) {
      const UIDecorator = Configuration.get('UIDecorator');

      Object.entries(config).forEach(([key, value]) => {
        if (key !== 'visible') {
          const decorator = UIDecorator[key];
          if (decorator && value) {
            const wrapperUI =
              typeof decorator.component === 'string' ? DataHelper.getValue(UIStore, decorator.component) : decorator.component;

            if (wrapperUI) {
              let props = { ...decorator.props, field, ...extend, __mui:'decorator' };
              if (value !== true) {
                Object.assign(props, value);
              }

              if(props.isApply && props.isApply(props) !== false) {
                ui = uiRenderer.wrapper(ui, wrapperUI, props);
              }
            }
          }
        }
      });
    }
    return ui;
  },
};

export default UIDecorator;

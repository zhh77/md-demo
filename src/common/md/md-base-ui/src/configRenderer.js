import UIStore from "./uiStore";
import { Configuration, DataHelper } from "md-base";

let _Renderer;
let PropUI;

const ConfigRenderer = {
  setRenderer(renderer) {
    _Renderer = renderer;
    PropUI = Configuration.get("configRenderer.PropUI");
  },
  render(config, key) {
    // 如果是已经渲染的组件直接返回
    if(config.$$typeof) {
      return config;
    }

    if(Array.isArray(config)) {
      return config.map((child, i) =>
        ConfigRenderer.render(child, i)
      );
    }

    const { children, component, props, type } = config;
    const uiType = component || type;

    if (uiType) {
      const ui = DataHelper.getValue(UIStore, uiType);
      if (ui) {
        let uiProps;

        if (props) {
          if (props.visible === false) {
            return null;
          }
          uiProps = { ...props };
        }

        let uiChildren;
        if(children) {
          if(Array.isArray(children)) {
            uiChildren = children.map((child, i) =>
              ConfigRenderer.render(child, i)
            );
          } else {
            uiChildren =  ConfigRenderer.render(children);
          }
        }

        // children &&
        //   children.forEach((child, i) => {
        //     uiChildren.push(ConfigRenderer.render(child, i));
        //   });

        uiProps && this.convertPropUI(uiType, uiProps);

        if (key != null) {
          if (uiProps == null) {
            uiProps = { key };
          } else if (uiProps.key == null) {
            uiProps.key = key;
          }
        }

        return _Renderer.render(ui, uiProps, uiChildren);
      }
    }
  },
  convertPropUI(uiType, uiProps) {
    const props = PropUI[uiType];
    if (props) {
      props.forEach((prop) => {
        handlePropChain(prop.split("."), uiProps, 0);
      });
    }
  },
};

function handlePropChain(chain, config, index) {
  let name = chain[index],
    chainConfig = config[name];

  if (chainConfig == null) {
    return;
  }
  if (index != chain.length - 1) {
    index++;
    if (Array.isArray(chainConfig)) {
      chainConfig.forEach((item,i) => {
        handlePropChain(chain, item, index);
      });
    } else {
      handlePropChain(chain, chainConfig, index);
    }
  } else {
    if (Array.isArray(chainConfig)) {
      const children = chainConfig.map((item, i) =>
        ConfigRenderer.render(item, i)
      );

      config[name] = children.length > 1 ? _Renderer.wrapperByEmpty(children) : children[0];
    } else {
      config[name] = ConfigRenderer.render(chainConfig);
    }
  }
}

export default ConfigRenderer;

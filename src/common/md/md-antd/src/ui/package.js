import { UIDecorator } from "./decorator";
import React,{forwardRef} from "react";

const UIPackage = {
  create(UI) {
    return forwardRef((props, ref) => {
      let decorator;
      if (props.uiDecorator) {
        // 子套件模式时
        decorator = props.uiDecorator.getDecorator(UI.name);
      } else {
        // 第一级套件时初始化
        decorator = new UIDecorator(props);
        props = Object.assign({}, props);
        props.uiDecorator = decorator;
      }

      return UI(props, ref);
    });
  },
  createPart(UI) {
    return this.create(UI);
  },
  buildOperations(operations, baseOpeartions) {
    if (operations == null) {
      // 如果没有自定义时，启用默认的操作
      return [].concat(baseOpeartions);
    } else if (operations.length) {
      return operations.map((operation) => {
        let base = baseOpeartions.find(item => item.name === operation.name);
        return Object.assign({}, base, operation);
      });
    }
    return operations;
  },
};

export default UIPackage;

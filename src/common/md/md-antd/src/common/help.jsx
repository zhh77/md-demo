// import UIscene from "../config/scene";
// import { UIService } from "md-base";
import React from "react";
import FieldRender from "../renderer/fieldRender";

const UIHelper = {
  /**
   * 获取字段渲染
   */
  getFieldUI(field, options, props, data) {
    if (options.render) {
      // 自定义渲染时
      return options.render(field, props, options, data);
    } else {
      return <FieldRender {...props} field={field} />;
    }
  },
  /**
   * 制定属性进行合并，props属性为空的时候才会合并
   * @param {*} names 
   * @param {*} props 
   * @param {*} copyProps 
   */
  mergeProps(names,props,copyProps) {
    names.forEach(name => {
      const value = copyProps[name];
      if(value != null && props[name] == null) {
        props[name] = value;
      }
    });
    return this;
  },
  /**
   * 清除属性
   * @param {*} names 
   * @param {*} props 
   */
  clearProps(names,props) {
    names.forEach(name => {
      const value = props[name];
      if(value != null) {
        delete props[name];
      }
    });
    return this;
  },
  mergeOperation(operations, defaultOperations) {
    
  }
};
export default UIHelper;
import React from "react";
import UIService from "md-base-ui";
// import { Col,Row } from "antd";

const DefaultStyle = {
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
};

/**
 * 包裹容器，可以在组件的前后自定义渲染，用于装饰器
 * @param {*} props
 * @returns
 */
const Wrapper = (props) => {
  const { field, scene, data } = props;
  let children = props.children;
  const renderWrapper = (wrapperProps, children) => {
    const { renderBefore, renderAfter, className } = wrapperProps;

    const before =
      typeof renderBefore === "function"
        ? renderBefore({ field, scene, data })
        : renderBefore;
    const after =
      typeof renderAfter === "function"
        ? renderAfter({ field, scene, data })
        : renderAfter;
    let style = props.style;
    if (style == null && className == null) {
      style = DefaultStyle;
    }

    return (
      <div style={style} className={className}>
        {before}
        {children}
        {after}
      </div>
    );
  };

  // 是否多层次
  if (props.tier) {
    props.tier.forEach((wrapperItem) => {
      children = renderWrapper(wrapperItem, children);
    });
    return children;
  }
  return renderWrapper(props, children);
};

UIService.addUI(Wrapper, "Wrapper");
export default Wrapper;

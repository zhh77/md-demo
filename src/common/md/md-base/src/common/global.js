let _mdHanlder = {};

const GlobalVariable = {
  attach(props) {
    Object.assign(_mdHanlder, props);
  }
};

window.__md = _mdHanlder;

export default GlobalVariable;

import LayoutBuilder from './layout';

let _Renderer = {};

const UIBuilder = {
  setRenderer(renderer) {
    Object.assign(_Renderer, renderer);
  },
  createLayoutBuilder(layoutConfig) {
    return new LayoutBuilder(layoutConfig, _Renderer.AutoLayout);
  },
  buildGroup(model, groups, RenderItem, handler) {
    return _Renderer.AutoLayout.build(model, groups, RenderItem, handler);
  },
  getRenderer() {
    return _Renderer;
  },
};

export default UIBuilder;

import Decorator from '../../common/decorator';
import { OriginModel } from '../../model/';
import { ModelLogger } from '../../common/help';
import Monitor from '../../common/monitor';

const RenderField = Decorator.create(
  {
    // init(options) {
    //   this.updateRenderField(options.data, options.scene);
    // },
    createRenderField(data, scene, updateOptions) {
      // 渲染字段不能再创建渲染字段
      if (this._vRender) {
        return;
      }

      const isList = this.model.getModelType() === 'List';
      let options,
        renderState = this.renderState;
      if (this.getRenderOptions) {
        if (isList && this.model._vk == null) {
          ModelLogger.warn('渲染字段', this.model, this, '列表模型使用渲染字段，必须开启virtualKey!');
          return;
        }
        // this.__buildingRender = true;
        options = this.getRenderOptions(data, scene, this.__op);
        // this.__buildingRender = false;
      }

      if (updateOptions) {
        options = options ? Object.assign(options, updateOptions) : updateOptions;
      }

      // renderState = '', 使用原始字段创建渲染字段
      if (options && options.renderState != null) {
        renderState = options.renderState;
      }

      // 存在多态渲染时
      if (this.renders && renderState) {
        let renderOptions = this.renders[renderState] || this.__op;
        if (renderOptions) {
          if (typeof renderOptions === 'function') {
            renderOptions = renderOptions(this, data, scene);
          }
          if (renderOptions) {
            options = { ...options, ...renderOptions };
          }
        }
      }

      // if (options == null && this.__renderOptions != null) {
      //   if (typeof this.__renderOptions === 'function') {
      //     options = this.__renderOptions(this, data, scene);
      //   } else {
      //     options = { ...this.__renderOptions };
      //   }
      // }

      if (options == null) {
        // 返回无效值的时候，不生成渲染字段，因为状态变化而生成的渲染字段，暂时不做清除
        return;
      }

      options._vRender = renderState || true;
      options.renderState = null;

      if (isList) {
        options._renderItem = data;
      }

      const renderField = this.model.createField(this.extend(options, { renderField: true }));
      if (isList) {
        const key = this.model.getItemVK(data);
        this.model.__renderStore[`${key}-${this.name}`] = renderField;
      } else {
        this._renderField = renderField;
      }
      return renderField;
    },
    getRenderField(data) {
      if (this._renderField) {
        return this._renderField;
      } else if (data && this.model.__renderStore) {
        const key = this.model.getItemVK(data);
        return key ? this.model.__renderStore[`${key}-${this.name}`] : null;
      }
      return null;
    },
  },
  {
    check(field) {
      const modelType = field.model.getModelType();
      return modelType === 'List' || modelType === 'Data';
    },
  }
);

export default RenderField;

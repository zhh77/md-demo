import { DataHelper } from '../common/help';
import { OriginModel } from '../model';
import { DataFieldAction } from '../services/dataAction';
import TypeHandlerFactory from './typeHandler';

class FieldType {
  constructor(field) {
    const { bizType } = field;

    // 获取业务类型处理器
    if (bizType) {
      this.bizType = bizType;
      this.bizHandler = field.loadTypeHandler(bizType, true);
      if (this.bizHandler) {
        // 合并业务类型中的扩展属性
        if (this.bizHandler.fieldProps) {
          DataHelper.mergeForEmpty(field, this.bizHandler.fieldProps, [
            'modelExtend',
          ]);
          // 当有设置其他bizType时，handler会切换到其他的bizHandler
          const originBizType = this.bizHandler.fieldProps.bizType;
          if (originBizType) {
            this.bizType = originBizType;
            this.bizHandler = field.loadTypeHandler(originBizType, true);
          }
        }
      }
    }

    let { dataType } = field;

    // 数据类型初始化设置
    if (dataType == null) {
      if (this.bizHandler && this.bizHandler.dataType) {
        field.dataType = dataType = this.bizHandler.dataType;
      } else {
        field.dataType = dataType = field.baseType || 'string';
      }
    }

    const handler = field.loadTypeHandler(dataType);

    // 存在扩展类型时
    if (handler.baseType) {
      this.baseType = handler.baseType;
      this.baseHandler = field.loadTypeHandler(this.baseType);
      this.extendType = dataType;
    } else {
      this.baseType = TypeHandlerFactory.isBaseType(dataType) ? dataType : 'string';
    }

    // 扩展类型中的扩展属性
    handler.fieldProps && DataHelper.mergeForEmpty(field, handler.fieldProps);

    this.handler = handler;

    // // 请求数据, 在发送请求时会转换成此类型
    // if (storeType) {
    //   this.storeType = storeType;
    //   this.actDataTypeHandler = field.loadTypeHandler(storeType);
    // }
    // 存在数据操作时,初始化字段行为操作
    if (field.dataAction) {
      field.dataAction = new DataFieldAction(field);
    }
  }

  createFieldModel(field) {
    let { dataType, modelConfig: model, structure, itemType } = field;

    // 删除原有模型，当动态模型场景使用
    const oldModel = deleteFieldModel(field);

    let modelType;

    //为模型字段时，附加模型装饰器
    if (model) {
      if (!['model', 'modelList'].includes(dataType)) {
        return;
      }
      if (typeof model === 'function') {
        model = model(field);
      }
    } else if (
      structure &&
      (['object', 'arrayObject'].includes(dataType) ||
        (dataType === 'array' && itemType === 'object'))
    ) {
      // 没有模型设置，当数据类型为object，且没有设置bizType和有手动设置数据结构时
      model = new OriginModel({
        name: 'fieldStructure',
        title: '字段结构模型',
        fields: structure,
      });
      modelType = dataType === 'object' ? 'data' : 'list';
    }

    if (model) {
      let fieldModel,
        parentModel = field.model;

      const options = {
        name: `${field.name}-fieldModel[${model._modelName}]`,
        originName: model._modelName,
        path: parentModel.getModelName(),
        parentPaths: parentModel._idPaths,
        title: `${field.title}-子模型[${model._title || model._modelName}]`,
        modelType:
          modelType || (field.dataType === 'modelList' ? 'list' : 'data'),
        mdContext: field.model.mdContext,
        data: field.getValue(),
        strictMode:
          model._strictMode == null
            ? field.model._strictMode
            : model._strictMode,
        // triggerTime: this._triggerTime
      };

      // 将设置的模型，实例化为数据模型
      if (model._storeHandler) {
        fieldModel = model;
      } else if (model.create) {
        // 有扩展信息时
        if (field.modelExtend) {
          model = model.extend(field.modelExtend);
        }

        fieldModel = model.create(options);
      }

      if (fieldModel) {
        let triggerInf,
          childChange = false;
        // 当开启了子模型绑定，会从子模型变更事件下同步数据
        if (field.modelBinding) {
          triggerInf = fieldModel.onChange('fillFieldValue', (value) => {
            childChange = true;
            field.setValue(value);
          });
        }

        // 监听数据变化更新子模型数据,只在数据模型时有效
        if (field.model.getModelType() === 'Data') {
          field.model.syncWatch(
            field.name + '-' + fieldModel.getModelName(),
            [field],
            (value, data) => {
              // 如果开启双向绑定，则添加排除子模型返回触发事件
              // if (triggerInf) {
              // fieldModel.excludeTrigger(triggerInf.key, triggerInf.name);
              // fieldModel.setData(value).then(() => {
              //   fieldModel.clearExcludeTrigger(triggerInf.key, triggerInf.name);
              // });
              // }
              if (childChange) {
                // 子变动时不触发子模型变更；
                childChange = false;
              } else {
                fieldModel.setData(value);
              }
            },
          );
        }
        field.fieldModel = fieldModel;
      }
    }
  }
}

function deleteFieldModel(field) {
  let fieldModel = field.fieldModel;
  if (fieldModel) {
    field.model.offWatch &&
      field.model.offWatch(
        field.name + '-' + field.fieldModel.getModelName(),
        true,
      );
    field.fieldModel = null;
  }
  return fieldModel;
}
export { FieldType };

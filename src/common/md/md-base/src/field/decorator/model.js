import Decorator from '../../common/decorator';

const ModelField = Decorator.create(
  {
    async validateValue(value, data, options) {
      const result = await this.fieldModel.validate({
        ...options,
        data: value,
      });

      let faults;
      if (result.faults) {
        faults = {};
        Object.values(result.faults).forEach((fault) => {
          const name = `${this.name}.${fault.field.name}`;
          faults[name] = {
            ...fault,
            message: `${this.title}-${fault.message}`,
          };
        });
      }
      // 子模型验证只取第一个错误反馈
      // const fault = result.faults;
      // const fault = result.faults && result.faults[0];
      return {
        success: faults == null,
        faults,
        //  && [
        //   {
        //     field,
        //     message: `${field.title}-${fault.message}`,
        //     name: `${field.name}.${fault.name}`,
        //     ruleValue: fault.ruleValue,
        //   },
        // ],
      };
    },
    getDefaultValue(extend) {
      return this.defaultValue !== void 0
        ? this.defaultValue
        : this.fieldModel.getDefaultData(extend);
    },
    convertValue(value) {
      const result = this.fieldModel.convert(value);
      if (this.fieldType.baseHandler) {
        return this.fieldType.baseHandler.convertValue(result, this);
      }
      return result;
    },

    setActionValue(value, data) {
      let actionData = { ...value };
      this.fieldModel._fields.forEach((field) => {
        const fieldValue = field.getValue(value);
        if (fieldValue != null) {
          delete actionData[field.key];
          field.setActionValue(fieldValue, actionData);
        }
      });
      this.callBase('setActionValue', actionData, data);
    },
  },
  {
    mode: 'proto',
    check(field) {
      //存在子模型时，附加模型装饰器
      return field.fieldModel;
    },
  },
);

export default ModelField;

import BaseField from "./baseField";
import DataField from "./dataField";
// import ModelField from "./modelField";

const FieldFactory = {
  create(name, field, model) {
    let FieldClass = BaseField;

    if (model._storeHandler) {
      FieldClass = DataField;
    }

    //当直接引用数据模型字段时
    if (field.model && field.model.getModelType() === 'Data') {
      field = field.extend({ linkField: field });
    }
    return new FieldClass(name, field, model);
  },
  isField(field) {
    return field instanceof BaseField;
  }
};
export default FieldFactory;
export { DataField, BaseField };

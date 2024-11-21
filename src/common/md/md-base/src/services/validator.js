// import _ from "lodash";
import Configuration from "../common/configuration";
import { DataHelper } from "../common/help";

class FieldValidator {
  constructor(field) {
    const path = "BaseRule." + field.fieldType.baseType;
    const baseRule = Configuration.get("Validator." + path);

    if (baseRule) {
      const baseMessages = Configuration.get("ValidatorMessage." + path), messages = field.validationMessage || {};
      this.field = field;
      this.rules = Object.entries(baseRule).map(([name, valid]) => {
        const template = messages[name] || baseMessages[name];
        let message = "";

        if (template) {
          let ruleValue = field[name];
          if (ruleValue && typeof ruleValue === "object") {
            // if(ruleValue && DataHelper.getDataType(ruleValue) !== 'object') {
            ruleValue = field.formatValue(ruleValue);
          }
          if (DataHelper.getDataType(template) === "string") {
            message = DataHelper.template(template, { field, ruleValue });
          } else if (DataHelper.getDataType(template) === "function") {
            message = template(field, ruleValue);
          }
        }
        return { name, valid, message };
      });
    }
  }

  async valid(value, data) {
    let result;
    if (this.rules && this.rules.length) {
      const field = this.field;

      // eslint-disable-next-line
      this.rules.find((rule) => {
        let ruleValue = field[rule.name];
        if (ruleValue != null) {
          if (value == null && rule.name !== "required") {
            return;
          }

          const ruleResult = rule.valid(field, value, ruleValue);
          if (ruleResult === false) {
            result = {
              field,
              name: rule.name,
              ruleValue,
              success: false,
              message: rule.message,
            };
            return true;
          }
        }
      });

      // 自定义验证
      if (result == null && field.valid) {
        const validResult = await field.valid(value, data);
        if (validResult && validResult.success === false) {
          result = {
            field,
            name: "valid",
            success: false,
            message: validResult.message,
          };
        }
      }
    }

    return result || { success: true };
  }
}
// const Validator = {
//   createRules(field) {
//     let rules = [];
//     const baseRule = Configuration.get("Validator.BaseRule." + field.fieldType.baseType);
//     if (baseRule) {
//       rules = Object.entries(baseRule).map(([name, valid]) => {
//         return { name, valid };
//       })
//     }
//     return {
//       rules,
//       valid() {

//       }
//     }
//   },
//   valid(value, field, rules, callback) {
//     let validList = rules.map((rule) => {
//       let result = true;

//       if (rule.validate) {
//         result = rule.validate(value, field);
//       }
//     });
//   },
// };

export default FieldValidator;

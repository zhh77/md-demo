const BaseRulesConfig = [
  {
    fieldProp: "required",
    ruleProp: "required",
    message(field) {
      return `请输入${field.title}!`;
    },
  },
  {
    fieldProp: "max",
    // validator(rule, value, callback) {
    //   if (typeof a === "number") {
    //     callback(value < rule);
    //   } else {
    //     callback(value < rule);
    //   }
    // },
    message(field) {
      let str = "",
        type = field.fieldType.baseType;
      if (type === "string") {
        str = "长度";
      } else {
        str = "值";
      }
      return `${field.title}输入${str}应小于${field.max}!`;
    },
  },
  {
    fieldProp: "min",
    // validator(rule, value, callback) {
    //   if (typeof a === "number") {
    //     callback(value > rule);
    //   } else {
    //     callback(value > rule);
    //   }
    // },
    message(field) {
      let str = "",
        type = field.fieldType.baseType;
      if (type === "string") {
        str = "长度";
      } else {
        str = "值";
      }
      return `${field.title}输入${str}应大于${field.min}!`;
    },
  },
];

const TypeRulesConfig = {
  link: {
    validator(field, value) {},
    message(field) {
      `${field.title}请输入链接格式的字符`;
    },
  },
};

export { BaseRulesConfig, TypeRulesConfig };

// import _ from "lodash";

const Decorator = {
  create(decorator, options) {
    const { extend, mode, check } = options || {};
    if (extend) {
      decorator = Object.assign({}, extend.decorator || extend, decorator);
    }

    return {
      attach(target, ...args) {
        if (check && !check(target)) {
          return;
        }
        let instance = {};
        Object.entries(decorator).forEach(([key, prop]) => {
          if (key === 'init') {
            prop.apply(target, args);
          } else {
            let isAttach = false,
              origin = target[key];
            if (mode === 'proto') {
              // 装饰原型模式，属性存在则不覆盖
              if (!target.hasOwnProperty(key)) {
                isAttach = true;
                // 存在原型属性时，加上原方法前置
                if (origin != null) {
                  target['_proto_' + key] = origin;
                }
              }
            } else {
              // 无论是属性还是原型只要有值都不覆盖
              isAttach = origin == null;
            }
            isAttach && (target[key] = prop);

            // 在迭代器实例上添加属性，如果为方法是，绑定目标对象
            instance[key] = prop.bind ? prop.bind(target) : prop;
          }
        });
        return instance;
      },
      decorator,
    };
  },
};
export default Decorator;

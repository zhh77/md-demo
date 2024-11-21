/**
 * AOP绑定对象，注册切面方法的时候，匿名函数不会去重，建议都应该使用代命名的函数
 */

const AopTypes = ['after', 'before'];

const AOP = {
  bind(target) {
    Object.assign(target, IAOP);
    target.__throttle = {};
  },
};

const IAOP = {
  onBefore(methodName, key, newMethod, mode) {
    this.bindTrigger('before', methodName, key, newMethod, mode);
  },

  on(methodName, key, newMethod, mode) {
    this.bindTrigger('after', methodName, key, newMethod, mode);
  },
  off(type, methodName) {
    let aoper = this.__aop && this.__aop[type];
    aoper && aoper.off(methodName);
  },
  bindTrigger(type, methodName, key, newMethod, mode) {
    let target = this,
      aoper;
    const method = target[methodName];

    if (method) {
      if (target.__aop == null) {
        target.__aop = {};
      } else {
        aoper = target.__aop[methodName];
      }

      if (aoper == null) {
        aoper = target.__aop[methodName] = new AOPER(target, method);

        target[methodName] = function (...args) {
          let e = new AOPEventArgs(args);

          aoper.triggerBefore(e);

          if (e.stopTrigger) {
            return e.result;
          }

          //前置触发器中如果存在handleArgs，则替代原有参数
          e.result = aoper.base(...e.args);
          // aop停止，节流处理
          if (e.result && e.result.__aopStop) {
            // aoper.end();
            return;
          }

          if (e.result && Object.prototype.toString.call(e.result) === '[object Promise]') {
            // 当结果是promise对象
            return new Promise(resolve => {
              e.result.then(data => {
                e.result = data;
                aoper.trigger(e);
                resolve(e.result);
              });
            });
          } else {
            aoper.trigger(e);
            return e.result;
          }
        };
      }

      aoper.on(type, key, newMethod, mode);
    }
  },
  fireOrigin(methodName, ...args) {
    if (this.__aop) {
      let origin = this.__aop[methodName];
      if (origin) {
        return origin(...args);
      } else if (this[methodName]) {
        this[methodName](...args);
      }
    }
  },
  /**
   * 节流触发
   * @param {*} name
   * @param {*} result 返回结果，支持function
   * @param {*} time 延迟触发时间
   * @returns
   */
  throttleTrigger(name, result, time) {
    let target = this.__throttle[name];
    if (target == null) {
      target = this.__throttle[name] = new Promise(resolve => {
        setTimeout(() => {
          this.__throttle[name] = null;
          resolve(typeof result === 'function' ? result() : result);
        }, time || this._triggerTime);
      });
      return target;
    } else {
      target.__aopStop = true;
    }
    return target;
  },
  /**
   * 排除的触发项
   * @param {*} name
   * @param {*} key
   */
  excludeTrigger(name, key) {
    const aoper = this.__aop[name];
    if (aoper) {
      aoper.excludes.push(key);
    }
  },
  /**
   * 清除排除的触发项
   * @param {*} name
   * @param {*} key
   */
  clearExcludeTrigger(name, key) {
    const aoper = this.__aop[name];
    if (aoper && aoper.excludes.length) {
      aoper.excludes.splice(aoper.excludes.indexOf(key), 1);
    }
  },
};

/**
 * AOP对象，支撑前置和后置干预
 * 前置可作为参数干预，干预函数返回数组则会默认作为后置的参数传递
 * 后置主要为结果干预，干预函数中参数会多一个，即新增第一个数据为结果数据，而且当干预函数返回不为空，则会当结果传递
 */
class AOPER {
  constructor(target, method) {
    // constructor(target, name, method) {
    let aoper = this;
    aoper.target = target;
    aoper.base = method.bind(target);
    // aoper.base = method;
    aoper.before = [];
    aoper.after = [];
    // 运行时排除的触发
    aoper.excludes = [];
  }

  on(type, key, trigger, mode) {
    let list = this[type];
    if (list) {
      const isOff = key !== '';
      trigger = trigger.bind(this.target);

      // 避免重复，先根据触发器名称卸载
      isOff && this.off(key, list);

      list.push({ trigger, mode, key });
    }
  }

  off(key, list) {
    const removeItem = list => {
      // eslint-disable-next-line
      if (list) {
        return (
          list.find((item, i) => {
            if (item.key === key) {
              list.splice(i, 1);
              return true;
            }
          }) != null
        );
      }
    };

    if (list) {
      removeItem(list);
    } else {
      const result = AopTypes.find(type => {
        return removeItem(this[type]);
      });
    }
  }

  /**
   * 触发前置干预
   * @param  {...any} args
   */
  triggerBefore(e) {
    this.before = runTriggers(this.before, e, this.excludes);
  }

  trigger(e) {
    this.after = runTriggers(this.after, e, this.excludes);
  }

  end() {
    this.excludes = [];
  }
}

function runTriggers(triggers, e, excludes) {
  let newTriggers = [];

  triggers.find(item => {
    if (excludes.length && excludes.includes(item.key)) {
      newTriggers.push(item);
      return;
    }

    let triggerResult = item.trigger(e);
    // 当存在返回值时，更新结果
    if (triggerResult != null) {
      e.result = triggerResult;
    }

    if (item.mode !== 'once') {
      newTriggers.push(item);
    }
    return e.stopTrigger;
  });
  return newTriggers;
}

class AOPEventArgs {
  constructor(args) {
    this.args = args;
  }

  getArgs() {
    return this.args;
  }

  stop() {
    this.stopTrigger = true;
  }

  changeArgs(args) {
    this.args = args;
  }
}

export default AOP;

import Decorator from '../../common/decorator';

/** 
 * 扩展处理器，可以将其他处理器关联到模型中
*/
const ExtendHandler = Decorator.create({
  init() {
    this._extendHandler = {};
  },
  useHandler(mid) {
    return this._extendHandler[mid];
  },
  addHandler(mid, handler) {
    this._extendHandler[mid] = handler;
  }
})

export default ExtendHandler;

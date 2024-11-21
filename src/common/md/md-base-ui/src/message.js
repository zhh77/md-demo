import { Configuration, DataHelper } from 'md-base';

let _message;
function getMessage () {
  if(_message) {
    return _message;
  }
  _message = Configuration.get('UIMessage');
  if(!_message) {
    console.error('MD-Error: Message 未注册！')
  }
  return _message;
}
const Message = {
  info(content) {
    return getMessage()?.info(content);
  },
  success(content) {
    return getMessage()?.success(content);
  },
  error(content) {
    return getMessage()?.error(content);
  },
  warning(content) {
    return getMessage()?.warning(content);
  },
  loading(content) {
    return getMessage()?.loading(content);
  },
};

export default Message;

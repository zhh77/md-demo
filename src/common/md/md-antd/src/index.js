import MD from 'md-base';
import UIService from 'md-base-ui';
import './config';
import './ui';

import UIScene from './config/scene';
// import Decorator from './common/decorator';
// import UIPackage from './common/package';
import Hooks from './hooks';
import './style.css';

const {
  // Input,
  // InputNumber,
  // DatePicker,
  // Radio,
  // Select,
  // Switch,
  // Tooltip,
  // Spin,
  Form,
  Table,
  FieldRenderer,
  MDList,
  MDTable,
  MDForm,
  Operations,
  Popup,
} = UIService.getUIStore();

// const MDUI = { 
//   ...UIService, 

// };

export default UIService;

export {
  // Input,
  // InputNumber,
  // DatePicker,
  // Radio,
  // Select,
  // Switch,
  // Tooltip,
  Form,
  Table,
  // Decorator,
  FieldRenderer,
  Operations,
  MDList,
  MDTable,
  MDForm,
  Popup,
  MD, 
  UIScene, 
  // UIPackage, 
  // Hooks 
};

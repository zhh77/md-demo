import ModelField from './model';
import RenderField from './render';
import Configuration from '../../common/configuration';
import FieldSource from './source';

const FieldDecorator = {
  attach(field) {

    ModelField.attach(field);
    // else if(dataType == 'tree') {
    //   TreeField.attach(field);
    // }

    RenderField.attach(field);

    FieldSource.attach(field);

    // 自定义装饰器
    const customDecorator = Configuration.get('Decorator.Field');
    customDecorator && customDecorator.forEach(decorator => decorator(field));
  },
};

export default FieldDecorator;

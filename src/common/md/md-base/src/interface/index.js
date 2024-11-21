/**
 * 类型处理器抽象接口
 */
class ITypeHandler {
    convertValue(value) {
        return value;
    }
    formatValue(value) {
        return value;
    }
    validateValue() {
        return true;
    }
}

class IDataAction {
 
}


export {ITypeHandler};

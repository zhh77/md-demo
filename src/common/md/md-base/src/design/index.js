import ModelFactory from "./factory";
import DataEnum from "./dataEnum";

const MDDesign = {
  createModelFactory(base, models) {
    return new ModelFactory(base, models);
  },
  createDataEnum(options) {
    return new DataEnum(options);
  }
};

export default MDDesign;

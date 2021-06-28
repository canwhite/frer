import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

var Store = function Store() {
  _classCallCheck(this, Store);

  _defineProperty(this, "stateMap", {});

  _defineProperty(this, "eventLog", {
    dataMap: {},
    pushHeadersMap: {}
  });
};

export default new Store();
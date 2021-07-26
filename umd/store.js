(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "@babel/runtime/helpers/classCallCheck", "@babel/runtime/helpers/defineProperty"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("@babel/runtime/helpers/classCallCheck"), require("@babel/runtime/helpers/defineProperty"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.classCallCheck, global.defineProperty);
    global.store = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _classCallCheck2, _defineProperty2) {
  "use strict";

  var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _classCallCheck2 = _interopRequireDefault(_classCallCheck2);
  _defineProperty2 = _interopRequireDefault(_defineProperty2);

  var Store = function Store() {
    (0, _classCallCheck2.default)(this, Store);
    (0, _defineProperty2.default)(this, "stateMap", {});
    (0, _defineProperty2.default)(this, "eventLog", {
      dataMap: {},
      headersMap: {}
    });
  };

  var _default = new Store();

  _exports.default = _default;
});
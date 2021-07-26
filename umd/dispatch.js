(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./store"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./store"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.store);
    global.dispatch = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _store) {
  "use strict";

  var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _store = _interopRequireDefault(_store);
  var stateMap = _store.default.stateMap;

  var dispatch = function dispatch(name, action) {
    if (typeof action === "string") {
      var type = action;
      action = {
        type: type
      };
    }

    stateMap[name]["producer"](action);
  };

  var _default = dispatch;
  _exports.default = _default;
});
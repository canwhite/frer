(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./state", "./dispatch"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./state"), require("./dispatch"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.state, global.dispatch);
    global.index = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _state, _dispatch) {
  "use strict";

  var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "state", {
    enumerable: true,
    get: function get() {
      return _state.default;
    }
  });
  Object.defineProperty(_exports, "dispatch", {
    enumerable: true,
    get: function get() {
      return _dispatch.default;
    }
  });
  _state = _interopRequireDefault(_state);
  _dispatch = _interopRequireDefault(_dispatch);
});
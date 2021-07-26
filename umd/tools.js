(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.tools = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var tools = {
    isObject: function isObject(obj) {
      return Object.prototype.toString.call(obj) === "[object Object]";
    },
    isCorrectVal: function isCorrectVal(variable, notBezero) {
      var result = true;

      if (typeof variable === "string") {
        if (variable === "" || variable === "undefined" || variable === "null" || variable === "NaN" || variable === "Infinity") {
          result = false;
        }
      }

      if (typeof variable === "number") {
        if (isNaN(variable) || !isFinite(variable)) {
          result = false;
        }

        if (notBezero) return variable > 0;
      }

      if (variable === null) {
        result = false;
      }

      ;

      if (typeof variable === "undefined") {
        result = false;
      }

      if (Object.prototype.toString.call(variable) === "[object Object]") {
        var is = false; //为空判断

        for (var key in variable) {
          is = true;
        }

        if (!is) {
          result = false;
        }
      }

      if (Array.isArray(variable)) {
        if (variable.length === 0) {
          result = false;
        }
      }

      return result;
    }
  };
  var _default = tools;
  _exports.default = _default;
});
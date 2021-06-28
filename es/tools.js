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
export default tools;
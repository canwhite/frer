import store from './store';
var stateMap = store.stateMap;

var dispatch = function dispatch(name, action) {
  if (typeof action === "string") {
    var type = action;
    action = {
      type: type
    };
  }
  stateMap[name]["producer"](action);
};

export default dispatch;
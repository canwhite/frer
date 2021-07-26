(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "@babel/runtime/helpers/classCallCheck", "@babel/runtime/helpers/createClass", "@babel/runtime/helpers/defineProperty", "rxjs", "rxjs/operators", "rxjs/internal/util/pipe", "./tools", "./store"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("@babel/runtime/helpers/classCallCheck"), require("@babel/runtime/helpers/createClass"), require("@babel/runtime/helpers/defineProperty"), require("rxjs"), require("rxjs/operators"), require("rxjs/internal/util/pipe"), require("./tools"), require("./store"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.classCallCheck, global.createClass, global.defineProperty, global.rxjs, global.operators, global.pipe, global.tools, global.store);
    global.state = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _classCallCheck2, _createClass2, _defineProperty2, _rxjs, _operators, _pipe, _tools, _store) {
  "use strict";

  var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _classCallCheck2 = _interopRequireDefault(_classCallCheck2);
  _createClass2 = _interopRequireDefault(_createClass2);
  _defineProperty2 = _interopRequireDefault(_defineProperty2);
  _tools = _interopRequireDefault(_tools);
  _store = _interopRequireDefault(_store);
  var stateMap = _store.default.stateMap;
  var eventLog = _store.default.eventLog;
  var conveyor$ = new _rxjs.Subject(); //conveyor belt

  function StateSubject(value) {
    this.observerList = [];
    this.value = value;
  }

  StateSubject.prototype = Object.create( //The Observable constructor takes one argument: the subscribe function.
  _rxjs.Observable.create(function subscribe(observer) {
    if (typeof this.value !== "undefined") {
      observer.next(this.value);
    }

    this.observerList.push(observer);
  }));

  StateSubject.prototype.next = function (val) {
    this.value = val;
    this.observerList.forEach(function (observer) {
      observer.next(val);
    });
  };

  var StateMachine = /*#__PURE__*/function () {
    function StateMachine(state$, options) {
      var _this = this;

      (0, _classCallCheck2.default)(this, StateMachine);
      (0, _defineProperty2.default)(this, "value", null);
      this.name = options.name;

      if (_tools.default.isCorrectVal(stateMap[this.name])) {
        throw new Error("'".concat(this.name, "'\u72B6\u6001\u6570\u636E\u5DF2\u5B58\u5728!"));
      }

      this.defaultValue = options.initValue;
      this.value = options.initValue;
      this.initial$ = (0, _rxjs.isObservable)(options.initial) ? options.initial : (0, _rxjs.of)(this.value);

      if (_tools.default.isCorrectVal(options.producer)) {
        this._producer = options.producer;

        var observableFactory = function observableFactory(action) {
          if (!_tools.default.isObject(action)) {
            return (0, _rxjs.of)(action);
          } else if (_tools.default.isObject(action) && _tools.default.isCorrectVal(action.type)) {
            return (0, _rxjs.defer)(function () {
              var _result = action.new_value;
              return (0, _rxjs.isObservable)(_result) ? _result : (0, _rxjs.of)(_result);
            });
          }
        };

        this.subscription = (0, _rxjs.merge)(this.initial$, actionHandle(this.name)).pipe((0, _operators.switchMap)(observableFactory)).subscribe(function (val) {
          _this.value = val;
          state$.next(val);
        }, function (err) {
          return state$.error(err);
        });
      } else {
        this.initial$.subscribe(function (val) {
          _this.value = val;
          state$.next(val);
        }, function (err) {
          return state$.error(err);
        });
      }
    }

    (0, _createClass2.default)(StateMachine, [{
      key: "producer",
      value: function producer(action) {
        var _this2 = this;

        var _next = function _next(new_value) {
          conveyor$.next((0, _defineProperty2.default)({}, _this2.name, Object.assign({}, action, {
            type: _this2.name,
            new_value: new_value
          })));
        };

        this._producer(_next, this.value, action);
      }
    }]);
    return StateMachine;
  }();

  function actionHandle(type, options) {
    if (!(typeof type === "string")) {
      throw new Error("action's type must be string");
    } //default options


    var _options = {
      useCache: false,
      cacheType: "eventCache" // eventCache itemCache

    };
    options = Object.assign({}, _options, options); //[this.name]: Object.assign({}, action, { type: this.name, new_value})
    //type == name

    var event$ = conveyor$.pipe((0, _operators.pluck)(type), (0, _operators.filter)(function (event) {
      if (!_tools.default.isCorrectVal(event)) return false;
      if (!_tools.default.isCorrectVal(event.payload)) event.payload = {};
      if (!_tools.default.isCorrectVal(event.options)) event.options = {}; //Add lastModifyId to headersMap and store event

      if (!_tools.default.isCorrectVal(eventLog.headersMap[event.type])) {
        eventLog.headersMap[event.type] = {
          event: event,
          lastModifyId: new Date().getTime()
        };
        return true;
      }

      var pushHeaders = eventLog.headersMap[event.type];
      var lastEvent = pushHeaders.event; //Update the header time mark if there is a change, 
      //and replace the event in the header

      if (!options.useCache || JSON.stringify(lastEvent.payload) !== JSON.stringify(event.payload) || JSON.stringify(lastEvent.options) !== JSON.stringify(event.options)) {
        eventLog.headersMap[event.type]["lastModifyId"] = new Date().getTime();
      }

      pushHeaders.event = event;
      return true;
    }));
    var operations = []; //Just as an order identifier

    var _subscription = {
      unsubscribe: function unsubscribe() {}
    };

    function generateObs(obs$) {
      _subscription.unsubscribe();

      var new_obs$ = new _rxjs.Subject();
      /* new_obs$.__type__ = type; */

      var _obs$ = obs$.pipe((0, _operators.switchMap)(function (event) {
        var pushHeaders = eventLog.headersMap[event.type]; //update tag

        var hasModified = new_obs$.lastModifyId !== pushHeaders.lastModifyId;
        var cacheData; //Cache is allowed, and if there is no change, the old value is taken directly

        if (options.useCache && !hasModified) {
          switch (options.cacheType) {
            case "eventCache":
              cacheData = eventLog.dataMap[event.type]; //get cache
              //error log

              if (!_tools.default.isCorrectVal(cacheData)) {
                hasModified = true;
                pushHeaders.lastModifyId = new Date().getTime();
              }

              break;
          }
        }

        event.hasModified = hasModified;
        /*
        The event is updated when it is updated, and the cacheData value is taken 
        if there is no or no update, and then passed to the next
        */

        return hasModified ? operations.length === 0 ? (0, _rxjs.of)(event) : (0, _pipe.pipeFromArray)(operations)((0, _rxjs.of)(event)) : (0, _rxjs.of)(cacheData);
      }), (0, _operators.filter)(function (data) {
        //data is event
        var canPass = !(data === null || typeof data === "undefined");
        var pushHeaders = eventLog.headersMap[type];
        var event = pushHeaders.event;
        var hasModified = event.hasModified;

        if (canPass) {
          new_obs$.lastModifyId = pushHeaders.lastModifyId;
        }

        if (canPass && hasModified) {
          switch (options.cacheType) {
            case "eventCache":
              //cache
              eventLog.dataMap[type] = data;
              break;
          }
        }

        return canPass;
      })); //_subscription is like an order,
      //_subscription is SafeSubscriber,Automatically canceled the subscription after onNext 


      _subscription = _obs$.subscribe(new_obs$);
      return new_obs$;
    }

    var pE$ = generateObs(event$);

    pE$.pipe = function () {
      for (var i = 0; i < arguments.length; i++) {
        operations.push(arguments[i]);
      }

      return generateObs(event$);
    };

    return pE$;
  }

  function state(options) {
    var state$ = new StateSubject();
    var stateMachine = new StateMachine(state$, options);
    stateMap[options.name] = stateMachine;
    return state$;
  }

  var _default = state;
  _exports.default = _default;
});
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import { isObservable, defer, of, merge, Subject, Observable } from 'rxjs';
import { switchMap, pluck, filter } from 'rxjs/operators';
import { pipeFromArray } from "rxjs/internal/util/pipe";
import tools from './tools';
import store from './store';
var stateMap = store.stateMap;
var eventLog = store.eventLog;
var conveyor$ = new Subject(); //conveyor belt

function StateSubject(value) {
  this.observerList = [];
  this.value = value;
}

StateSubject.prototype = Object.create(Observable.create(function subscribe(observer) {
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

    _classCallCheck(this, StateMachine);

    _defineProperty(this, "value", null);

    this.name = options.name;

    if (tools.isCorrectVal(stateMap[this.name])) {
      throw new Error("'".concat(this.name, "'\u72B6\u6001\u6570\u636E\u5DF2\u5B58\u5728!"));
    }

    this.defaultValue = options.initValue;
    this.value = options.initValue;
    this.initial$ = isObservable(options.initial) ? options.initial : of(this.value);

    if (tools.isCorrectVal(options.producer)) {
      this._producer = options.producer;

      var observableFactory = function observableFactory(action) {
        if (!tools.isObject(action)) {
          return of(action);
        } else if (tools.isObject(action) && tools.isCorrectVal(action.type)) {
          return defer(function () {
            var _result = action.new_value;
            return isObservable(_result) ? _result : of(_result);
          });
        }
      };

      this.subscription = merge(this.initial$, actionHandle(this.name)).pipe(switchMap(observableFactory)).subscribe(function (val) {
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

  _createClass(StateMachine, [{
    key: "producer",
    value: function producer(action) {
      var _this2 = this;

      var _next = function _next(new_value) {
        conveyor$.next(_defineProperty({}, _this2.name, Object.assign({}, action, {
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

  var event$ = conveyor$.pipe(pluck(type), filter(function (event) {
    if (!tools.isCorrectVal(event)) return false;
    if (!tools.isCorrectVal(event.payload)) event.payload = {};
    if (!tools.isCorrectVal(event.options)) event.options = {}; //Add lastModifyId to headersMap and store event

    if (!tools.isCorrectVal(eventLog.headersMap[event.type])) {
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

    var new_obs$ = new Subject();
    /* new_obs$.__type__ = type; */

    var _obs$ = obs$.pipe(switchMap(function (event) {
      var pushHeaders = eventLog.headersMap[event.type]; //update tag

      var hasModified = new_obs$.lastModifyId !== pushHeaders.lastModifyId;
      var cacheData; //Cache is allowed, and if there is no change, the old value is taken directly

      if (options.useCache && !hasModified) {
        switch (options.cacheType) {
          case "eventCache":
            cacheData = eventLog.dataMap[event.type]; //get cache
            //error log

            if (!tools.isCorrectVal(cacheData)) {
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

      return hasModified ? operations.length === 0 ? of(event) : pipeFromArray(operations)(of(event)) : of(cacheData);
    }), filter(function (data) {
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

export default state;
"use strict";

var utils = require("./utils"),
  Emitter = require("./emitter");

/**
 * @param {Array} fields
 */
function createActions (actions) {
  var properties = {};

  function Action_ () {
    Action_.super_.call(this);
    // bind action functions to our this
    utils.each(actions, function (theAction, actionName) {
      var eventName = actionName.toUpperCase();
      if (!utils.isFunction(theAction)) {
        this[actionName] = theAction;
        return;
      }
      this.fields_.push(eventName);
      theAction.name_ = eventName;
      this["on" + eventName] = this.on.bind(this, eventName);
      if (actionName.indexOf("async") !== 0 ) {
        this[actionName] = function action_action () {
          var ret = theAction.apply(this, arguments);
          if (ret instanceof Error) {
            return ret;
          }
          this.emit.apply(this, [eventName].concat(ret));
          return null;
        }.bind(this);
        return;
      }
      this[actionName] = function action_action () {
        var args = utils.toArray(arguments),
          cb = args.pop(), ret, that = this;

        if (!utils.isFunction(cb)) {
          that = cb;
          cb = args.pop();
        }

        if (!utils.isFunction(cb)) {
          throw new Error("I take a callback or callback, this as final arguments");
        }

        ret = theAction.apply(this, arguments);
        if (ret instanceof Error) {
          return ret;
        }
        this.emitAsync.call(this, cb.bind(that, ret), eventName, ret);
        return null;
      }.bind(this);
      return;
    }, this);
    if (utils.isFunction(this.init)) {
      this.init.apply(this, arguments);
    }
  }

  utils.inherit(Action_, Emitter);

  // wrap emitter listener ids
  properties = {
    /**
    * @param {Function} listener
    * @param {Object=} opt_thisArg
    */
    on: {
      value: function (event, listener, opt_thisArg) {
        if (utils.isString(event) && !utils.contains(this.fields_, event)) {
          throw new Error("event " + event + " is not a valid event ");
        }
        return Emitter.prototype.on.apply(this, arguments);
      }
    },
  };

  // set actions.toUpper constants on ourself
  utils.each(actions, function (theAction, actionName) {
    var eventName;
    if (theAction === "init") {
      return;
    }
    eventName = actionName.toUpperCase();

    properties[eventName] = {
      get: function eventGetter() {
        return eventName;
      },
      enumerable: true
    };
  });
  Object.defineProperties(Action_.prototype, properties);
  Action_.prototype.fields_ = [];
  return Action_;
}

module.exports = createActions;

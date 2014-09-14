"use strict";

var _ = require("lodash"),
  utils = require("./utils"),
  Emitter = require("./emitter");

/**
 * @param {Array} fields
 */
function createActions (actions) {
  var properties = {};

  function Action_ () {
    this.fields_ = _.keys(actions).map(function(f) {return f.toUpperCase();});
    Object.seal(this.fields_);
    Action_.super_.call(this);
    // bind action functions to our this
    _.each(actions, function (theAction, actionName) {
      if (!_.isFunction(theAction)) {
        this[actionName] = theAction;
        return;
      }
      if (actionName.indexOf("async") !== 0 ) {
        this[actionName] = function action_action () {
          var ret = theAction.apply(this, arguments);
          if (ret instanceof Error) {
            return ret;
          }
          this.emit.apply(this, [actionName.toUpperCase()].concat(ret));
          return null;
        }.bind(this);
        return;
      }
      this[actionName] = function action_action () {
        var args = _.toArray(arguments),
          cb = args.pop(), ret, that = this;

        if (!_.isFunction(cb)) {
          that = cb;
          cb = args.pop();
        }

        if (!_.isFunction(cb)) {
          throw new Error("I take a callback or callback, this as final arguments");
        }

        ret = theAction.apply(this, arguments);
        if (ret instanceof Error) {
          return ret;
        }
        this.emitAsync.call(this, cb.bind(that, ret), actionName.toUpperCase(), ret);
        return null;
      }.bind(this);
      return;
    }, this);
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
        if (_.isString(event) && !_.contains(this.fields_, event)) {
            throw new Error("event " + event + " is not a valid event ");
        }
        return Emitter.prototype.on.apply(this, arguments);
      }
    },
  };

  // set actions.toUpper constants on ourself
  _.each(actions, function (theAction, actionName) {
    var eventName = actionName.toUpperCase();

    properties[eventName] = {
      get: function eventGetter() {
        return eventName;
      },
      enumerable: true
    };
  });
  Object.defineProperties(Action_.prototype, properties);
  return Action_;
}

module.exports = createActions;
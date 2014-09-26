var utils = require('./utils'),
  data_emitter = require("./data_emitter"),
  ARRAY_MUTATORS = [ "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
/**
 * @param {string} name
 * @param {Array.<*>} opt_data
 * @extends {DataEmitter}
 * @constructor
 */
function List (name, opt_data) {
  data_emitter.DataEmitter.apply(this, arguments);
  this.modelName = name;
  this.collection = [];
  if (!opt_data) {
    opt_data = name;
    name = "List";
  }
  utils.each(opt_data || [], function (item) {
    this.collection.push(item);
  }, this);
}
utils.inherit(List, data_emitter.DataEmitter);


utils.each(Object.getOwnPropertyNames(Array.prototype), function (name) {
  var f = Array.prototype[name];
  if (!utils.isFunction(f)) {
    return;
  }
  if (!utils.contains(ARRAY_MUTATORS, name)) {
    List.prototype[name] = function () {
      return f.apply(this.collection, arguments);
    };
    return;
  }
  List.prototype[name] = function () {
    var ret = f.apply(this.collection, arguments);
    this.update();
    return ret;
  };
});

Object.defineProperty(List.prototype, "length", {
  get: function length () {
    return this.collection.length;
  }
});

List.prototype.update = function () {
  this.super_.prototype.update.call(this);
};

/**
 * @param {number} index
 * @return {PrimitiveChainable}
 */
List.prototype.get = function (index) {
  return this.collection[index];
};

/**
 * @param {Array} new values
 */
List.prototype.set = function (values, options) {
  this.collection = values;
  if (!options || options.silent !== true) {
    this.update();
  }
};

/**
 * This removes a value from the list if it is already in, otherwise adds it.
 * @param {*} value A value to toggle.
 * @return {boolean} This returns true if value was added, otherwise false.
 */
List.prototype.toggle = function (value) {
  if (this.collection.indexOf(value) === -1) {
    this.collection.push(value);
    return true;
  }
  this.collection = this.collection.filter(function (currentValue) {
    return currentValue != value;
  });
  return false;
};

/**
 * @return {Array}
 */
List.prototype.valueOf = function () {
  return utils.map(this.collection, function(value) {
    return (utils.isUndefined(value) || utils.isNull(value)) ? value : value.valueOf();
  });
};

module.exports = List;

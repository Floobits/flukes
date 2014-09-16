var _ = require("lodash"),
  utils = require('./utils'),
  data_emitter = require("./data_emitter"),
  ARRAY_MUTATORS = [ "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
/**
 * @param {string} name
 * @param {Array.<*>} opt_data
 * @constructor
 */
function List (name, opt_data) {
  DataEmitter.apply(this, arguments);
  this.modelName = name;
  this.collection = [];
  _.each(opt_data || [], function (item) {
    this.push(item);
  }, this);
}

utils.inherit(List, data_emitter.DataEmitter);

_.each(Object.getOwnPropertyNames(Array.prototype), function (name) {
  var f = Array.prototype[name];
  if (!_.isFunction(f)) {
    return;
  }
  if (!_.contains(ARRAY_MUTATORS, name)) {
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
  DataEmitter.prototype.update.call(this, this.fieldName || this.modelName);
};

/**
 * @param {number} index
 * @returns {*}
 */
List.prototype.get = function (index) {
  return this.collection[index];
};

/**
 * @param {Array} new values
 */
List.prototype.set = function (values) {
  this.collection = values;
  this.update_();
};

/**
 * @returns {Array}
 */
List.prototype.valueOf = function () {
  return _.clone(this.collection);
};

module.exports = List;

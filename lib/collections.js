"use strict()";

var utils = require('./utils'),
  settings = require("./settings"),
  data_emitter = require("./data_emitter");

/**
 * @param {Array.<DataModel>} data
 * @constructor
 */
function DataCollection (data) {
  data_emitter.DataEmitter.call(this);
  /**
   * @type {Object}
   */
  this.eventIds = {};
  /**
   * @type {{collection: {}, order: Array}}
   */
  this.data = {collection: {}, order: []};
  this.set(data);
}

utils.inherit(DataCollection, data_emitter.DataEmitter);

/**
 * @param {Object} model
 * @private
 */
DataCollection.prototype.add = function (model) {
  this.add_(model);
  this.update(this.model.modelName);
};

/**
 * @param {Object} model
 * @private
 */
DataCollection.prototype.add_ = function (model) {
  var data = this.data;

  if (settings.debug && !this.model.prototype.isPrototypeOf(model)) {
    throw new Error("Added invalid model to data collection");
  }

  data.order.push(model.id);
  data.collection[model.id] = model;
  model.on(function (name) {
    this.update(this.model.modelName + "." + name);
  }, this);
};

/**
 * @param {number|string} id
 * @private
 */   
DataCollection.prototype.remove = function (id) {
  this.remove_(id);
  this.update(this.model.modelName);
};

/**
 * @param {number|string} id
 * @private
 */
DataCollection.prototype.remove_ = function (id) {
  var index, model,
    data = this.data;

  model = data.collection[id];
  if (!model) {
    return;
  }
  delete data.collection[id];
  model.off(this.eventIds[id]);

  delete this.eventIds[id];
  index = data.order.indexOf(id);
  data.order.splice(index, 1);
};

DataCollection.prototype.getRawData = function () {
  return this.data.collection;
};
/**
 * @param {Array.<DataModel>} models
 */
DataCollection.prototype.set = function (models) {
  this.silent_ = true;
  this.reset();
  utils.each(models, function (model) {
    this.add_(model);
  }, this);
  this.silent_ = false;
  this.update(this.fieldName || this.model.modelName);
};

DataCollection.prototype.reset = function () {
  utils.each(Object.keys(this.data.collection), function (id) {
    this.remove_(id);
  }, this);
};

/**
 * @param {Function} f
 * @param {Object} opt_thisArg
 * @return {Array}
 */
DataCollection.prototype.map = function (f, opt_thisArg) {
  var collection = this.data.collection;
  return this.data.order.map(function (id, index) {
    return f.call(opt_thisArg, collection[id], index);
  });
};

/**
 * @param {Function} f
 * @param {Object} opt_thisArg
 */
DataCollection.prototype.forEach = function (f, opt_thisArg) {
  var collection = this.data.collection;
  this.data.order.map(function (id, index) {
    f.call(opt_thisArg, collection[id], index);
  });
};

/**
 * @param {Function} f
 * @param accumulator
 * @param opt_thisArg
 * @returns {*}
 */
DataCollection.prototype.reduce = function (f, accumulator, opt_thisArg) {
  var collection = this.data.collection;
  return this.data.order.reduce(function (result, item, index) {
    return f.call(opt_thisArg, result, collection[item], index);
  }, accumulator);
};

/**
 * @param {string|number}
 * @return {DataModel}
 */
DataCollection.prototype.get = function (id) {
  return this.data.collection[id];
};

/**
 * @param {number} index
 * @return {DataModel}
 */
DataCollection.prototype.byIndex = function (index) {
  return this.data.collection[this.data.order[index]];
};

/**
 * @return {Array}
 */
DataCollection.prototype.valueOf = function () {
  return this.map(function (value) {
    return (utils.isUndefined(value) || utils.isNull(value)) ? value : value.valueOf();
  });
};

DataCollection.prototype.save = function (key, id) {
  if (!this.backend) {
    throw new Error("you must specify a backend");
  }
  return this.backend.save(key, this, id);
}

DataCollection.prototype.find = function (f, opt_thisArg) {
  var collection = this.data.collection;
  return utils.each(this.data.order, function (id, index) {
    return (f.call(opt_thisArg, collection[id], index) === true ? false : null);
  });
};
/**
 * @return {Number}
 */
Object.defineProperty(DataCollection.prototype, "length", {
  get: function getLength () {
    return this.data.order.length;
  }
});

DataCollection.prototype.replaceEventName = true;

/**
 * @param {DataModel} model
 */
function createCollection(options) {

  if (!options.model) {
    throw new Error("I need a model", options.modelName);
  }
  /**
   * @param {Array<Object|DataModel>} opt_list
   * @constructor
   */
  function Collection (opt_list) {
    var defaults, list;
    list = opt_list || [];
    this.model = options.model;
    this.modelName = options.modelName || "Collection";
    defaults = utils.isFunction(options.getDefaultFields) ? options.getDefaultFields() : {};
    DataCollection.apply(this, defaults);
    list.forEach(function (data) {
      this.add(this.model.prototype.isPrototypeOf(data) ? data : new this.model(data));
    }, this);
  }

  utils.inherit(Collection, DataCollection);
  /**
   * @type {DataModel}
   */
  Collection.prototype.model = options.model;

  Collection.load = function(key, id) {
    if (!options.backend) {
      throw new Error("you must specify a backend");
    }
    if (!utils.isFinite(id)) {
      id = key;
      key = "";
    }
    return options.backend.load(key, Collection, id);
  };
  return Collection;
}

module.exports = {
  DataCollection: DataCollection,
  createCollection: createCollection
};

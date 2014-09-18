"use strict";

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
  Object.seal(this.data);
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

  if (!this.validate_(model)) {
    model = new this.model(model);
  }
  if (data.collection.hasOwnProperty(model.id)) {
    data.collection[model.id].set(model.valueOf());
    return model;
  }
  data.order.push(model.id);
  data.collection[model.id] = model;
  model.on(function (name) {
    this.update(this.model.modelName + "." + name);
  }, this);
  return model;
};

/**
 * @param {number|string} id
 * @private
 */   
DataCollection.prototype.remove = function (id) {
  this.remove_(id);
  this.update(this.model.modelName);
};

DataCollection.prototype.sort = function () {
  this.data.order.sort(this.sort_);
};

DataCollection.prototype.sort_ = function (a, b) {
  if (a < b) {
    return -1;
  }
  if (b < a) {
    return 1;
  }
  return 0;
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
  var collection, newCollection = {}, newOrder = [];
  this.silent_ = true;
  if (!utils.isArray(models)) {
    throw new Error("You must pass set an array of raw data or instances");
  }
  utils.each(models, function (model) {
    model = this.add_(model);
    newCollection[model.id] = model;
  }, this);
  collection = this.data.collection;
  this.data.order.forEach(function (id) {
    if (id in newCollection) {
      newOrder.push(id);
      return;
    }
    collection[id].off(this.eventIds[id]);
    delete this.eventIds[id];
  }, this);
  this.data.collection = newCollection;
  this.data.order = newOrder;
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
 * @return {*}
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

/**
 * @throws {Error}
 * @return {*}
 */
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
    this.validate_ = this.model.prototype.isPrototypeOf.bind(this.model.prototype);
    this.modelName = options.modelName || "Collection";
    defaults = utils.isFunction(options.getDefaultFields) ? options.getDefaultFields() : [];
    DataCollection.call(this, defaults);
    list.forEach(function (data) {
      this.add(this.model.prototype.isPrototypeOf(data) ? data : new this.model(data));
    }, this);
    if (utils.isFunction(this.init)) {
      this.init.apply(this, arguments);
    }
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

  utils.each(options, function (property, name) {
    if (utils.contains(['model', 'modelName'], name)) {
      return;
    }
    if (utils.has(Collection.prototype, name)) {
      throw new Error("Collection " + options.modelName + " already has property " + name);
    }
    Collection.prototype[name] = property;
  });

  return Collection;
}

module.exports = {
  DataCollection: DataCollection,
  createCollection: createCollection
};

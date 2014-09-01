/*global _, React */
"use strict";

var Actions, inherit, configure, FieldTypes, defaultsToValues, _, React;
_= _ || require('lodash');
React = React || {PropTypes: {}};


/*

replace backbone with flux

actions:
  action id is a constant
  contain calling context (object that called it)

dispatches:
  all actions (global events/ui events) are emitted from here

stores:
  responsible for canonical state
  listen to actions on dispatch

  automatically bind components mount/unmount/initiWal state to store ?
    bind to a key in top lvl state?


*/

/**
 * @type {Object}
 */
configure = {
  debug: false,
};
Object.seal(configure);

/**
 * @param {*} value
 * @returns {boolean}
 */
function isDataEmitter(value) {
  return DataEmitter.prototype.isPrototypeOf(value);
}

/**
 * @constructor
 */
function Emitter() {
  /**
   * @type {number}
   * @private
   */
  this.count = 0;
  /**
   * @type {Object}
   * @private
   */
  this.on_ = {};
  /**
   * @type {Object}
   * @private
   */
  this.all_ = {};
}

/**
 * @param {string} event
 * @param {Function} listener
 * @param {Object=} opt_thisArg
 */
Emitter.prototype.on = function (event, listener, opt_thisArg) {
  if (!_.has(this.on_), event) {
    this.on_[event] = {};
  }
  if (!_.isUndefined(opt_thisArg)) {
    listener = listener.bind(opt_thisArg);
  }
  this.on_[event][++this.count] = listener;
  return this.count;
};

/**
 * @param {Function} listener
 * @param {Object=} opt_thisArg
 */
Emitter.prototype.onAll = function (listener, opt_thisArg) {
  if (!_.isUndefined(opt_thisArg)) {
    listener = listener.bind(opt_thisArg);
  }
  this.all_[++this.count] = listener;
  return this.count;
};

/**
 * @param {string} event
 */
Emitter.prototype.emit = function (event) {
  var args;

  args = _.toArray(arguments);

  _.each(this.all_, function (l) {
    l.apply(null, args);
  }, this);

  args.shift();
  _.each((this.on_[event] || {}), function (l, k) {
    l.apply(null, args);
  }, this);
};

/**
 * @param {string} event
 * @param {number} id
 */
Emitter.prototype.off = function (event, id) {
  switch (arguments.length) {
    case 0:
      this.on_ = {};
      this.all_ = {};
      break;
    case 1:
      this.on_[event] = {};
      break;
    default:
      delete (this.on_[event] || {})[id];
      break;
  }
};

/**
 * @param {number} id
 */
Emitter.prototype.offAll = function (id) {
  switch (arguments.length) {
    case 0:
      this.all_ = {};
      break;
    default:
      delete this.all_[id];
      break;
  }
};

function defaultsToValues(t) {
  switch(t) {
    case React.PropTypes.array:
      return [];
    case React.PropTypes.bool:
      return false;
    case React.PropTypes.number:
      return 0;
    case React.PropTypes.string:
      return "";
    case React.PropTypes.object:
      return {};
  }
}

/**
 * @param {Function} c
 * @param {Function} sc
 */
function inherit(c, sc) {
  c.prototype = Object.create(sc.prototype, {});
  c.super_ = sc;
  /** @Overrider */
  c.prototype.constructor = c;
}

function DataEmitter() {
  /**
   * @type {boolean}
   * @private
   */
  this.silent_ = false;
  Emitter.call(this);
  // TODO: throttle?
  this.update = this.update_.bind(this);
}

inherit(DataEmitter, Emitter);

DataEmitter.prototype.update_ = function () {
  if (this.silent_) {
    return;
  }
  this.emit.apply(this, ["change"].concat(_.toArray(arguments)));
};

DataEmitter.prototype.on = function (f)  {
  return Emitter.prototype.on.call(this, "change", f);

};

DataEmitter.prototype.off = function (id) {
  return Emitter.prototype.off.call(this, "change", id);
};

/**
 * @param {string}
 */
DataEmitter.prototype.validate = function (field) {
  var err;
  if (configure.debug) {
    err = this.schema[field](this.data, field, this.modelName);
    if (err) throw err;
  }
};


/**
 * @param {Array} fields
 */
function createActions(actions) {
  var properties = {};

  function Action_() {
    this.fields_ = _.keys(actions);
    Object.seal(this.fields_);
    Action_.super_.call(this);
  }

  inherit(Action_, Emitter);

  properties = {
    /**
    * @param {Function} listener
    * @param {Object=} opt_thisArg
    */
    on: {
      value: function (listener, opt_thisArg) { this.onAll.apply(this, arguments);}
    }, 
    /**
    * @param {string} id
    */
    off: {
      value: function (id) { this.offAll.apply(this, arguments); }
    },
  };

  _.each(actions, function (theAction, actionName) {
    var eventName = actionName.toUpperCase();

    properties[eventName] = {
      get: function eventGetter() {
        return eventName;
      },
      enumerable: true
    };

    properties[actionName] = {
      /**
       * @return {?Error}
       */
      value: function action_action() {
        var ret = theAction.apply(this, arguments);
        if (ret instanceof Error) {
          return ret;
        }
        this.emit.apply(this, [eventName].concat(ret));
        return null;
      }
    };
  });
  Object.defineProperties(Action_.prototype, properties);
  return Action_;
}

/**
 * @param {DataEmitter} Model
 * @param {Object} props
 * @param {string} propName
 * @param {string} componentName
 * @returns {Error}
 */
function checkType(Model, props, propName, componentName) {
  var prop = props[propName];
  if (_.isNull(prop)) {
    return;
  }
  if (Model.prototype.isPrototypeOf(prop)) {
    return new Error("Validation failed: " + propName + " " + componentName);
  }
}

/**
 * @type {{modelProp: modelProp, listProp: listProp, collectionProp: collectionProp}}
 */
FieldTypes = _.extend({
  model: _.partial(checkType, DataModel),
  collection: _.partial(checkType, DataCollection),
  list: _.partial(checkType, List),
}, React.Proptypes);

/**
 * @param {Object} schema
 */
function createModel(options) {
  var id_ = 1;
  if (!_.isObject(options) || !options.fieldTypes) {
    throw new Error("options with prototypes are required to make a DataModel");
  }

  /**
   * @param {Object=} opt_data
   * @constructor
   */
  function Model(opt_data) {
    var defaults, data;
    data = opt_data || {};

    DataModel.call(this);
    this.update = this.update_.bind(this);
    this.modelName = options.modelName || "Model";

    if (options.getDefaultFields && _.isFunction(options.getDefaultFields)) {
      defaults = options.getDefaultFields();
    } else {
      defaults = {};
    }
    defaults.id = defaults.id || ++id_;
    // TODO: check if user adds attrs that aren't in the schema
    this.silent_ = true;
    _.each(this.schema, function (value, field) {
      if (_.has(data, field)) {
        this[field] = data[field];
      } else if (_.has(defaults, field)) {
        this[field] = defaults[field];
      } else {
        this[field] = defaultsToValues(value);
      }
    }, this);
    this.silent_ = false;
    Object.seal(this.data);
  }

  inherit(Model, DataModel);
  if (!_.has(options.fieldTypes, "id")) {
    options.fieldTypes.id = React.PropTypes.number;
  }
  Object.seal(options.fieldTypes);
  Model.prototype.schema = options.fieldTypes;

  _.each(options.fieldTypes, function (fieldType, field) {
    Object.defineProperty(Model.prototype, field, {
      get: function () {
        return this.data[field];
      },
      set: function (v) {
        var err, current = this.data[field];
        this.data[field] = v;
        this.validate(field);
        if (isDataEmitter(current)) {
          current.off(this.eventIds[field]);
        }
        if (isDataEmitter(v)) {
          this.eventIds[field] = v.on(this.update.bind(this, field));
        }
        this.update(field);
      },
    });
  });

  _.each(options, function (property, name) {
    if (_.contains(['fieldTypes', 'getDefaultFields', 'modelName'], name)) {
      return;
    }
    if (_.has(Model.prototype, name)) {
      throw new Error("Model " + options.modelName + " already has property " + name);
    }
    Model.prototype[name] = property;
  });

  return Model;
}

/**
 * @param {Object=} opt_data
 * @extends {Emitter}
 * @constructor
 */
function DataModel(opt_data) {
  DataEmitter.call(this);
  /**
   * @type {Object}
   */
  this.data = {};

  /**
   * @type {Object.<string, number>}
   */
  this.eventIds = {};
}
inherit(DataModel, DataEmitter);

/**
 * @param {Object} d
 * @param {Object} options
 */
DataModel.prototype.set = function (d, options) {
  var changed = [];

  this.silent_ = true;
  _.each(d, function (dataValue, propertyName) {
    this[propertyName] = dataValue;
    changed.push(propertyName);
  }, this);
  this.silent_ = false;

  if (options && options.silent) {
    return;
  }
  this.update(changed);
};

/**
 * @returns {Object}
 */
DataModel.prototype.valueOf = function () {
  var returnedData = {};

  _.each(this.data, function (value, field) {
    if (_.isUndefined(value) || _.isNull(value)) {
      returnedData[field] = value;
    } else {
      returnedData[field] = value.valueOf();
    }
  });
  return returnedData;
};

/**
 * @param {DataModel} model
 */
function createCollection(options) {
  /**
   * @param {Array<Object|DataModel>} opt_list
   * @constructor
   */
  function Collection (opt_list) {
    var defaults, list;
    list = opt_list || [];
    this.modelName = options.modelName || "Collection";
    defaults = _.isFunction(options.getDefaultFields) ? options.getDefaultFields() : {};
    DataCollection.apply(this, defaults);
    list.forEach(function (data) {
      this.add(this.model.prototype.isPrototypeOf(data) ? data : new this.model(data));
    }, this);
  }
  inherit(Collection, DataCollection);
  /**
   * @type {DataModel}
   */
  Collection.prototype.model = options.model;
  return Collection;
}


/**
 * @param {Array.<DataModel>} data
 * @constructor
 */
function DataCollection (data) {
  DataEmitter.call(this);
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
inherit(DataCollection, DataEmitter);

/**
 * @param {Object} model
 * @private
 */
DataCollection.prototype.add = function (model) {
  this.add_(model);
  this.update(model);
};

/**
 * @param {Object} model
 * @private
 */
DataCollection.prototype.add_ = function (model) {
  var data = this.data;

  if (configure.debug && !this.model.prototype.isPrototypeOf(model)) {
    throw new Error("Added invalid model to data collection");
  }

  data.order.push(model.id);
  data.collection[model.id] = model;
  model.on(this.update.bind(this, model));
  this.update(model);
}; 

/**
 * @param {number|string} id
 * @private
 */   
DataCollection.prototype.remove = function (id) {
  this.remove_(id);
  this.update();
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
  _.each(models, function (model) {
    this.add_(model);
  }, this);
  this.silent_ = false;
  this.update();
};

DataCollection.prototype.reset = function () {
  _.each(_.keys(this.data.collection), function (id) {
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
  return _.map(this.data.order, function (id, index) {
    return f.call(opt_thisArg, collection[id], index);
  });
};

/**
 * @param {Function} f
 * @param {Object} opt_thisArg
 */
DataCollection.prototype.forEach = function (f, opt_thisArg) {
  var collection = this.data.collection;
  _.map(this.data.order, function (id, index) {
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
  return _.reduce(this.data.order, function (result, item, index) {
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
  return this.map(function (item, index) {
    return item;
  }, this);
};

/**
 * @return {Number}
 */
Object.defineProperty(DataCollection.prototype, "length", {
  get: function getLength() {
    return this.data.order.length;
  }
});

/**
 * Makes a mixin that auto binds flux props
 * takes optional props array like ['a.b.c', 'b'] which will bind to those props
 * @param {Array<string>=} opt_propPaths
 * @returns {{componentDidMount: componentDidMount, componentWillUnmount: componentWillUnmount}}
 */
function createAutoBinder(opt_propPaths) {
  var mixin, propPaths, boundIds_ = {};

  propPaths = opt_propPaths || [];

  /**
   * @param {Object} props
   * @param {string} componentName
   * @returns {*}
   */
  function getModels(props, componentName) {
    if (_.isEmpty(propPaths)) {
      return _.values(props);
    }
    return propPaths.map(function (propPath) {
      var i, model, paths;

      model = props;
      paths = propPath.split(".");

      for (i=0; i<paths.length; i++) {
        model = model[paths[i]];
        if (!model) break;
      }
      if (!model && configure.debug) {
        throw new Error("No model found for " + propPath + " " + componentName);
      }
      return model;
    });
  }

  mixin = {
    componentDidMount: function () {
      var update = this.forceUpdate.bind(this);
      getModels(this.props, this.componentName).forEach(function (model) {
      if (isDataEmitter(model)) {
          boundIds_[model.on(function () {
            console.log("component on change", model.modelName);
            update();
          }.bind(this))] = model;
        }
      }, this);
    },
    componentWillUnmount: function () {
      _.each(boundIds_, function (model, id) {
        model.off(id);
      });
    },
  };
  return mixin;
}

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
    console.log("this.push", this.push);
    this.push(item);
  }, this);
}

inherit(List, DataEmitter);

_.each(Object.getOwnPropertyNames(Array.prototype), function (name) {
  var f = Array.prototype[name];
  if (!_.isFunction(f)) {
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
  this.update();
};

/**
 * @returns {Array}
 */
List.prototype.valueOf = function () {
  return _.clone(this.collection);
};


module.exports = {
  inherit: inherit,
  createActions: createActions,
  createAutoBinder: createAutoBinder,
  createModel: createModel,
  createCollection: createCollection,
  List: List,
  configure: configure,
  FieldTypes: FieldTypes,
};

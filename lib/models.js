"use strict";

var utils = require("./utils"),
  data_emitter = require("./data_emitter"),
  fields = require("./fields").FieldTypes,
  isDataEmitter = data_emitter.isDataEmitter;

/**
 * @extends {Emitter}
 * @constructor
 */
function DataModel() {
  data_emitter.DataEmitter.call(this);
  /**
   * @type {Object}
   */
  this.data = {};

  /**
   * @type {Object.<string, number>}
   */
  this.eventIds = {};
}

utils.inherit(DataModel, data_emitter.DataEmitter);

DataModel.prototype.save = function (key, cb) {
  if (!this.backend) {
    throw new Error("you must specify a backend");
  }
  return this.backend.save(key, this, this.id, cb);
};

/**
 * @param {Object} d
 * @param {Object} options
 */
DataModel.prototype.set = function (d, options) {
  var changed = [];

  this.silent_ = true;
  utils.each(d, function (dataValue, propertyName) {
    if (!utils.has(this.schema, propertyName)) {
      return;
    }
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
  var v = {};
  utils.each(this.nonEphemeralFields, function (field) {
    var value = this.data[field];
    if (utils.isUndefined(value) || utils.isNull(value)) {
      return value;
    }
    v[field] = value.valueOf();
  }, this);
  return v;
};

DataModel.prototype.bindToField = function (field, fieldName) {
  this.eventIds[fieldName] = field.on(function (name) {
    this.update(fieldName);
  }, this);
};

module.exports = DataModel;

/**
 * @param {Object} schema
 */
function createModel(options) {
  var id_ = 0, fieldTypes, modelName, nonEphemeralFields;
  if (!utils.isObject(options)) {
    throw new Error("options with prototypes are required to make a DataModel");
  }
  fieldTypes = options.fieldTypes || {};
  modelName = options.modelName || "Model";
  /**
   * @param {Object=} opt_data
   * @constructor
   */
  function Model(opt_data) {
    var defaults, data;

    DataModel.call(this);

    data = opt_data || {};

    this.modelName = modelName;
    this.backend = options.backend;

    if (options.getDefaultFields && utils.isFunction(options.getDefaultFields)) {
      defaults = options.getDefaultFields();
    } else {
      defaults = {};
    }
    defaults.id = defaults.id || id_++;
    // TODO: check if user adds attrs that aren't in the schema
    this.silent_ = true;
    utils.each(this.schema, function (Field, fieldName) {
      var defaultValue = utils.has(data, fieldName) ? data[fieldName] : defaults[fieldName];

      if (isDataEmitter(Field.prototype)) {
        if (!defaultValue) {
          this[fieldName] = new Field();
          return;
        }
        if (!defaultValue.isPrototypeOf(Field)) {
          this[fieldName] = new Field(defaultValue);
          return;
        }
        this[fieldName] = defaultValue;
        return;
      }
      if (utils.has(data, fieldName) || utils.has(defaults, fieldName)) {
        this[fieldName] = defaultValue;
        return;
      }
      if (Field.isRequired) {
        throw new Error("The field " + fieldName + " is required according to you!");
      }
      this[fieldName] = Field.defaultsTo;
    }, this);
    this.silent_ = false;
    Object.seal(this.data);
    if (utils.isFunction(this.init)) {
      this.init.apply(this, arguments);
    }
  }

  utils.inherit(Model, DataModel);
  if (!utils.has(fieldTypes, "id")) {
    fieldTypes.id = fields.number;
  }
  Object.seal(fieldTypes);
  Model.prototype.schema = fieldTypes;
  Model.modelName = modelName;
  Model.load = function(key, id) {
    if (!options.backend) {
      throw new Error("you must specify a backend");
    }
    if (!utils.isFinite(id)) {
      id = key;
      key = "";
    }
    return options.backend.load(key, Model, id);
  };
  nonEphemeralFields = [];
  utils.each(fieldTypes, function (fieldType, fieldName) {
    if (!fieldType) {
      throw new Error("The field '" + fieldName + "' is invalid for '" + modelName + "'.");
    }
    if (!fieldType.isEphemeral) {
      nonEphemeralFields.push(fieldName);
    }
    Object.defineProperty(Model.prototype, fieldName, {
      get: function () {
        return this.data[fieldName];
      },
      set: function (v) {
        var current = this.data[fieldName],
        isEmitter = isDataEmitter(v),
        wasEmitter = isDataEmitter(current);

        this.validate(v, fieldName);

        if (!wasEmitter && !isEmitter) {
          this.data[fieldName] = v;
          return this.update(fieldName);
        }

        if (wasEmitter && isEmitter) {
          this.data[fieldName] = v;
          current.off(this.eventIds[fieldName]);
          this.bindToField(v, fieldName);
          return this.update(fieldName);
        }

        if (wasEmitter && !isEmitter) {
          current.set(v);
          return this.update(fieldName);
        }
        // isEmitter but was not c
        this.data[fieldName] = v;
        this.bindToField(v, fieldName);
        this.update(fieldName);
      },
    });
  });
  Object.freeze(nonEphemeralFields);
  Model.prototype.nonEphemeralFields = nonEphemeralFields;
  utils.each(options, function (property, name) {
    if (utils.contains(['fieldTypes', 'getDefaultFields', 'modelName'], name)) {
      return;
    }
    if (utils.has(Model.prototype, name)) {
      throw new Error("Model " + options.modelName + " already has property " + name);
    }
    Model.prototype[name] = property;
  });

  return Model;
}

createModel.DataModel = DataModel;
module.exports = createModel;

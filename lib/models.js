var _ = require("lodash"),
  fieldRegex = /(\w+)/,
  utils = require("./utils"),
  DataModel = require("./data_model"),
  isDataEmitter =  require("./data_emitter").isDataEmitter,
  React = React || {PropTypes: {}};


/**
 * @param {Object} schema
 */
function createModel(options) {
  var id_ = 0, fieldTypes, modelName;
  if (!_.isObject(options)) {
    throw new Error("options with prototypes are required to make a DataModel");
  }
  fieldTypes = options.fieldTypes || {};
  modelName = options.modelName || "Model"
  /**
   * @param {Object=} opt_data
   * @constructor
   */
  function Model(opt_data) {
    var defaults, data;

    DataModel.call(this);

    if (_.isFunction(this.init)) {
      opt_data = this.init.apply(this, opt_data);
    }

    data = opt_data || {};

    this.update = this.update_.bind(this);
    this.modelName = modelName;

    if (options.getDefaultFields && _.isFunction(options.getDefaultFields)) {
      defaults = options.getDefaultFields();
    } else {
      defaults = {};
    }
    defaults.id = defaults.id || id_++;
    // TODO: check if user adds attrs that aren't in the schema
    this.silent_ = true;
    _.each(this.schema, function (value, field) {
      if (_.has(data, field)) {
        if (value && isDataEmitter(value.prototype) && !data[field].isPrototypeOf(value)) {
          this[field] = new (this.schema[field])(data[field]);
          return;
        }
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

  utils.inherit(Model, DataModel);
  if (!_.has(fieldTypes, "id")) {
    fieldTypes.id = React.PropTypes.number;
  }
  Object.seal(fieldTypes);
  Model.prototype.schema = fieldTypes;
  Model.modelName = modelName;

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
          this.eventIds[field] = v.on(function (name) {
            if (v.replaceEventName) {
              name = name.replace(fieldRegex, field);
            } else {
              name = field + "." + name;
            }
            this.update(name);
          }, this);
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

module.exports = createModel;
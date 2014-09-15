"use strict";

var _ = require("lodash"),
  DataModel = require("./models"),
  List = require("./list"),
  collections = require("./collections"),
  React = React || {Proptypes: null};

function Chainable() {
  this.backend = null;
  this.defaults = null;
  this.required = false;
};

Chainable.prototype.persist = function (backend) {
  this.backend = backend;
  return this;
};

Chainable.prototype.defaults = function (value) {
  this.defaults = value;
  return this;
};

Chainable.prototype.required = function (value) {
  this.required = !!value;
  return this;
};

Chainable.prototype.validate = function () {
  return false;
};

function extend (f, p) {
  _.extend(f.prototype, p);
};

function BoolField () { this.defaults = false; };
extend(BoolField, function validate(value) {
  return _.isBoolean(value);
});

function NumberField () { this.defaults = 0; };
extend(NumberField, function validate(value) {
  return _.isNumber(value);
});

function StringField () { this.defaults = ""; };
extend(StringField, function validate(value) {
  return _.isString(value);
});

function FuncField () { this.defaults = null; };
extend(FuncField, function validate(value) {
  return _.isFunction(value);
});

function ObjectField () { this.defaults = {}; };
extend(ObjectField, function validate(value) {
  return _.isObject(value);
});

function ArrayField () { this.defaults = []; };
extend(ArrayField, function validate(value) {
  return _.isArray(value);
});

function EnumField (enum_) { 
  this.enum_ = enum_;
  thid.defaults = null;
  if (!_.isArray(enum_)) {
    throw new Error("Enums require an array");
  }
};

extend(EnumField, function validate(value) {
  for (var i = 0; i < this.enum_.length; i++ ) {
    if (this.enum_[i] === value) {
      return true;
    }
  }
  return false;
});

function InstanceOfField (klass) {
  if (!klass || !klass.isPrototypeOf) {
    throw new Error("I need a klass");
  }
  this.defaults = null;
  this.klass = klass;
};
extend(InstanceOfField, function validate (value) {
  return this.klass.isPrototypeOf(value);
});

function OneOfField (ones) {
  this.defaults = null;
  this.ones = ones;
}

extend(OneOfField, function validate(value) {
  for (var i = 0; i < this.ones.length; i++ ) {
    if (this.enum_[i].validate(value)) {
      return true;
    }
  }
  return false;
});

function ArrayOfField (field) {
  if (!field || !field.validate) {
    throw new Error("I need a field");
  }
  this.field = field;
  this.defaults = field.defaults;
}
extend(ArrayOfField, function validate (value) {
  if (!_.isArray(value)) {
    return false;
  }
  for (var i = 0; i < value.length; i++ ) {
    if (!this.field.validate(value[i])) {
      return false;
    }
  }
  return true;
});

function ObjectOfField (field) {
  if (!field || !field.validate) {
    throw new Error("I need a field");
  }
  this.field = field;
}
extend(ObjectOfField, function validate (value) {
  var keys, i;
  if (!_.isObject(value)) {
    return false;
  }
  keys = Object.keys(value);
  for (i = 0; i < keys.length; i++ ) {
    if (!Object.hasOwnProperty(keys[i])) {
      continue;
    }
    if (!this.field.validate(value[keys[i]])) {
      return false;
    }
  }
  return true;
});

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

module.exports = {
  FieldTypes: {
    BoolField: BoolField,
    NumberField: NumberField,
    StringField: StringField,
    FuncField: FuncField,
    ObjectField: ObjectField,
    ArrayField: ArrayField,
    EnumField: EnumField,
    InstanceOfField: InstanceOfField,
    OneOfField: OneOfField,
    ArrayOfField: ArrayOfField,
    ObjectOfField: ObjectOfField,
  },
  checkType: checkType
};
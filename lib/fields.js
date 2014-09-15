"use strict";

var _ = require("lodash"), 
  utils = require("./utils"), 
  chainablePrototype;

function PrimitiveChainable () {
  this.persist = true;
  this.defaults = null;
  this.required = false;
  this.newMe = false;
};

PrimitiveChainable.prototype.newify = function (persist, defaults, required){
  var newMe;
  if (this.newMe) {
    newMe = this;
  } else {
    newMe = new this.constructor();
    newMe.newMe = true;
  }
  newMe.persist = persist;
  newMe.defaults = defaults;
  newMe.required = required;
  return newMe;
}
PrimitiveChainable.prototype.persist = function (persist) {
  return this.newify(persist, this.defaults, this.required);
};

PrimitiveChainable.prototype.defaults = function (defaults) {
  return this.newify(this.persist, defaults, this.required);
};

PrimitiveChainable.prototype.required = function (required) {
  return this.newify(this.persist, this.defaults, !!required);
};

PrimitiveChainable.prototype.validate = function () {
  return false;
};

function BooleanField () { PrimitiveChainable.call(this); this.defaults = false; };
utils.inherit(BooleanField, PrimitiveChainable);
BooleanField.prototype.validate = function (value) {
  return _.isBoolean(value);
};


function NumberField () { PrimitiveChainable.call(this); this.defaults = 0; };
utils.inherit(NumberField, PrimitiveChainable);
NumberField.prototype.validate = function (value) {
  return _.isNumber(value);
};


function StringField () { PrimitiveChainable.call(this); this.defaults = ""; };
utils.inherit(StringField, PrimitiveChainable);
StringField.prototype.validate = function (value) {
  return _.isString(value);
};


function FunctionField () { PrimitiveChainable.call(this); this.defaults = null; };
utils.inherit(FunctionField, PrimitiveChainable);
FunctionField.prototype.validate = function (value) {
  return _.isFunction(value);
};


function ObjectField () { PrimitiveChainable.call(this); this.defaults = {}; };
utils.inherit(ObjectField, PrimitiveChainable);
ObjectField.prototype.validate = function (value) {
  return _.isObject(value);
};


function ArrayField () { PrimitiveChainable.call(this); this.defaults = []; };
utils.inherit(ArrayField, PrimitiveChainable);
ArrayField.prototype.validate = function (value) {
  return _.isArray(value);
};

chainablePrototype = {
  persist: function (persist) {
    this.persist = !!persist;
    return this;
  },
  defaults: function (defaults) {
    this.defaults = defaults;
    return this;
  },
  required: function (required) {
    this.required = !!required;
    return this;
  },
  validate: function () {
    return false;
  }
}

function extendChainableField (field, validate) {
  field.prototype = _.extend({}, chainablePrototype, {validate: validate});
};

function OneOfField (enum_) {
  if (!_.isArray(enum_)) {
    throw new Error("Enums require an array");
  }
  this.defaults = null;
  this.enum_ = enum_;
};

extendChainableField(OneOfField, function validate (value) {
  for (var i = 0; i < this.enum_.length; i++ ) {
    if (this.enum_[i] === value) {
      return true;
    }
  }
  return false;
});

function InstanceOfField (klass) {
  if (!klass || !klass.prototype || !klass.prototype.isPrototypeOf) {
    throw new Error("I need a klass (constructor)");
  }
  this.defaults = null;
  this.proto_ = klass.prototype;
};
extendChainableField(InstanceOfField, function validate (value) {
  return this.proto_.isPrototypeOf(value);
});

function OneOfTypeField (ones) {
  this.defaults = null;
  this.ones_ = ones;
  if (!_.isArray(ones)) {
    throw new Error("I need an array of fields");
  }
}

extendChainableField(OneOfTypeField, function validate(value) {
  for (var i = 0; i < this.ones_.length; i++ ) {
    if (this.ones_[i].validate(value)) {
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
extendChainableField(ArrayOfField, function validate (value) {
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
extendChainableField(ObjectOfField, function validate (value) {
  var keys, key, i, validate = this.field.validate;
  if (!_.isObject(value)) {
    return false;
  }
  keys = Object.keys(value);
  for (i = 0; i < keys.length; i++ ) {
    key = keys[i];
    if (!Object.hasOwnProperty.call(value, key)) {
      continue;
    }
    console.log(value[key]);
    if (!validate(value[key])) {
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

function createChainableField(F, unwrap) {
  // JAVASCRIPT is rtarded
  return function(a, b, c, d, e, f, g, h, i, j, k, l, m) {
    return new F(a, b, c, d, e, f, g, h, i, j, k, l, m);
  };
}


module.exports = {
  FieldTypes: {
    BooleanField: new BooleanField(),
    NumberField: new NumberField(),
    StringField: new StringField(),
    FunctionField: new FunctionField(),
    ObjectField: new ObjectField(),
    ArrayField: new ArrayField(),
    OneOfField: createChainableField(OneOfField),
    InstanceOfField: createChainableField(InstanceOfField),
    OneOfTypeField: createChainableField(OneOfTypeField),
    ArrayOfField: createChainableField(ArrayOfField),
    ObjectOfField: createChainableField(ObjectOfField),
  },
  checkType: checkType
};
"use strict()";

var utils = require("./utils"),
  chainablePrototype;

function PrimitiveChainable () {
  this.persists_ = true;
  this.defaults_ = null;
  this.required_ = false;
  this.newMe_ = false;
}

PrimitiveChainable.prototype.newify = function (persist, defaults, required) {
  var newMe;

  if (this.newMe_) {
    newMe = this;
  } else {
    newMe = new this.constructor();
    newMe.newMe_ = true;
  }
  newMe.persists_ = persist;
  newMe.defaults_ = defaults;
  newMe.required_ = required;
  return newMe;
};

PrimitiveChainable.prototype.persists = function (persist) {
  return this.newify(persist, this.defaults_, this.required_);
};

PrimitiveChainable.prototype.defaults = function (defaults) {
  return this.newify(this.persists_, defaults, this.required_);
};

PrimitiveChainable.prototype.required = function (required) {
  return this.newify(this.persists_, this.defaults_, !!required);
};

PrimitiveChainable.prototype.validate = function () {
  return false;
};

function BooleanField () { PrimitiveChainable.call(this); this.defaults_ = false; }
utils.inherit(BooleanField, PrimitiveChainable);
BooleanField.prototype.validate = function (value) {
  return utils.isBoolean(value);
};


function NumberField () { PrimitiveChainable.call(this); this.defaults_ = 0; }
utils.inherit(NumberField, PrimitiveChainable);
NumberField.prototype.validate = function (value) {
  return utils.isNumber(value);
};


function StringField () { PrimitiveChainable.call(this); this.defaults_ = ""; }
utils.inherit(StringField, PrimitiveChainable);
StringField.prototype.validate = function (value) {
  return utils.isString(value);
};


function FunctionField () { PrimitiveChainable.call(this); this.defaults_ = null; }
utils.inherit(FunctionField, PrimitiveChainable);
FunctionField.prototype.validate = function (value) {
  return utils.isFunction(value);
};


function ObjectField () { PrimitiveChainable.call(this); this.defaults_ = {}; }
utils.inherit(ObjectField, PrimitiveChainable);
ObjectField.prototype.validate = function (value) {
  return !utils.isArray(value) && utils.isObject(value);
};


function ArrayField () { PrimitiveChainable.call(this); this.defaults_ = []; }
utils.inherit(ArrayField, PrimitiveChainable);
ArrayField.prototype.validate = function (value) {
  return utils.isArray(value);
};

chainablePrototype = {
  persists: function (persist) {
    this.persists_ = !!persist;
    return this;
  },
  defaults: function (defaults) {
    this.defaults_ = defaults;
    return this;
  },
  required: function (required) {
    this.required_ = !!required;
    return this;
  },
  validate: function () {
    return false;
  }
};

function extendChainableField (field, validate) {
  field.prototype = utils.extend({}, chainablePrototype, {validate: validate});
}

function OneOfField (enum_) {
  if (!utils.isArray(enum_)) {
    throw new Error("Enums require an array");
  }
  this.defaults_ = null;
  this.enum_ = enum_;
}

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
  this.defaults_ = null;
  this.proto_ = klass.prototype;
}

extendChainableField(InstanceOfField, function validate (value) {
  return this.proto_.isPrototypeOf(value);
});

function OneOfTypeField (ones) {
  this.defaults_ = null;
  this.ones_ = ones;
  if (!utils.isArray(ones)) {
    throw new Error("I need an array of fields");
  }
}

extendChainableField(OneOfTypeField, function validate (value) {
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
  this.defaults_ = field.defaults;
}
extendChainableField(ArrayOfField, function validate (value) {
  if (!utils.isArray(value)) {
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
extendChainableField(ObjectOfField, function _validate (value) {
  var keys, key, i, validate = this.field.validate;
  if (!utils.isObject(value)) {
    return false;
  }
  keys = Object.keys(value);
  for (i = 0; i < keys.length; i++ ) {
    key = keys[i];
    if (!Object.hasOwnProperty.call(value, key)) {
      continue;
    }
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
  if (utils.isNull(prop)) {
    return;
  }
  if (Model.prototype.isPrototypeOf(prop)) {
    return new Error("Validation failed: " + propName + " " + componentName);
  }
}

function createChainableField(F) {
  // JAVASCRIPT is rtarded
  return function(a, b, c, d, e, f, g, h, i, j, k, l, m) {
    return new F(a, b, c, d, e, f, g, h, i, j, k, l, m);
  };
}


module.exports = {
  FieldTypes: {
    bool: new BooleanField(),
    number: new NumberField(),
    string: new StringField(),
    func: new FunctionField(),
    object: new ObjectField(),
    array: new ArrayField(),
    oneOf: createChainableField(OneOfField),
    instanceOf: createChainableField(InstanceOfField),
    oneOfType: createChainableField(OneOfTypeField),
    arrayOf: createChainableField(ArrayOfField),
    objectOf: createChainableField(ObjectOfField),
  },
  checkType: checkType
};

"use strict";

var utils = require("./utils"),
  list = require("./list"),
  chainablePrototype;

/**
 * @constructor
 */
function PrimitiveChainable () {
  this.persists_ = true;
  this.defaults_ = null;
  this.required_ = false;
  this.newMe_ = false;
}

/**
 * @return {PrimitiveChainable}
 */
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

/**
 * @return {PrimitiveChainable}
 */
PrimitiveChainable.prototype.persists = function (persist) {
  return this.newify(persist, this.defaults_, this.required_);
};

/**
 * @return {PrimitiveChainable}
 */
PrimitiveChainable.prototype.defaults = function (defaults) {
  return this.newify(this.persists_, defaults, this.required_);
};

/**
 * @return {PrimitiveChainable}
 */
PrimitiveChainable.prototype.required = function (required) {
  return this.newify(this.persists_, this.defaults_, !!required);
};

/**
 * @return {boolean}
 */
PrimitiveChainable.prototype.validate = function () {
  return false;
};

/**
 * @extends {PrimitiveChainable}
 * @constructor
 */
function BooleanField () {
  PrimitiveChainable.call(this); this.defaults_ = false;
}
utils.inherit(BooleanField, PrimitiveChainable);

/** @inheritDoc */
BooleanField.prototype.validate = function (value) {
  return utils.isBoolean(value);
};


/**
 * @extends {PrimitiveChainable}
 * @constructor
 */
function NumberField () {
  PrimitiveChainable.call(this); this.defaults_ = 0;
}
utils.inherit(NumberField, PrimitiveChainable);

/** @inheritDoc */
NumberField.prototype.validate = function (value) {
  return utils.isNumber(value);
};


function StringField () { PrimitiveChainable.call(this); this.defaults_ = ""; }
utils.inherit(StringField, PrimitiveChainable);
StringField.prototype.validate = function (value) {
  return utils.isString(value);
};


/**
 * @extends {PrimitiveChainable}
 * @constructor
 */
function FunctionField () {
  PrimitiveChainable.call(this); this.defaults_ = null;
}
utils.inherit(FunctionField, PrimitiveChainable);

/** @inheritDoc */
FunctionField.prototype.validate = function (value) {
  return utils.isFunction(value);
};


/**
 * @extends {PrimitiveChainable}
 * @constructor
 */
function ObjectField () {
  PrimitiveChainable.call(this); this.defaults_ = {};
}
utils.inherit(ObjectField, PrimitiveChainable);

/** @inheritDoc */
ObjectField.prototype.validate = function (value) {
  return !utils.isArray(value) && utils.isObject(value);
};


/**
 * @extends {PrimitiveChainable}
 * @constructor
 */
function ArrayField () {
  PrimitiveChainable.call(this); this.defaults_ = [];
}
utils.inherit(ArrayField, PrimitiveChainable);

/** @inheritDoc */
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

/**
 * @param {PrimitiveChainable} field
 * @param {boolean} validate
 */
function extendChainableField (field, validate) {
  field.prototype = utils.extend({}, chainablePrototype, {validate: validate});
}

/**
 * @param {Array} enum_
 */
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

/**
 * @throws {Error}
 * @param {Function|Object} klass
 */
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

/**
 * @throws {Error}
 * @param {Array}
 */
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

/**
 * @param {PrimitiveChainable} field
 */
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

/**
 * @param {PrimitiveChainable} field
 */
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
 * @return {Error}
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

/**
 * @param {Function} F
 * @return {Object}
 */
function createChainableField(F) {
  return function(a, b, c, d, e, f, g, h, i, j, k, l, m) {
    return new F(a, b, c, d, e, f, g, h, i, j, k, l, m);
  };
}

module.exports = {
  FieldTypes: {
    array: new ArrayField(),
    arrayOf: createChainableField(ArrayOfField),
    bool: new BooleanField(),
    func: new FunctionField(),
    instanceOf: createChainableField(InstanceOfField),
    list: list,
    number: new NumberField(),
    object: new ObjectField(),
    objectOf: createChainableField(ObjectOfField),
    oneOf: createChainableField(OneOfField),
    oneOfType: createChainableField(OneOfTypeField),
    string: new StringField()
  },
  checkType: checkType
};

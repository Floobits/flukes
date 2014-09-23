"use strict";

var utils = require("./utils"),
  list = require("./list"),
  chainablePrototype, OneOfField, InstanceOfField, 
  ObjectOfField, OneOfTypeField, ArrayOfField;

/**
 * @constructor
 */
function PrimitiveChainable () {
  this.isEphemeral = false;
  this.defaultsTo = null;
  this.isRequired = false;
  this.newMe_ = false;
}

/**
 * @return {PrimitiveChainable}
 */
PrimitiveChainable.prototype.newify = function (ephemeral, defaults, required) {
  var newMe;

  if (this.newMe_) {
    newMe = this;
  } else {
    newMe = new this.constructor();
    newMe.newMe_ = true;
  }
  newMe.isEphemeral = ephemeral;
  newMe.defaultsTo = defaults;
  newMe.isRequired = required;
  return newMe;
};

/**
 * @return {PrimitiveChainable}
 */
PrimitiveChainable.prototype.ephemeral = function () {
  return this.newify(true, this.defaultsTo, this.isRequired);
};

/**
 * @return {PrimitiveChainable}
 */
PrimitiveChainable.prototype.required = function () {
  return this.newify(this.isEphemeral, this.defaultsTo, true);
};

/**
 * @return {PrimitiveChainable}
 */
PrimitiveChainable.prototype.defaults = function (defaults) {
  return this.newify(this.isEphemeral, defaults, this.isRequired);
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
  PrimitiveChainable.call(this);
  this.defaultsTo = false;
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
  PrimitiveChainable.call(this);
  this.defaultsTo = 0;
}
utils.inherit(NumberField, PrimitiveChainable);

/** @inheritDoc */
NumberField.prototype.validate = function (value) {
  return utils.isNumber(value);
};


/**
 * @extends {PrimitiveChainable}
 * @constructor
 */
function StringField () {
  PrimitiveChainable.call(this);
  this.defaultsTo = "";
}
utils.inherit(StringField, PrimitiveChainable);

/** @inheritDoc */
StringField.prototype.validate = function (value) {
  return utils.isString(value);
};


/**
 * @extends {PrimitiveChainable}
 * @constructor
 */
function FunctionField () {
  PrimitiveChainable.call(this);
  this.defaultsTo = null;
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
  PrimitiveChainable.call(this);
  this.defaultsTo = {};
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
  PrimitiveChainable.call(this);
  this.defaultsTo = [];
}
utils.inherit(ArrayField, PrimitiveChainable);

/** @inheritDoc */
ArrayField.prototype.validate = function (value) {
  return utils.isArray(value);
};

chainablePrototype = {
  ephemeral: function () {
    this.isEphemeral = true;
    return this;
  },
  defaults: function (defaults) {
    this.defaultsTo = defaults;
    return this;
  },
  required: function () {
    this.isRequired = true;
    return this;
  },
  validate: function () {
    return false;
  }
};

function extendChainableField(init, validate) {
  function F () {}
  F.prototype = Object.create(chainablePrototype);
  F.prototype.validate = validate;
  F.prototype.init = init;
  return F;
}

/**
 * @param {Array} enum_
 */


OneOfField = extendChainableField(function OneOfField (enum_) {
  if (!utils.isArray(enum_)) {
    throw new Error("Enums require an array");
  }
  this.defaultsTo = null;
  this.enum_ = enum_;
  this.isEphemeral = false;
  this.isRequired = false;
  return this;
}, function OneOfField_validate (value) {
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
InstanceOfField = extendChainableField(function InstanceOfField (klass) {
    if (!klass || !klass.prototype || !klass.prototype.isPrototypeOf) {
      throw new Error("I need a klass (constructor)");
    }
    this.defaultsTo = null;
    this.isEphemeral = false;
    this.isRequired = false;

    this.proto_ = klass.prototype;
    return this;
  }, function InstanceOfField_validate (value) {
  return this.proto_.isPrototypeOf(value);
});

/**
 * @throws {Error}
 * @param {Array}
 */
OneOfTypeField = extendChainableField(function OneOfTypeField (ones) {
    this.defaultsTo = null;
    this.isEphemeral = false;
    this.isRequired = false;

    this.ones_ = ones;
    if (!utils.isArray(ones)) {
      throw new Error("I need an array of fields");
    }
    return this;
  }, function validate (value) {
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
ArrayOfField = extendChainableField(function ArrayOfField (field) {
  if (!field || !field.validate) {
    throw new Error("I need a field");
  }
  this.field = field;
  this.defaultsTo = field.defaults;
  this.isEphemeral = false;
  this.isRequired = false;
  return this;
}, function validate (value) {
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

ObjectOfField = extendChainableField(function ObjectOfField (field) {
    if (!field || !field.validate) {
      throw new Error("I need a field");
    }
    this.field = field;
    this.isEphemeral = false;
    this.isRequired = false;
    return this;
  }, function _validate (value) {
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

function createChainableField (f) {
  return f.init.bind(f);
}

module.exports = {
  FieldTypes: {
    array: new ArrayField(),
    bool: new BooleanField(),
    func: new FunctionField(),
    list: list,
    number: new NumberField(),
    object: new ObjectField(),
    arrayOf: createChainableField(new ArrayOfField()),
    instanceOf: createChainableField(new InstanceOfField()),
    objectOf: createChainableField(new ObjectOfField()),
    oneOf: createChainableField(new OneOfField()),
    oneOfType: createChainableField(new OneOfTypeField()),
    string: new StringField()
  },
  checkType: checkType
};

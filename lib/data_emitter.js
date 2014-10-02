var Emitter = require("./emitter"),
  utils = require("./utils"),
  settings = require("./settings");

/**
 * @extends {Emitter}
 * @constructor
 */
function DataEmitter () {
  /**
   * @type {boolean}
   * @private
   */
  this.recursing_ = false;
  this.silent_ = false;
  Emitter.call(this);
  this.fieldName = null;
}
utils.inherit(DataEmitter, Emitter);

/**
 * @param {string}
 * @throws {Error}
 */
DataEmitter.prototype.validate = function (field) {
  var err;
  if (settings.debug) {
    err = this.schema[field](this.data, field, this.modelName);
    if (err) throw err;
  }
};

DataEmitter.prototype.load = function (key, cb) {
  if (!this.backend) {
    throw new Error("you must specify a backend");
  }
  return this.backend.load(key, this, this.id, cb);
};

/**
 * @param {Array<PrimitiveChainable>}
 */
DataEmitter.prototype.update = function(fields) {
  if (this.silent_ || this.recursing_) {
    return;
  }
  this.recursing_ = true;
  if (this.didUpdate(fields) === false) {
    return;
  }
  this.recursing_ = false;
  this.emit.apply(this, arguments);
};

/**
 * @return {boolean}
 */
DataEmitter.prototype.didUpdate = function () {
  return true;
};

/**
 * @param {*} value
 * @return {boolean}
 */
function isDataEmitter (value) {
  return DataEmitter.prototype.isPrototypeOf(value);
}

module.exports = {
  DataEmitter: DataEmitter,
  isDataEmitter: isDataEmitter,
};

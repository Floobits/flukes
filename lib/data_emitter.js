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

/**
 * @param {Array<PrimitiveChainable>}
 */
DataEmitter.prototype.update = function(fields) {
  if (this.silent_) {
    return;
  }
  this.silent_ = true;
  if (this.didUpdate(fields) === false) {
    return;
  }
  this.silent_ = false;
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

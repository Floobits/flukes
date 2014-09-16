var Emitter = require("./emitter"),
  utils = require("./utils"),
  settings = require("./settings");

function DataEmitter () {
  /**
   * @type {boolean}
   * @private
   */
  this.silent_ = false;
  Emitter.call(this);
  // TODO: throttle?
  this.update = this.update_.bind(this);
  this.fieldName = null;
}

utils.inherit(DataEmitter, Emitter);

DataEmitter.prototype.update_ = function () {
  if (this.silent_) {
    return;
  }
  this.emit.apply(this, arguments);
};

/**
 * @param {string}
 */
DataEmitter.prototype.validate = function (field) {
  var err;
  if (settings.debug) {
    err = this.schema[field](this.data, field, this.modelName);
    if (err) throw err;
  }
};

/**
 * @param {*} value
 * @returns {boolean}
 */
function isDataEmitter (value) {
  return DataEmitter.prototype.isPrototypeOf(value);
}

module.exports = {
  DataEmitter: DataEmitter,
  isDataEmitter: isDataEmitter,
};

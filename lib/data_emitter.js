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
  this.fieldName = null;
}

utils.inherit(DataEmitter, Emitter);

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

DataEmitter.prototype.didUpdate = function () {
  return true;
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

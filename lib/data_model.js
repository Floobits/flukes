"use strict";

var _ = require("lodash"),
  utils = require("./utils"),
  data_emitter = require("./data_emitter");
/**
 * @param {Object=} opt_data
 * @extends {Emitter}
 * @constructor
 */
function DataModel(opt_data) {
  data_emitter.DataEmitter.call(this);
  /**
   * @type {Object}
   */
  this.data = {};

  /**
   * @type {Object.<string, number>}
   */
  this.eventIds = {};
}

utils.inherit(DataModel, data_emitter.DataEmitter);

/**
 * @param {Object} d
 * @param {Object} options
 */
DataModel.prototype.set = function (d, options) {
  var changed = [];

  this.silent_ = true;
  _.each(d, function (dataValue, propertyName) {
    this[propertyName] = dataValue;
    changed.push(propertyName);
  }, this);
  this.silent_ = false;

  if (options && options.silent) {
    return;
  }
  this.update(changed);
};

/**
 * @returns {Object}
 */
DataModel.prototype.valueOf = function () {
  var returnedData = {};

  _.each(this.data, function (value, field) {
    if (_.isUndefined(value) || _.isNull(value)) {
      returnedData[field] = value;
    } else {
      returnedData[field] = value.valueOf();
    }
  });
  return returnedData;
};

module.exports = DataModel;

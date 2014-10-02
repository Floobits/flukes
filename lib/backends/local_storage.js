"use strict";

var utils = require("../utils"),
  settings = require("../settings"),
  localStorage;

try {
  localStorage = window.localStorage;
} catch (e) {
  localStorage = {};
}


function LocalStorage () {}

LocalStorage.prototype.supported = function() {
  try {
    return 'localStorage' in window && window.localStorage !== null;
  } catch (e) {
    return false;
  }
};

LocalStorage.prototype.getKey = function (namespace, model, id) {
  return "floobits::" + (namespace || settings.namespace) + "::" + model.modelName + "::" + (id || model.id);
};

LocalStorage.prototype.save = function (namespace, model, id, cb) {
  var key = this.getKey(namespace, model, id);
  try {
    localStorage[key] = JSON.stringify(model.valueOf());
  } catch (e) {
    if (utils.isFunction(cb)) {
      cb(e);
      return e;
    }
  }
};

LocalStorage.prototype.load = function (namespace, model, id, cb) {
  var cereal, data, key = this.getKey(namespace, model, id);

  if (!utils.isFunction(cb)) {
    cb = function () {};
  }

  cereal = localStorage[key];
  if (!cereal) {
    return cb(new Error("No data to load"));
  }
  try {
    data = JSON.parse(cereal);
  } catch (e) {
    console.warn(e);
    cb(e);
    return e;
  }
  if (!utils.isFinite(model.id) && !(model.id && model.id.length)) {
    model = new model(data);
    cb(null, model);
    return model;
  }
  model.set(data);
  cb(null, model);
  return model;
};

module.exports = new LocalStorage();

/*global $*/

var utils = require("../utils"),
  settings = require("../settings");

function XHRStorage (getUrl) {
  this.getUrl = getUrl;
}

XHRStorage.prototype.supported = function() {
  return (typeof $ !== "undefined") && $.ajax;
};

XHRStorage.prototype.getUrl = function(namespace, model, id) {
  var getUrl = model.getUrl || (model.prototype && model.prototype.getUrl),
    getPath = model.getPath || (model.prototype && model.prototype.getPath);

  if (utils.isFunction(getUrl)) {
    return getUrl.call(model, id, namespace);
  }
  if (namespace || settings.namespace) {
    return(namespace || settings.namespace) + getPath.call(model, id, namespace);
  }
  return window.location.protocol + "//" + window.location.host + getPath.call(model, id, namespace);
};

XHRStorage.prototype.save = function (namespace, model, id, cb) {
  var data;

  try {
    data = JSON.stringify(model.valueOf());
  } catch (e) {
    if (typeof cb !== "function") {
      cb(e);
      return e;
    }
  }

  return $.ajax({
    data: data,
    url: this.getUrl(namespace, model),
    method: "post",
    complete: function (xhr, status) {
      if (status === "error") {
        return cb(xhr);
      } else {
        return cb(null, xhr);
      }
    }
  });
};

/**
 * @param {DataEmitter} model
 * @param {*} data
 * @param {string|number} id
 */
XHRStorage.prototype.parse = function (model, data, id) {
  model.set(data);
};

/**
 * @param {string} namespace
 * @param {DataEmitter} model
 * @param {string|number} id
 * @param {Function} cb
 */
XHRStorage.prototype.load = function (namespace, model, id, cb) {
  if (typeof cb !== "function") {
    cb = function () {};
  }

  return $.ajax({
    url: this.getUrl(namespace, model, id),
    method: "get",
    error: cb,
    success: (function (data) {
      if (model.parse) {
        return cb(null, model.parse(model, data, id));
      }
      this.parse(model, data, id);
      return;
    }.bind(this)),
  });
};

module.exports = XHRStorage;

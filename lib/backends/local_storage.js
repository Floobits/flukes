var _ = require("lodash"),
  localStorage = localStorage || {};

function LocalStorage () {};

LocalStorage.prototype.supported = function() {
  try {
    return 'localStorage' in window && window.localStorage !== null;
  } catch (e) {
    return false;
  }
};

LocalStorage.prototype.getKey = function (namespace, model, id) {
  return "floobits::" + (namespace || "") + "::" + model.modelName + "::" + (id || model.id);
}

LocalStorage.prototype.save = function (namespace, model, id) {
  var key = this.getKey(namespace, model, id);
  localStorage[key] = JSON.stringify(model.valueOf());
};

LocalStorage.prototype.load = function (namespace, model, id) {
  var cereal, data, key = this.getKey(namespace, model, id);
  cereal = localStorage[key]
  if (!cereal) {
    return;
  }
  try {
    data = JSON.parse(cereal);
  } catch (e) {
    console.warn(e);
    return;
  }
  if (!_.isFinite(model.id)) {
    return new model(data);
  }
  model.set(data);
  return model;
};

module.exports = new LocalStorage();

"use strict";

var utils = require("./utils"),
  isDataEmitter = require("./data_emitter").isDataEmitter,
  settings = require("./settings");

/**
 * @param {Object} props
 * @param {string} componentName
 * @return {*}
 */
function getModels(propPaths, props, componentName) {
  return propPaths.map(function (propPath) {
    var i, model, paths;

    model = props;
    paths = propPath.split(".");

    for (i=0; i<paths.length; i++) {
      model = model[paths[i]];
      if (!model) break;
    }
    if (!model && settings.debug) {
      throw new Error("No model found for " + propPath + " " + componentName);
    }
    return model;
  });
}

/**
 * Makes a mixin that auto binds flux props
 * takes props array like ['a.b.c', 'b'] which will bind to those props and/or models as second argument
 * @param {Array<string>=} opt_propPaths
 * @return {{componentDidMount: componentDidMount, componentWillUnmount: componentWillUnmount}}
 */
function createAutoBinder (propPaths, models) {
  var mixin, boundIds_ = {};

  if (utils.isUndefined(propPaths) && utils.isUndefined(models)) {
    throw new Error("I require propPaths or models");
  }

  if (!utils.isArray(models)) {
    models = [];
  }

  mixin = {
    componentDidMount: function () {
      var update = function(name, modelName) {
        var owner = this._owner, componentName = "unknown";
        if (!this.isMounted()) {
          return;
        }
        while (owner) {
          componentName = owner.componentName;
          if (componentName) {
            break;
          }
          owner = owner._owner;
        }
        console.log("force updating " + name + " of " + componentName + " because of " + modelName);
        this.forceUpdate();
      };
      getModels(propPaths, this.props, this.componentName).concat(models).forEach(function (model) {
        if (isDataEmitter(model)) {
          boundIds_[model.on(update.bind(this, this.componentName, model.modelName))] = model;
        }
      }, this);
    },
    componentWillUnmount: function () {
      utils.each(boundIds_, function (model, id) {
        model.off(id);
      });
    }
  };
  return mixin;
}

module.exports = createAutoBinder;

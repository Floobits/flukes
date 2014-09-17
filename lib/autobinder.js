"use strict";

var utils = require("./utils"),
  isDataEmitter = require("./data_emitter").isDataEmitter,
  settings = require("./settings");
/**
 * Makes a mixin that auto binds flux props
 * takes props array like ['a.b.c', 'b'] which will bind to those props
 * @param {Array<string>=} opt_propPaths
 * @returns {{componentDidMount: componentDidMount, componentWillUnmount: componentWillUnmount}}
 */
function createAutoBinder (propPaths) {
  var mixin, boundIds_ = {};

  if (_.isUndefined(propPaths)) {
    throw new Error("I require propPaths");
  }
  /**
   * @param {Object} props
   * @param {string} componentName
   * @returns {*}
   */
  function getModels(props, componentName) {
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

  mixin = {
    componentDidMount: function () {
      var update = this.forceUpdate.bind(this);
      getModels(this.props, this.componentName).forEach(function (model) {
      if (isDataEmitter(model)) {
          boundIds_[model.on(function () {
            update();
          }.bind(this))] = model;
        }
      }, this);
    },
    componentWillUnmount: function () {
      utils.each(boundIds_, function (model, id) {
        model.off(id);
      });
    },
  };
  return mixin;
}

module.exports = createAutoBinder;

"use strict";
var fields = require("./fields").FieldTypes,
  collections = require("./collections"),
  models = require("./models");

fields.model = fields.instanceOf(models.DataModel);
fields.collection = fields.instanceOf(collections.DataCollection);

module.exports = {
  inherit: require("./utils").inherit,
  createActions: require("./actions"),
  createAutoBinder: require("./autobinder"),
  createModel: models,
  createCollection: collections.createCollection,
  List: require("./list"),
  settings: require("./settings"),
  Emitter: require("./emitter"),
  FieldTypes: fields,
  backends: {
    local: require("./backends/local_storage"),
    XHRStorage: require("./backends/xhr_storage")
  }
};

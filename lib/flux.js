"use strict()";

module.exports = {
  inherit: require("./utils").inherit,
  createActions: require("./actions"),
  createAutoBinder: require("./autobinder"),
  createModel: require("./models"),
  createCollection: require("./collections").createCollection,
  List: require("./list"),
  settings: require("./settings"),
  FieldTypes: require("./fields").FieldTypes,
  Emitter: require("./emitter"),
  backends: {
    local: require("./backends/local_storage")
  }
};

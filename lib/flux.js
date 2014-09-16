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
  Emitter: require("./Emitter"),
  backends: {
    local: require("./backends/local_storage")
  }
};

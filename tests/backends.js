var flux = require("../lib/flux"), 
  utils = require("../lib/utils"),
  FieldTypes = flux.FieldTypes, 
  localStore = flux.backends.local,
  local,
  M = flux.createModel({
    modelName: "model",
    backend: localStore,
    fieldTypes: {
      field: FieldTypes.string
    }
  });

local = {
  reload: function(test) {
    var m = new M({field: "asdf"});
    m.save();
    m.field = "qwer";
    m.load();
    test.strictEqual(m.field, "asdf");
    test.done();
  },
  load: function (test) {
    var m2, m1 = new M({field: "asdf"});
    m1.save();
    m1.field = "qwer";
    m2 = M.load(m1.id);
    test.strictEqual(m2.field, "asdf");
    test.done();
  }
};

module.exports = {
  local: local,
};
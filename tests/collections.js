"use strict()";

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes,
  Model, model, SubModel;

SubModel = flux.createModel({
  modelName: "sub",
  fieldTypes: {
    field: FieldTypes.string,
    field2: FieldTypes.string
  }
});

Model = flux.createCollection({
  modelName: "subs",
  model: SubModel
});

module.exports = {
  creation: function(test) {
    model = new Model();
    model.add(new SubModel({field: "asdf"}));
    model.on(function() {
      test.done();
    });
    model.get(0).field = "qwe";
    test.expect(1);
  },
  valueOf: function (test) {
    var submodel = new SubModel({field: "asdf"});
    model = new Model([submodel]);
    test.deepEqual(model.valueOf(), [{ field: 'asdf', field2: '', id: 1 }]);
    test.done();
  },
  ids_set: function (test) {
    var submodel = new SubModel({field: "asdf"});
    model = new Model([submodel]);
    model.set([submodel, new SubModel({id: submodel.id})]);
    test.equal(model.length, 1);
    test.done();
  },
  ids_add: function (test) {
    var submodel = new SubModel({field: "asdf"});
    model = new Model([submodel]);
    model.add(new SubModel({id: submodel.id}));
    test.equal(model.length, 1);
    test.done();
  },
  add_raw: function (test) {
    var submodel = new SubModel({field: "asdf"});
    model = new Model();
    model.add(new SubModel({id: submodel.id}).valueOf());
    test.equal(model.length, 1);
    test.done();
  },
  // dataCollectionSubFields: function(test) {
  //   var model, Model, SubModel, SubModels;

  //   SubModel = flux.createModel({
  //     modelName: "sub",
  //     fieldTypes: {
  //       field: FieldTypes.string
  //     }
  //   });
  //   SubModels = flux.createCollection({
  //     modelName: "subs",
  //     model: SubModel
  //   });
  //   Model = flux.createModel({
  //     modelName: "top",
  //     fieldTypes: {
  //       submodels: SubModels 
  //     }
  //   });
  //   model = new Model();
  //   model.submodels = new SubModels();
  //   model.submodels.add(new SubModel({field: "asdf"}));
  //   model.on(function(name) {
  //     test.equals("submodels.field", name);
  //     test.done();
  //   });
  //   model.submodels.get(0).field = "a";
  // },
};
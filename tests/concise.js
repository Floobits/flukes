"use strict"

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes;

var tests = {
  // test_createModel: function(test) {
  //   test.throws(function() {
  //     flux.createModel({});
  //   }, Error, "Empty models are not allowed");
  //   test.done();
  // },
  // test_conciseModelCreation: function(test) {
  //   var Model = flux.createModel({
  //     submodel: {
  //       field: FieldTypes.string
  //     }
  //   });
  //   test.ok(new Model.submodel() instanceof Model.submodel);
  //   test.done();
  // },
  test_conciseCollectionCreation: function(test) {
    var Model = flux.createModel({
      submodel: [{
        field: FieldTypes.string
      }]
    });
    test.ok(new Model.submodel() instanceof Model.submodel);
    test.done();
  },
  test_conciseModelInstantiation: function (test) {
    var model, Model, SubModel, SubModels,
      testField = "asdf";

    SubModel = flux.createModel({
      fieldTypes: {
        field: FieldTypes.string
      }
    });
    SubModels = flux.createCollection({
      modelName: "SubModels",
      model: SubModel
    });
    Model = flux.createModel({
      fieldTypes: {
        submodels: SubModels 
      }
    });
    model = new Model({
      submodels: [
        {field: testField},
        {field: "qwer"}
      ]
    });
    test.equals(model.submodels.get(0).field, testField);
    test.done();
  },
  test_conciseListInstantiation2: function (test) {
    var model, Model, SubModel, SubModels,
      testField = [1,2,3];

    Model = flux.createModel({
      fieldTypes: {
        list: FieldTypes.List
      }
    });
    model = new Model({
      list: testField
    });
    test.deepEqual(model.list.valueOf(), testField);
    test.done();
  }
}

module.exports = tests;
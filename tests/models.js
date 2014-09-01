"use strict"

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes;

var tests = {
  test_createModel: function(test) {
    test.throws(function() {
      flux.createModel({});
    }, Error, "Empty models are not allowed");
    test.done();
  },
  test_cleanModelCreation: function(test) {
    var Model = flux.createModel({
      submodel: {
        field: FieldTypes.string
      }
    });
    test.ok(new Model.submodel() instanceof Model.submodel);
    test.done();
  },
  test_cleanCollectionCreation: function(test) {
    var Model = flux.createModel({
      submodel: [{
        field: FieldTypes.string
      }]
    });
    test.ok(new Model.submodel() instanceof Model.submodel);
    test.done();
  },
  test_cleanModelInstantiation: function (test) {
    var Model, SubModel, SubModels;
    Model = flux.createModel({
      fieldTypes: {
        submodels: SubModels 
      }
    });
    SubModel = flux.createModel({
      fieldTypes: {
        field: FieldTypes.string
      }
    });
    SubModels = flux.createCollection({
      modelName: "SubModels",
      model: SubModel
    });
    test.ok(new Model({submodels: [{field: "asdf"}, {field: "qwer"}]}));
    test.done();
  }
}

module.exports = tests;
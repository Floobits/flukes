"use strict";

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes,
  creation, instantiation, events;

module.exports = {
  fields1: function(test) {
    var model, Model = flux.createModel({
      fieldTypes: {
        field: FieldTypes.string,
      }
    });
    model = new Model();
    model.on("field", function() {
      test.done();
    });
    model.field = "asdf";
  },
  fields2: function(test) {
    var model, Model = flux.createModel({
      fieldTypes: {
        field: FieldTypes.string,
      }
    });
    model = new Model();
    model.on(function(field) {
      test.equals(field, "field");
      test.done();
    });
    model.field = "asdf";
  },
  requiredFields: function (test) {
    var model, Model = flux.createModel({
      fieldTypes: {
        field: FieldTypes.string.required(true)
      }
    });
    test.throws(function() {
      model = new Model();
    }, Error, "Required field");
    new Model({field: "asdf"});
    test.done();
  },
  subFields: function(test) {
    var model, Model, SubModel = flux.createModel({
      fieldTypes: {
        subField: FieldTypes.string
      }
    });
    Model = flux.createModel({
      fieldTypes: {
        field: SubModel,
      }
    });
    model = new Model({field: new SubModel()});
    model.on(function(field) {
      test.equals(field, "field.subField");
      test.done();
    });
    model.field.subField = "asdf";
  },
  creation: function (test) {
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
  inPlaceUpdate: function (test) {
    var model, Model, SubModel, id;
    SubModel = flux.createModel({
      fieldTypes: {
        field: FieldTypes.string
      }
    });
    Model = flux.createModel({
      fieldTypes: {
        submodel: SubModel
      }
    });
    model = new Model({submodel: new SubModel({field: "asdf"})});
    id = model.submodel.id;
    model.set({submodel: {field: "qwer"}});
    test.equals(model.submodel.id, id);
    test.done();
  },
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
  // subField: function(test) {
  //   var Model = flux.createModel({
  //     submodel: [{
  //       field: FieldTypes.string
  //     }]
  //   });
  //   test.ok(new Model.submodel() instanceof Model.submodel);
  //   test.done();
  // },
};

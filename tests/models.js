"use strict";

var flux = require("../lib/flux"),
  utils = require("../lib/utils"),
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
        subField: FieldTypes.string,
        subField2: FieldTypes.string
      }
    });
    Model = flux.createModel({
      fieldTypes: {
        field: SubModel,
      }
    });
    model = new Model({field: new SubModel()});
    model.on(function(field) {
      test.equals(field, "field");
    });
    model.field.subField = "asdf";
    model.off();
    model.field.on(function(fields) {
      test.deepEqual(fields, ["subField", "subField2"]);
    });
    model.field.set({subField: "a", subField2: "b"});
    test.done();
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
  valueOf: function (test) {
    var model, Model;
    Model = flux.createModel({
      fieldTypes: {
        field1: FieldTypes.string,
        field2: FieldTypes.string.ephemeral(),
        id: FieldTypes.number.ephemeral(),
      }
    });
    test.deepEqual(new Model({field1: "1", field2: "2"}).valueOf(), {field1: "1"});
    test.done();
  },
  dontSetThingsNotInSchema: function (test) {
    var model, Model;
    Model = flux.createModel({
      fieldTypes: {
        field1: FieldTypes.string,
      }
    });
    model = new Model();
    model.set({field1: "2", bad: 3});
    test.ok(utils.isUndefined(model.bad));
    test.deepEqual(model.valueOf(), {field1: "2", id: model.id});
    test.done();
  }
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

"use strict()";

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes,
  creation, instantiation, events;

events = {
  dataModelFields1: function(test) {
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
  dataModelFields2: function(test) {
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
  dataModelSubFields: function(test) {
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
  dataCollection: function(test) {
    var model, Model, SubModel;

    SubModel = flux.createModel({
      modelName: "sub",
      fieldTypes: {
        field: FieldTypes.string
      }
    });
    Model = flux.createCollection({
      modelName: "subs",
      model: SubModel
    });
    model = new Model();
    model.add(new SubModel({field: "asdf"}));
    model.on(function() {
      test.done();
    });
    model.get(0).field = "qwe";
    test.expect(1);
  },
  list: function (test) {

    test.expect(1);
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

creation = {
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

instantiation = {
  Model: function (test) {
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
  List: function (test) {
    var model, Model, SubModel, SubModels,
      testField = [1,2,3];

    Model = flux.createModel({
      fieldTypes: {
        list: FieldTypes.list
      }
    });
    model = new Model({
      list: testField
    });
    test.deepEqual(model.list.valueOf(), testField);
    test.done();
  }
};

module.exports = {
  creation: creation,
  instantiation: instantiation,
  events: events
};
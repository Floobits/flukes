"use strict"

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes,
  _ = require("lodash"),
  properties, events;

properties = {
  setUp: function(cb) {
    this.randomField = "afai3ji32";
    this.Actions = flux.createActions({
      sum: function(a, b) {
        return a + b;
      },
      field: this.randomField,
    });
    this.actions = new this.Actions();
    return cb();
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
  emitters: function(test) {
    test.ok(_.isFunction(this.actions.sum));
    test.done();
  },
  constants: function(test) {
    test.equals(this.actions.FIELD, "FIELD");
    test.equals(this.actions.SUM, "SUM");
    test.done();
  },
  randomProperties: function(test) {
    test.equals(this.actions.field, this.randomField);
    test.ok(!_.isFunction(this.actions.field), "why is this field a function?");
    test.done();
  }
};

// events = {
//   Model: function (test) {
//     var model, Model, SubModel, SubModels,
//       testField = "asdf";

//     SubModel = flux.createModel({
//       fieldTypes: {
//         field: FieldTypes.string
//       }
//     });
//     SubModels = flux.createCollection({
//       modelName: "SubModels",
//       model: SubModel
//     });
//     Model = flux.createModel({
//       fieldTypes: {
//         submodels: SubModels 
//       }
//     });
//     model = new Model({
//       submodels: [
//         {field: testField},
//         {field: "qwer"}
//       ]
//     });
//     test.equals(model.submodels.get(0).field, testField);
//     test.done();
//   },
//   List: function (test) {
//     var model, Model, SubModel, SubModels,
//       testField = [1,2,3];

//     Model = flux.createModel({
//       fieldTypes: {
//         list: FieldTypes.List
//       }
//     });
//     model = new Model({
//       list: testField
//     });
//     test.deepEqual(model.list.valueOf(), testField);
//     test.done();
//   }
// }

module.exports = {
  properties: properties
};
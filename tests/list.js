"use strict";

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes,
  creation, instantiation, events;

module.exports = {
  events: function (test) {
    var Model, model, testField = [1];

    Model = flux.createModel({
      fieldTypes: {
        list: FieldTypes.list
      }
    });
    model = new Model({
      list: testField
    });
    model.on(function () {
      test.deepEqual(model.list.valueOf(), [1, 1]);
      test.done();
    });
    model.list.push(1);
    test.expect(1);
  },
  creation: function (test) {
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

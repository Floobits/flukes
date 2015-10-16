"use strict";

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes,
  creation, instantiation, events;

/**
 * @param {Array}
 */
function setupModel(testField) {
  var Model, model;
  Model = flux.createModel({
    fieldTypes: {
      list: FieldTypes.list
    }
  });
  model = new Model({
    list: testField
  });
  return model;
}

module.exports = {
  events: function (test) {
    var model;

    model = setupModel([1]);
    model.on(function () {
      test.deepEqual(model.list.valueOf(), [1, 1]);
      test.done();
    });
    model.list.push(1);
    test.expect(1);
  },
  creation: function (test) {
    var model, SubModel, SubModels, testField = [1, 2, 3];

    model = setupModel(testField);
    test.deepEqual(model.list.valueOf(), testField);
    test.done();
  },
  toggleAdds: function (test) {
    var model, testField = [1, 2, 3], resultField = [1, 2, 3, 4];
    model = setupModel(testField);
    test.ok(model.list.toggle(4), "Should return true because 4 was added.");
    test.deepEqual(model.list.valueOf(), resultField, "Should have added 4.");
    test.expect(2);
    test.done();
  },
  toggleAddsEvent: function (test) {
    var model, testField = [1, 2, 3], resultField = [1, 2, 3, 4];
    model = setupModel(testField);
    model.on(function () {
      test.deepEqual(model.list.valueOf(), resultField, "Should have added 4.");
      test.done();
    });
    test.expect(1);
    model.list.toggle(4);
  },
  toggleRemoves: function (test) {
    var model, testField = [1, 2, 3, 4, 4], resultField = [1, 2, 3];
    model = setupModel(testField);
    test.ok(!model.list.toggle(4), "Should return false because 4's were removed.");
    test.deepEqual(model.list.valueOf(), resultField, "Should have removed 4's.");
    test.expect(2);
    test.done();
  },
  defaults: function (test) {
    var model, Model = flux.createModel({
      fieldTypes: {
        list: FieldTypes.list,
      },
      getDefaultFields: function () {
        return {};
      }
    });
    model = new Model();

    model.list.push(1);
    test.done();
  }
};

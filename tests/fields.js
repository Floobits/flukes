"use strict";

var flux = require("../lib/flux"), 
  _ = require("lodash"),
  util = require("util"),
  utils = require("../lib/utils"),
  FieldTypes = flux.FieldTypes, fields;

function validate(f, test, tValues, fValues, name) {
  _.each(tValues, function(tValue) {
    test.strictEqual(true, f.validate(tValue), util.format("%s: %s should validate. ",  name, tValue));
  });
  _.each(fValues, function(fValue) {
    test.strictEqual(false, f.validate(fValue), util.format("%s: %s should not validate. ",  name, fValue));
  });
  test.done();
}

fields = {
  BooleanField: function(test) {
    validate(FieldTypes.BooleanField, test, [false], [""], "BooleanField");
  },
  NumberField: function(test) {
    validate(FieldTypes.NumberField, test, [0], [""], "NumberField");
  },
  StringField: function(test) {
    validate(FieldTypes.StringField, test, ["true"], [false], "StringField");
  },
  FunctionField: function(test) {
    validate(FieldTypes.FunctionField, test, [validate], [false], "FunctionField");
  },
  ObjectField: function(test) {
    validate(FieldTypes.ObjectField, test, [{}], [false, 0, ""], "ObjectField");
  },
  ArrayField: function(test) {
    validate(FieldTypes.ArrayField, test, [[]], [{}, 0, false, NaN], "ArrayField");
  },
  OneOfField: function(test) {
    validate(FieldTypes.OneOfField(["asdf", 0, fields]), test, ["asdf", 0, fields], [1, false, {}, []], "OneOfField");
  },
  InstanceOfField: function(test) {
    var H, F = function () {};
    H = function () { F.call(this);};
    utils.inherit(H, F);
    validate(FieldTypes.InstanceOfField(F), test, [new F(), new H()], [validate], "InstanceOfField");
  },
  OneOfTypeField: function(test) {
    validate(FieldTypes.OneOfTypeField([FieldTypes.BooleanField, FieldTypes.StringField]), test, [true, "asdf"], [0, {}, []], "OneOfTypeField");
  },
  ArrayOfField: function(test) {
    validate(FieldTypes.ArrayOfField(FieldTypes.BooleanField), test, [[true, true, false]], [true, [1,2,3]], "ArrayOfField");
  },
  ObjectOfField: function(test) {
    validate(FieldTypes.ObjectOfField(FieldTypes.NumberField), test, [{a: 2}, {b: Infinity}, [], function(){}, /asdf/], [{a: false}], "ObjectOfField");
  },
};

module.exports = {
  fields: fields
};
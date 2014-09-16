"use strict()";

var flux = require("../lib/flux"), 
  util = require("util"),
  utils = require("../lib/utils"),
  FieldTypes = flux.FieldTypes, 
  chainability, fields;

function validate(f, test, tValues, fValues, name) {
  utils.each(tValues, function(tValue) {
    test.strictEqual(true, f.validate(tValue), util.format("%s: %s should validate. ",  name, tValue));
  });
  utils.each(fValues, function(fValue) {
    test.strictEqual(false, f.validate(fValue), util.format("%s: %s should not validate. ",  name, fValue));
  });
  test.done();
}

fields = {
  bool: function(test) {
    validate(FieldTypes.bool, test, [false], [""], "bool");
  },
  number: function(test) {
    validate(FieldTypes.number, test, [0], [""], "number");
  },
  string: function(test) {
    validate(FieldTypes.string, test, ["true"], [false], "string");
  },
  func: function(test) {
    validate(FieldTypes.func, test, [validate], [false], "func");
  },
  object: function(test) {
    validate(FieldTypes.object, test, [{}], [false, 0, ""], "object");
  },
  array: function(test) {
    validate(FieldTypes.array, test, [[]], [{}, 0, false, NaN], "array");
  },
  oneOf: function(test) {
    validate(FieldTypes.oneOf(["asdf", 0, fields]), test, ["asdf", 0, fields], [1, false, {}, []], "oneOf");
  },
  instanceOf: function(test) {
    var H, F = function () {};
    H = function () { F.call(this);};
    utils.inherit(H, F);
    validate(FieldTypes.instanceOf(F), test, [new F(), new H()], [validate], "instanceOf");
  },
  oneOfType: function(test) {
    validate(FieldTypes.oneOfType([FieldTypes.bool, FieldTypes.string]), test, [true, "asdf"], [0, {}, []], "oneOfType");
  },
  arrayOf: function(test) {
    validate(FieldTypes.arrayOf(FieldTypes.bool), test, [[true, true, false]], [true, [1,2,3]], "arrayOf");
  },
  objectOf: function(test) {
    validate(FieldTypes.objectOf(FieldTypes.number), test, [{a: 2}, {b: Infinity}, [], function(){}, /asdf/], [{a: false}], "objectOf");
  },
};

chainability = {
  primitive: function (test) {
    var g, f = FieldTypes.bool;
    g = f.persists(true).defaults(true).required(true);
    test.strictEqual(g.persists_, true);
    test.strictEqual(g.required_, true);
    test.strictEqual(g.defaults_, true);
    test.strictEqual(f.defaults_, false);
    test.strictEqual(f.required_, false);
    test.strictEqual(f.persists_, true);
    test.done();
  },
  complex: function (test) {
    var f = FieldTypes.arrayOf(FieldTypes.bool)
      .persists(false)
      .defaults([false])
      .required(true);
    test.strictEqual(f.persists_, false);
    test.strictEqual(JSON.stringify(f.defaults_), JSON.stringify([false]));
    test.strictEqual(f.required_, true);
    test.done();
  },
};
module.exports = {
  fields: fields,
  chainability: chainability
};
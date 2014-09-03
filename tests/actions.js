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
  this: function(test) {
    var self = this;
    this.actions.on(function(name, sum) {
      test.deepEqual(this, self)
      test.done();
    }, this);
    this.actions.sum(1, 2);
  },
  binding: function(test) {
    var self = this;
    this.actions.on(function(name, sum) {
      if (name == self.actions.SUM) {
        test.equals(sum, 3)
        test.done();
      }
    })
    this.actions.sum(1, 2);
  },
  explicitBinding: function(test) {
    this.actions.on(this.actions.SUM, function(sum) {
      test.equals(sum, 3);
      test.done();
    }, this);
    this.actions.sum(1, 2);
  },
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
  },
  badEvent: function(test) {
    test.throws(function(){
      this.actions.on('aASDFASDF', function(){})
    });
    test.done();
  }
};
module.exports = {
  properties: properties
};
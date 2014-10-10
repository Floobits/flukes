"use strict";

var flux = require("../lib/flux"),
  utils = require("../lib/utils"),
  FieldTypes = flux.FieldTypes,
  properties, events;

module.exports = {
  setUp: function(cb) {
    this.randomField = "afai3ji32";
    this.Actions = flux.createActions({
      sum: function(a, b) {
        return a + b;
      },
      async_sum: function(a, b) {
        return a + b;
      },
      field: this.randomField,
    });
    this.actions = new this.Actions();
    return cb();
  },
  bindThis: function(test) {
    var self = this;
    this.actions.on(function(name, sum) {
      test.deepEqual(this, self);
      test.done();
    }, this);
    this.actions.sum(1, 2);
  },
  binding: function(test) {
    var self = this;
    this.actions.on(function(name, sum) {
      if (name == self.actions.SUM) {
        test.equals(sum, 3);
        test.done();
      }
    });
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
    test.ok(utils.isFunction(this.actions.sum));
    test.done();
  },
  constants: function(test) {
    test.equals(this.actions.FIELD, "FIELD");
    test.equals(this.actions.SUM, "SUM");
    test.done();
  },
  randomProperties: function(test) {
    test.equals(this.actions.field, this.randomField);
    test.ok(!utils.isFunction(this.actions.field), "why is this field a function?");
    test.done();
  },
  badEvent: function(test) {
    test.throws(function() {
      this.actions.on('aASDFASDF', function(){});
    });
    test.done();
  },
  automaticThis: function(test) {
    test.done();
  },
  doubleOn: function(test) {
    var actions, Actions = flux.createActions({
      sum: function(a, b) {
        return a + b;
      }
    });
    actions = new Actions();
    actions.on(actions.SUM, function(value) {
      test.equals(value, 3);
    });
    actions.on(actions.SUM, function(value) {
      test.equals(value, 3);
    });
    test.expect(2);
    actions.sum(1, 2);
    test.done();
  },
  awaitActions: function(test) {
    this.actions.on(this.actions.ASYNC_SUM, function(sum, cb) {
      test.equals(sum, 3);
      cb();
    });
    this.actions.on(this.actions.ASYNC_SUM, function(sum, cb) {
      test.equals(sum, 3);
      cb();
    });
    this.actions.async_sum(1, 2, function(val) {
      test.done();
    });
    test.expect(2);
  },
  asyncActionsThis: function(test) {
    this.asdfasdasdf = 2;
    this.actions.on(this.actions.ASYNC_SUM, function(sum, cb) {
      test.equals(sum, 3);
      setTimeout(cb, 1);
    });
    this.actions.on(this.actions.ASYNC_SUM, function(sum, cb) {
      test.equals(sum, 3);
      cb();
    });
    this.actions.async_sum(1, 2, function(val) {
      test.equals(this.asdfasdasdf, 2);
      test.done();
    }, this);
    test.expect(3);
  },
  staticChecking: function(test) {
    this.actions.onSUM(function(sum) {
      test.equals(sum, 3);
    });
    this.actions.sum(1, 2);
    test.expect(1);
    test.done();
  },
  init: function (test) {
    var action, Action = flux.createActions({
      init: function (a, b) {
        test.equals(a, 1);
        test.equals(b, 2);
      }
    });
    test.expect(2);
    action = new Action(1, 2);
    test.done();
  },
  tearDown: function(cb) {
    return cb();
  }
};

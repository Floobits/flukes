"use strict";

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes;

module.exports = {
  partialBinding: function(test) {
    var emitter = new flux.Emitter();
    emitter.on("a", function(value) {
      test.equals(value, 1);
      test.done();
    });
    test.expect(1);
    emitter.emit("a", 1);
  },
  bindAll: function(test) {
    var emitter = new flux.Emitter();

    emitter.on(function(name, value) {
      test.equals(name, "a");
      test.equals(value, 1);
      test.done();
    });
    test.expect(2);
    emitter.emit("a", 1);
  },
  unbindEvent: function(test) {
    var emitter = new flux.Emitter(), id;
    id = emitter.on("a", function(value) {
      throw new Error("I should not be reached");
    });
    emitter.off("a");
    emitter.emit("a");
    test.expect(0);
    test.done();
  },
  unbindId: function(test) {
    var emitter = new flux.Emitter(), id;

    id = emitter.on("a", function(value) {
      throw new Error("I should not be reached");
    });

    emitter.on("a", function(value) {
      test.equals(value, 1);
      test.done();
    });
    emitter.off(id);
    test.expect(1);
    emitter.emit("a", 1);
  },
  unbindAll: function(test) {
    var emitter = new flux.Emitter();

    emitter.on(function() {
      throw new Error("I should not be reached");
    });
    emitter.on("a", function() {
      throw new Error("I should not be reached");
    });
    emitter.off();
    emitter.emit("a");
    test.expect(0);
    test.done();
  }
};

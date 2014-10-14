"use strict";

var flux = require("../lib/flux"),
  FieldTypes = flux.FieldTypes,
  Collection, model, Model;

Model = flux.createModel({
  modelName: "sub",
  fieldTypes: {
    field: FieldTypes.string,
    field2: FieldTypes.string
  }
});

Collection = flux.createCollection({
  modelName: "subs",
  model: Model,
  sort: function (a, b) {
    var aLen = a.field.length, bLen = b.field.length;
    if (aLen < bLen) {
      return -1;
    }
    if (aLen === bLen) {
      return 0;
    }
    return 1;
  }
});

module.exports = {
  creation: function(test) {
    model = new Collection();
    model.add(new Model({field: "asdf"}));
    model.on(function() {
      test.done();
    });
    model.get(0).field = "qwe";
    test.expect(1);
  },
  valueOf: function (test) {
    var submodel = new Model({field: "asdf"});
    model = new Collection([submodel]);
    test.deepEqual(model.valueOf(), [{ field: 'asdf', field2: '', id: 1 }]);
    test.done();
  },
  ids_set: function (test) {
    var submodel = new Model({field: "asdf"});
    model = new Collection([submodel]);
    model.set([submodel, new Model({id: submodel.id})]);
    test.equal(model.length, 1);
    test.done();
  },
  ids_add: function (test) {
    var submodel = new Model({field: "asdf"});
    model = new Collection([submodel]);
    model.add(new Model({id: submodel.id}));
    test.equal(model.length, 1);
    test.done();
  },
  ids_add_index: function (test) {
    model = new Collection();
    model.add(new Model({id: 0}));
    model.insert(new Model({id: 1}), 0);
    model.insert(new Model({id: 2}), 1);
    test.equal(model.length, 3);
    test.equal(model.byIndex(0).id, 1);
    test.equal(model.byIndex(1).id, 2);
    test.done();
  },
  add_raw: function (test) {
    var submodel = new Model({field: "asdf"});
    model = new Collection();
    model.add(new Model({id: submodel.id}).valueOf());
    test.equal(model.length, 1);
    test.done();
  },
  set_raw: function (test) {
    var submodel, submodelId, submodelValueOf;

    model = new Collection([{field: "0"}, {field: "1"}]);
    test.equal(model.length, 2);
    submodelId = model.valueOf()[0].id;
    submodel = model.get(submodelId);
    submodelValueOf = submodel.valueOf();
    submodelValueOf.field = "0a";
    submodel.on(function () {
      test.equal(model.get(submodelId).field, "0a");
    });
    model.on(function() {
      test.equal(model.length, 1);
      test.equal(submodel.field, submodelValueOf.field);      
      test.done();
    });
    model.set([submodelValueOf]);
    test.expect(3);
  },
  splicing: function (test) {
    var removed;
    model = new Collection([{field: "1"}, {field: "2"}, {field: "3"}, {field: "4"}]);
    removed = model.splice(2);
    test.equals(removed.length, 2);
    test.equals(removed[0].field, "3");
    test.equals(removed[1].field, "4");
    test.equals(model.length, 2);

    model.splice(0, 0, {field: "5"});
    test.equals(model.byIndex(0).field, "5");
    test.equals(model.byIndex(1).field, "1");
    test.equals(model.byIndex(2).field, "2");
    test.equals(model.byIndex(-1).field, "2");
    test.equals(model.byIndex(-2).field, "1");
    test.equals(model.length, 3);

    removed = model.splice(-1);
    test.equals(removed[0].field, "2");
    test.equals(model.byIndex(0).field, "5");
    test.equals(model.byIndex(1).field, "1");
    test.equals(model.byIndex(-1).field, "1");
    test.equals(model.length, 2);

    test.done();
  },
  sorting: function (test) {
    var startingLen = 0;
    model = new Collection([{field: "1"}, {field: "1234"}, {field: "12"}, {field: "123"}]);
    model.sort();
    model.map(function (m) {
      test.equals(m.field.length, ++startingLen);
    });
    test.done();
  },
  incompleteLoad: function (test) {
    var collection, Collection, Model = flux.createModel({
      fieldTypes: {
        f: FieldTypes.number.required(),
      }
    });

    Collection = flux.createCollection({
      modelName: "subs",
      model: Model,
    });

    collection = new Collection();
    test.equals(collection.set([{f: 1}, {}]), 1);
    test.done();
  },
  strictMode: function (test) {
    var collection, Collection, Model = flux.createModel({
      fieldTypes: {
        f: FieldTypes.number.required(),
      }
    });

    Collection = flux.createCollection({
      modelName: "subs",
      model: Model,
      strict: true,
    });

    collection = new Collection();
    test.throws(function() {
      collection.set([{f: 1}, {}]);
    });
    test.done();
  },
  // dataCollectionSubFields: function(test) {
  //   var model, Collection, Model, SubModels;

  //   Model = flux.createModel({
  //     modelName: "sub",
  //     fieldTypes: {
  //       field: FieldTypes.string
  //     }
  //   });
  //   SubModels = flux.createCollection({
  //     modelName: "subs",
  //     model: Model
  //   });
  //   Collection = flux.createModel({
  //     modelName: "top",
  //     fieldTypes: {
  //       submodels: SubModels 
  //     }
  //   });
  //   model = new Collection();
  //   model.submodels = new SubModels();
  //   model.submodels.add(new Model({field: "asdf"}));
  //   model.on(function(name) {
  //     test.equals("submodels.field", name);
  //     test.done();
  //   });
  //   model.submodels.get(0).field = "a";
  // },
};
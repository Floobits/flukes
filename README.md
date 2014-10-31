#flux

[![Build Status](https://travis-ci.org/Floobits/flukes.svg)](https://travis-ci.org/Floobits/flukes)

[![NPM version](https://badge.fury.io/js/flukes.svg)](http://badge.fury.io/js/flukes)

Floobit's Flux is an implementation of Facebook's [Flux](http://facebook.github.io/react/docs/flux-overview.html) architecture for React.  Flux is minimal, modern, and designed for boilerplate-free reactive programing. If React is the V in MVC, Flux is the M.

##Design Goals
Flux choices ease of use and development over legacy suport.  Because of the liberal use of  [getters and setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#Defining_getters_and_setters), it is not supported by ie9 or earlier.

##Components:
- [Events](#Events) - Binding and Unbinding
- [Actions](#Actions) - Signaling Changes in State
- [Models](#Models) - Canonical State
- [AutoBinder](#AutoBinder) - Binding to React Components
- [BestPractices](#BestPractices)

### <a name="Events"></a>Events
Event binding breaks from the NodeJS convention by returning a unique ID (number).  


```javascript
var events = SomeEventEmitter();
// binds to all events
var id = events.on(function () {});
// binds to SomeEvent
var onSomeEventId = events.on('SomeEvent', function () {});
// unbind onSomeEventId handler
events.off(onSomeEventId);
// unbind all 'SomeEvent' handlers
events.off('SomeEvent');
// unbind all handlers
events.off();
```

### <a name="Actions"></a>Actions
A Flux Action is a public, (typically singleton) event emitter with a well defined interface.

```javascript
var actions, Actions = flux.createActions({
  sum: function(a, b) {
    return a + b;
  }
});
actions = new Actions();

console.log(actions.SUM);
// 'SUM'
console.log(actions.sum);
// [Function]
```
***flux.createActions*** returns a *constructor*- you must call *new* to make the *Actions* object.  *actions* has a *SUM* field ("SUM") and a *sum* function (emitter).

```javascript
actions.on(function(name, data) {
  console.log(name, data);
});

//'static' checking
actions.onSUM(function (data) {
  console.log("onSum", data);
});

console.log(actions.sum(1, 2));
// SUM 3
// onSum 3

//don't do this!
actions.on(actions.SUM, function (data) {});
```

Actions also support the special property, ***init***, which is called after instantiation.  Fields that aren't functions are set on Action's prototype.
```javascript
var actions, Actions = flux.createActions({
  sum: function(b) {
    return this.a + this.someVariable + b;
  },
  init: function (a) {
    this.a = a;
  },
  someVariable: 2,
});

actions = new Actions(1);
actions.sum(3);
```

The values returned by actions are __applied__ to the bound handlers.  If you want to return an array, it must be wrapped in another array:
```javascript
var actions, Actions = flux.createActions({
  f: function (x) {
    return [1, 2, 3];
  },
  g: function () {
    // returns an array
    return [[1, 2, 3]];
  }
});

actions = new Actions();
actions.onF(function (a, b, c) {
  console.log(a, b, c);
});
actions.f();
// 1 2 3
actions.g();
// [1, 2, 3] undefined undefined
```

Actions may ***return*** an Error object to cancel the dispatch.  The error will be returned from the action call.
```javascript
var actions, Actions = flux.createActions({
  f: function () {
    return new Error("oh shit");
  }
});
actions = new Actions();
// never called
actions.onF(console.log);
var err = actions.f();
```

A final note, emitting is synchronous by design.

#### <a name="AsyncActions"></a>AsyncActions (Experimental)

Some actions have handlers that are asynchronous.  It is often necessary to take some further action after all the dispatchers have completed.  Asynchronous actions solve this problem.

```javascript
var actions = new (flux.createActions({
  async_sum: function(a, b) {
    return a + b;
  }
}));
actions.on(actions.ASYNC_SUM, function(sum, cb) {
  setTimeout(cb, 1);
});
actions.on(actions.ASYNC_SUM, function(sum, cb) {
  cb();
});
actions.async_sum(1, 2, function(sum) {
  console.log(sum);
});
```
***NOTE:*** Async actions are prefixed with *async*.  

The callback to *actions.async_sum* will not be called until both listeners have fired their callback.

###<a name="Models"></a>Models (Stores)

Flux Models are the canonical source of truth within an application and provide a well defined (reactive) interface for mutating state.

React elements can bind to models via the [AutoBinder Mixin](#AutoBinder); the element will be rerendered automagically when the model changes.  Models may contain references to other models.  In this case, change events proprogate up the chain. You should only bind the root level model to an Element.  

Models come in three flavors:
- [DataModel](#DataModel) - a heterogenous container (sometimes called a Model)
- [Collection](#Collection) - a homogenous, ordered set of a DataModel
- [List](#List) - a heterogenous list whose children are not bound

####<a name="DataModel"></a>DataModel
DataModels are the workhorse of Flux.  They are loosely modeled after React Elements and may contain references to other Models, Lists, or Collections.

```javascript
var flux = require("flux"),
  fieldTypes = flux.FieldTypes,
  Model, model;
  
Model = flux.createModel({
  modelName: "ModelModelModel",
  fieldTypes: {
    someField: fieldTypes.string,
  }
});

model = new Model({someField: "asdf"});
```
The attribute modelName is used for logging and is not required. FieldTypes are Flux's analog to propTypes and are required.  The fields are reactive; when a value changes, the model emits an update event.  Models must have an __id__ field. If it is not supplied, a number field will be added automatically to the model- id fields may be any (hashable) type.

__createModel__ creates setters for each field in __fieldTypes__.  When the value for a field changes, the model will emit:
```javascript
// emits
model.someField = "asdf";
```

Models have other special fields:

```javascript
Model = flux.createModel({
  // will save an instance to local storage on model.save()
  backend: flux.backends.local,
  // applied with arguments to new Model(...) after fields have been set
  init: function (a, b, c) {
    console.log(a, b, c);
  },
  // called before model emits
  didUpdate: function (field) {
    if (field === "someField") {
      // suppresses emitting events
      return false;
    }
  },
  fieldTypes: {
    someField: fieldTypes.string,
  }
});
```

Model instances have the following methods:
- ***set({}, options)*** - sets the values for fields and calls update afterwards- if {silent: true} is given as an option, the instance will not emit
- ***valueOf()*** - recursively JSON serialization discarding ephemeral fields
- ***save(opt_key, opt_cb)*** - saves the instance if a backend is specified


####<a name="Collection"></a>Collection

A collection is a homogenous, ordered set of DataModels. Collections are ordered by the order in which models are added unless a sort function is supplied to createCollection.  When a model is added or when it changes, the Collection emits a change event.

```javascript
Models = flux.createCollection({
  model: Model,
  modelName: "Models",
  sort: function (a, b) {
    return a > b;
  }
});
```

Collection instances have the following methods:
- ***add(model)*** - adds the model to the collection
- ***remove(id)*** - removes the model matching the id
- ***insert(model, index)*** - inserts the model at postion __index__
- ***byIndex(i)*** finds model at index i
- ***get(id)*** returns model with id, __id__
- ***valueOf()*** serialized the entire collection to JSON recursively - ephemeral fields are omitted
- ***sort()*** - sorts the models via the time at which they were added or by the user defined sort function
- ***set([models])*** - adds or overwrites existing models that match the ids of the models
- ***reset()*** empties the collection
- ***map(f, opt_thisArg)*** maps over the collection using the order calling f.call(opt_thisArg, model, id, index)
- ***forEach(f, opt_thisArg)*** loops over the collection using the order
- ***reduce(f, accumulator, opt_thisArg)*** reduces the collection returning the result
- ***find(f, opt_thisArg)*** returns the model the first time __fmodel, index)__ returns true
- ***save(namespace, id)*** serializes this model using valueOf and saves under namespace __namespace__ and id __id__
- ***load(namespace, opt_cb)*** calls backend.load and set() with the data. throws if no backend is specified.  

Properties:
- ***length*** returns the size of the collection
- ***model*** the model

Static Methods:
- ***load(namespace, id, opt_cb)*** will load and return a new collection with key __key__ and id __id__


####<a name="List"></a>List
A thin wrapper around arrays because general getters (Harmony) haven't landed in JS land yet.  Lists have all methods of Arrays.  Lists only emit when members are added or removed.


#### <a name="AutoBinder"></a>AutoBinder Mixin (Binding to React Components)
The AutoBinder Mixin is glue for binding Models to  Components.  When the Model's state changes, the mixin calls forceupdate on the Component ensuring it is rerendered.  Consider the following model and component:

```javascript
Model = flux.createModel({
  fieldTypes: {
    field: FieldTypes.string,
  }
});

aModelProp = new Model({field: "b"});
    
View = React.createClass({
  mixins: [flux.createAutoBinder(["aModelProp"])],
  render: function () {...}
});

React.renderComponent(<View aProp={aModelProp} />, document.getElementById("view"));
```
In the typical case, some Model is passed to the View as a prop.  The variable __aModelProp__  is bound after the model is created and any change in the model will call the forceUpdate function on the view.  

Dots can be used if the Model is buried within some descendant of the prop:
```javascript
View = React.createClass({
  mixins: [flux.createAutoBinder(["prop.child.Model"])],
  render: function () {...}
});
```

Models can be passed to the mixin directly:
```javascript
someModel = new Model({field: "b"});
View = React.createClass({
  mixins: [flux.createAutoBinder([], [someModel])],
  render: function () {...}
});
```

#### <a name="BestPractices"></a>BestPractices
###Actions are Singletons
###Avoiding Model Passthrough
Nested React Components tend to generate extreme variable pass-through.  Often, variables (models for presentation) must be handed through several layers of layout controlling components before they are used.  This anti-pattern may be avoided in Flux in the case of model singletons.  Export the singleton so that leaf nodes can require it.  Instead of changing the model directly, alter the state of the model within actions and return the instance from the action.

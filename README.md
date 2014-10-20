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

#### <a name="Events"></a>Events
Event binding breaks from the NodeJS convention by returning a unique ID (number).  


```javascript
var events = SomeEventEmitter();
// binds to all events
var id = events.on(function () {});
// binds to SomeEvent
var onSomeEventId = events.on('SomeEvent', function () {});
// unbind onSomeEventId handler
events.off(id);
// unbind all 'SomeEvent' handlers
events.off('SomeEvent');
// unbind all handlers
events.off();
```

#### <a name="Actions"></a>Actions
A Flux Action is a public, (typically) static event emitter with a well defined interface.  

Evented code often relies on event emitters with callbacks.  In practice, raw emitters are error prone.  Binding to the incorrect event (mispelling the name) results in code that is never called, not an exception.  Objects tend to come and go including both the emitter and handler.  Finally, optionally binding events is often necessary and results in intractable spaghetti code.

####*(Synchronous)* Actions
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

Actions also support the special property, ***init***, which is called after instantiation.

```javascript
var actions, Actions = flux.createActions({
  sum: function(b) {
    return this.a + b;
  },
  init: function (a) {
    this.a = a;
  }
});

actions = new Actions(1);
actions.sum(2);
```

A few notes:

1. Actions return values (which are emitted).

2. The sum function can return an Error object which will cancel the dispatch.

3. The sum function can return multiple arguments as a list.

4. Emitting is synchronous by design.

#### <a name="AsyncActions"></a>AsyncActions

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

####<a name="Models"></a>Models (Stores)

Flux Models are the canonical source of truth within an application and provide a well defined interface for mutating state.

####Motivation
Props and State in React Components are nearly always insufficient for reactive rendering on their own. In practice, state is populated from a database or perhaps localstorage. It travels through some intermediate representation before Components exist meaning State is __not__ the canonical source of truth for the rest of the application.  Components only react to state changes, so props can not be used without boilerplate.  State is likely a subset of the data so it must be serialized and __merged__ before permanent storage. Finally, user interactions which mutate the same state can span __multiple__ Components.

React components can bind to models via the (AutoBinder Mixin)[#AutoBinder]; the component will be rerendered automagically when the model changes.  Models may contain references to other models.  In this case, change events proprogate up the chain. Typically, you should only bind the root level model.  

Models come in three flavors:
- [DataModel](#DataModel) - a heterogenous container (sometimes called a Model)
- [Collection](#Collection) - a homogenous ordered set of a Model
- [List](#List) - a heterogenous list (children are not bound)

####<a name="DataModel"></a>DataModel
DataModels are the workhorse of Flux.  They are modeled after React Components and may contain references to other Models, Lists, or Collections.

####<a name="Collection"></a>Collection

A collection is an ordered set of DataModels. Collections are homogenous.  When a model changes, the Collection emits a change event.

####<a name="List"></a>List
A thin wrapper around arrays because general getters (Harmony) haven't landed in JS land yet.  Lists only update when members are added or removed.

#### <a name="AutoBinder"></a>AutoBinder Mixin (Binding to React Components)
Binds Models state to React Components.  When Model's state changes, it calls forceupdate.  Consider the following model and component:

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

Models can also be bassed to the mixin directly:
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

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
A Flux Action is a public, static event emitter with a well defined interface.  

Evented code typically relies on event emitters with callbacks.  In practice, raw emitters are error prone because objects come and go (including the emitter itself)-  binding and unbinding callbacks, and emitting events often results in intractable spaghetti code.

Actions should be created during startup.

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

console.log(actions.sum(1, 2));
// SUM 3
```

A few notes:

1. Actions return values (which are emitted).

2. The sum function can return an Error object which will cancel the dispatch.

3. The sum function can return multiple arguments as a list.

4. Emitting is synchronous by design and will likely never change.


A shorthand exists to avoid switch statements, but multiple bindings is probably an antipattern:
```javascript
actions.on(actions.SUM, function(name, data) {
  console.log(name, data);
});
```
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

#### <a name="Models"></a>Models (Stores)

Flux Models are the canonical source of truth and provide a well defined interface for mutating state.  

React Components may contain state (and update themselves on state changes), but in practice most React components are stateless apart from their props.  Outside of props as state, only the component (a View) can access or mutate the state.

Models may contain references to other Models; change events proprogate upwards.  Typically, it is only necessary to bind to the root level module to a React Component because React (Javascript) is fast.

####DataModel
A heterogenous data container.

####Collection

A collection is an ordered set of DataModels. Collections are homogenous.  When a model changes, the Collection emits a change event.

####List
A thin wrapper around arrays because general getters (Harmony) haven't landed in JS land yet.

#### <a name="AutoBinder"></a>AutoBinder (Binding to React Components)
Binds Models state to React Components.  When Model's state changes, it calls forceupdate.

#### <a name="BestPractices"></a>BestPractices
###Actions are Singletons
###Avoiding Model Passthrough
Nested React Components tend to generate extreme variable pass-through.  Often, variables (models for presentation) must be handed through several layers of layout controlling components before they are used.  This anti-pattern may be avoided in Flux in the case of model singletons.  Export the singleton so that leaf nodes can require it.  Instead of changing the model directly, alter the state of the model within actions and return the instance from the action.

#flux
====

Floobit's Flux is an implementation of Facebook's Flux architecture for React.  If React is the V in MVC, Flux is the M. Flux attemps to remove all boilerplate from React while providing light wieght models and event emitters. 

##Design Goals
Flux is an attempt at a minimal, modern, front end framework.  To that end, it uses getters/setters and does not currently support ie9 or earlier.

##Components

###Actions
Flux Actions are a public, static event emitter with a well defined interface.  

Evented code typically relies on event emitters with callbacks.  In practice, raw emitters are error prone because objects come and go (including the emitter itself)-  binding and unbinding callbacks, and emitting events often results in intractable spaghetti code.

####*(Synchronous)* Actions
```
> var actions, Actions = flux.createActions({
  sum: function(a, b) {
    return a + b;
  }
});
> actions = new Actions();

> actions.SUM
'SUM'
> actions.sum
[Function]
```
***flux.createActions*** returns a *constructor*- you must call *new* to make the *Actions* object.  *actions* has a *SUM* field ("SUM") and a *sum* function (emitter).

```
> actions.on(function(name, data) {
  console.log(name, data);
});

> actions.sum(1, 2);
SUM 3
```

A few notes:

1. Actions return values (which are emitted).

2. The sum function can return an Error object which will cancel the dispatch.

3. The sum function can return multiple arguments as a list.

4. Emitting is synchronous by design and will likely never change.


A shorthand exists to avoid switch statements, but multiple bindings is probably an antipattern:
```
actions.on(actions.SUM, function(name, data) {
  console.log(name, data);
});
```

#### AsyncActions

Some actions have handlers that are asynchronous.  It is often necessary to take some further action after all the dispatchers have completed.  Asynchronous actions solve this problem.

```
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

###Models (Stores)
Models are the canonical source of truth for data in Flux and provide a well defined interface for updating data.  

React Components may contain state (and update themselves on state changes), but in practice most React components are stateless apart from their props.  Outside of props as state, only the component (a View) can access or mutate the state.

Models may contain references to other Models; change events proprogate upwards.  Typically, it is only necessary to bind to the root level module to a React Component because React (Javascript) is fast.

####DataModel
A heterogenous data container.

####Collection

A collection is an ordered set of DataModels. Collections are homogenous.  When a model changes, the Collection emits a change event.

####List
A thin wrapper around arrays because general getters (Harmony) haven't landed in JS land yet.

###AutoBinder
Binds Models state to React Components.  When Model's state changes, it calls forceupdate.

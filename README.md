#flux
====

Floobit's Flux is an implementation of the flux architecture for React.  If React is the V in MVC, Flux is the M. Flux attempts to remove all boilerplate from React and to aid in the development of reusable components. 

##Design Goals
Flux is an attempt at a minimal, modern, front end framework.  To that end, it uses getters/setters and does not currently support ie9 or earlier.

##Components

###Actions
Evented code typically relies on event emitters with callbacks.  In practice, raw emitters are error prone becauase objects come and go including the emitter itself.  Binding and unbinding callbacks, and emitting is almost always spaghetti code.  Flux Actions are then, a public, static emitter with a well defined interface.  

####Synchronous Actions
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
***flux.createActions*** returns a *constructor*- you must call new to make the Actions object.  actions has both a SUM field which is the string, "SUM", and a function (dispatch).

```
> actions.on(function(name, data) {
  console.log(name, data);
});

> actions.sum(1, 2);
SUM 3
```

A few notes:
1. The sum function can return multiple arguments as a list.  
2. The sum function can return an Error object which will cancel the dispatch.
3. Emitting is synchronous by design and will likely never change.

A shorthand exists to avoid switch statements:
```
actions.on(actions.SUM, function(name, data) {
  console.log(name, data);
});
```


Typical actions are synchronous.  

###Models (Stores)
Canonical source of truth for data.  Most React components end up with no state- it is entirely within props or else no 

####DataModel
####Collection
####List

###AutoBinder
Binds Models state to React Components.  When Model's state changes, it calls forceupdate.
replace backbone with flux

actions:
  action id is a constant
  contain calling context (object that called it)

dispatches:
  all actions (global events/ui events) are emitted from here

stores:
  responsible for canonical state
  listen to actions on dispatch

   ?
    bind to a key in top lvl state?


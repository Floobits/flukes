#flux
====

An implementation of the flux architecture for React.  If React is the V in MVC, Flux is the M.  Flux takes inspiration from Flux, Backbone, and Async.


##Design Goals
Flux is an attempt to make a minimal, modern, front end framework with no boilerplate.  To that end, it uses getters/setters and will nt work in ie9.

##Components

###Actions
Essentially an event emitter with a well defined interface.  Raw emitters tend to work poorly becuase objects come and go, but everything needs a reference to the emitter.  Tracking down binding/unbinding is error prone.  

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
***flux.createActions*** returns a constructor- you must call new to make the Actions object.


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


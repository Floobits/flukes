"use strict";
/* global self */

var _isFinite,
  MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

if (typeof global !== "undefined") {
  _isFinite = global.isFinite;
} else if (typeof window !== "undefined") {
  _isFinite = window.isFinite;
} else if (typeof self !== "undefined") {
  _isFinite = self.isFinite;
} else {
  // TODO
}


function assign_ (object, source) {
  var index = -1, key,
      props = Object.keys(source),
      length = props.length;

  while (++index < length) {
    key = props[index];
    object[key] = source[key];
  }
  return object;
}

function contains (collection, target) {
  var length = collection ? collection.length : 0,
    index = -1;

  if (isFunction(collection.indexOf)) {
    return collection.indexOf(target) >= 0;
  }

  if (!(hasLength(length))) {
    collection = values(collection);
    length = collection.length;
  }

  while (++index < length) {
    if (collection[index] === target) {
      return true;
    }
  }
  return false;
}

function map (collection, iter, self) {
  var data = {};
  if (collection.map) {
    return collection.map(iter, self);
  }
  each(collection, function(item, key) {
    data[key] = iter.call(self, item, key);
  });

  return data;
}

function each (collection, iter, self) {
  var index = -1, keys_,
    length = collection ? collection.length : 0;

  if (!(hasLength(length))) {
    keys_ = keys(collection);
    length = keys_.length;

    while (++index < length) {
      var key = keys_[index];
      if (iter.call(self, collection[key], key, collection) === false) {
        return collection[key];
      }
    }
    
  }

  while (++index < length) {
    if (iter.call(self, collection[index], index, collection) === false) {
      return collection[index];
    }
  }
}

function extend () {
  var length = arguments.length,
    object = arguments[0],
    i = 0;

  while (++i < length) {
    assign_(object, arguments[i]);
  }

  return object;
}

function has (object, key) {
  return object ? Object.hasOwnProperty.call(object, key) : false;
}

function hasLength (length) {
  return (typeof length == 'number' && length > -1 && length <= MAX_SAFE_INTEGER);
}

/**
 * @param {Function} c
 * @param {Function} sc
 */
function inherit (c, sc) {
  c.prototype = Object.create(sc.prototype, {});
  c.prototype.super_ = sc;
  c.super_ = sc;
  /** @Overrider */
  c.prototype.constructor = c;
}

function isArray (a) {
  return Array.isArray(a);
}

function isBoolean (a) {
  return typeof(a) === "boolean";
}

function isFinite (a) {
  return typeof(a) === "number" && _isFinite(a);
}

function isFunction (a) {
  return typeof(a) === "function";
}

function isNull (a) {
  return a === null;
}

function isNumber (a) {
  return typeof(a) === "number";
}

function isString (a) {
  return typeof(a) === "string";
}

function isObject (a) {
  var type = typeof a;
  return type === 'function' || (a && type === 'object') || false;
}

function isUndefined (a) {
  return typeof(a) === "undefined";
}

function keys (a) {
  try {
    return Object.keys(a);
  } catch (unused) { }
  return [];
}

function size (a) {
  if (a && isFinite(a.length) && a.length >= 0) {
    return a.length;
  }
  return Object.keys(a).length;
}

function toArray (a) {
  var length = a ? a.length : 0;
  if (hasLength(length) && isFunction(a.slice)) {
    return a.slice();
  }
  return values(a);
}

function values (a) {
  var i = -1, keys_ = keys(a), length = keys_.length, v = [];
  while (++i < length ) {
    v.push(a[keys_[i]]);
  }
  return v;
}

module.exports = {
  contains: contains,
  each: each,
  extend: extend,
  has: has,
  inherit: inherit,
  isArray: isArray,
  isBoolean: isBoolean,
  isFinite: isFinite,
  isFunction: isFunction,
  isNull: isNull,
  isNumber: isNumber,
  isString: isString,
  isObject: isObject,
  isUndefined: isUndefined,
  map: map,
  keys: keys,
  size: size,
  toArray: toArray,
  values: values,
};

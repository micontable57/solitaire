/**
 * Simple event emitter implementation
 */
export function Emitter() {}

Emitter.prototype = {
  on: function (event, fct) {
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);
  },
  off: function (event, fct) {
    this._events = this._events || {};
    if (event in this._events === false) return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
  },
  emit: function (event /* , args... */) {
    this._events = this._events || {};
    if (event in this._events === false) return;
    for (var i = 0; i < this._events[event].length; i++) {
      this._events[event][i].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    }
  },
};

Emitter.mixin = function (obj) {
  var props = ["on", "off", "emit"];
  for (var i = 0; i < props.length; i++) {
    if (typeof obj === "function") {
      obj.prototype[props[i]] = Emitter.prototype[props[i]];
    } else {
      obj[props[i]] = Emitter.prototype[props[i]];
    }
  }
  return obj;
};

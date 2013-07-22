'use strict'
var EventEmitter = require('events').EventEmitter
var proto = EventEmitter.prototype

module.exports = Emitter
function Emitter(obj) {
  if (arguments.length === 0) {
    if (this instanceof Emitter) {
      EventEmitter.call(this)
      return
    } else {
      return new Emitter()
    }
  }
  if ((typeof obj !== 'function' && typeof obj !== 'object') || obj === null) {
    throw new TypeError('object to add event emitter mixin to must be an `object` or a `function`.')
  }
  if (Array.isArray && Array.isArray(obj)) {
    throw new TypeError('You can\'t add an event emitter mixin to an array')
  }
  if (typeof obj === 'object' && (typeof obj.addEventListener === 'function' || typeof obj.attachEvent === 'function')) {
    throw new TypeError('The object already has `addEventListener` or `attachEvent`, you can\'t also add an EventEmitter')
  }
  if (typeof obj === 'object' && typeof obj.length === 'number' && typeof obj.item === 'function') {
    throw new TypeError('You cannot add an EventEmitter API to an object with `length` of type number and `item` of type function' +
      ' because it looks too much like a NodeList.')
  }
  // mixin
  for (var k in proto) {
    if (typeof proto[k] === 'function') obj[k] = proto[k]
  }
  obj.off = off
  EventEmitter.call(obj)
  return obj
}
Emitter.prototype = Object.create(proto)
Emitter.prototype.constructor = Emitter
Emitter.prototype.off = off

function off(event, fn) {
  switch (arguments.length) {
    case 2:
      this.removeListener(event, fn)
      return this
    case 1:
      this.removeAllListeners(event)
      return this
    case 0:
      this.removeAllListeners()
      return this
  }
}
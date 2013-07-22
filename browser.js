var closest = require('closest')
var Emitter = require('./index.js')

module.exports = BrowserEmitter
function BrowserEmitter(obj, parent) {
  if (arguments.length === 0) {
    if (this instanceof Emitter) {
      Emitter.call(this)
      return
    } else {
      return new BrowserEmitter()
    }
  }
  if ((typeof obj === 'string' || isDOMNode(obj) || isNodeList(obj)) && !(this instanceof BrowserEmitter)) {
    return new BrowserEmitter(obj, parent)
  }
  if (typeof obj === 'string') {
    var origin = parent || document
    parent = new BrowserEmitter(origin)
    this._on = function (name, fn, capture) {
      return parent._on(name, function (element, e) {
        var source = e.target || e.srcElement
        var el = closest(source, obj, true)
        fn(el, e)
      })
    }
    this._off = function (name, fn, capture) {
      return parent._off(name, fn, capture)
    }
    this._dispatchEvent = function (e) {
      var children = origin.querySelectorAll(obj)
      for (var i = 0; i < children.length; i++) {
        children[i].dispatchEvent(e)
      }
    }
  } else if (isDOMNode(obj)) {
    this._on = function (name, fn, capture) {
      function f(e) {
        return fn(obj, e)
      }
      if (obj.addEventListener) {
        obj.addEventListener(name, f, capture || false)
      } else {
        obj.attachEvent('on' + name, f)
      }
      return f
    }
    this._off = function (name, fn, capture) {
      if (obj.removeEventListener) {
        obj.removeEventListener(type, fn, capture || false)
      } else {
        obj.detachEvent('on' + type, fn)
      }
      return fn
    }
    this._dispatchEvent = function (e) {
      obj.dispatchEvent(e)
    }
  } else if (isNodeList(obj)) {
    var list = Array.prototype.map.call(obj, function (n) { return new BrowserEmitter(n) })
    this._on = function (name, fn, capture) {
      for (var i = 0; i < list.length; i++) {
        list[i].on(name, fn)
      }
      return fn
    }
    this._off = function (name, fn, capture) {
      for (var i = 0; i < list.length; i++) {
        list[i].off(name, fn)
      }
      return fn
    }
    this._dispatchEvent = function (e) {
      for (var i = 0; i < obj.length; i++) {
        obj[i].dispatchEvent(e)
      }
    }
  } else {
    return Emitter(obj)
  }

  Emitter.prototype.on.call(this, 'removeListener', function (type, listener) {
    if (this.listeners(type).length === 0 && this.domListeners[type]) {
      this._off(type, this.domListeners[type])
      this.domListeners[type] = null
    }
  })
}

BrowserEmitter.prototype = Object.create(Emitter.prototype)
BrowserEmitter.prototype.constructor = BrowserEmitter
BrowserEmitter.prototype.addListener = function (type, listener) {
  return this.on.apply(this, arguments)
}
BrowserEmitter.prototype.on = function (type, listener) {
  if (!this.domListeners || !this.domListeners[type]) {
    var self = this
    this.domListeners = this.domListeners || {}
    this.domListeners[type] = this._on(type, function (element, e) {
      Emitter.prototype.emit.call(self, type, element, e, e.target || e.srcElement)
    })
  }
  return Emitter.prototype.on.apply(this, arguments)
}
BrowserEmitter.prototype.emit = function (type, element) {
  var e = new Event(type)
  if (element && element.dispatchEvent) {
    element.dispatchEvent(e)
  } else {
    this._dispatchEvent(e)
  }
}

function isDOMNode(obj) {
  return obj && typeof obj === 'object' && (typeof obj.addEventListener === 'function' || typeof obj.attachEvent === 'function')
}
function isNodeList(obj) {
  if (!(obj && typeof obj === 'object' && typeof obj.length === 'number' && typeof obj.item === 'function' && !(Array.isArray && Array.isArray(obj)))) {
    return false
  }
  for (var i = 0; i < obj.length; i++) {
    if (!isDOMNode(obj.item(i))) {
      return false
    }
  }
  return true
}
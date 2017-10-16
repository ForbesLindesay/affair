var assert = require('assert')
var emitter = require('../')
var Person = function () {}
var person = new Person()

emitter(Person.prototype)

describe('Mixin to prototype: emitter(Person.prototype)', function () {
  it('should mixin emitter', function () {
    assert(!person._events || Person.prototype._events !== person._events)
  })

  it('should not modify the constructor`', function () {
    assert(person.constructor === Person);
  })

  testEmitter(person)
})

describe('Mixin to object: emitter({})', function () {

  var obj = emitter({})

  it('should return the given `obj`', function () {
    var obj = {}
    assert(emitter(obj) === obj)
  })

  testEmitter(obj)
})

describe('Mixin to function: emitter(function fn() {})', function () {

  function fn() {}
  var obj = emitter(fn)

  it('should return the given `function`', function () {
    assert(obj === fn)
  })

  testEmitter(obj)
})

function testEmitter(obj) {
  describe('.on()', function () {
    it('should work', function () {
      assert(obj.on('foo', console.log)._events['foo'] === console.log)
    })
  })

  describe('.removeListener()', function () {
    it('should work', function () {
      assert.deepEqual(obj.removeListener('foo', console.log)._events, {})
    })
  })

  describe('.removeAllListeners()', function () {
    it('should work', function () {
      assert.deepEqual(obj.on('foo', console.log).removeAllListeners()._events, {})
    })
  })

  describe('.once()', function () {
    it('should work', function () {
      var called = false
      obj.once('foo', function () { called = true }).emit('foo')
      assert.deepEqual(obj._events, {})
      assert(called === true)
    })
  })

  describe('.setMaxListeners()', function () {
    it('should work', function () {
      obj.setMaxListeners(10)
      assert(obj._maxListeners === 10)
    })
  })

  describe('.listeners()', function () {
    it('should return all listeners for event', function () {
      assert(obj.on('foo', console.log).listeners('foo')[0] === console.log)
      obj.removeListener('foo', console.log)
    })
  })

  describe('.emit()', function () {
    it('should emit the given event with `args`', function () {
      var args;

      obj.on('foo', function () {
        args = [].slice.call(arguments);
      }).emit('foo', 'bar', 'baz');

      assert.deepEqual(args, ['bar', 'baz']);
    })
  })

  describe('.off()', function () {
    it('should remove all listeners if arguments are omitted', function () {
      obj.on('foo', function () {
        assert(false, 'Should have removed listener');
      }).on('bar', function () {
        assert(false, 'Should have removed listener');
      }).off();
      obj.emit('foo');
      obj.emit('bar');
    })

    it('should remove all listeners for `event`', function () {
      var calledBar = false;
      obj.on('foo', function () {
        assert(false, 'Should have removed listener');
      }).on('bar', function () {
        calledBar = true;
      }).off('foo');
      obj.emit('foo');
      obj.emit('bar');
      assert(calledBar, 'Should have only remove named listener');
    })

    it('should remove the given `listener` from `event`', function () {
      var calledOther = false;
      function listenerToRemove() {
        assert(false, 'Should have removed listener');
      }
      obj.on('foo', listenerToRemove).on('foo', function () {
        calledOther = true;
      }).off('foo', listenerToRemove);
      obj.emit('foo');
      assert(calledOther, 'Should have only remove matching listener');
    })
  })
}

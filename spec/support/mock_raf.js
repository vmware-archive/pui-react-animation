var callbacks = [];

var raf = jasmine.createSpy('raf').and.callFake(function(callback) {
  callbacks.push(callback);
  return callbacks.indexOf(callback);
});

raf.cancel = jasmine.createSpy('cancel').and.callFake(function(index) {
  callbacks.splice(index, 1);
});

Object.assign(raf, {
  next() {
    callbacks.forEach(function(cb) {
      cb();
      callbacks.splice(callbacks.indexOf(cb), 1);
    });
  },
  reset() {
    callbacks = [];
  }
});

module.exports = raf;
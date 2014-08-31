var tests = {
  setUp: function (callback) {
    this.foo = 'bar';
    callback();
  },
  tearDown: function (callback) {
    // clean up
    callback();
  },
  test1: function (test) {
    test.equals(this.foo, 'bar');
    test.done();
  }
}
module.exports = tests;
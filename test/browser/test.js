'use strict';
Function.prototype.bind = Function.prototype.bind || function (thisp) {
  var fn = this;
  return function () {
    return fn.apply(thisp, arguments);
  };
};
var cad = require('../..');
require('should');

describe('Compile it in browserify', function() {
  it('Should not throw an error', function() {
    cad.should.be.instanceOf(Object);
    cad.init.should.be.instanceOf(Function);
  });
});

'use strict';
var cad = require('../..');
require('should');

describe('Compile it in browserify', function() {
  it('Should not throw an error', function() {
    cad.should.be.instanceOf(Object);
    cad.init.should.be.instanceOf(Function);
  });
});

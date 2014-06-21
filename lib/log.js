require('colors');
var _ = require('underscore');
var util = require('util');

module.exports = function() {
  var log = [];
  log.push('commit-a-day '.cyan);
  log.push(util.format.apply(util, arguments).green);
  console.log.apply(console, log);
};

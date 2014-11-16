require('colors');
var util = require('util');

var disabled = false;
var verbose = false;

module.exports = {
  debug: debug,
  d: debug,
  i: info,
  info: info,
  e: error,
  error: error,
  disable: function() {
    disabled = true;
  },
  enable: function() {
    disabled = false;
  },
  verbose: function(flag) {
    verbose = (flag ? true : false);
  }
};

function error() {
  return logger('red', arguments);
}

function info() {
  return logger('green', arguments);
}

function debug() {
  if (verbose) {
    logger('grey', arguments);
  }
}

function logger(color) {
  if (disabled) {
    return;
  }
  var log = [];
  log.push('commit-a-day '.cyan);
  log.push(util.format.apply(util, arguments[1])[color]);
  console.log.apply(console, log);
}

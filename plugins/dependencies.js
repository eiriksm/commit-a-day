var david = require('david');
var util = require('util');
var _ = require('underscore');
var log = require('../lib/log');

module.exports = function(data, callback) {

  var config = require('..').config;
  var npm = config.npm || {};

  david.getUpdatedDependencies(data.packageJson, { dev: true, npm: npm }, function(e, r) {
    if (e) {
      callback(e);
      return;
    }
    if (_.size(r) === 0) {
      // Problems, or nothing to do. better take the next one.
      log('All dependencies are looking good for %s', data.repo.full_name);
      callback(null, null);
      return;
    }

    callback(null, util.format('There are dependencies to be updated in repo %s', data.repo.full_name));
  });
};

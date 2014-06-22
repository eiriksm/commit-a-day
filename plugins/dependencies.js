var david = require('david');
var util = require('util');
var _ = require('underscore');
var WaitGroup = require('waitgroup');

var log = require('../lib/log');

module.exports = function(data, callback) {

  var config = require('..').config;
  var npm = config.npm || {};

  var wg = new WaitGroup();
  var hasUpdate = false;

  // Check both dev and regular dependencies.
  [false, true].forEach(function(n) {
    wg.add();
    david.getUpdatedDependencies(data.packageJson, { dev: n, npm: npm }, function(e, r) {
      var depType = n ? 'devDependenvies' : 'dependencies (not dev)';
      log.i('Checked %s for %s', depType, data.repo.full_name);
      if (e) {
        callback(e);
        wg.done();
        wg.cancel = true;
        return;
      }
      if (_.size(r) === 0) {
        // Problems, or nothing to do. better take the next one.
        log.i('All %s are looking good for %s', depType, data.repo.full_name);
      }
      else {
        hasUpdate = true;
      }
      wg.done();

    });
  });
  wg.wait(function() {
    if (!wg.cancel) {
      if (hasUpdate) {
        callback(null, util.format('There are dependencies to be updated in repo %s', data.repo.full_name));
      }
      else {
        callback(null, null);
      }
    }
  });
};

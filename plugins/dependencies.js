'use strict';
var util = require('util');
var _ = require('underscore');
var WaitGroup = require('waitgroup');
var semver = require('semver');

var log = require('../lib/log');
var requestCache = require('../lib/cache').get;

module.exports = function(data, callback) {
  setTimeout(function() {
    //callback(null, null);
  }, 0);
  var config = require('..').config;
  var npm = config.npm || {};

  // @todo: When npm starts supporting CORS again...
  var npmurl = npm.registry || 'http://npm-registry-cors-proxy.herokuapp.com';

  // Try to get the latest info about this package.
  var wg = new WaitGroup();
  var hasUpdate = false;

  // Check both dev and regular dependencies.
  if (!data.packageJson || (!data.packageJson.dependencies && !data.packageJson.devDependencies)) {
    log.d('Skipping dependency lookup for %s', data.repo.full_name);
    // Skip a heartbeat so we are sure that all waitgroups are added in the
    // plugin loop.
    setTimeout(function() {
      callback(null, null);
    }, 0);
    return;
  }
  var packages = [];
  _.each(['dependencies', 'devDependencies'], function(type) {
    if (data.packageJson[type]) {
      _.each(data.packageJson[type], function(i, n) {
        packages.push({
          name: n,
          version: i
        });
      });
    }
  });
  if (packages.length === 0) {
    // Just make the waitgroup execute.
    wg.add();
    wg.done();
  }
  packages.forEach(function(n) {
    wg.add();
    var opts = {
      url: npmurl + '/' + n.name
    };
    requestCache(opts, function(e, r, b) {
      if (e) {
        callback(e);
        wg.done();
        wg.cancel = true;
        return;
      }
      var depPackage;
      try {
        depPackage = JSON.parse(b);
      }
      catch(err) {
        callback(err);
        wg.done();
        wg.cancel = true;
        return;
      }
      // See what this version is.
      var distVersion = depPackage['dist-tags'].latest;
      // Compare with what we are looking for.
      var upAvail;
      log.d('Comparing versions for %s, dependency %s. Wanted version %s, latest version is %s',
            data.packageJson.name,
            n.name,
            n.version,
            distVersion);
      try {
        upAvail = semver.gtr(distVersion, n.version);
      }
      catch(err) {
        // Whatever...
        log.d('%s has specified version %s of %s, which does not validate the comparison against latest version: %s',
              data.packageJson.name,
              n.version,
              n.name,
              distVersion);
      }
      if (upAvail) {
        hasUpdate = true;
        log.d('%s has specified version %s of %s, which is lower than latest version: %s',
              data.packageJson.name,
              n.version,
              n.name,
              distVersion);
      }
      wg.done();
    });
  });
  wg.wait(function() {
    if (!wg.cancel) {
      if (hasUpdate) {
        callback(null, util.format('There are dependencies to be updated in repo %s. How about an update there?', data.repo.full_name));
      }
      else {
        callback(null, null);
      }
    }
  });
};

var util = require('util');
var request = require('request');

var log = require('./log');

module.exports = function processRepo(r, callback) {
  var config = require('..').config;
  var processNext = function() {
    // Move on.
    callback();
  };
  // Is it a fork? Discard.
  if (r.fork === true) {
    log.d('Skipping %s, since it is a fork.', r.full_name);
    processNext();
    return;
  }
  // See if this repo has a package json.
  var urlString = config.rawurl || 'https://rawgit.com/%s/%s/package.json';
  var url = util.format(urlString, r.full_name, r.default_branch);
  var opts = {
    uri: url,
    withCredentials: false
  };
  request(opts, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }
    if (res.statusCode !== 200) {
      log.d('No package.json found for %s', r.full_name);
      callback(null, {name: r.name});
      return;
    }
    // Ok, we have a package.json. See if it parses as JSON.
    var pack;
    try {
      pack = JSON.parse(body);
    }
    catch (e) {
      log.e('Found package.json for %s, but failed to parse as json', r.full_name);
      callback(e);
      return;
    }
    log.i('Found package.json for %s', r.full_name);
    callback(null, pack);
  });
};

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
    processNext();
    return;
  }
  // See if this repo has a package json.
  var urlString = config.rawurl || 'https://raw.githubusercontent.com/%s/%s/package.json';
  var url = util.format(urlString, r.full_name, r.default_branch);
  request(url, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }
    if (res.statusCode != 200) {
      processNext();
      return;
    }
    // Ok, we have a package.json. See if it parses as JSON.
    var pack;
    try {
      pack = JSON.parse(body);
    }
    catch (e) {
      callback(e);
      return;
    }
    log('Found package.json for %s', r.full_name);
    callback(null, pack);
  });
};

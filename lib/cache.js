'use strict';
var request = require('request');

var log = require('./log');

var cache = {};

function set(id, data) {
  cache[id] = data;
}

module.exports = {
  set: set,
  reset: function() {
    Object.keys(cache).forEach(function(n) {
      delete cache[n];
    });
  },
  get: function(options, callback) {
    if (cache[options.url]) {
      var data = cache[options.url];
      log.d('Using cache for URL %s', options.url);
      callback(data.error, data.response, data.body);
      return;
    }
    log.d('Requesting URL %s', options.url);
    options.withCredentials = false;
    options.timeout = 20000;
    request(options, function(error, response, body) {
      set(options.url, {
        error: error,
        response: response,
        body: body
      });
      callback(error, response, body);
    });
  }
};

var request = require('request');

var log = require('./log');

var cache = {};

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

function set(id, data) {
  cache[id] = data;
}

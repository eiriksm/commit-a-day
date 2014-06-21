var _ = require('underscore');
var request = require('request');
var util = require('util');
var requireDir = require('require-dir');
var WaitGroup = require('waitgroup');
var yesno = require('yesno');

var commitaday = {
  init: {},
  config: {}
};

module.exports = commitaday;

var plugins = requireDir('./plugins');
var processRepo = require('./lib/processing');
var log = require('./lib/log');

var init = function(config, callback) {

  config = config || {};
  commitaday.config = config;
  var user = config.user;
  var urlString = config.url || 'https://api.github.com/users/%s/repos?sort=updated&direction=desc';
  if (!user) {
    callback(new Error('This is a no username found Error.'));
    return;
  }
  var url = util.format(urlString, user);
  var options = {
    url: url,
    headers: {
      'User-Agent': 'Requested with https://github.com/eiriksm/commit-a-day'
    }
  };
  request(options, function(error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode === 200) {
      // Looking good, let's hope this is good json as well.
      var repos;
      try {
        repos = JSON.parse(body);
      }
      catch(jsonerr) {
        callback(jsonerr);
        return;
      }
      if (!repos || !repos.length) {
        callback(new Error('No repos found.'));
        return;
      }
      // Loop over all repos in a sync manner.
      var nextRepo = function(delta) {
        var repo = repos[delta];
        if (!repo) {
          // @TODO! Add support for paging.
          callback(new Error('No more tips to show!'));
          return;
        }
        processRepo(repo, function(err, packageJson) {
          delta += 1;
          if (err || !packageJson) {
            nextRepo(delta);
            return;
          }
          var data = {
            repo: repo,
            packageJson: packageJson
          };
          var wg = new WaitGroup();
          Object.keys(plugins).forEach(function(n) {
            wg.add();
            plugins[n](data, function(pluginErr, data) {
              if (pluginErr) {
                callback(pluginErr);
                return;
              }
              if (data) {
                log(data);
                yesno.ask('Not so useful tip? Do you want another one?', true, function(ok) {
                  if (ok) {
                    wg.done();
                  }
                  else {
                    wg.cancel = true;
                    wg.done();
                    callback();
                  }
                });
              }
              else {
                wg.done();
              }
            });
          });
          wg.wait(function() {
            if (!wg.cancel) {
              nextRepo(delta);
            }
          });
        });

      };
      nextRepo(0);
      return;
    }
    callback(new Error('Did not get expected HTTP status code.'));
  });
};

commitaday.init = init;

//init({user: 'eiriksm'}, function(e, r) {
//  console.log(r);
//});

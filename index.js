var _ = require('underscore');
var util = require('util');
var WaitGroup = require('waitgroup');

var commitaday = {
  init: {},
  config: {}
};

module.exports = commitaday;
commitaday.init = init;

var plugins = {
  issues: require('./plugins/issues'),
  dependencies: require('./plugins/dependencies')
};
commitaday.plugins = plugins;
var processRepo = require('./lib/processing');
var log = require('./lib/log');
var requestCache = require('./lib/cache').get;

var hasRepos = false;

function init(config, initCallback) {
  var calledBack = false;
  function callback() {
    if (!calledBack) {
      initCallback.apply(initCallback, arguments);
    }
    calledBack = true;
  }

  config = config || {};
  if (config.debug) {
    log.verbose(true);
  }
  var disabled = {};
  if (config.disable) {
    // See if we are to disable some dependencies.
    config.disable.forEach(function(n) {
      if (plugins[n]) {
        disabled[n] = true;
      }
    });
  }
  commitaday.config = config;
  var user = config.user;
  var page = config.page || 1;
  var urlString = config.url || 'https://api.github.com/users/%s/repos?sort=updated&direction=asc&page=%d';
  if (!user) {
    callback(new Error('This is a no username found Error.'));
    return;
  }
  var url = util.format(urlString, user, page);
  var options = {
    url: url,
    headers: {
      'User-Agent': 'Requested with https://github.com/eiriksm/commit-a-day'
    }
  };
  requestCache(options, function(error, response, body) {
    log.d('Loaded page %d with URL %s', (config.page ? config.page : 0), options.url);
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
        log.e('There was an error parsing the github JSON');
        callback(jsonerr);
        return;
      }
      if ((!repos || !repos.length)) {
        var message = 'No repos found.';
        if (hasRepos) {
          message = 'No more tips to show!';
        }
        callback(new Error(message));
        return;
      }
      log.d('This particular list of repos is %d items long', repos.length);
      var pagingEnd = false;
      // Loop over all repos in a sync manner.
      var nextRepo = function(delta) {
        var repo = repos[delta];
        if (!repo) {
          if (!pagingEnd) {
            config.page = config.page || 1;
            config.page += 1;
            // Reset delta.
            config.delta = 0;
            pagingEnd = true;
            log.d('Loading page %d in github API', config.page);
            init(config, callback);
            return;
          }
          log.d('Calling callback with "no more tips"');
          callback(new Error('No more tips to show!'));
          return;
        }
        hasRepos = true;
        pagingEnd = false;
        processRepo(repo, function(err, packageJson) {
          delta += 1;
          if (err || !packageJson) {
            if (err) {
              log.e('Experienced an error with processing %s. The error was: %s', repo.full_name, err.message);
            }
            nextRepo(delta);
            return;
          }
          var data = {
            repo: repo,
            packageJson: packageJson
          };
          var wg = new WaitGroup();
          log.d('Processing plugins for %s', repo.full_name);
          Object.keys(plugins).forEach(function(n) {
            if (disabled[n]) {
              log.d('Skipping plugin %s, because it is disabled via config', n);
              return;
            }
            wg.add();
            plugins[n](data, function(pluginErr, data) {
              if (pluginErr) {
                log.e('Encountered a plugin error on plugin %s with the repo %s', n, repo.full_name);
                callback(pluginErr, {repo: repo, delta: delta});
                wg.cancel = true;
                wg.done();
                return;
              }
              if (data && !wg.cancel) {
                log.i(data.inverse);
                wg.cancel = true;
                callback(null, {message: data, delta: delta, repo: repo});
              }
              wg.done();
            });
          });
          wg.wait(function() {
            if (!wg.cancel) {
              nextRepo(delta);
            }
            return;
          });
        });

      };
      var delta = config.delta || 0;
      nextRepo(delta);
      return;
    }
    var msg = util.format('Did not get expected HTTP status code. Expected 200, but got %d', response.statusCode);
    callback(new Error(msg));
  });
}

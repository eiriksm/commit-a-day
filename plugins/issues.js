'use strict';
var util = require('util');

var log = require('../lib/log');

module.exports = function processRepo(data, callback) {
  // See if the repo has any open issues.
  var r = data.repo;
  log.d('Looking for open issues in %s', r.full_name);
  if (r.open_issues_count && r.open_issues_count > 0) {
    var message = util.format('%s has %d open issues. How about tackling one of them?', r.full_name, r.open_issues_count);
    callback(null, message);
    return;
  }
  log.d('No issues found for %s', r.full_name);
  callback();
};

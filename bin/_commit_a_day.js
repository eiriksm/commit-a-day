var n = require('nomnom');
var yesno = require('yesno');

var c = require('..');
var log = require('../lib/log');

// Harvest some stuff from the command line.

function displayVersion() {
  return 'Version ' + require('../package').version;
}
n.options({
    user: {
      position: 0,
      help: 'Username to use for github scanning'
    },
    version: {
      flag: true,
      abbr: 'v',
      help: 'print version and exit',
      callback: function() {
        return displayVersion();
      }
   }
  });

var opts = n.parse();

// See if we have a username.
if (!opts || !opts.user) {
  // Spit out usage info.
  console.log(n.getUsage());
  process.exit(0);
}
// Initilize sauce.
var start = function(opts) {
  c.init(opts, function(err, res) {
    if (err) {
      log('Sorry! There was an error. The error was: %s', err.message.bold);
      process.exit(0);
    }
    yesno.ask('Not so useful tip? Do you want another one?', true, function(ok) {
      if (ok) {
        opts.delta = res.delta;
        start(opts);
      }
      else {
        log('Exiting.');
        process.exit(0);
      }
    });
  });
};

start(opts);

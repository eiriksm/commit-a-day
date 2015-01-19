'use strict';

module.exports = function(config) {
  config.set({
    basePath: '../..',
    frameworks: ['mocha', 'browserify'],
    files: [
      'test/browser/test.js'
    ],
    port: 9876,

    reporters: ['dots'],
    preprocessors: {
      'test/**/*.js': ['browserify']
    },
    plugins: [
      'karma-phantomjs-launcher',
      'karma-mocha',
      'karma-browserify'
    ],
    browserify: {
      debug: true,
      configure: function(b) {
        b.on('prebundle', function() {
          b.require('http');
        });
      }
    },

    colors: true,

    logLevel: config.LOG_ERROR,

    autoWatch: false,

    browsers: ['PhantomJS'],

    singleRun: true

  });
};

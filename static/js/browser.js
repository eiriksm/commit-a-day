;(function() {
  'use strict';
  var m = require('mithril');
  var util = require('util');

  var c = require('../..');

  // Disable logging to the console.
  require('../../lib/log').disable();

  var app = {};

  app.controller = function() {
    this.plugins = [];
    this.enabledPlugins = {};
    for (var prop in c.plugins) {
      if (c.plugins.hasOwnProperty(prop)) {
        this.plugins.push(prop);
        // Enable all by default.
        this.enabledPlugins[prop] = true;
      }
    }
    var loadingtext = [
      'Requesting something over the internet',
      'Talking to some remote servers',
      'Communicating with the interconnected web',
      'Looking for some information',
      'Trying to assemble some pieces'
    ];
    var ctrl = this;
    this.buttonText = 'Gimme suggestion!';
    this.username = m.prop('');
    this.getLoadingText = function() {
      return loadingtext[Math.floor(Math.random() * loadingtext.length)];
    };
    this.opts = {};
    this.start = function() {
      var user = this.username();
      m.startComputation();
      ctrl.loading = true;
      ctrl.loadingText = ctrl.getLoadingText();
      if (user !== this.opts.user) {
        // Reset everything.
        this.error = false;
        this.suggestions = [];
        this.opts = {};
        // Re-render.
        m.endComputation();
        m.startComputation();
      }
      this.opts.disable = this.getDisabledPlugins();
      this.opts.user = user;
      setTimeout(m.endComputation, 1);
      ctrl.error = '';
      c.init(this.opts, function(e, r) {
        m.startComputation();
        if (!e) {
          ctrl.buttonText = 'Next suggestion';
          ctrl.opts.delta = r.delta;
          ctrl.suggestions.push({msg: r.message, repo: r.repo});
        }
        else {
          ctrl.error = e;
          if (r) {
            ctrl.error = e + '. Error encountered on processing of repo ' + r.repo.full_name;
          }
        }
        ctrl.loading = false;
        setTimeout(m.endComputation, 1);
      });
    }.bind(this);
    this.suggestions = [];
    this.isChecked = function(plugin) {
      if (ctrl.enabledPlugins[plugin]) {
        return true;
      }
      return false;
    };
    this.pluginChange = function(e) {
      // Find plugin.
      var plugin = e.target.getAttribute('data-plugin');
      // Disable plugin.
      if (ctrl.enabledPlugins[plugin]) {
        delete ctrl.enabledPlugins[plugin];
        return;
      }
      ctrl.enabledPlugins[plugin] = true;
    };
    this.getDisabledPlugins = function() {
      var disabled = [];
      for (var p in c.plugins) {
        if (!ctrl.enabledPlugins[p]) {
          disabled.push(p);
        }
      }
      return disabled;
    };
  };
  // view
  app.view = function(ctrl) {
    return m('div.content', [
      m('div.choices', [
        m('h3', 'Optionally disable some plugins'),
        ctrl.plugins.map(function(n) {
          var id = 'checkbox-' + n;
          return [
            m('input', {onchange: ctrl.pluginChange, 'data-plugin': n, type: 'checkbox', id: id, checked: ctrl.isChecked(n)}),
            m('label', {for: id}, n)
          ];
        })
      ]),
      m('input.username-input', {onchange: m.withAttr('value', ctrl.username), value: ctrl.username(), type: 'text', placeholder: 'Enter username', id: 'username'}),
      !ctrl.loading ? m('button.action-button', {onclick: ctrl.start}, ctrl.buttonText) : '',
      ctrl.loading ? m('div.loading-spinner-holder', [
        m('div.inner', [
          m('span', ctrl.loadingText),
          m('h1', [
            [1, 2, 3, 4].map(function(num) {
              return m('i', {class: 'dot-' + num});
            })
          ])
        ])
      ]) : '',
      ctrl.error ? m('div.errors', ctrl.error) : '',
      m('div.suggestion-wrapper', [
        ctrl.suggestions.map(function(suggestion) {
          // Replace full_name with a link.
          var text = suggestion.msg;
          var link = util.format('<a href="%s">%s</a>', suggestion.repo.html_url, suggestion.repo.full_name);
          text = text.replace(suggestion.repo.full_name, link);
          return m('div.flipInX.animated.suggestion', m.trust(text));
        })
      ])
   ]);
  };
  m.module(document.getElementById('container'), app);
}());

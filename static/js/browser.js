;(function() {
  'use strict';
  var m = require('mithril');
  var util = require('util');

  var c = require('../..');

  // Disable logging to the console.
  require('../../lib/log').disable();

  var app = {};

  app.controller = function() {
    var ctrl = this;
    this.buttonText = 'Gimme suggestion!';
    this.username = m.prop('');
    this.opts = {};
    this.start = function() {
      var user = this.username();
      m.startComputation();
      ctrl.loading = true;
      if (user !== this.opts.user) {
        // Reset everything.
        this.error = false;
        this.suggestions = [];
        this.opts = {};
        // Re-render.
        m.endComputation();
        m.startComputation();
      }
      this.opts.user = user;
      setTimeout(m.endComputation, 1);
      c.init(this.opts, function(e, r) {
        m.startComputation();
        if (!e) {
          ctrl.buttonText = 'Next suggestion';
          ctrl.opts.delta = r.delta;
          ctrl.suggestions.push({msg: r.message, repo: r.repo});
        }
        else {
          ctrl.error = e;
        }
        ctrl.loading = false;
        setTimeout(m.endComputation, 1);
      });
    }.bind(this);
    this.suggestions = [];
  };
  // view
  app.view = function(ctrl) {
    return m('div.content', [
      m('input.username-input', {onchange: m.withAttr('value', ctrl.username), value: ctrl.username(), type: 'text', placeholder: 'Enter username', id: 'username'}),
      !ctrl.loading ? m('button.action-button', {onclick: ctrl.start}, ctrl.buttonText) : '',
      ctrl.loading ? m('div.loading-spinner-holder', [
        m('div.inner', [
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

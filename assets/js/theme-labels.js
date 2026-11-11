(function () {
  'use strict';

  function relabel(host) {
    var group = host.querySelector('.jk-thsw');
    if (!group) return false;
    var html = document.documentElement;
    var italian = (html.dataset.uiLang || html.lang) === 'it';
    var theme = window.JaackTheme;
    var from = theme ? theme.FROM : 7;
    var to = theme ? theme.TO : 19;
    var labels = italian ? { auto: 'Auto', light: 'Chiaro', dark: 'Scuro' } :
      { auto: 'Auto', light: 'Light', dark: 'Dark' };
    var titles = italian ? {
      auto: 'Automatico: chiaro dalle ' + from + ' alle ' + to,
      light: 'Tema chiaro', dark: 'Tema scuro'
    } : {
      auto: 'Automatic: light from ' + from + ' to ' + to,
      light: 'Light theme', dark: 'Dark theme'
    };
    group.setAttribute('aria-label', italian ? 'Tema' : 'Theme');
    [].forEach.call(group.querySelectorAll('button[data-m]'), function (button) {
      var mode = button.getAttribute('data-m');
      var label = button.querySelector('.l');
      if (label && labels[mode]) {
        label.textContent = labels[mode];
        button.title = titles[mode];
      }
    });
    return true;
  }

  function init() {
    [].forEach.call(document.querySelectorAll('[data-jk-theme-switch]'), function (host) {
      if (relabel(host) || typeof MutationObserver !== 'function') return;
      var observer = new MutationObserver(function () {
        if (relabel(host)) observer.disconnect();
      });
      observer.observe(host, { childList: true, subtree: true });
    });
  }

  window.addEventListener('languageChanged', function () {
    [].forEach.call(document.querySelectorAll('[data-jk-theme-switch]'), relabel);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

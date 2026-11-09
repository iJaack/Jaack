(function () {
  'use strict';
  var html = document.documentElement;
  var fixedLanguage = html.getAttribute('data-content-lang');
  var preferred;
  try { preferred = localStorage.getItem('site-lang'); } catch (e) {}
  var initialLang = preferred || fixedLanguage || ((navigator.language || '').indexOf('it') === 0 ? 'it' : 'en');
  if (initialLang !== 'it' && initialLang !== 'en') initialLang = 'en';
  // Pick the visible language in head, before either translation can paint.
  html.dataset.uiLang = initialLang;
  html.lang = fixedLanguage || initialLang;

  function init() {
    var buttons = document.querySelectorAll('[data-lang]');
    function setLang(lang) {
      if (lang !== 'it' && lang !== 'en') lang = 'en';
      document.body.classList.remove('lang-en', 'lang-it');
      document.body.classList.add('lang-' + lang);
      html.lang = fixedLanguage || lang;
      html.dataset.uiLang = lang;
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-lang') === lang));
      });
      try {
        localStorage.setItem('site-lang', lang);
        localStorage.setItem('blog-lang', lang === 'it' ? 'italian' : 'english');
      } catch (e) { /* The language switch also works without browser storage. */ }
      return lang;
    }
    if (typeof document.querySelector === 'function') {
      var alt = document.querySelector('[data-alt-url]');
      if (alt && alt.getAttribute('data-alt-url')) {
        window.alternateLangUrl = alt.getAttribute('data-alt-url');
        window.alternateLangCode = alt.getAttribute('data-alt-lang');
      }
      var themeMeta = document.querySelector('meta[name="theme-color"]');
      function paintChrome() {
        if (!themeMeta) return;
        themeMeta.setAttribute('content', document.documentElement.getAttribute('data-theme') === 'dark' ? '#161210' : '#f3eee6');
      }
      paintChrome();
      if (typeof window.addEventListener === 'function') window.addEventListener('jaacktheme', paintChrome);
      var bar = document.querySelector('nav.site-nav');
      if (bar && typeof ResizeObserver === 'function') {
        var fitBar = function () {
          var box = bar.getBoundingClientRect();
          document.documentElement.style.setProperty('--jk-topbar-h', Math.ceil(box.top + box.height) + 'px');
        };
        fitBar();
        new ResizeObserver(fitBar).observe(bar);
      }
    }
    window.toggleGlobalLang = function (lang) {
      lang = setLang(lang);
      if (window.alternateLangUrl && window.alternateLangCode === lang) {
        window.location.href = window.alternateLangUrl;
      }
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
    };
    setLang(initialLang);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        window.toggleGlobalLang(button.getAttribute('data-lang'));
      });
    });
  }
  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();

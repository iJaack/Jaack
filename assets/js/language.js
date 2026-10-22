(function () {
  'use strict';
  var buttons = document.querySelectorAll('[data-lang]');
  var fixedLanguage = document.documentElement.getAttribute('data-content-lang');
  function setLang(lang) {
    if (lang !== 'it' && lang !== 'en') lang = 'en';
    document.body.classList.remove('lang-en', 'lang-it');
    document.body.classList.add('lang-' + lang);
    document.documentElement.lang = fixedLanguage || lang;
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
      themeMeta.setAttribute('content', document.documentElement.getAttribute('data-theme') === 'dark' ? '#121314' : '#f7f5f0');
    }
    paintChrome();
    if (typeof window.addEventListener === 'function') window.addEventListener('jaacktheme', paintChrome);
  }
  window.toggleGlobalLang = function (lang) {
    lang = setLang(lang);
    if (window.alternateLangUrl && window.alternateLangCode === lang) {
      window.location.href = window.alternateLangUrl;
    }
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
  };
  var preferred;
  try { preferred = localStorage.getItem('site-lang'); } catch (e) {}
  setLang(preferred || fixedLanguage || ((navigator.language || '').indexOf('it') === 0 ? 'it' : 'en'));
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      window.toggleGlobalLang(button.getAttribute('data-lang'));
    });
  });
})();

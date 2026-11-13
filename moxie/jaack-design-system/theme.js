// jaack theme — load as a BLOCKING external script in <head> (CSP friendly, no inline code) so the theme is set before first paint:
//   <script src="/theme.js"></script>            optional: data-light-from="7" data-light-to="19" data-key="jaack.theme"
// Order: saved choice (Light/Dark, localStorage) → ?theme=light|dark → Auto by the visitor's local clock (light 07:00–18:59).
// Re-checked every 60 s, on focus, on visibility change and across tabs; theme changes are instant (--jk-d-theme is --jk-dur-0).
// JaackTheme.mount(el) adds Auto / Light / Dark (Italian: Auto / Chiaro / Scuro); styles: components/themeswitch.css.
// Language: html data-ui-lang || lang (it prefix → Italian; otherwise English). relabel() also runs on attribute changes and languageChanged.
// Override JaackTheme.labels.en / .it before mount: auto, light, dark, group, autoTitle, lightTitle, darkTitle, suffix.
(function(root){'use strict';
  var S=typeof document!=='undefined'&&document.currentScript,ds=(S&&S.dataset)||{};
  var FROM=+ds.lightFrom||7,TO=+ds.lightTo||19,KEY=ds.key||'jaack.theme',T={FROM:FROM,TO:TO,KEY:KEY,labels:(root.JaackTheme||{}).labels||{}};
  T.auto=function(d){var h=d.getHours();return h>=FROM&&h<TO?'light':'dark';};
  T.pick=function(saved,param,d){if(saved==='light'||saved==='dark')return saved;if(param==='light'||param==='dark')return param;return T.auto(d);};
  root.JaackTheme=T;if(typeof document==='undefined'||!document.documentElement)return;
  var html=document.documentElement,mq=function(q){try{return matchMedia(q).matches}catch(e){return false}};
  if(mq('(prefers-reduced-motion: reduce)'))html.classList.add('jk-rm');
  function saved(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function param(){try{return new URLSearchParams(location.search).get('theme')}catch(e){return null}}
  T.mode=function(){var s=saved();return s==='light'||s==='dark'?s:'auto';};
  T.apply=function(fade){var t=T.pick(saved(),param(),new Date());html.dataset.themeMode=T.mode();if(html.dataset.theme===t)return;
    if(fade&&html.dataset.theme&&!mq('(prefers-reduced-motion: reduce)')){html.classList.add('jk-th-fade');clearTimeout(T._f);T._f=setTimeout(function(){html.classList.remove('jk-th-fade')},220);}
    html.dataset.theme=t;try{dispatchEvent(new CustomEvent('jaacktheme',{detail:t}))}catch(e){}};
  T.set=function(m){try{if(m==='light'||m==='dark')localStorage.setItem(KEY,m);else localStorage.removeItem(KEY);}catch(e){}T.apply(true);T.sync();};
  var OPTS=[['auto','◐'],['light','☀'],['dark','☾']];
  var LABELS={en:{auto:'Auto',light:'Light',dark:'Dark',group:'Theme',autoTitle:'Automatic: light from '+FROM+' to '+TO,lightTitle:'Light theme',darkTitle:'Dark theme',suffix:', theme'},
    it:{auto:'Auto',light:'Chiaro',dark:'Scuro',group:'Tema',autoTitle:'Automatico: chiaro dalle '+FROM+' alle '+TO,lightTitle:'Tema chiaro',darkTitle:'Tema scuro',suffix:', tema'}};
  function label(g){var lang=(html.dataset.uiLang||html.lang||'').toLowerCase().indexOf('it')===0?'it':'en',labels=Object.assign({},LABELS[lang],T.labels[lang]);
    g.setAttribute('aria-label',labels.group);[].forEach.call(g.querySelectorAll('button[data-m]'),function(b){b.title=labels[b.dataset.m+'Title'];b.querySelector('.l').textContent=labels[b.dataset.m];b.querySelector('.visually-hidden').textContent=labels.suffix;});}
  T.relabel=function(){[].forEach.call(document.querySelectorAll('.jk-thsw'),label);};
  T.mount=function(host){if(!host||host.querySelector('.jk-thsw'))return;var g=document.createElement('div');g.className='jk-thsw';g.setAttribute('role','group');
    g.innerHTML=OPTS.map(function(o){return '<button type="button" data-m="'+o[0]+'"><span class="i" aria-hidden="true">'+o[1]+'</span><span class="l"></span><span class="visually-hidden"></span></button>'}).join('');label(g);
    g.addEventListener('click',function(e){var b=e.target.closest('button');if(b)T.set(b.dataset.m);});host.appendChild(g);T.sync();};
  T.sync=function(){var m=T.mode();[].forEach.call(document.querySelectorAll('.jk-thsw button'),function(b){b.setAttribute('aria-pressed',b.dataset.m===m?'true':'false')});};
  T.apply(false);
  setInterval(function(){T.apply(true)},60000);
  addEventListener('focus',function(){T.apply(true)});document.addEventListener('visibilitychange',function(){if(!document.hidden)T.apply(true)});
  addEventListener('storage',function(e){if(e.key===KEY){T.apply(true);T.sync();}});
  if(root.MutationObserver)new root.MutationObserver(T.relabel).observe(html,{attributes:true,attributeFilter:['lang','data-ui-lang']});
  addEventListener('languageChanged',T.relabel);
  // auto-mount into any element with [data-jk-theme-switch]
  document.addEventListener('DOMContentLoaded',function(){[].forEach.call(document.querySelectorAll('[data-jk-theme-switch]'),T.mount);});
})(typeof window!=='undefined'?window:this);

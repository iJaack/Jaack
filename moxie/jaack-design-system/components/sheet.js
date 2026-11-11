// Sheet: any element with data-jk-sheet="#id" opens the <dialog id> as a modal glass sheet; Esc, the × button or a click on the backdrop close it.
(function(){'use strict';
  var exits=new WeakMap();
  function cancelExit(d){var exit=exits.get(d);if(!exit)return;
    clearTimeout(exit.timer);d.removeEventListener('animationend',exit.end);exits.delete(d);d.classList.remove('jk-leaving');}
  function close(d){if(!d.open||exits.has(d))return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.close();return;}
    d.classList.add('jk-leaving');
    var duration=Math.max.apply(null,getComputedStyle(d).animationDuration.split(',').map(function(value){return parseFloat(value)*(value.trim().slice(-2)==='ms'?1:1000)||0;}));
    if(!duration){d.classList.remove('jk-leaving');d.close();return;}
    var exit={};
    function finish(){if(exits.get(d)!==exit)return;cancelExit(d);d.close();}
    exit.end=function(e){if(e.target===d&&e.animationName==='jksheetout'&&!e.pseudoElement)finish();};
    exits.set(d,exit);d.addEventListener('animationend',exit.end);exit.timer=setTimeout(finish,duration+50);
  }
  document.addEventListener('click',function(e){var t=e.target.closest('[data-jk-sheet]');if(t){var d=document.querySelector(t.getAttribute('data-jk-sheet'));if(d&&d.showModal){cancelExit(d);d._from=t;if(!d.open)d.showModal();}return;}
    var x=e.target.closest('.jk-sheet .jk-x');if(x){close(x.closest('dialog'));return;}
    if(e.target.matches&&e.target.matches('dialog.jk-sheet'))close(e.target);});
  document.addEventListener('cancel',function(e){var d=e.target;if(d.matches&&d.matches('dialog.jk-sheet')){e.preventDefault();close(d);}},true);
  document.addEventListener('close',function(e){var d=e.target;if(d.matches&&d.matches('dialog.jk-sheet')){cancelExit(d);if(d._from)d._from.focus();}},true);
})();

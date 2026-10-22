// Sheet: any element with data-jk-sheet="#id" opens the <dialog id> as a modal glass sheet; Esc, the × button or a click on the backdrop close it.
(function(){'use strict';
  document.addEventListener('click',function(e){var t=e.target.closest('[data-jk-sheet]');if(t){var d=document.querySelector(t.getAttribute('data-jk-sheet'));if(d&&d.showModal){d.showModal();d._from=t;}return;}
    var x=e.target.closest('.jk-sheet .jk-x');if(x){x.closest('dialog').close();return;}
    if(e.target.matches&&e.target.matches('dialog.jk-sheet'))e.target.close();});
  document.addEventListener('close',function(e){var d=e.target;if(d.matches&&d.matches('dialog.jk-sheet')&&d._from)d._from.focus();},true);
})();

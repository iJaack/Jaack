// Demo wiring — PLACEHOLDER data generated here (deterministic pseudo-random). Not real data of any kind.
(function(){'use strict';
  var rnd=(function(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};})(42);
  var days=30,bars=[],line=[];for(var i=0;i<days;i++){bars.push(Math.round(800+rnd()*900));}
  var v=50;for(var j=0;j<90;j++){v+= (rnd()-.48)*3;line.push(Math.round(v*10)/10);}
  var NS='http://www.w3.org/2000/svg';
  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
  function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
  function barChart(box,vals){var W=box.clientWidth||600,H=Math.round(Math.max(160,Math.min(innerHeight*.27,W*.24,300))),pb=24,pt=8,max=Math.max.apply(null,vals)*1.1;
    var s=el('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H,role:'img','aria-label':'Grafico a barre di esempio con valori segnaposto'});
    var d=el('defs',{}),g=el('linearGradient',{id:'jkg',x1:0,y1:1,x2:0,y2:0});g.appendChild(el('stop',{offset:0,'stop-color':'var(--jk-c-yellow)'}));g.appendChild(el('stop',{offset:1,'stop-color':'var(--jk-c-orange)'}));d.appendChild(g);s.appendChild(d);
    [0,.5,1].forEach(function(f){var y=pt+(H-pt-pb)*(1-f);s.appendChild(el('line',{x1:0,x2:W-40,y1:y,y2:y,stroke:'var(--jk-hair)'}));var t=el('text',{x:W-36,y:y+4,'font-size':11,fill:'var(--jk-t2)'});t.textContent=fmt(Math.round(max*f));s.appendChild(t);});
    var bw=(W-40)/vals.length,w=Math.min(28,bw*.6);vals.forEach(function(v,i){var h=(H-pt-pb)*v/max,x=i*bw+(bw-w)/2;s.appendChild(el('rect',{x:x,y:H-pb-h,width:w,height:h,rx:Math.min(6,w/2),fill:i===vals.length-1?'none':'url(#jkg)',stroke:i===vals.length-1?'var(--jk-c-orange)':'none','stroke-dasharray':i===vals.length-1?'3 3':''}));
      if(i%5===0||i===vals.length-1){var t=el('text',{x:Math.max(10,Math.min(W-60,x+w/2)),y:H-6,'text-anchor':'middle','font-size':11,fill:'var(--jk-t2)'});t.textContent=i===vals.length-1?'oggi':'g'+(i+1);s.appendChild(t);}});
    box.textContent='';box.appendChild(s);
    JaackTip.scrub(box,vals.length,function(i){return '<span class="d">'+(i===vals.length-1?'oggi (parziale)':'giorno '+(i+1))+'</span><br>valore <b>'+fmt(vals[i])+'</b> <span class="d">· segnaposto</span>';});}
  function lineChart(box,vals){var W=box.clientWidth||600,H=Math.round(Math.max(160,Math.min(innerHeight*.27,W*.24,300))),pb=24,pt=12,mn=Math.min.apply(null,vals)-1,mx=Math.max.apply(null,vals)+1;
    var X=function(i){return i/(vals.length-1)*(W-48)},Y=function(v){return pt+(H-pt-pb)*(1-(v-mn)/(mx-mn))};
    var s=el('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H,role:'img','aria-label':'Grafico a linea di esempio con valori segnaposto'});
    [mn+1,(mn+mx)/2,mx-1].forEach(function(v){s.appendChild(el('line',{x1:0,x2:W-48,y1:Y(v),y2:Y(v),stroke:'var(--jk-hair)'}));var t=el('text',{x:W-44,y:Y(v)+4,'font-size':11,fill:'var(--jk-t2)'});t.textContent=v.toFixed(0);s.appendChild(t);});
    s.appendChild(el('path',{d:vals.map(function(v,i){return (i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)}).join(''),fill:'none',stroke:'var(--jk-c-green)','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'}));
    var last=vals.length-1;s.appendChild(el('circle',{cx:X(last),cy:Y(vals[last]),r:5,fill:'var(--jk-c-green)',stroke:'var(--jk-bg)','stroke-width':2}));
    box.textContent='';box.appendChild(s);
    JaackTip.scrub(box,vals.length,function(i){return '<span class="d">giorno '+(i+1)+'</span><br><b>'+vals[i].toFixed(1).replace('.',',')+'</b> <span class="d">· segnaposto</span>';});}
  function spark(box,vals,col){var W=box.clientWidth||200,H=72,mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals)||1;var s=el('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H,'aria-hidden':'true'});
    var bw=W/vals.length;vals.forEach(function(v,i){var h=8+(H-12)*(v-mn)/(mx-mn||1);s.appendChild(el('rect',{x:i*bw+bw*.2,y:H-h,width:bw*.6,height:h,rx:3,fill:col,opacity:i===vals.length-1?.45:1}));});box.textContent='';box.appendChild(s);}
  function draw(){var b=document.getElementById('demo-bars');if(b)barChart(b,bars);var l=document.getElementById('demo-line');if(l)lineChart(l,line.slice(-(+(l.dataset.p||90))));
    [].forEach.call(document.querySelectorAll('[data-spark]'),function(x,k){spark(x,bars.slice(k*7,k*7+7),k%2?'var(--jk-c-cyan)':'var(--jk-c-blue)');});}
  document.addEventListener('DOMContentLoaded',function(){
    draw();var lw=innerWidth;addEventListener('resize',function(){if(innerWidth!==lw){lw=innerWidth;draw();}});
    var per=document.getElementById('demo-period');if(per)JaackPill.init(per,function(v){var l=document.getElementById('demo-line');l.dataset.p=v;lineChart(l,line.slice(-Math.min(+v,line.length)));});
    var nav=document.getElementById('demo-nav');if(nav){var P=JaackPill.init(nav,function(v){var s=document.getElementById(v);if(s)scrollTo({top:s.getBoundingClientRect().top+scrollY-80,behavior:document.documentElement.classList.contains('jk-rm')?'auto':'smooth'});});
      addEventListener('scroll',function(){var at='c-1';['c-1','c-2','c-3'].forEach(function(id){var s=document.getElementById(id);if(s&&s.getBoundingClientRect().top<innerHeight*.45)at=id;});P.set(at);},{passive:true});}
  });
})();

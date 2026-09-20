// ===== scroll infrastructure (rect-based; works under CSS zoom, unlike IntersectionObserver) =====
  var scrollTasks=[], ticking=false;
  function runTasks(){ for(var i=0;i<scrollTasks.length;i++){ try{scrollTasks[i]();}catch(e){} } ticking=false; }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(runTasks); } }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  function addScrollTask(fn){ scrollTasks.push(fn); fn(); }
  function onEnter(el, frac, cb){
    var done=false;
    function check(){ if(done)return; var r=el.getBoundingClientRect(), vh=window.innerHeight; if(r.top < vh*frac && r.bottom > 0){ done=true; cb(); } }
    scrollTasks.push(check); check();
  }
  function splitWords(el){
    var text=el.textContent; el.textContent='';
    var frag=document.createDocumentFragment();
    text.split(/(\s+)/).forEach(function(w){
      if(w==='') return;
      if(/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
      else { var s=document.createElement('span'); s.className='fw'; s.textContent=w; frag.appendChild(s); }
    });
    el.appendChild(frag);
    return el.querySelectorAll('.fw');
  }
  function scrollProgress(el, startFrac, endFrac){
    var r=el.getBoundingClientRect(), vh=window.innerHeight;
    var sY=vh*startFrac, eY=vh*endFrac, p=(sY-r.top)/(sY-eY);
    return p<0?0:(p>1?1:p);
  }

  // ---- Marquee builder (seamless infinite scroll) ----
  var LABELS = ["LEAD VOCALS","BACKING VOCALS","LEAD GUITAR","RYTHM GUITAR","BASSIST","KEYBOARD","SYNTHESIZER","DRUM","MIXING","EFFECT","PIANO","VIOLIN"];
  function copyHtml(){
    var html = "";
    for(var i=0;i<LABELS.length;i++){
      html += '<p>'+LABELS[i]+'</p><img class="d" src="assets/dot.svg" alt=""/>';
    }
    return html;
  }
  function buildMarquee(el){
    // two identical copies so translateX(-50%) loops seamlessly
    var one = copyHtml();
    // repeat the set enough times to comfortably overflow, then duplicate for the loop
    var block = one + one + one;
    el.innerHTML = '<span class="mseg" style="display:flex;gap:12px;align-items:center">'+block+'</span>'
                 + '<span class="mseg" style="display:flex;gap:12px;align-items:center">'+block+'</span>';
    // keep gap between the two copies consistent
    el.style.gap = '12px';
  }
  document.querySelectorAll('[data-marquee]').forEach(buildMarquee);

  // ---- Class cards ----
  var CLASSES = [
    {lvl:"BEGINNER", nm:"Guitar Essentials", price:"$100", off:"-60%"},
    {lvl:"BEGINNER", nm:"Drum Performance", price:"$75", off:"-40%"},
    {lvl:"INTERMEDIATE", nm:"Vocal Performance", price:"$150", off:"-55%"},
    {lvl:"BEGINNER", nm:"Keyboard Foundations", price:"$120", off:"-70%"}
  ];
  var cc = document.getElementById('class-cards');
  if(cc){
    cc.innerHTML = CLASSES.map(function(c){
      return '<div class="card creveal">'
        +'<div class="img"><img src="assets/rect-34624749.png" alt=""/></div>'
        +'<div class="meta"><div class="lvl">'+c.lvl+'</div><div class="nm">'+c.nm+'</div></div>'
        +'<div class="join-btn"><span class="jt">Join — <b>'+c.price+'</b></span><span class="badge">'+c.off+'</span></div>'
        +'</div>';
    }).join('');
    // stagger reveal the class cards left->right once the row is actually visible
    var cards = cc.querySelectorAll('.card');
    onEnter(cc, 0.82, function(){ cards.forEach(function(card,i){ setTimeout(function(){ card.classList.add('in'); }, i*150); }); });
  }

  // ---- Responsive scale via zoom (native scroll + sticky works) ----
  var scaler = document.getElementById('scaler');
  function fit(){
    var w = document.documentElement.clientWidth;
    var scale = w / 1440;
    if(scale > 1) scale = 1;
    scaler.style.zoom = scale;
  }
  window.addEventListener('resize', fit);
  fit();

  // ---- Marquee: consistent slow speed everywhere; pause off-screen (perf) ----
  (function(){
    var tracks = document.querySelectorAll('.mtrack');
    tracks.forEach(function(tr){
      var seg = tr.querySelector('.mseg');
      var w = seg ? seg.offsetWidth : 0;              // layout width (rotation-proof)
      if(w > 0){ tr.style.animationDuration = Math.max(80, w/26) + 's'; }
    });
    scrollTasks.push(function(){
      var vh=window.innerHeight;
      tracks.forEach(function(tr){ var r=tr.getBoundingClientRect(); tr.style.animationPlayState=(r.bottom>-150 && r.top<vh+150)?'running':'paused'; });
    });
  })();

  // ---- Hero entrance ----
  requestAnimationFrame(function(){ document.body.classList.add('play'); });
  document.querySelectorAll('.anim,.anim-card,.anim-word,.anim-mem').forEach(function(el){
    el.addEventListener('animationend', function(){ el.classList.add('a-done'); });
  });

  // ---- Scroll reveal for later sections (rect-based, works under zoom) ----
  document.querySelectorAll('.reveal').forEach(function(el){ onEnter(el, 0.9, function(){ el.classList.add('in'); }); });

  // ================= SECTION 2 (LEARN) =================
  (function(){
    // (a) WHOLE paragraph fills grey -> white on scroll
    var h2=document.querySelector('.learn h2');
    if(h2){
      var fws=splitWords(h2), lastN=-1;
      addScrollTask(function(){
        var n=Math.round(scrollProgress(h2,0.85,0.4)*fws.length);
        if(n===lastN) return; lastN=n;
        for(var i=0;i<fws.length;i++) fws[i].style.color = i<n ? '#ffffff' : '#b2b2b2';
      });
    }

    // (b) smooth crossfade carousel + dots + auto every 5s
    var wrap=document.querySelector('.learn-imgwrap');
    var dotsWrap=document.querySelector('.learn-dots');
    if(wrap && dotsWrap){
      var ls=wrap.querySelectorAll('.learn-slide');
      var front=ls[0], back=ls[1];
      var IMAGES=['assets/rect-34624750.png','assets/rect-34624749.png','assets/showcase-circle.png','assets/hero-band.png'];
      IMAGES.forEach(function(s){ var im=new Image(); im.src=s; });
      var idx=0, timer=null;
      dotsWrap.innerHTML='';
      IMAGES.forEach(function(_,i){
        var d=document.createElement('div'); d.className='ldot'+(i===0?' on':'');
        d.addEventListener('click', function(){ go(i); restart(); });
        dotsWrap.appendChild(d);
      });
      var dots=dotsWrap.querySelectorAll('.ldot');
      function swap(){ back.style.opacity='1'; front.style.opacity='0'; var t=front; front=back; back=t; }
      function go(i){
        if(i===idx) return; idx=i;
        dots.forEach(function(d,j){ d.classList.toggle('on', j===i); });
        back.onload=swap; back.src=IMAGES[i];
        if(back.complete) swap();
      }
      function next(){ go((idx+1)%IMAGES.length); }
      function restart(){ if(timer) clearInterval(timer); timer=setInterval(next,5000); }
      restart();
    }

    // (c) infinity: neon line forms once (glow), not repeating
    var inf=document.querySelector('.draw-inf');
    if(inf){
      var len=900; try{ len=inf.getTotalLength(); }catch(e){}
      inf.style.strokeDasharray=len; inf.style.strokeDashoffset=len;
      inf.style.transition='stroke-dashoffset 2.2s cubic-bezier(.65,0,.35,1)';   // one smooth continuous trace
      var drawn=false;
      function drawInf(){
        if(drawn) return; drawn=true;
        void inf.getBoundingClientRect();
        inf.style.strokeDashoffset='0';                        // the neon line traces the whole figure-8 once
        setTimeout(function(){ inf.style.transition='fill-opacity .8s ease'; inf.style.fillOpacity='1'; }, 1900); // then fills in
      }
      onEnter(inf, 0.72, drawInf);
    }
  })();

  // ============ SECTION: HOW IT WORKS (pinned; scroll is GATED so every step must be seen) ============
  (function(){
    var pin=document.getElementById('how-pin');
    var sticky=document.querySelector('.how-sticky');
    var howEl=document.querySelector('.how');
    var h2=document.querySelector('.how-b h2');
    var fws = h2 ? splitWords(h2) : [];
    var steps=Array.prototype.slice.call(document.querySelectorAll('.how .step'));
    var desc=document.getElementById('how-desc');
    if(!pin||!sticky||!howEl) return;
    var NSTEP=steps.length;      // 4 steps
    var NSTAGE=NSTEP+1;          // stage 0 = paragraph fill, stages 1..NSTEP = each step
    var COOLDOWN=520;            // min time a stage stays before the gate opens to the next

    function sizePin(){ pin.style.height = (howEl.offsetHeight + 260*NSTAGE) + 'px'; }
    sizePin();
    window.addEventListener('resize', sizePin);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(sizePin);
    setTimeout(sizePin, 500);

    var lastN=-1, curActive=-2, gate=0, seen=-1, timer=null;
    function setFill(fp){ var n=Math.round(fp*fws.length); if(n===lastN) return; lastN=n; for(var i=0;i<fws.length;i++) fws[i].style.color = i<n ? '#111111' : '#777777'; }
    function setActive(a){ if(a===curActive) return; curActive=a; steps.forEach(function(s,i){ s.classList.toggle('active', i===a); }); if(desc && a>=0){ var d=steps[a].getAttribute('data-desc'); if(d) desc.textContent=d; } }

    addScrollTask(function(){
      var pr=pin.getBoundingClientRect(), sr=sticky.getBoundingClientRect();
      var range=pr.height - sr.height; if(range<=0) range=1;
      var p=(-pr.top)/range;
      if(p<=0){ setFill(0); setActive(-1); return; }         // above the section
      if(p>=1 && gate>=NSTAGE){ setFill(1); setActive(NSTEP-1); return; } // fully done -> released
      var seg=Math.floor(p*NSTAGE); if(seg<0)seg=0; if(seg>NSTAGE-1)seg=NSTAGE-1;
      // GATE: user may not scroll past the current stage until it has been shown for COOLDOWN
      if(seg>gate){
        var pMax=(gate+1)/NSTAGE - 0.0015;
        window.scrollTo(0, window.scrollY + (pMax - p)*range);   // hold them here
        seg=gate; p=pMax;
      }
      if(seg===0){ setFill(p*NSTAGE); setActive(-1); }          // paragraph fills as you scroll stage 0
      else { setFill(1); setActive(seg-1); }                    // then one step per stage
      // once a new stage is reached, open the gate to the next stage after a dwell
      if(seg>seen){
        seen=seg;
        if(timer) clearTimeout(timer);
        timer=setTimeout(function(){ if(gate<seg+1){ gate=seg+1; onScroll(); } }, COOLDOWN);
      }
    });
  })();

  // ================= CTA entrance (like hero) + FOOTER auto-fill =================
  (function(){
    var cta=document.querySelector('.cta');
    if(cta){ onEnter(cta, 0.8, function(){ cta.classList.add('in'); }); }
    var it=document.getElementById('impact-title');
    if(it){
      var fws=splitWords(it);
      function play(){ var n=0; var timer=setInterval(function(){
        n++; for(var i=0;i<fws.length;i++) fws[i].style.color = i<n ? '#ffffff' : '#b2b2b2';
        if(n>=fws.length) clearInterval(timer);
      }, 55); }
      onEnter(it, 0.85, play);
    }
  })();

  // ---- in-place crossfade slider (optional slide-in): content swaps smoothly; layout never moves ----
  function crossSlider(host, renderFn, count, onIndex, slide){
    var idx=0, busy=false;
    function mod(i){ return ((i%count)+count)%count; }
    host.innerHTML='';
    var a=document.createElement('div'), b=document.createElement('div');
    a.className='xlayer'; b.className='xlayer';
    host.appendChild(a); host.appendChild(b);
    a.innerHTML=renderFn(0); a.style.opacity='1'; a.style.pointerEvents='auto'; b.style.opacity='0'; b.style.pointerEvents='none';
    var front=a, back=b;
    if(onIndex) onIndex(0);
    var EASE='opacity .5s ease, transform .5s cubic-bezier(.22,.61,.36,1)';
    function go(ni, dir){
      if(busy || ni===idx) return; busy=true; idx=ni;
      back.innerHTML=renderFn(idx);
      if(slide){
        back.style.transition='none';
        back.style.transform='translateX('+(dir>0? slide : -slide)+'px)';
        back.style.opacity='0';
        void back.offsetWidth;                       // commit start state
        back.style.transition=EASE; front.style.transition=EASE;
        back.style.transform='translateX(0)';        // slide in + fade in
        front.style.transform='translateX('+(dir>0? -slide*0.5 : slide*0.5)+'px)';
      } else {
        void back.offsetWidth;
      }
      back.style.opacity='1'; back.style.pointerEvents='auto';
      front.style.opacity='0'; front.style.pointerEvents='none';
      var t=front; front=back; back=t;
      if(onIndex) onIndex(idx);
      setTimeout(function(){ if(slide){ back.style.transition='none'; back.style.transform='translateX(0)'; } busy=false; }, 520);
    }
    return {
      next:function(){ go(mod(idx+1), 1); },
      prev:function(){ go(mod(idx-1), -1); },
      to:function(i){ i=mod(i); go(i, i>=idx?1:-1); }
    };
  }

  // ================= SHOWCASE gallery (crossfade in place) =================
  (function(){
    var host=document.getElementById('gal-imgs');
    var prev=document.getElementById('gal-prev'), next=document.getElementById('gal-next');
    if(!host||!prev||!next) return;
    var POOL=['assets/rect-34624749.png','assets/rect-34624750.png','assets/showcase-circle.png','assets/hero-band.png','assets/impact-card.png'];
    POOL.forEach(function(s){ new Image().src=s; });
    var W=[300,450,300];
    function m(n){ return ((n%POOL.length)+POOL.length)%POOL.length; }
    function page(i){
      var h='';
      for(var s=0;s<3;s++){ h+='<div class="g" style="width:'+W[s]+'px"><img src="'+POOL[m(i+s)]+'" alt=""></div>'; }
      return h;
    }
    var S=crossSlider(host, page, POOL.length, null, 90);   // slide-in + fade
    prev.addEventListener('click', S.prev); next.addEventListener('click', S.next);
  })();

  // ================= BLOGS (crossfade in place; 2 cards, 2nd mirrored) =================
  (function(){
    var host=document.getElementById('blog-cards');
    var prev=document.getElementById('blog-prev'), next=document.getElementById('blog-next');
    var dotsWrap=document.querySelector('.blog-dots');
    if(!host||!prev||!next) return;
    var BLOGS=[
      {date:"SEP 16, 2026", author:"LUKMAN HAKIM", title:"How to Practice an Instrument Without Getting Bored", a:"assets/rect-34624749.png"},
      {date:"OCT 02, 2026", author:"RINA PUTRI", title:"Finding Your Sound: A Beginner's Guide to Tone", a:"assets/rect-34624750.png"},
      {date:"OCT 20, 2026", author:"DAVE KUSUMA", title:"Why Playing in a Band Makes You Improve Faster", a:"assets/showcase-circle.png"},
      {date:"NOV 05, 2026", author:"MIXROOM CREW", title:"Five Warm-Ups Every Musician Should Know by Heart", a:"assets/hero-band.png"}
    ];
    BLOGS.forEach(function(x){ new Image().src=x.a; });
    function card(x, mirror){
      var content='<div class="content">'
        +'<div class="date"><span class="dt">'+x.date+'</span><img class="sc" src="assets/blog-scribble.svg" alt=""></div>'
        +'<div class="foot"><div class="badge">'+x.author+'</div><div class="ttl">'+x.title+'</div></div></div>';
      var thumb='<div class="thumb"><img src="'+x.a+'" alt=""></div>';
      return '<a href="blog-detail.html" class="bcard'+(mirror?' mirror':'')+'">'+content+thumb+'</a>';
    }
    function page(i){ return card(BLOGS[i], false) + card(BLOGS[(i+1)%BLOGS.length], true); }
    var dots=[];
    if(dotsWrap){
      dotsWrap.innerHTML='';
      BLOGS.forEach(function(_,i){ var d=document.createElement('div'); d.className='bdot'; d.addEventListener('click', function(){ S.to(i); }); dotsWrap.appendChild(d); });
      dots=dotsWrap.querySelectorAll('.bdot');
    }
    var S=crossSlider(host, page, BLOGS.length, function(i){ dots.forEach(function(d,j){ d.classList.toggle('on', j===i); }); });
    prev.addEventListener('click', S.prev); next.addEventListener('click', S.next);
  })();

  // sticky navbar shadow once the page is scrolled
  (function(){
    var nav=document.querySelector('.nav');
    if(nav) scrollTasks.push(function(){ nav.classList.toggle('nav-stuck', window.scrollY > 4); });
  })();

  // re-check all scroll tasks after full load & once images settle (layout can shift positions)
  window.addEventListener('load', runTasks);
  setTimeout(runTasks, 400); setTimeout(runTasks, 1200);

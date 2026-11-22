(function(){
 var D=document,H=D.documentElement;

 // Clean InfinityFree ?i=1 / ?i=2 verification parameter from URL bar
 if (window.location.search.includes('i=')) {
  var clean = window.location.origin + window.location.pathname;
  window.history.replaceState({ path: clean }, '', clean);
 }

 // mobile menu
 var bg=D.querySelector('.burger'),ln=D.querySelector('.links');
 if(bg)bg.addEventListener('click',function(){var o=ln.classList.toggle('open');bg.setAttribute('aria-expanded',o)});

 // ---------- animations (GSAP + ScrollTrigger, with a plain fallback) ----------
 var els=[].slice.call(D.querySelectorAll('.rv'));
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(window.gsap&&window.ScrollTrigger&&!reduce){animate()}else{fallback()}

 function fallback(){
  if('IntersectionObserver' in window){
   var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});
   els.forEach(function(el){io.observe(el)});
  }else els.forEach(function(el){el.classList.add('in')});
 }
 function split(el,units){
  [].slice.call(el.childNodes).forEach(function(n){
   if(n.nodeType===3){
    var f=D.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(function(t){
     if(!t)return;
     if(/^\s+$/.test(t)){f.appendChild(D.createTextNode(' '));return}
     var s=D.createElement('span');s.className='w';s.textContent=t;f.appendChild(s);units.push(s);
    });
    el.replaceChild(f,n);
   }else if(n.nodeType===1){n.classList.add('w');units.push(n)}
  });
 }
 function animate(){
  gsap.registerPlugin(ScrollTrigger);
  H.classList.add('gs');
  var tilts=[0,0,0,0];
  function tl(el){
   if(el.classList.contains('photo'))return 0;
   if(el.classList.contains('tile')&&el.parentNode.classList.contains('bento'))return tilts[[].indexOf.call(el.parentNode.children,el)%4];
   return 0;
  }
  // navbar drop-in + scroll progress bar
  gsap.from('.nav',{y:-90,opacity:0,duration:.9,ease:'back.out(1.4)'});
  var pg=D.createElement('div');pg.className='pg';D.body.appendChild(pg);
  gsap.set(pg,{scaleX:0});
  gsap.to(pg,{scaleX:1,ease:'none',scrollTrigger:{trigger:D.body,start:'top top',end:'bottom bottom',scrub:.3}});
  // hero intro timeline
  var hero=D.querySelector('.hero');
  if(hero){
   var h1=hero.querySelector('h1'),units=[];
   if(h1)split(h1,units);
   gsap.set(hero.querySelectorAll('.rv'),{opacity:1});
   var tag=hero.querySelector('.tag'),p=hero.querySelector('p'),bt=hero.querySelectorAll('.btn'),ph=hero.querySelector('.photo');
   var t=gsap.timeline({defaults:{ease:'power3.out'},delay:.2});
   if(tag)t.from(tag,{y:20,opacity:0,rotation:-8,duration:.6});
   if(units.length)t.from(units,{y:80,opacity:0,duration:.8,stagger:.07},'-=.3');
   if(p)t.from(p,{y:25,opacity:0,duration:.7},'-=.4');
   if(bt.length)t.from(bt,{y:25,opacity:0,scale:.8,duration:.6,stagger:.1,ease:'back.out(1.7)'},'-=.4');
   if(ph){
    t.fromTo(ph,{opacity:1,clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:1.3,ease:'power4.inOut'},.3);
    gsap.to(ph,{y:-40,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
   }
  }
  // scroll-triggered reveal for everything else
  var rest=els.filter(function(e){return !(hero&&hero.contains(e))});
  gsap.set(rest,{opacity:0});
  ScrollTrigger.batch(rest,{start:'top 90%',once:true,onEnter:function(b){
   gsap.fromTo(b,{opacity:0,y:60,scale:.94,rotation:0},
    {opacity:1,y:0,scale:1,rotation:0,duration:.9,stagger:.1,ease:'power3.out',overwrite:true});
  }});
  // count-up numbers
  D.querySelectorAll('.stat b').forEach(function(b){
   var m=b.textContent.match(/(\d+)(\D*)/);if(!m)return;
   var o={v:0},n=+m[1];b.textContent='0'+m[2];
   ScrollTrigger.create({trigger:b,start:'top 92%',once:true,onEnter:function(){
    gsap.to(o,{v:n,duration:1.6,ease:'power2.out',onUpdate:function(){b.textContent=Math.round(o.v)+m[2]}});
   }});
  });
  // mouse effects (desktop only): 3D card tilt + magnetic buttons
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
   D.querySelectorAll('.bento .tile').forEach(function(c){
    c.addEventListener('mousemove',function(e){
     var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
     gsap.to(c,{rotationY:x*3,rotationX:-y*3,y:-4,transformPerspective:800,duration:.4,ease:'power2.out',overwrite:'auto'});
    });
    c.addEventListener('mouseleave',function(){gsap.to(c,{rotationX:0,rotationY:0,y:0,duration:.8,ease:'elastic.out(1,.5)',overwrite:'auto'})});
   });
   D.querySelectorAll('.btn').forEach(function(b){
    b.addEventListener('mousemove',function(e){
     var r=b.getBoundingClientRect();
     gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.3,overwrite:'auto'});
    });
    b.addEventListener('mouseleave',function(){gsap.to(b,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'})});
   });
  }
  window.addEventListener('load',function(){ScrollTrigger.refresh()});
 }

 // ---------- toast notification popup ----------
 var t=D.getElementById('toast'),tm=D.getElementById('toastMsg'),tx=D.getElementById('toastX'),timer;
 function toast(msg,err){
  if(!t||!tm)return;
  tm.textContent=msg;
  t.classList.toggle('err',!!err);
  t.hidden=false;
  clearTimeout(timer);
  timer=setTimeout(function(){t.hidden=true},8000);
 }
 if(tx)tx.addEventListener('click',function(){t.hidden=true;clearTimeout(timer)});

 if(/[?&]sent=1/.test(location.search)){
  toast('Your message has been sent successfully. I will get back to you soon!');
  history.replaceState(null,'',location.pathname);
 }

 // ---------- contact form (Formboost AJAX - No redirect) ----------
 var f=D.getElementById('cf');
 if(f)f.addEventListener('submit',function(e){
  e.preventDefault();

  // Bot check: ignore if honeypot was touched
  var hp=f.querySelector('input[name="_gotcha"]');
  if(hp&&hp.value!==''){
   toast('Your message has been sent successfully. I will get back to you soon!');
   f.reset();
   return;
  }

  var b=f.querySelector('button[type=submit]'),old=b.textContent;
  b.disabled=true;
  b.textContent='Sending...';

  // Format form values as a JSON payload for Formboost
  var data={};
  new FormData(f).forEach(function(val,key){
   if(key!=='_gotcha') data[key]=val;
  });

  // Save lead locally to MZWeb Lead CRM
  try {
   var existingLeads = JSON.parse(localStorage.getItem('mzweb_leads') || '[]');
   var newLead = {
    id: 'lead_' + Date.now(),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    name: data.name || 'Anonymous',
    email: data.email || 'N/A',
    phone: data.phone || 'N/A',
    service: data.service || 'General Inquiry',
    message: data.message || '',
    stage: 'New Lead',
    callMade: false,
    callNotes: '',
    responseReceived: '',
    projectAssigned: '',
    projectStage: 'Inquiry Received',
    notes: ''
   };
   existingLeads.unshift(newLead);
   localStorage.setItem('mzweb_leads', JSON.stringify(existingLeads));
  } catch(err) {
   console.warn('LocalStorage error:', err);
  }

  var ac=new AbortController(),to=setTimeout(function(){ac.abort()},15000);

  fetch(f.dataset.endpoint||f.action,{
   method:'POST',
   headers:{
    'Content-Type':'application/json',
    'Accept':'application/json'
   },
   body:JSON.stringify(data),
   signal:ac.signal
  })
  .then(function(r){
   return r.json().catch(function(){return {}});
  })
  .then(function(d){
   // Check if Formboost completed successfully
   if(d.success===true||d.success==='true'||d.status==='success'||!d.error){
    toast('Your message has been sent successfully. I will get back to you soon!');
    f.reset();
   } else {
    toast('Error submitting your form, please email directly.',true);
   }
  })
  .catch(function(err){
   // Show the error popup instead of redirecting the page
   toast('Error submitting your form, please email directly.',true);
  })
  .finally(function(){
   clearTimeout(to);
   b.disabled=false;
   b.textContent=old;
  });
 });
})();
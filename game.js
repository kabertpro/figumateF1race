(()=>{
const CFG={TIME:240,ENERGY:100,SPEED:34,HIT:15,WRONG_T:4,SHOTS:[3,4,5,6,9]};
const $=i=>document.getElementById(i),L=[-3.2,0,3.2],rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
const mob=/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:!mob});R.setPixelRatio(Math.min(devicePixelRatio,mob?1.25:1.75));
const S=new THREE.Scene();S.background=new THREE.Color(0x0a0620);S.fog=new THREE.Fog(0x0a0620,40,150);
const cam=new THREE.PerspectiveCamera(65,1,.1,300);
S.add(new THREE.HemisphereLight(0xaaccff,0x331155,1.2));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(5,10,6);S.add(dl);
const resize=()=>{R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();};addEventListener('resize',resize);resize();
const M=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0});
const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);

/* ---------- AUDIO ---------- */
const A={x:null,m:.5,s:.7,mute:false};
function ctx(){if(!A.x)A.x=new(window.AudioContext||window.webkitAudioContext)();if(A.x.state==='suspended')A.x.resume();return A.x;}
function tone(f,d,ty,v,ch,dl=0,f2){if(A.mute||!A.x)return;const x=A.x,o=x.createOscillator(),g=x.createGain(),t=x.currentTime+dl,vol=Math.max(v*(ch==='m'?A.m:A.s),.0001);o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(x.destination);o.start(t);o.stop(t+d);}
const SFX={shot:()=>tone(900,.15,'square',.12,'s',0,200),hit:()=>tone(160,.3,'sawtooth',.25,'s',0,50),coin:()=>{tone(660,.1,'triangle',.2,'s');tone(990,.15,'triangle',.2,'s',.08)},ok:()=>[523,659,784].forEach((f,i)=>tone(f,.2,'triangle',.25,'s',i*.1)),bad:()=>tone(200,.35,'sawtooth',.2,'s',0,100),boom:()=>tone(120,.6,'sawtooth',.35,'s',0,30),beep:()=>tone(440,.15,'square',.15,'s'),go:()=>tone(880,.4,'square',.2,'s')};
const NOTES=[110,110,165,110,131,131,196,131,98,98,147,98,123,123,185,123];let ms=0;
setInterval(()=>{if(!['menu','count','play','end'].includes(st)||A.mute||!A.x)return;const n=NOTES[ms%16];tone(n,.2,'sawtooth',.08,'m');if(ms%2==0)tone(n*4,.1,'square',.04,'m');ms++;},230);
document.querySelectorAll('.vm').forEach(e=>e.oninput=()=>{A.m=+e.value;document.querySelectorAll('.vm').forEach(o=>o.value=e.value)});
document.querySelectorAll('.vs').forEach(e=>e.oninput=()=>{A.s=+e.value;document.querySelectorAll('.vs').forEach(o=>o.value=e.value)});
document.querySelectorAll('.mt').forEach(e=>e.onclick=()=>{A.mute=!A.mute;document.querySelectorAll('.mt').forEach(o=>o.textContent=A.mute?'🔇':'🔈')});

/* ---------- MODELOS ---------- */
function car(c,boss){const g=new THREE.Group();
 const b=box(1.8,.6,3.4,M(c,boss?0x550000:0x111111));b.position.y=.55;g.add(b);
 const t=box(1.3,.5,1.4,M(0x222233,0x113355));t.position.set(0,1.05,.3);g.add(t);
 const sp=box(2,.1,.5,M(c));sp.position.set(0,1.1,1.5);g.add(sp);
 const gl=box(1.6,.12,.2,M(0xffffff,0x00e5ff));gl.position.set(0,.55,-1.7);g.add(gl);
 for(const x of[-.95,.95])for(const z of[-1.1,1.1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.35,10),M(0x111111));w.rotation.z=Math.PI/2;w.position.set(x,.4,z);g.add(w);}
 if(boss){const h=box(.3,.8,.3,M(0xff0000,0xff0000));h.position.set(0,1.6,.3);g.add(h);}
 return g;}
const player=car(0x00e5ff);S.add(player);
const ECOL=[0xff3355,0xffaa00,0x33ff88,0xaa44ff,0x990000],ENAME=['Rojo Rayo','Naranja Turbo','Verde Veloz','Violeta Veneno','JEFE FINAL'];
const EN=ECOL.map((c,i)=>{const g=car(c,i==4);g.userData.s=i==4?1.4:1;g.scale.setScalar(g.userData.s);g.visible=false;S.add(g);return g;});
// carretera
const road=box(13,.2,400,M(0x15122e,0x07051a));road.position.set(0,-.1,-150);S.add(road);
for(const x of[-6.6,6.6]){const e=box(.3,.3,400,M(0xff3df2,0xff3df2));e.position.set(x,0,-150);S.add(e);}
const SC=[];const add=(m,span,k,max=15)=>{S.add(m);SC.push({m,span,k,max});};
for(const x of[-1.6,1.6])for(let i=0;i<20;i++){const d=box(.25,.05,3,M(0xffffff,0x888888));d.position.set(x,.02,-i*10+10);add(d,200,1);}
for(const s of[-1,1])for(let i=0;i<14;i++){const g=new THREE.Group();g.add(box(.3,5,.3,M(0x334))).position.y=2.5;const l=box(.8,.3,.8,M(0xffd400,0xffaa00));l.position.y=5;g.add(l);g.position.set(s*7.6,0,-i*14+14);add(g,196,1);}
for(const s of[-1,1])for(let i=0;i<16;i++){const h=rnd(4,22),b=box(rnd(3,6),h,rnd(3,6),M(pick([0x2a1a6e,0x0d3b66,0x5a1a6e]),pick([0x110033,0x002244,0x330044])));b.position.set(s*rnd(11,22),h/2,-i*12+12);add(b,192,1);}
for(let i=0;i<24;i++){const b=box(.05,.05,3,new THREE.MeshBasicMaterial({color:0x99ddff}));b.position.set(rnd(-9,9),rnd(.5,5),-rnd(0,120));add(b,120,1.8);}

/* ---------- PARTÍCULAS Y POOLS ---------- */
const PT=[];for(let i=0;i<60;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,.25),new THREE.MeshBasicMaterial());m.visible=false;S.add(m);PT.push({m,v:new THREE.Vector3(),l:0});}let pi=0;
function burst(p,c,n,sp){for(let i=0;i<n;i++){const q=PT[pi++%60];q.m.position.copy(p);q.m.material.color.setHex(c);q.v.set(rnd(-1,1),rnd(0,1),rnd(-1,1)).multiplyScalar(sp);q.l=rnd(.4,.9);q.m.visible=true;}}
const GEO={};const free=[[],[],[],[],[],[]];
const OT=[{h:.9,hw:1.3},{h:2.2,hw:.9},{h:1.1,hw:1},{h:2.6,hw:1.2},{h:1.2,hw:.7},{h:.9,hw:.8}];
function mkObs(t){if(free[t].length)return free[t].pop();let m;
 if(t==0)m=box(2.6,.9,.5,M(0xff8a00,0xaa4400));else if(t==1)m=box(1.8,2.2,1.8,M(0x9a6a2a,0x331a00));else if(t==2){m=new THREE.Mesh(new THREE.DodecahedronGeometry(1),M(0x777788));m.scale.y=.9;}
 else if(t==3)m=box(2.4,2.6,1.2,M(0x2266ff,0x0033aa));else if(t==4)m=box(1.4,1.2,1.4,M(0xff3df2,0xaa00aa));else m=new THREE.Mesh(new THREE.OctahedronGeometry(.9),M(0xff0000,0xff0000));
 S.add(m);return m;}
const obs=[],pus=[],bul=[];
const bm=new THREE.Mesh(new THREE.SphereGeometry(.35,6,6),new THREE.MeshBasicMaterial({color:0xffee55}));
const starG=new THREE.OctahedronGeometry(.8),starM=M(0xffd400,0xffaa00);
function spawnObs(t,lane,z){const m=mkObs(t);m.visible=true;m.position.set(L[lane],t==2?.9:OT[t].h/2,z);obs.push({m,t,h:OT[t].h,hw:OT[t].hw,lane,ph:rnd(0,6),done:false});}
// meta
const gate=new THREE.Group();{const c=document.createElement('canvas');c.width=128;c.height=32;const g=c.getContext('2d');for(let i=0;i<16;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#fff':'#111';g.fillRect(i*8,j*8,8,8);}
 const tx=new THREE.CanvasTexture(c);const b=new THREE.Mesh(new THREE.BoxGeometry(14,2,.4),new THREE.MeshBasicMaterial({map:tx}));b.position.y=6;gate.add(b);
 for(const x of[-6.8,6.8]){const p=box(.6,7,.6,M(0xffd400,0xffaa00));p.position.set(x,3.5,0);gate.add(p);}gate.visible=false;S.add(gate);}

/* ---------- ESTADO ---------- */
let st='load',T=0,name='',score=0,timeLeft=0,elapsed=0,energy=0,charges=0,kills=0,right=0,wrong=0,hits=0,maxLv=1,fin=false,slow=1,shk=0,inv=0;
let lane=1,px=0,py=0,vy=0,mvCD=0,fireCD=0,spT=1,puT=4,cdT=0,deadT=0,hudT=0,held={},q=null;
let en=null,LV=1;try{LV=Math.min(20,Math.max(1,+localStorage.getItem('figumate_lv')||1));}catch(e){}
const D=()=>(LV-1)/19;
const pickType=()=>{const a=[0,2];if(LV>=2)a.push(1);if(LV>=4)a.push(3);if(LV>=7)a.push(4);if(LV>=10)a.push(4,3,1);return pick(a);};
const ui=(id,on)=>$(id).classList[on?'add':'remove']('show');
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.remove('go');void e.offsetWidth;e.classList.add('go');};
function show(id){['load','menu','howbox','quiz','pause','end'].forEach(i=>ui(i,i===id));}
function spawnEnemy(i){const g=EN[i];g.visible=true;g.position.set(0,0,-110);en={i,g,hp:CFG.SHOTS[i]+Math.floor(D()*3),max:CFG.SHOTS[i]+Math.floor(D()*3),lane:1,laneT:2,trapT:2.5,pulse:0,alive:true};$('ebn').textContent='👾 '+ENAME[i];$('ef').style.width='100%';}
function clearWorld(){for(const o of obs){o.m.visible=false;free[o.t].push(o.m);}obs.length=0;for(const p of pus)S.remove(p.m);pus.length=0;for(const b of bul)S.remove(b.m);bul.length=0;gate.visible=false;EN.forEach(e=>e.visible=false);PT.forEach(p=>p.m.visible=false);}
function newGame(){clearWorld();score=0;timeLeft=CFG.TIME;elapsed=0;energy=CFG.ENERGY;charges=0;kills=0;right=wrong=hits=0;maxLv=LV;fin=false;slow=1;shk=0;inv=0;lane=1;px=0;py=vy=0;spT=1.5;puT=3;deadT=0;held={};
 spawnEnemy(0);show('');ui('hud',1);ui('ctrl',1);st='count';cdT=3.99;hud();
 try{const e=document.documentElement;if(!document.fullscreenElement&&e.requestFullscreen)e.requestFullscreen().then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})).catch(()=>{});}catch(e){}}
function toMenu(){clearWorld();ui('hud',0);ui('ctrl',0);show('menu');st='menu';EN.forEach((g,i)=>{g.visible=true;g.position.set(L[i%3]*(i==4?0:1),0,-14-i*9);});}
function hud(){$('hn').textContent=name;$('hl').textContent='Nivel '+LV+' · 👾'+Math.min(5,kills+1)+'/5';$('ht').textContent='⏱ '+Math.max(0,Math.ceil(timeLeft));$('hs').textContent='★ '+score;$('hc').textContent='⚡ '+charges;
 $('he').textContent='🔧';$('ee').style.width=Math.max(0,energy/CFG.ENERGY*100)+'%';if(en)$('ef').style.width=Math.max(0,en.hp/en.max*100)+'%';}
const addScore=n=>{score=Math.max(0,score+n);};

/* ---------- QUIZ ---------- */
function startQuiz(){st='quiz';held={};$('c').classList.add('frz');const lv=LV;q=makeQuestion(lv);
 $('qh').textContent='⏸ Tiempo congelado · Nivel '+lv+' — ¿Cuánto suman estas '+q.figs.length+' figuras?';
 $('qf').innerHTML=q.figs.map(k=>'<div class="fc"><img src="'+(URLS[k]||'figuras/'+k+'.png')+'" alt="'+k+'"></div>').join('');
 $('qa').innerHTML='';q.opts.forEach(v=>{const b=document.createElement('button');b.textContent=v;b.onclick=()=>answer(b,v);$('qa').appendChild(b);});show('quiz');}
function answer(b,v){const bs=[...$('qa').children];bs.forEach(x=>x.disabled=true);
 if(v===q.sum){b.classList.add('ok');right++;charges++;addScore(100);SFX.ok();}else{b.classList.add('no');wrong++;timeLeft-=CFG.WRONG_T;SFX.bad();bs.find(x=>+x.textContent===q.sum).classList.add('ok');}
 setTimeout(()=>{if(st!=='quiz')return;show('');$('c').classList.remove('frz');st='play';toast(v===q.sum?'¡Correcto! +1 disparo ⚡':'Era '+q.sum+' · −'+CFG.WRONG_T+'s');},v===q.sum?800:1500);}

/* ---------- ACCIONES ---------- */
function hurt(){hits++;energy-=Math.round(10+10*D());addScore(-30);slow=.4;shk=.6;inv=1.2;$('flash').classList.remove('go');void $('flash').offsetWidth;$('flash').classList.add('go');SFX.hit();burst(new THREE.Vector3(px,1,0),0xffaa00,14,6);}
function fire(){if(st!=='play'||fireCD>0)return;if(!en||!en.alive){return;}if(charges<=0){toast('¡Recoge ⭐ para tener disparos!');fireCD=.5;return;}
 charges--;fireCD=.25;const m=bm.clone();m.position.set(px,.9,-2);S.add(m);bul.push({m,l:1.4});SFX.shot();}
function jump(){if(st==='play'&&py<=0){vy=11.5;}}
function killEnemy(){en.alive=false;en.g.visible=false;burst(new THREE.Vector3(en.g.position.x,1,en.g.position.z),0xff6600,40,10);SFX.boom();shk=.8;addScore(500);kills++;deadT=1.8;toast('¡Enemigo destruido! +500');}
function pause(){if(st==='play'){st='pause';held={};show('pause');if(A.x)A.x.suspend();}}
function resume(){if(st==='pause'){st='play';show('');if(A.x)A.x.resume();}}
function end(win){st='end';held={};ui('ctrl',0);ui('hud',0);$('c').classList.remove('frz');let bonus=0;
 if(win){bonus=Math.round(timeLeft)*2+(hits==0?300:0);score+=bonus;}
 const acc=right+wrong?right/(right+wrong):.5,perf=.45*acc+.3*Math.max(0,timeLeft/CFG.TIME)+.25*Math.max(0,1-hits/8);
 const medal=perf>=.72?'🥇 Oro':perf>=.5?'🥈 Plata':'🥉 Bronce';let best=0;try{best=+localStorage.getItem('figumate_best')||0;if(score>best){best=score;localStorage.setItem('figumate_best',best);}}catch(e){}
 $('etitle').textContent=win?'¡MISIÓN CUMPLIDA!':'¡Casi lo logras!';
 $('emedal').textContent=win?medal.slice(0,2):'💪';
 $('esub').textContent=win?name+', ¡eres un campeón del ritmo! '+medal:(timeLeft<=0?'Se acabó el tiempo, ¡pero cada carrera te hace mejor, '+name+'!':'Tu vehículo necesita un respiro. ¡Inténtalo de nuevo, '+name+'!');
 $('estats').innerHTML='<span>Puntuación: <b>'+score+'</b></span><span>Mejor: <b>'+best+'</b></span><span>Tiempo: <b>'+Math.round(elapsed)+'s</b></span><span>Enemigos: <b>'+kills+'/5</b></span><span>Correctas: <b>'+right+'</b></span><span>Incorrectas: <b>'+wrong+'</b></span><span>Nivel: <b>'+LV+'</b></span><span>Colisiones: <b>'+hits+'</b></span>'+(win?'<span>Bono: <b>+'+bonus+'</b></span>':'');
 $('eb1').textContent=win?'VOLVER A JUGAR':'INTENTAR DE NUEVO';$('eb2').textContent=win?'NUEVA PARTIDA':'MENÚ';
 $('conf').innerHTML=win?Array.from({length:60},()=>'<i style="left:'+rnd(0,100)+'%;background:hsl('+rnd(0,360)+',90%,60%);animation-duration:'+rnd(2,5)+'s;animation-delay:'+rnd(0,3)+'s"></i>').join(''):'';
 $('eb2').onclick=toMenu;show('end');if(win)for(let i=0;i<4;i++)setTimeout(()=>{burst(new THREE.Vector3(rnd(-4,4),3,-8),pick([0xffd400,0xff3df2,0x00e5ff]),15,8);SFX.coin();},i*300);}

/* ---------- ENTRADAS ---------- */
const KM={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ControlLeft:'fire',ControlRight:'fire',KeyX:'fire'};
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code)&&st==='play')e.preventDefault();
 if(e.code==='Escape'||e.code==='KeyP'){st==='pause'?resume():pause();return;}
 if(e.code==='Space'||e.code==='ArrowUp'){jump();return;}const k=KM[e.code];if(k){if(!held[k])mvCD=0;held[k]=true;}});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)held[k]=false;});
[['bl','left'],['br','right'],['bf','fire'],['bj','jump']].forEach(([id,k])=>{const b=$(id);
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('on');if(k==='jump')jump();else{held[k]=true;mvCD=0;}});
 const up=()=>{b.classList.remove('on');if(k!=='jump')held[k]=false;};['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,up));});
document.addEventListener('contextmenu',e=>e.preventDefault());
// selector de nivel
const lg=$('lvsel');for(let l=1;l<=20;l++){const b=document.createElement('button');b.textContent=l;b.onclick=()=>selLv(l);lg.appendChild(b);}
function selLv(l){LV=l;try{localStorage.setItem('figumate_lv',l);}catch(e){}[...lg.children].forEach((b,i)=>b.classList.toggle('sel',i+1===l));$('lvd').textContent='Nivel '+l+': '+LV_DESC[l]+(l>1?' · obstáculos '+(l<5?'fáciles':l<10?'medios':l<15?'difíciles':'extremos'):' · obstáculos suaves');}
selLv(LV);
$('play').onclick=()=>{name=$('pname').value.trim();if(!name){$('pname').focus();$('pname').style.borderColor='#f33';return;}ctx();newGame();};
$('how').onclick=()=>ui('howbox',1);$('howok').onclick=()=>ui('howbox',0);
$('pbtn').onclick=pause;$('pres').onclick=resume;$('prest').onclick=()=>{if(A.x)A.x.resume();newGame();};$('eb1').onclick=newGame;
$('fs').onclick=()=>{const d=document,e=d.documentElement;if(d.fullscreenElement)d.exitFullscreen();else if(e.requestFullscreen)e.requestFullscreen().then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})).catch(()=>{});};
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();if(A.x)A.x.suspend();}else if(A.x&&st!=='pause')A.x.resume();});

/* ---------- BUCLE ---------- */
function scroll(d){for(const s of SC){const p=s.m.position;p.z+=d*s.k;if(p.z>s.max)p.z-=s.span;}
 for(let i=obs.length-1;i>=0;i--){const o=obs[i];o.m.position.z+=d;if(o.m.position.z>8){o.m.visible=false;free[o.t].push(o.m);obs.splice(i,1);}}
 for(let i=pus.length-1;i>=0;i--){const p=pus[i];p.m.position.z+=d;if(p.m.position.z>8){S.remove(p.m);pus.splice(i,1);}}
 if(gate.visible)gate.position.z+=d;}
function update(dt){T+=dt;
 if(st==='pause'||st==='quiz'||st==='load')return;
 if(st==='menu'||st==='end'){scroll(7*dt);cam.position.set(Math.sin(T*.5)*7,2.8,Math.cos(T*.5)*3+7);cam.lookAt(0,1.2,-14);player.position.set(0,0,0);player.visible=true;return;}
 if(st==='count'){const p=Math.ceil(cdT);cdT-=dt;const n=Math.ceil(cdT);const e=$('cd');e.classList.add('show');if(n!==p||e.textContent===''){e.textContent=n>0?n:'¡CORRE!';(n>0?SFX.beep:SFX.go)();}
  if(cdT<=0){e.classList.remove('show');e.textContent='';st='play';}scroll(10*dt);}
 else{
 elapsed+=dt;timeLeft-=dt;if(timeLeft<=0){timeLeft=0;return end(false);}
 slow=Math.min(1,slow+dt*1.1);const sp=CFG.SPEED*(1+.5*D())*slow*(1+.04*kills);scroll(sp*dt);
 // jugador
 mvCD-=dt;fireCD-=dt;inv-=dt;
 if(mvCD<=0&&(held.left||held.right)){if(held.left)lane=Math.max(0,lane-1);else lane=Math.min(2,lane+1);mvCD=.22;}
 if(held.fire)fire();
 px+=(L[lane]-px)*Math.min(1,12*dt);if(py>0||vy>0){vy-=32*dt;py+=vy*dt;if(py<=0){py=vy=0;burst(new THREE.Vector3(px,.1,0),0xcccccc,5,3);}}
 // enemigo
 if(en&&en.alive){const g=en.g;en.laneT-=dt;if(en.laneT<=0){en.lane=(Math.random()*3)|0;en.laneT=(rnd(1,2.6)-en.i*.15)*(1-.35*D());}
  g.position.x+=(L[en.lane]-g.position.x)*Math.min(1,3*dt);const tz=-34+Math.sin(T*.7+en.i)*7;g.position.z+=(tz-g.position.z)*Math.min(1,2*dt);
  en.pulse=Math.max(0,en.pulse-dt);g.scale.setScalar(g.userData.s*(1+en.pulse));
  en.trapT-=dt;if(en.trapT<=0){en.trapT=[3.6,3.1,2.7,2.3,1.8][en.i]*(1-.4*D());spawnObs(5,en.lane,g.position.z+3);burst(g.position,0xff3300,6,3);}}
 else if(deadT>0&&!fin){deadT-=dt;if(deadT<=0){if(kills<5)spawnEnemy(kills);else{fin=true;en=null;gate.visible=true;gate.position.z=-170;toast('¡A LA META! 🏁');}}}
 // generación
 spT-=dt;if(spT<=0&&!(fin&&gate.position.z>-45)){spT=rnd(.8,1.4)*(1-.45*D())/(1+.05*kills);const ls=shuffle([0,1,2]).slice(0,Math.random()<.12+.4*D()?2:1);for(const l of ls)spawnObs(pickType(),l,-150);}
 puT-=dt;if(puT<=0&&!fin){puT=rnd(4.5,6.5);const m=new THREE.Mesh(starG,starM);m.position.set(L[Math.random()*3|0],1.2,-150);S.add(m);pus.push({m});}
 // obstáculos
 for(const o of obs){const p=o.m.position;if(o.t==4)p.x=L[o.lane]+Math.sin(T*2+o.ph)*2.2;if(o.t==5)o.m.rotation.y+=dt*4;
  if(!o.done&&inv<=0&&p.z>-1.8&&p.z<1.8&&Math.abs(p.x-px)<o.hw+.85&&py<o.h-.15){o.done=true;p.z=99;hurt();}
  else if(!o.done&&p.z>2.5){o.done=true;addScore(25);}}
 for(let i=pus.length-1;i>=0;i--){const p=pus[i],m=p.m.position;p.m.rotation.y+=dt*3;if(m.z>-2&&m.z<2&&Math.abs(m.x-px)<1.6){S.remove(p.m);pus.splice(i,1);addScore(50);SFX.coin();burst(m,0xffd400,12,5);startQuiz();return;}}
 // disparos
 for(let i=bul.length-1;i>=0;i--){const b=bul[i];b.m.position.z-=95*dt;b.l-=dt;let rm=b.l<=0;
  if(en&&en.alive){const e=en.g.position;if(b.m.position.z<e.z+2&&b.m.position.z>e.z-2.5&&Math.abs(b.m.position.x-e.x)<1.7){en.hp--;en.pulse=.15;rm=true;SFX.hit();burst(b.m.position,0xffee55,10,6);if(en.hp<=0)killEnemy();}}
  if(rm){S.remove(b.m);bul.splice(i,1);}}
 // meta
 if(fin&&gate.visible&&gate.position.z>0)return end(true);
 if(energy<=0)return end(false);
 hudT-=dt;if(hudT<=0){hudT=.1;hud();}
 }
 // partículas y cámara (count/play)
 for(const p of PT)if(p.m.visible){p.l-=dt;p.v.y-=12*dt;p.m.position.addScaledVector(p.v,dt);if(p.l<=0)p.m.visible=false;}
 player.position.set(px,py,0);player.rotation.z=-(L[lane]-px)*.08;player.visible=inv<=0||(Math.floor(T*20)%2==0);
 shk=Math.max(0,shk-dt*1.5);cam.position.set(px*.55+rnd(-1,1)*shk*.3,4.3+py*.3+rnd(-1,1)*shk*.3,9);cam.lookAt(px*.4,1.2,-12);
 const f=62+(slow*8);if(Math.abs(cam.fov-f)>.2){cam.fov=f;cam.updateProjectionMatrix();}
}
let last=0;function loop(t){requestAnimationFrame(loop);const dt=Math.min((t-last)/1000||0,.05);last=t;update(dt);R.render(S,cam);}
// carga
loadFigures((n,t)=>{$('lb').style.width=n/t*100+'%';$('lt').textContent='Cargando figuras '+n+'/'+t;},()=>{
 if(MISSING.length)$('warn').textContent='⚠ Faltan archivos en figuras/: '+MISSING.join(', ');
 setTimeout(()=>{toMenu();},MISSING.length?2500:300);});
requestAnimationFrame(loop);
})();

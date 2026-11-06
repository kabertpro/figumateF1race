/* FIGUMATE GAME — Kabert Studio Pro · LMKE
   Juego de carreras estilo bloques para aprender a sumar figuras musicales (niveles 1-20, ver figures.js). */
(()=>{
'use strict';
const CFG={TIME:240,ENERGY:100,SPEED:34,WRONG_T:4,SHOTS:[3,4,5,6,9],BANK:'banco.kab',LV_UP:3};
const SITE='https://kabert-edulab.vercel.app/',WA='65596602',GAME='FIGUMATE';
const $=i=>document.getElementById(i),L=[-3.2,0,3.2],rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const mob=/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
const mb=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};

/* ---------- ESCENA ---------- */
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:!mob});R.setPixelRatio(Math.min(devicePixelRatio,mob?1.25:1.75));
const S=new THREE.Scene();S.background=new THREE.Color(0x8fd3ff);S.fog=new THREE.Fog(0x9fdcff,55,200);
const cam=new THREE.PerspectiveCamera(65,1,.1,300);
S.add(new THREE.HemisphereLight(0xdff2ff,0x5a7a3a,1.05));const dl=new THREE.DirectionalLight(0xffffff,.85);dl.position.set(-6,12,8);S.add(dl);
const resize=()=>{R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();};addEventListener('resize',resize);resize();

/* ---------- TEXTURAS DE BLOQUES (16x16) ---------- */
const shade=(hex,k)=>{const f=v=>Math.max(0,Math.min(255,v*k|0));return 'rgb('+f(hex>>16&255)+','+f(hex>>8&255)+','+f(hex&255)+')';};
function tex(seed,fn){const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');fn(g,mb(seed));
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const noise=(hex,a)=>(g,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){g.fillStyle=shade(hex,1+(r()-.5)*2*a);g.fillRect(x,y,1,1);}};
const TX={
 nz:tex(1,noise(0xeeeeee,.1)),
 grass:tex(2,noise(0x55b843,.22)),
 stone:tex(3,(g,r)=>{noise(0x8c8c8c,.18)(g,r);g.fillStyle='#555';for(let i=0;i<14;i++)g.fillRect(r()*16|0,r()*16|0,1+(r()*2|0),1);}),
 plank:tex(4,(g,r)=>{noise(0xb98a4e,.1)(g,r);g.fillStyle='#6f4f2a';[0,5,10,15].forEach(y=>g.fillRect(0,y,16,1));for(let i=0;i<4;i++)g.fillRect(r()*16|0,i*5+1,1,4);}),
 road:tex(5,(g,r)=>{noise(0x4a4a58,.1)(g,r);g.fillStyle='#3a3a46';g.fillRect(0,0,16,1);g.fillRect(0,0,1,16);}),
 leaf:tex(6,noise(0x2f8f2f,.3)),
 log:tex(7,(g,r)=>{for(let x=0;x<16;x++){g.fillStyle=shade(0x6b4a2a,.85+(x%4===0?-.2:0)+(r()-.5)*.15);g.fillRect(x,0,1,16);}}),
 tnt:tex(8,(g,r)=>{noise(0xd32f2f,.1)(g,r);g.fillStyle='#e9e9e9';g.fillRect(0,5,16,6);g.fillStyle='#222';for(let x=2;x<15;x+=2)g.fillRect(x,6,1,4);}),
 crate:tex(9,(g,r)=>{noise(0xa9793c,.1)(g,r);g.fillStyle='#5c3d1a';g.fillRect(0,0,16,2);g.fillRect(0,14,16,2);g.fillRect(0,0,2,16);g.fillRect(14,0,2,16);for(let i=0;i<12;i++)g.fillRect(2+i,2+i,1,1);}),
 lava:tex(10,(g,r)=>{noise(0xff7a00,.35)(g,r);g.fillStyle='#ffe066';for(let i=0;i<20;i++)g.fillRect(r()*16|0,r()*16|0,2,1);})
};
const MC={};const M=(c,e,t)=>{const k=c+'|'+(e||0)+'|'+(t?t.uuid:'');return MC[k]||(MC[k]=new THREE.MeshLambertMaterial({color:c,emissive:e||0,map:t||null}));};
const MB=c=>{const k='b'+c;return MC[k]||(MC[k]=new THREE.MeshBasicMaterial({color:c}));};
/* caja con UV en "píxeles de bloque": cada u unidades = 1 baldosa de textura */
function vbox(w,h,d,m,u){const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
 for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*dims[f][0]/u,uv.getY(k)*dims[f][1]/u);}return new THREE.Mesh(g,m);}
const at=(m,x,y,z)=>{m.position.set(x,y,z);return m;};

/* suelo que se desplaza */
const GT=[];
function ground(w,l,x,y,t,tile){const tx=t.clone();tx.needsUpdate=true;tx.repeat.set(w/tile,l/tile);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,l),new THREE.MeshLambertMaterial({map:tx}));m.rotation.x=-Math.PI/2;m.position.set(x,y,-150);S.add(m);GT.push({t:tx,tile});return m;}
ground(13,420,0,0,TX.road,2);ground(120,420,-66.5,-.02,TX.grass,2);ground(120,420,66.5,-.02,TX.grass,2);
for(const x of[-7,7])S.add(at(vbox(1,.35,420,M(0xffffff,0,TX.stone),1),x,.17,-150));
// sol
const sun=new THREE.Mesh(new THREE.BoxGeometry(16,16,2),new THREE.MeshBasicMaterial({color:0xfff2a0,fog:false}));sun.position.set(-50,62,-210);S.add(sun);

/* ---------- AUDIO ---------- */
const A={x:null,m:.5,s:.7,mute:false};
function ctx(){if(!A.x)A.x=new(window.AudioContext||window.webkitAudioContext)();if(A.x.state==='suspended')A.x.resume();return A.x;}
function tone(f,d,ty,v,ch,dl=0,f2){if(A.mute||!A.x)return;const x=A.x,o=x.createOscillator(),g=x.createGain(),t=x.currentTime+dl,vol=Math.max(v*(ch==='m'?A.m:A.s),.0001);o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(x.destination);o.start(t);o.stop(t+d);}
const SFX={shot:()=>tone(900,.15,'square',.12,'s',0,200),hit:()=>tone(160,.3,'sawtooth',.25,'s',0,50),coin:()=>{tone(660,.1,'triangle',.2,'s');tone(990,.15,'triangle',.2,'s',.08)},ok:()=>[523,659,784].forEach((f,i)=>tone(f,.2,'triangle',.25,'s',i*.1)),bad:()=>tone(200,.35,'sawtooth',.2,'s',0,100),boom:()=>tone(120,.6,'sawtooth',.35,'s',0,30),beep:()=>tone(440,.15,'square',.15,'s'),go:()=>tone(880,.4,'square',.2,'s'),lv:()=>[392,523,659,784].forEach((f,i)=>tone(f,.15,'square',.18,'s',i*.07))};
/* Música: archivos mp3 en /audio (menu, carrera1-5, final). Si faltan, suena el chiptune de respaldo. */
const AUDIO={menu:['audio/menu.mp3'],race:[1,2,3,4,5].map(i=>'audio/carrera'+i+'.mp3'),end:['audio/final.mp3']};
const Mu={a:new Audio(),key:'',list:[],idx:0,tries:0,synth:false,duck:1};
Mu.vol=()=>{Mu.a.volume=Math.max(0,Math.min(1,A.m*Mu.duck));Mu.a.muted=A.mute;};
Mu.play=()=>{Mu.a.src=Mu.list[Mu.idx];Mu.a.loop=Mu.list.length===1;Mu.vol();const p=Mu.a.play();if(p&&p.catch)p.catch(()=>{});};
Mu.start=(key,fresh)=>{if(Mu.key===key&&!fresh){Mu.resume();return;}
 Mu.key=key;Mu.list=key==='race'?shuffle(AUDIO.race.slice()):AUDIO[key].slice();Mu.idx=0;Mu.tries=0;Mu.synth=false;Mu.duck=1;Mu.play();};
Mu.pause=()=>{Mu.a.pause();};
Mu.resume=()=>{if(Mu.key&&!Mu.synth&&Mu.a.paused){Mu.vol();const p=Mu.a.play();if(p&&p.catch)p.catch(()=>{});}};
Mu.a.addEventListener('playing',()=>{Mu.tries=0;});
Mu.a.addEventListener('ended',()=>{Mu.idx=(Mu.idx+1)%Mu.list.length;Mu.play();});
Mu.a.addEventListener('error',()=>{Mu.tries++;if(Mu.tries>=Mu.list.length){Mu.synth=true;return;}Mu.idx=(Mu.idx+1)%Mu.list.length;Mu.play();});
const NOTES=[131,131,196,131,147,147,220,147,110,110,165,110,123,123,185,123];let ms=0;
setInterval(()=>{if(!Mu.synth||!['menu','count','play','end','garage'].includes(st)||A.mute||!A.x)return;const n=NOTES[ms%16];tone(n,.2,'triangle',.12,'m');if(ms%2==0)tone(n*4,.1,'square',.03,'m');ms++;},240);
document.querySelectorAll('.vm').forEach(e=>e.oninput=()=>{A.m=+e.value;document.querySelectorAll('.vm').forEach(o=>o.value=e.value);Mu.vol();});
document.querySelectorAll('.vs').forEach(e=>e.oninput=()=>{A.s=+e.value;document.querySelectorAll('.vs').forEach(o=>o.value=e.value)});
document.querySelectorAll('.mt').forEach(e=>e.onclick=()=>{A.mute=!A.mute;document.querySelectorAll('.mt').forEach(o=>o.textContent=A.mute?'🔇':'🔈');Mu.vol();});

/* ---------- AUTO (editable) ---------- */
const PAL=[0xf9fffe,0xf9801d,0xb02e26,0xf38baa,0x3ab3da,0x3c44aa,0x80c71f,0x5e7c16,0xfed83d,0x8932b8,0x474f52,0x1d1d21];
const MODELS=['Clásico','Pickup','Deportivo'],STRIPES=['Sin franja','Central','Doble','Lateral'];
let carCfg=Object.assign({m:0,c:0x3ab3da,a:0xfed83d,s:1,sp:1,n:0},store.get('qr_car',{}));
function buildCar(cfg,boss){const g=new THREE.Group(),u=.2;
 const body=M(cfg.c,boss?0x330000:0,TX.nz),acc=M(cfg.a,0,TX.nz),dark=M(0x2a2a36,0,TX.nz),glass=M(0x9fe8ff,0x1a4a66);
 const D=[{bw:1.8,bh:.6,by:.6,L:3.4},{bw:1.8,bh:.55,by:.55,L:3.4},{bw:1.9,bh:.45,by:.5,L:3.7}][cfg.m],top=D.by+D.bh/2,hl=D.L/2;
 g.add(at(vbox(D.bw,D.bh,D.L,body,u),0,D.by,0));
 if(cfg.m===0){g.add(at(vbox(1.4,.5,1.5,glass,u),0,top+.25,.35));g.add(at(vbox(1.5,.12,1.6,acc,u),0,top+.56,.35));}
 else if(cfg.m===1){g.add(at(vbox(1.6,.6,1.2,glass,u),0,top+.3,-.25));g.add(at(vbox(1.7,.1,1.3,acc,u),0,top+.65,-.25));
  for(const x of[-.82,.82])g.add(at(vbox(.15,.35,1.3,body,u),x,top+.17,1.05));g.add(at(vbox(1.8,.35,.15,body,u),0,top+.17,1.65));}
 else{g.add(at(vbox(1.2,.4,1.2,glass,u),0,top+.2,.2));g.add(at(vbox(1.25,.08,1.0,acc,u),0,top+.44,.2));g.add(at(vbox(1.7,.2,1,body,u),0,top+.1,-1.5));}
 // franjas (capó y maletero) y laterales
 const hood=cfg.m===0?[-hl,-.4]:cfg.m===1?[-hl,-.85]:[-hl,-.4],trunk=cfg.m===0?[1.1,hl]:cfg.m===1?null:[.8,hl];
 for(const seg of[hood,trunk]){if(!seg)continue;const len=seg[1]-seg[0],cz=(seg[0]+seg[1])/2;
  if(cfg.s===1)g.add(at(vbox(.4,.04,len,acc,u),0,top+.02,cz));
  if(cfg.s===2)for(const x of[-.28,.28])g.add(at(vbox(.14,.04,len,acc,u),x,top+.02,cz));}
 if(cfg.s===3)for(const x of[-1,1])g.add(at(vbox(.04,.16,D.L*.9,acc,u),x*(D.bw/2+.01),D.by-.05,0));
 // ruedas cuadradas
 for(const x of[-1,1])for(const z of[-1,1]){g.add(at(vbox(.36,.8,.8,dark,u),x*(D.bw/2+.03),.4,z*(hl-.7)));g.add(at(vbox(.38,.3,.3,M(0x999999),u),x*(D.bw/2+.04),.4,z*(hl-.7)));}
 // luces
 for(const x of[-.6,.6]){g.add(at(vbox(.34,.2,.06,MB(0xfff7a8),u),x,D.by+.05,-hl-.02));g.add(at(vbox(.34,.2,.06,MB(0xff2b2b),u),x,D.by+.05,hl+.02));}
 if(cfg.sp||cfg.m===2){const z=hl-.25;for(const x of[-.6,.6])g.add(at(vbox(.1,.4,.1,dark,u),x,top+.2,z));g.add(at(vbox(D.bw+.2,.1,.5,acc,u),0,top+.43,z));}
 if(cfg.n){const n=at(vbox(D.bw+.3,.04,D.L+.3,MB(cfg.a),u),0,.06,0);g.add(n);}
 if(boss){for(const x of[-.5,.5])g.add(at(vbox(.2,.7,.2,MB(0xff2020),u),x,top+1.1,.3));}
 return g;}
let player=null;
function rebuildPlayer(){if(player)S.remove(player);player=buildCar(carCfg);S.add(player);}
rebuildPlayer();
const ENC=[{m:0,c:0xb02e26,a:0xf9fffe,s:3,sp:0,n:0},{m:1,c:0xf9801d,a:0x1d1d21,s:1,sp:0,n:0},{m:2,c:0x80c71f,a:0xfed83d,s:2,sp:1,n:0},{m:0,c:0x8932b8,a:0xf38baa,s:1,sp:1,n:1},{m:2,c:0x1d1d21,a:0xb02e26,s:2,sp:1,n:1}];
const ENAME=['Rojo Rayo','Naranja Turbo','Verde Veloz','Violeta Veneno','JEFE FINAL'];
const EN=ENC.map((c,i)=>{const g=buildCar(c,i===4);g.userData.s=i===4?1.4:1;g.scale.setScalar(g.userData.s);g.visible=false;g.rotation.y=0;S.add(g);return g;});

/* ---------- ESCENARIO ---------- */
const SC=[];const add=(m,span,k,max=15)=>{S.add(m);SC.push({m,span,k,max});};
const stoneM=M(0xffffff,0,TX.stone),plankM=M(0xffffff,0,TX.plank),logM=M(0xffffff,0,TX.log),leafM=M(0xffffff,0,TX.leaf),whiteM=MB(0xffffff);
for(const x of[-1.6,1.6])for(let i=0;i<20;i++)add(at(vbox(.25,.04,2,M(0xffffff,0x888888)),x,.03,-i*10+10),200,1);
for(let i=0;i<14;i++)for(const s of[-1,1]){ // antorchas
 const g=new THREE.Group();g.add(at(vbox(.3,3.2,.3,logM,.3),0,1.6,0));g.add(at(vbox(.5,.5,.5,M(0xffe27a,0xffc233)),0,3.45,0));g.position.set(s*7.9,0,-i*14+14);add(g,196,1);}
for(const s of[-1,1])for(let i=0;i<12;i++){ // árboles
 const g=new THREE.Group();g.add(at(vbox(.8,3.2,.8,logM,.8),0,1.6,0));g.add(at(vbox(3.2,2,3.2,leafM,.8),0,4.1,0));g.add(at(vbox(1.6,1.2,1.6,leafM,.8),0,5.7,0));
 g.scale.setScalar(rnd(.8,1.3));g.position.set(s*rnd(9.5,22),0,-i*16+rnd(0,8)+14);add(g,192,1);}
for(const s of[-1,1])for(let i=0;i<6;i++){ // casas
 const g=new THREE.Group();g.add(at(vbox(6,4,6,plankM,1),0,2,0));g.add(at(vbox(7,1.6,7,M(0x8b4a2b),1),0,4.8,0));g.add(at(vbox(1.2,2.2,.1,logM,.6),0,1.1,3.05));
 g.position.set(s*rnd(28,42),0,-i*30+20);add(g,180,1);}
for(const s of[-1,1])for(let i=0;i<4;i++){ // montañas de piedra
 const g=new THREE.Group(),w=rnd(14,26);g.add(at(vbox(w,8,w,stoneM,2),0,4,0));g.add(at(vbox(w*.65,8,w*.65,stoneM,2),0,12,0));g.add(at(vbox(w*.3,6,w*.3,M(0xf4f4f4),2),0,19,0));
 g.position.set(s*rnd(60,95),0,-i*60-20);add(g,240,1,30);}
for(let i=0;i<34;i++){const s=Math.random()<.5?-1:1;add(at(vbox(.3,.5,.3,M(pick([0xe74c3c,0xf1c40f,0xffffff,0xe84393])),1),s*rnd(8.5,15),.25,-rnd(0,200)),200,1);}
for(let i=0;i<9;i++){const g=new THREE.Group(),w=rnd(8,14);g.add(at(new THREE.Mesh(new THREE.BoxGeometry(w,2,6),whiteM),0,0,0));g.add(at(new THREE.Mesh(new THREE.BoxGeometry(w*.6,2,5),whiteM),w*.2,1.6,0));
 g.position.set(rnd(-100,100),rnd(34,52),-rnd(0,230));add(g,260,.12,30);}
const ped=at(vbox(5,.5,6,M(0xffffff,0,TX.grass),1),-2.3,-.2,0);ped.visible=false;S.add(ped);

/* ---------- PARTÍCULAS Y OBSTÁCULOS ---------- */
const PT=[];for(let i=0;i<60;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,.25),new THREE.MeshBasicMaterial());m.visible=false;S.add(m);PT.push({m,v:new THREE.Vector3(),l:0});}let pi=0;
function burst(p,c,n,sp){for(let i=0;i<n;i++){const q=PT[pi++%60];q.m.position.copy(p);q.m.material.color.setHex(c);q.v.set(rnd(-1,1),rnd(0,1),rnd(-1,1)).multiplyScalar(sp);q.l=rnd(.4,.9);q.m.visible=true;}}
const free=[[],[],[],[],[],[]];
const OT=[{h:.9,hw:1.25},{h:2.25,hw:.9},{h:1.1,hw:.85},{h:2.4,hw:1.2},{h:1.3,hw:.7},{h:1.1,hw:.8}];
function mkObs(t){if(free[t].length)return free[t].pop();let m;
 if(t===0)m=vbox(2.4,.9,.5,plankM,.45);else if(t===1)m=vbox(1.8,2.25,1.8,M(0xffffff,0,TX.crate),.75);
 else if(t===2)m=vbox(1.7,1.1,1.1,stoneM,.55);else if(t===3)m=vbox(2.4,2.4,.8,stoneM,.8);
 else if(t===4)m=vbox(1.3,1.3,1.3,M(0xffffff,0,TX.tnt),.65);else m=vbox(1.1,1.1,1.1,M(0xffffff,0x663300,TX.lava),.55);
 S.add(m);return m;}
const obs=[],pus=[],bul=[];
const bm=new THREE.Mesh(new THREE.BoxGeometry(.35,.35,.9),new THREE.MeshBasicMaterial({color:0xffee55}));
const STAR=['..#..','.###.','#####','.###.','.#.#.'],starCube=new THREE.BoxGeometry(.38,.38,.38),starMat=new THREE.MeshLambertMaterial({color:0xffd400,emissive:0xffaa00});
function mkStar(){const g=new THREE.Group();STAR.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='#')g.add(at(new THREE.Mesh(starCube,starMat),(x-2)*.4,(2-y)*.4,0));}));return g;}
function spawnObs(t,lane,z){const m=mkObs(t);m.visible=true;m.rotation.y=0;m.position.set(L[lane],OT[t].h/2,z);obs.push({m,t,h:OT[t].h,hw:OT[t].hw,lane,ph:rnd(0,6),done:false});}
const gate=new THREE.Group();{const c=document.createElement('canvas');c.width=128;c.height=32;const g=c.getContext('2d');for(let i=0;i<16;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#fff':'#111';g.fillRect(i*8,j*8,8,8);}
 const tx=new THREE.CanvasTexture(c);tx.magFilter=THREE.NearestFilter;gate.add(at(new THREE.Mesh(new THREE.BoxGeometry(14,2,.4),new THREE.MeshBasicMaterial({map:tx})),0,6,0));
 for(const x of[-6.8,6.8])gate.add(at(vbox(.8,7,.8,M(0xffd400,0xaa7700),.8),x,3.5,0));gate.visible=false;S.add(gate);}

/* ---------- PERFIL / RÉCORD ---------- */
let prof=store.get('qr_profile',null);
const getName=()=>prof?prof.name:'';
const recOf=()=>{if(!prof)return{best:0,plays:0};const k='L'+LV;return prof.rec[k]||(prof.rec[k]={best:0,plays:0});};

/* ---------- ESTADO ---------- */
let st='splash',T=0,score=0,timeLeft=0,elapsed=0,energy=0,charges=0,kills=0,right=0,wrong=0,hits=0,maxLv=1,fin=false,slow=1,shk=0,inv=0,LV=Math.min(20,Math.max(1,+store.get('figumate_lv',1)||1)),cleared=false,endless=false;
let lane=1,px=0,py=0,vy=0,mvCD=0,fireCD=0,spT=1,puT=4,cdT=0,deadT=0,hudT=0,held={},q=null,en=null,lastRes=null;
const D=()=>Math.min(1,(LV-1)/19);
const pickType=()=>{const a=[0,2];if(LV>=2)a.push(1);if(LV>=4)a.push(3);if(LV>=7)a.push(4);if(LV>=10)a.push(4,3,1);return pick(a);};
const ui=(id,on)=>$(id).classList[on?'add':'remove']('show');
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.remove('go');void e.offsetWidth;e.classList.add('go');};
function show(id){['splash','menu','howbox','namebox','garage','quiz','pause','end'].forEach(i=>ui(i,i===id));}
function parkEnemies(){EN.forEach((g,i)=>{g.visible=true;g.scale.setScalar(g.userData.s);g.position.set(L[i%3]*(i==4?0:1),0,-14-i*9);});}
function enemyName(){const i=kills%5,r=Math.floor(kills/5);return ENAME[i]+(r>0?' '+['II','III','IV','V','VI','VII'][Math.min(5,r-1)]:'');}
function spawnEnemy(){const i=kills%5,g=EN[i];g.visible=true;g.position.set(0,0,-110);const hp=CFG.SHOTS[i]+Math.floor(D()*3)+(endless?Math.floor(kills/5)*2:0);
 en={i,g,hp,max:hp,lane:1,laneT:2,trapT:2.5,pulse:0,alive:true};$('ebn').textContent='👾 '+enemyName();$('ef').style.width='100%';}
function clearWorld(){for(const o of obs){o.m.visible=false;free[o.t].push(o.m);}obs.length=0;for(const p of pus)S.remove(p.m);pus.length=0;for(const b of bul)S.remove(b.m);bul.length=0;gate.visible=false;EN.forEach(e=>e.visible=false);PT.forEach(p=>p.m.visible=false);en=null;ped.visible=false;}
function goFullscreen(){try{const e=document.documentElement;if(!document.fullscreenElement&&e.requestFullscreen)e.requestFullscreen().then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})).catch(()=>{});}catch(e){}}
function newGame(){clearWorld();score=0;timeLeft=CFG.TIME;elapsed=0;energy=CFG.ENERGY;charges=0;kills=0;right=wrong=hits=0;maxLv=LV;fin=false;cleared=false;endless=false;slow=1;shk=0;inv=0;lane=1;px=0;py=vy=0;spT=1.5;puT=3;deadT=0;held={};
 player.rotation.set(0,0,0);recOf().plays++;store.set('qr_profile',prof);
 spawnEnemy();show('');ui('hud',1);ui('ctrl',1);st='count';cdT=3.99;hud();goFullscreen();Mu.start('race',true);}
function toMenu(){clearWorld();ui('hud',0);ui('ctrl',0);$('c').classList.remove('frz');$('conf').innerHTML='';player.rotation.set(0,0,0);parkEnemies();show('menu');st='menu';refreshMenu();Mu.start('menu');}
function hud(){$('hn').textContent=getName();$('hl').textContent='Nivel '+LV+' · 👾'+(endless?kills:Math.min(5,kills+1)+'/5');$('ht').textContent='⏱ '+Math.max(0,Math.ceil(timeLeft));$('hs').textContent='★ '+score;$('hc').textContent='⚡ '+charges;
 $('he').textContent='🔧';$('ee').style.width=Math.max(0,energy/CFG.ENERGY*100)+'%';if(en)$('ef').style.width=Math.max(0,en.hp/en.max*100)+'%';}
const addScore=n=>{score=Math.max(0,score+n);};

/* ---------- PREGUNTA (suma de figuras) ---------- */
function startQuiz(){st='quiz';held={};$('c').classList.add('frz');Mu.duck=.35;Mu.vol();const lv=LV;q=makeQuestion(lv);q.done=false;
 $('qh').textContent='⏸ TIEMPO CONGELADO · NIVEL '+lv+' — ¿CUÁNTO SUMAN ESTAS '+q.figs.length+' FIGURAS?';
 $('qf').innerHTML=q.figs.map(k=>'<div class="fc"><img src="'+(URLS[k]||'figuras/'+k+'.png')+'" alt="'+k+'"></div>').join('');
 const qa=$('qa');qa.innerHTML='';q.opts.forEach((v,i)=>{const b=document.createElement('button');b.textContent=v;b.onclick=()=>answer(i);qa.appendChild(b);});show('quiz');}
function answer(i){if(!q||q.done)return;q.done=true;const bs=[...$('qa').children];bs.forEach(x=>x.disabled=true);const c=q.opts.indexOf(q.sum),ok=i===c;
 if(ok){bs[i].classList.add('ok');right++;charges++;addScore(100);SFX.ok();}else{bs[i].classList.add('no');wrong++;timeLeft-=CFG.WRONG_T;SFX.bad();bs[c].classList.add('ok');}
 setTimeout(()=>{if(st!=='quiz')return;Mu.duck=1;Mu.vol();show('');$('c').classList.remove('frz');st='play';toast(ok?'¡Correcto! +1 disparo ⚡':'Era '+q.sum+' · −'+CFG.WRONG_T+'s');},ok?800:1500);}

/* ---------- ACCIONES ---------- */
function hurt(){hits++;energy-=Math.round(10+10*D());addScore(-30);slow=.4;shk=.6;inv=1.2;$('flash').classList.remove('go');void $('flash').offsetWidth;$('flash').classList.add('go');SFX.hit();burst(new THREE.Vector3(px,1,0),0xffaa00,14,6);}
function fire(){if(st!=='play'||fireCD>0)return;if(!en||!en.alive)return;if(charges<=0){toast('¡Recoge ⭐ y responde para tener disparos!');fireCD=.5;return;}
 charges--;fireCD=.25;const m=bm.clone();m.position.set(px,.9,-2);S.add(m);bul.push({m,l:1.4});SFX.shot();}
function jump(){if(st==='play'&&py<=0)vy=11.5;}
function killEnemy(){en.alive=false;en.g.visible=false;burst(new THREE.Vector3(en.g.position.x,1,en.g.position.z),0xff6600,40,10);SFX.boom();shk=.8;addScore(500);kills++;deadT=1.8;toast('¡Enemigo destruido! +500');}
function pause(){if(st==='play'){st='pause';held={};show('pause');Mu.pause();if(A.x)A.x.suspend();}}
function resume(){if(st==='pause'){st='play';show('');Mu.resume();if(A.x)A.x.resume();}}

/* ---------- FIN + TARJETA ---------- */
function end(win){st='end';held={};ui('ctrl',0);ui('hud',0);$('c').classList.remove('frz');let bonus=0;
 if(win){cleared=true;bonus=Math.round(timeLeft)*2+(hits==0?300:0);score+=bonus;}
 const tot=right+wrong,acc=tot?right/tot:0,perf=.45*(tot?acc:.5)+.3*Math.max(0,timeLeft/CFG.TIME)+.25*Math.max(0,1-hits/8);
 let tier=perf>=.72?2:perf>=.5?1:0;if(!cleared)tier=Math.min(tier,1);
 const rc=recOf(),prev=rc.best;const newRec=score>prev&&score>0;if(newRec)rc.best=score;store.set('qr_profile',prof);
 lastRes={win,cleared,score,best:rc.best,newRec,lv:LV,right,wrong,acc,kills,time:Math.round(elapsed),hits,bonus,tier,name:getName(),bank:'NIVEL '+LV,desc:LV_DESC[LV]||'',endless:false};
 $('conf').innerHTML=cleared?Array.from({length:60},()=>'<i style="left:'+rnd(0,100)+'%;background:hsl('+rnd(0,360)+',90%,60%);animation-duration:'+rnd(2,5)+'s;animation-delay:'+rnd(0,3)+'s"></i>').join(''):'';
 drawCard(lastRes);show('end');Mu.start('end');
 if(cleared)for(let i=0;i<4;i++)setTimeout(()=>{burst(new THREE.Vector3(rnd(-4,4),3,-8),pick([0xffd400,0xff3df2,0x00e5ff]),15,8);SFX.coin();},i*300);}

function car2D(g,cx,gy,k,cfg){const hx=n=>'#'+('000000'+n.toString(16)).slice(-6);const Rc=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 const m=cfg.m,bw=[14,15,16][m],bh=[3,3,2.4][m],cab=[[8,2.6,0],[5,2.4,3],[6,2,-1]][m],x0=cx-bw/2*k,by=gy-1.2*k-bh*k,body=hx(cfg.c),acc=hx(cfg.a);
 if(cfg.n){g.save();g.shadowColor=acc;g.shadowBlur=36;Rc(x0-.4*k,gy-.4*k,(bw+.8)*k,.3*k,acc);g.restore();}
 const cw=cab[0]*k,ch=cab[1]*k,cxp=cx+cab[2]*k-cw/2;
 Rc(cxp,by-ch,cw,ch,'#111');Rc(cxp+.4*k,by-ch+.4*k,cw-.8*k,ch-.4*k,'#9fe8ff');Rc(cxp,by-ch,cw,.45*k,acc);
 if(m===1){Rc(x0,by-.9*k,5*k,.9*k,body);Rc(x0,by-.9*k,5*k,.3*k,acc);}
 Rc(x0,by,bw*k,bh*k,body);Rc(x0,by,bw*k,.4*k,'rgba(255,255,255,.28)');Rc(x0,by+bh*k-.4*k,bw*k,.4*k,'rgba(0,0,0,.28)');
 if(cfg.s===1)Rc(x0,by+bh*k*.38,bw*k,.55*k,acc);if(cfg.s===2){Rc(x0,by+bh*k*.28,bw*k,.25*k,acc);Rc(x0,by+bh*k*.6,bw*k,.25*k,acc);}if(cfg.s===3)Rc(x0,by+bh*k-.85*k,bw*k,.55*k,acc);
 if(cfg.sp||m===2){Rc(x0+.5*k,by-.9*k,.5*k,.9*k,'#222');Rc(x0-.5*k,by-1.4*k,2.6*k,.5*k,acc);}
 Rc(x0+bw*k-.5*k,by+.4*k,.5*k,.9*k,'#fff7a8');Rc(x0,by+.4*k,.4*k,.9*k,'#ff2b2b');
 for(const wx of[x0+2.6*k,x0+(bw-2.6)*k]){Rc(wx-1.5*k,gy-3*k,3*k,3*k,'#111');Rc(wx-.6*k,gy-2.1*k,1.2*k,1.2*k,'#999');}}

async function drawCard(r){
 const cv=$('card'),g=cv.getContext('2d');cv.width=1600;cv.height=900;
 try{await Promise.race([document.fonts.load('20px "Press Start 2P"'),new Promise(s=>setTimeout(s,1200))]);}catch(e){}
 const F=s=>s+'px "Press Start 2P",ui-monospace,Menlo,Consolas,monospace',rr=mb(7);
 const Rc=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);};
 const Tx=(t,x,y,s,c,al,sh)=>{g.font=F(s);g.textAlign=al||'left';g.textBaseline='top';if(sh!==false){g.fillStyle='rgba(0,0,0,.6)';g.fillText(t,x+Math.max(2,s*.1),y+Math.max(2,s*.1));}g.fillStyle=c;g.fillText(t,x,y);};
 const fit=(t,w,s)=>{g.font=F(s);while(s>12&&g.measureText(t).width>w){s-=2;g.font=F(s);}return s;};
 // cielo
 const sky=g.createLinearGradient(0,0,0,770);sky.addColorStop(0,r.cleared?'#3d8bff':'#4aa3ff');sky.addColorStop(1,'#bfe6ff');g.fillStyle=sky;g.fillRect(0,0,1600,770);
 Rc(1380,50,100,100,'#fff3a0');Rc(1400,70,60,60,'#ffe066');
 for(let i=0;i<7;i++){const x=rr()*1500,y=40+rr()*220,w=140+rr()*140;Rc(x,y,w,36,'rgba(255,255,255,.85)');Rc(x+w*.2,y-24,w*.5,28,'rgba(255,255,255,.85)');}
 // montañas de bloques
 for(let i=0;i<14;i++){const w=60+(rr()*3|0)*40,h=60+rr()*180,x=i*120-40;Rc(x,770-h,w,h,i%2?'#7d8a99':'#6f7c8c');Rc(x,770-h,w,16,'#e8eef4');}
 // suelo
 for(let x=0;x<1600;x+=40){Rc(x,770,40,40,(x/40)%2?'#4caf3a':'#43a032');Rc(x,810,40,90,(x/40)%2?'#8b5a2b':'#7a4e25');
  for(let j=0;j<5;j++){Rc(x+rr()*30,775+rr()*20,8,8,'rgba(0,0,0,.12)');Rc(x+rr()*30,815+rr()*70,8,8,'rgba(0,0,0,.14)');}}
 Rc(0,770,1600,6,'#7cd35a');
 // confeti pixel si ganó
 if(r.cleared)for(let i=0;i<70;i++)Rc(rr()*1600,rr()*740,12,12,'hsl('+(rr()*360|0)+',90%,60%)');
 // logo + banco
 Tx('QUIZ',60,38,64,'#ffd400');Tx('RUSH',60+4*64,38,64,'#7dff5a');
 Tx('NIVEL '+r.lv,1540,38,24,'#ffffff','right');const bt=(r.desc||'').toUpperCase();Tx(bt,1540,72,fit(bt,640,14),'#10223f','right',false);
 Tx(new Date().toLocaleDateString('es-BO',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase(),1540,96,14,'#10223f','right',false);
 // panel izquierdo
 const px0=60,py0=150,pw=860,ph=590;Rc(px0,py0,pw,ph,'#000');Rc(px0+6,py0+6,pw-12,ph-12,'#2b2b3a');Rc(px0+6,py0+6,pw-12,6,'#5d5d7a');Rc(px0+6,py0+6,6,ph-12,'#5d5d7a');Rc(px0+6,py0+ph-12,pw-12,6,'#15151f');Rc(px0+pw-12,py0+6,6,ph-12,'#15151f');
 const head=r.win?'¡MISIÓN CUMPLIDA!':(r.cleared?'¡GRAN CARRERA!':'¡CASI LO LOGRAS!');
 Tx(head,100,182,fit(head,780,34),r.cleared?'#ffd400':'#ff9f43');
 Tx(r.name,100,244,fit(r.name,780,44),'#ffffff');
 Tx('PUNTOS',100,314,18,'#9fb0d8');const ss=String(r.score);Tx(ss,100,342,fit(ss,430,84),'#7dd3ff');
 if(r.newRec){Rc(560,318,330,96,'#000');Rc(564,322,322,88,'#e84393');Rc(564,322,322,8,'#ff9ccd');Tx('¡NUEVO',725,336,22,'#fff','center');Tx('RÉCORD!',725,366,26,'#ffd400','center');}
 const cells=[['RÉCORD',r.best],['NIVEL',r.lv],['CORRECTAS',r.right+' / '+(r.right+r.wrong)],['PRECISIÓN',Math.round(r.acc*100)+'%'],['ENEMIGOS',r.kills+(r.endless?'':' / 5')],['TIEMPO',r.time+' s'],['COLISIONES',r.hits],['INCORRECTAS',r.wrong]];
 cells.forEach((c,i)=>{const x=100+(i%2)*420,y=452+(i>>1)*70;Tx(c[0],x,y,15,'#9fb0d8');Tx(String(c[1]),x,y+24,28,'#ffffff');});
 // medalla
 const cx=1230,cy=330,cols=[['#cd7f32','#8a5420','#f0b27a'],['#c9d1d9','#7d8793','#ffffff'],['#ffd400','#b88700','#fff59d']][r.tier];
 Rc(cx-62,cy-140,44,80,'#d63a30');Rc(cx+18,cy-140,44,80,'#3b6bd3');Rc(cx-62,cy-140,44,8,'#000');Rc(cx+18,cy-140,44,8,'#000');
 for(let y=-10;y<=10;y++)for(let x=-10;x<=10;x++){const d=Math.hypot(x,y);if(d<=10)Rc(cx+x*9-4,cy+y*9-4,9,9,d>8.3?'#000':d>7.2?cols[1]:cols[0]);}
 ['..#..','.###.','#####','.###.','.#.#.'].forEach((row,j)=>[...row].forEach((c,i)=>{if(c==='#')Rc(cx+(i-2)*16-8,cy+(j-2)*16-8,16,16,cols[2]);}));
 Tx(['BRONCE','PLATA','ORO'][r.tier],cx,462,28,cols[0],'center');
 Tx(['APRENDIZ','PILOTO','MAESTRO'][r.tier],cx,504,16,'#ffffff','center');
 // auto
 car2D(g,cx+10,770,26,carCfg);
 // pie
 Tx('KABERT STUDIO PRO · LMKE',800,824,22,'#ffd400','center');
 Tx(SITE.replace(/^https?:\/\//,'').replace(/\/$/,'')+'   ·   WhatsApp '+WA,800,860,19,'#ffffff','center');}

function cardBlob(cb){$('card').toBlob(cb,'image/png');}
function saveCard(){if(!lastRes)return;cardBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='QuizRush-'+(lastRes.name||'jugador').replace(/[^\w\-]+/g,'_')+'-'+lastRes.score+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('Imagen guardada');});}
function shareCard(){if(!lastRes)return;cardBlob(async b=>{const f=new File([b],'QuizRush-'+lastRes.score+'.png',{type:'image/png'});
 const data={files:[f],title:GAME,text:lastRes.name+' hizo '+lastRes.score+' puntos en '+GAME+' · '+lastRes.bank+' — '+SITE};
 try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share(data);return;}}catch(e){if(e&&e.name==='AbortError')return;}
 saveCard();});}

/* ---------- MENÚ / USUARIO / GARAJE ---------- */
let figWarn='';
function refreshMenu(){const rc=recOf();
 $('lvd').textContent='Nivel '+LV+': '+LV_DESC[LV]+(LV>1?' · obstáculos '+(LV<5?'fáciles':LV<10?'medios':LV<15?'difíciles':'extremos'):' · obstáculos suaves');
 [...$('lvsel').children].forEach((b,i)=>b.classList.toggle('sel',i+1===LV));
 $('uname').textContent=getName()||'(sin nombre)';$('rec').textContent=prof?'🏆 Récord nivel '+LV+': '+rc.best+'  ·  Partidas: '+rc.plays:'';
 const ms=$('bkmsg');ms.innerHTML='';if(figWarn){const li=document.createElement('li');li.textContent='⚠ '+figWarn;ms.appendChild(li);}}
let nameAfter=null;
function openName(after){nameAfter=after||null;$('nmt').textContent=prof?'Cambiar usuario':'¿Cómo te llamas?';$('pname').value=prof?prof.name:'';
 $('nmw').textContent=prof?'⚠ Si cambias el nombre, tu récord vuelve a cero.':'';$('pname').style.borderColor='#000';show('namebox');setTimeout(()=>$('pname').focus(),50);}
function saveName(){const n=$('pname').value.trim().slice(0,14);if(!n){$('pname').style.borderColor='#f33';return;}
 if(!prof||prof.name!==n){prof={name:n,rec:{},since:Date.now()};store.set('qr_profile',prof);}
 show('menu');refreshMenu();if(nameAfter){const f=nameAfter;nameAfter=null;f();}}
const chip=(t,on,f)=>{const b=document.createElement('button');b.className='chip'+(on?' on':'');b.textContent=t;b.onclick=f;return b;};
const sw=(c,on,f)=>{const b=document.createElement('button');b.className='sw'+(on?' on':'');b.style.background='#'+c.toString(16).padStart(6,'0');b.onclick=f;return b;};
function chg(){store.set('qr_car',carCfg);rebuildPlayer();buildGarage();}
function buildGarage(){const el=$('gbody');el.innerHTML='';const sec=t=>{const h=document.createElement('h3');h.textContent=t;el.appendChild(h);const d=document.createElement('div');d.className='chips';el.appendChild(d);return d;};
 let d=sec('Modelo');MODELS.forEach((n,i)=>d.appendChild(chip(n,carCfg.m===i,()=>{carCfg.m=i;chg();})));
 d=sec('Color del auto');PAL.forEach(c=>d.appendChild(sw(c,carCfg.c===c,()=>{carCfg.c=c;chg();})));
 d=sec('Color de detalles');PAL.forEach(c=>d.appendChild(sw(c,carCfg.a===c,()=>{carCfg.a=c;chg();})));
 d=sec('Franjas');STRIPES.forEach((n,i)=>d.appendChild(chip(n,carCfg.s===i,()=>{carCfg.s=i;chg();})));
 d=sec('Extras');d.appendChild(chip('Alerón: '+(carCfg.sp?'SÍ':'NO'),!!carCfg.sp,()=>{carCfg.sp=carCfg.sp?0:1;chg();}));d.appendChild(chip('Neón: '+(carCfg.n?'SÍ':'NO'),!!carCfg.n,()=>{carCfg.n=carCfg.n?0:1;chg();}));}
function openGarage(){st='garage';EN.forEach(g=>g.visible=false);ped.visible=true;buildGarage();show('garage');}
function closeGarage(){ped.visible=false;player.rotation.set(0,0,0);toMenu();}

/* ---------- ENTRADAS ---------- */
const KM={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ControlLeft:'fire',ControlRight:'fire',KeyX:'fire'};
addEventListener('keydown',e=>{
 if(st==='quiz'){const m={Digit1:0,Digit2:1,Digit3:2,Digit4:3,Numpad1:0,Numpad2:1,Numpad3:2,Numpad4:3};if(e.code in m)answer(m[e.code]);return;}
 if(['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code)&&st==='play')e.preventDefault();
 if(e.target&&e.target.tagName==='INPUT'){if(e.code==='Enter'&&st==='namebox')saveName();if(e.code==='Enter'&&$('namebox').classList.contains('show'))saveName();return;}
 if(e.code==='Escape'||e.code==='KeyP'){st==='pause'?resume():pause();return;}
 if(e.code==='Space'||e.code==='ArrowUp'){jump();return;}const k=KM[e.code];if(k){if(!held[k])mvCD=0;held[k]=true;}});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)held[k]=false;});
[['bl','left'],['br','right'],['bf','fire'],['bj','jump']].forEach(([id,k])=>{const b=$(id);
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('on');if(k==='jump')jump();else{held[k]=true;mvCD=0;}});
 const up=()=>{b.classList.remove('on');if(k!=='jump')held[k]=false;};['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,up));});
document.addEventListener('contextmenu',e=>e.preventDefault());
$('play').onclick=()=>{ctx();if(!prof)openName(()=>{ctx();newGame();});else newGame();};
$('chname').onclick=()=>openName(null);$('nmok').onclick=saveName;$('nmno').onclick=()=>{nameAfter=null;show('menu');};
$('garbtn').onclick=openGarage;$('gok').onclick=closeGarage;
$('how').onclick=()=>ui('howbox',1);$('howok').onclick=()=>ui('howbox',0);
$('pbtn').onclick=pause;$('pres').onclick=resume;$('prest').onclick=()=>{if(A.x)A.x.resume();newGame();};$('pmenu').onclick=()=>{if(A.x)A.x.resume();toMenu();};
$('eb-again').onclick=newGame;$('eb-menu').onclick=toMenu;$('eb-save').onclick=saveCard;$('eb-share').onclick=shareCard;
$('fs').onclick=()=>{const d=document,e=d.documentElement;if(d.fullscreenElement)d.exitFullscreen();else if(e.requestFullscreen)e.requestFullscreen().then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})).catch(()=>{});};
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();Mu.pause();if(A.x)A.x.suspend();}else{if(A.x&&st!=='pause')A.x.resume();if(st!=='pause')Mu.resume();}});
/* selector de nivel */
{const lg=$('lvsel');for(let l=1;l<=20;l++){const b=document.createElement('button');b.textContent=l;b.onclick=()=>{LV=l;store.set('figumate_lv',l);refreshMenu();};lg.appendChild(b);}}
$('splash').onclick=()=>{if(!$('splash').classList.contains('ready'))return;ctx();toMenu();};

/* ---------- BUCLE ---------- */
function scroll(d){for(const gt of GT)gt.t.offset.y=(gt.t.offset.y+d/gt.tile)%1;
 for(const s of SC){const p=s.m.position;p.z+=d*s.k;if(p.z>s.max)p.z-=s.span;}
 for(let i=obs.length-1;i>=0;i--){const o=obs[i];o.m.position.z+=d;if(o.m.position.z>8){o.m.visible=false;free[o.t].push(o.m);obs.splice(i,1);}}
 for(let i=pus.length-1;i>=0;i--){const p=pus[i];p.m.position.z+=d;if(p.m.position.z>8){S.remove(p.m);pus.splice(i,1);}}
 if(gate.visible)gate.position.z+=d;}
function update(dt){T+=dt;
 if(st==='pause')return;
 if(st==='quiz')return;
 if(st==='garage'){cam.position.set(0,2.6,7.5);cam.lookAt(0,1,0);player.position.set(-2.3,.05,0);player.rotation.y=T*.8;return;}
 if(st==='menu'||st==='end'||st==='splash'){scroll(7*dt);cam.position.set(Math.sin(T*.5)*7,2.8,Math.cos(T*.5)*3+7);cam.lookAt(0,1.2,-14);player.position.set(0,0,0);player.visible=true;return;}
 if(st==='count'){const p=Math.ceil(cdT);cdT-=dt;const n=Math.ceil(cdT);const e=$('cd');e.classList.add('show');if(n!==p||e.textContent===''){e.textContent=n>0?n:'¡CORRE!';(n>0?SFX.beep:SFX.go)();}
  if(cdT<=0){e.classList.remove('show');e.textContent='';st='play';}scroll(10*dt);}
 else{
 elapsed+=dt;timeLeft-=dt;if(timeLeft<=0){timeLeft=0;return end(false);}
 slow=Math.min(1,slow+dt*1.1);const sp=CFG.SPEED*(1+.5*D())*slow*(1+.04*Math.min(kills,12));scroll(sp*dt);
 mvCD-=dt;fireCD-=dt;inv-=dt;
 if(mvCD<=0&&(held.left||held.right)){if(held.left)lane=Math.max(0,lane-1);else lane=Math.min(2,lane+1);mvCD=.22;}
 if(held.fire)fire();
 px+=(L[lane]-px)*Math.min(1,12*dt);if(py>0||vy>0){vy-=32*dt;py+=vy*dt;if(py<=0){py=vy=0;burst(new THREE.Vector3(px,.1,0),0xcccccc,5,3);}}
 if(en&&en.alive){const g=en.g;en.laneT-=dt;if(en.laneT<=0){en.lane=(Math.random()*3)|0;en.laneT=(rnd(1,2.6)-en.i*.15)*(1-.35*D());}
  g.position.x+=(L[en.lane]-g.position.x)*Math.min(1,3*dt);const tz=-34+Math.sin(T*.7+en.i)*7;g.position.z+=(tz-g.position.z)*Math.min(1,2*dt);
  en.pulse=Math.max(0,en.pulse-dt);g.scale.setScalar(g.userData.s*(1+en.pulse));
  en.trapT-=dt;if(en.trapT<=0){en.trapT=[3.6,3.1,2.7,2.3,1.8][en.i]*(1-.4*D());spawnObs(5,en.lane,g.position.z+3);burst(g.position,0xff3300,6,3);}}
 else if(deadT>0&&!fin){deadT-=dt;if(deadT<=0){if(kills<5||endless)spawnEnemy();else{fin=true;en=null;gate.visible=true;gate.position.z=-170;toast('¡A LA META! 🏁');}}}
 spT-=dt;if(spT<=0&&!(fin&&gate.position.z>-45)){spT=rnd(.8,1.4)*(1-.45*D())/(1+.05*Math.min(kills,12));const ls=shuffle([0,1,2]).slice(0,Math.random()<.12+.4*D()?2:1);for(const l of ls)spawnObs(pickType(),l,-150);}
 puT-=dt;if(puT<=0&&!fin){puT=rnd(4.5,6.5);const m=mkStar();m.position.set(L[Math.random()*3|0],1.2,-150);S.add(m);pus.push({m});}
 for(const o of obs){const p=o.m.position;if(o.t===4)p.x=L[o.lane]+Math.sin(T*2+o.ph)*2.2;if(o.t===5)o.m.rotation.y+=dt*4;
  if(!o.done&&inv<=0&&p.z>-1.8&&p.z<1.8&&Math.abs(p.x-px)<o.hw+.85&&py<o.h-.15){o.done=true;p.z=99;hurt();}
  else if(!o.done&&p.z>2.5){o.done=true;addScore(25);}}
 for(let i=pus.length-1;i>=0;i--){const p=pus[i],m=p.m.position;p.m.rotation.y+=dt*3;if(m.z>-2&&m.z<2&&Math.abs(m.x-px)<1.6){S.remove(p.m);pus.splice(i,1);addScore(50);SFX.coin();burst(m,0xffd400,12,5);startQuiz();return;}}
 for(let i=bul.length-1;i>=0;i--){const b=bul[i];b.m.position.z-=95*dt;b.l-=dt;let rm=b.l<=0;
  if(en&&en.alive){const e=en.g.position;if(b.m.position.z<e.z+2&&b.m.position.z>e.z-2.5&&Math.abs(b.m.position.x-e.x)<1.7){en.hp--;en.pulse=.15;rm=true;SFX.hit();burst(b.m.position,0xffee55,10,6);if(en.hp<=0)killEnemy();}}
  if(rm){S.remove(b.m);bul.splice(i,1);}}
 if(fin&&gate.visible&&gate.position.z>0)return end(true);
 if(energy<=0)return end(false);
 hudT-=dt;if(hudT<=0){hudT=.1;hud();}
 }
 for(const p of PT)if(p.m.visible){p.l-=dt;p.v.y-=12*dt;p.m.position.addScaledVector(p.v,dt);if(p.l<=0)p.m.visible=false;}
 player.position.set(px,py,0);player.rotation.z=-(L[lane]-px)*.08;player.visible=inv<=0||(Math.floor(T*20)%2==0);
 shk=Math.max(0,shk-dt*1.5);cam.position.set(px*.55+rnd(-1,1)*shk*.3,4.3+py*.3+rnd(-1,1)*shk*.3,9);cam.lookAt(px*.4,1.2,-12);
 const f=62+(slow*8);if(Math.abs(cam.fov-f)>.2){cam.fov=f;cam.updateProjectionMatrix();}
}
let last=0;function loop(t){requestAnimationFrame(loop);const dt=Math.min((t-last)/1000||0,.05);last=t;update(dt);R.render(S,cam);}

/* ---------- ARRANQUE ---------- */
(function blocks(){const b=$('blks'),cols=['#4caf3a','#8b5a2b','#ffd400','#3ab3da','#b02e26','#8932b8'];for(let i=0;i<22;i++){const e=document.createElement('i');e.style.left=rnd(0,100)+'%';e.style.background=pick(cols);e.style.animationDuration=rnd(7,16)+'s';e.style.animationDelay=-rnd(0,14)+'s';b.appendChild(e);}})();
async function boot(){const setP=(p,t)=>{$('lb').style.width=p+'%';$('lt').textContent=t;},t0=performance.now();
 parkEnemies();st='splash';setP(10,'Construyendo bloques…');
 try{if(document.fonts&&document.fonts.load)await Promise.race([document.fonts.load('16px "Press Start 2P"'),new Promise(r=>setTimeout(r,1500))]);}catch(e){}
 setP(20,'Cargando figuras…');
 await new Promise(res=>loadFigures((n,t)=>setP(20+Math.round(n/t*80),'Cargando figuras '+n+'/'+t),res));
 if(MISSING.length)figWarn='Faltan archivos en figuras/: '+MISSING.join(', ');
 setP(100,MISSING.length?'Faltan '+MISSING.length+' figuras':'Todo listo');
 await new Promise(r=>setTimeout(r,Math.max(0,(MISSING.length?2600:1900)-(performance.now()-t0))));$('splash').classList.add('ready');}
requestAnimationFrame(loop);boot();
})();

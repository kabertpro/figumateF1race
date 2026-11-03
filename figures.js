const FIGURES={"redonda":4,"blanca":2,"negra":1,"corchea":0.5,"semicorchea":0.25,"redonda-sil":4,"blanca-sil":2,"negra-sil":1,"corchea-sil":0.5,"semicorchea-sil":0.25,"corro":1,"pescame":1,"sabado":1,"detengo":1,"ligerito":1,"tresillo":1,"salto":1,"vamos":1};
const REPO="https://raw.githubusercontent.com/kabertpro/figumategame/main/figuras/";
// Figuras por nivel (1-20). Niveles 15-20: todas, con más peso a las fraccionarias.
const P5=["negra","blanca","corro","negra-sil","blanca-sil"];
const SPEC=["corro","pescame","sabado","detengo","ligerito","tresillo","salto","vamos"];
const LV_POOLS=[null,
 ["negra","negra-sil"],
 ["negra","negra-sil","corro"],
 ["negra","blanca"],
 ["negra","blanca","negra-sil","blanca-sil"],
 P5,
 [...P5,"redonda"],
 [...P5,"redonda","redonda-sil"],
 [...P5,"redonda","redonda-sil","pescame","sabado"],
 [...P5,"redonda","redonda-sil","pescame","sabado","detengo","ligerito"],
 [...P5,"redonda","redonda-sil",...SPEC],
 [...P5,"redonda","redonda-sil",...SPEC,"corchea"],
 [...P5,"redonda","redonda-sil",...SPEC,"corchea","corchea-sil"],
 [...P5,"redonda","redonda-sil",...SPEC,"corchea","corchea-sil","semicorchea"],
 Object.keys(FIGURES)];
for(let l=15;l<=20;l++)LV_POOLS[l]=LV_POOLS[14];
const LV_DESC=[null,"Negras y silencios de negra","Negras, silencios y corros","Negras y blancas","Negras, blancas y sus silencios","Negras, blancas, corros y sus silencios","+ Redondas","+ Silencio de redonda","+ Pescame y Sábado","+ Detengo y Ligerito","+ Tresillo, Salto y Vamos (todo entero)","+ Corcheas","+ Silencio de corchea","+ Semicorcheas","Todas las figuras (con fracciones)"];
for(let l=15;l<=20;l++)LV_DESC[l]="Todas las figuras · más fracciones y trampas";
const URLS={},MISSING=[];let prevSig="",prevSum=-1;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
function loadFigures(prog,done){const ks=Object.keys(FIGURES);let n=0;
 const fin=()=>{prog(++n,ks.length);if(n===ks.length)done();};
 ks.forEach(k=>{const im=new Image();let alt=false;
  im.onload=()=>{URLS[k]=im.src;fin();};
  im.onerror=()=>{if(!alt){alt=true;im.src=REPO+k+".png";}else{MISSING.push(k+".png");fin();}};
  im.src="figuras/"+k+".png";});}
function makeQuestion(l){
 const all=LV_POOLS[l];let pool=all.filter(k=>URLS[k]);if(!pool.length)pool=all;
 const prev=l>1?LV_POOLS[l-1]:[],nw=l>1&&l<15?pool.filter(k=>!prev.includes(k)):[];
 const wt=k=>1+(l>14&&FIGURES[k]<1?(l-14)*1.5:0),tot=pool.reduce((a,k)=>a+wt(k),0);
 const wp=()=>{let r=Math.random()*tot;for(const k of pool){r-=wt(k);if(r<=0)return k;}return pool[0];};
 let f,sig,sum,t=0;
 do{const n=3+(Math.random()*5|0); // entre 3 y 7 figuras
  f=[];for(let i=0;i<n;i++)f.push(wp());
  if(nw.length&&!f.some(k=>nw.includes(k)))f[Math.random()*n|0]=nw[Math.random()*nw.length|0];
  sig=f.join();sum=f.reduce((a,k)=>a+FIGURES[k],0);}while((sig===prevSig||sum===prevSum)&&++t<40);
 prevSig=sig;prevSum=sum;
 const st=l<=10?1:l<=12?.5:.25;
 const offs=l>=15?[-1,1,-2,2]:[-1,1,2,-2,3,-3];
 const c=shuffle(offs.map(m=>sum+m*st).filter(v=>v>0));
 return{figs:f,sum,opts:shuffle([sum,...c.slice(0,3)])};
}

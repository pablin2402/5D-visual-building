const $=id=>document.getElementById(id);
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
/* ---------- UI: paneles, avisos y formatos ---------- */
const RM=matchMedia('(prefers-reduced-motion: reduce)');
function showPanel(e){if(!e)return;clearTimeout(e._ht);e.classList.remove('is-leaving');e.hidden=false;}
function hidePanel(e){if(!e||e.hidden)return;clearTimeout(e._ht);if(RM.matches){e.hidden=true;return;}e.classList.add('is-leaving');e._ht=setTimeout(()=>{e.hidden=true;e.classList.remove('is-leaving');},160);}
function toolState(){[['estBtn',()=>typeof STRUCT!=='undefined'&&STRUCT.on],['furnBtn',()=>FURN.on],['finBtn',()=>FINC.on],['prodBtn',()=>SHOP.on],['winBtn',()=>WIN.on],['doorBtn',()=>DOOR.on],['zocBtn',()=>ZOC.on],['facBtn',()=>typeof FAC!=='undefined'&&FAC.on],['cortBtn',()=>typeof CORT!=='undefined'&&CORT.on],['techBtn',()=>typeof TECH!=='undefined'&&TECH.on],['pisoBtn',()=>PISO.on],['wrBtn',()=>WR.on]].forEach(([id,f])=>{try{$(id).setAttribute('aria-pressed',String(!!f()));}catch(e){}});}
let toastT=null;
function toast(msg,kind){const t=$('toast');clearTimeout(toastT);clearTimeout(t._ht);t.className='toast '+(kind||'ok');t.innerHTML=`<svg class="ico"><use href="#${kind==='err'?'i-alert':'i-check'}"/></svg><span></span>`;t.lastChild.textContent=msg;t.hidden=false;toastT=setTimeout(()=>hidePanel(t),kind==='err'?5200:2600);}
const cmR=v=>Math.round(v*100);
function dimsTxt(it){if(!it||!it.dims)return '';const k=+it.scale||1,[x,y,z]=it.dims;return `${cmR(x*k)} × ${cmR(z*k)} × ${cmR(y*k)} cm`;}
function keepFocus(box,attr,fn){const a=document.activeElement,v=a&&box.contains(a)&&a.getAttribute(attr);fn();if(v!=null&&v!==false){const n=[...box.querySelectorAll('['+attr+']')].find(x=>x.getAttribute(attr)===v);if(n)n.focus({preventScroll:true});}}
const SLAB=0.2,EYE=1.6,FPX=64;
const BUILTIN={id:'peredo',name:'Edificio Peredo Rivas',sub:'Zona Hipódromo · Cochabamba',builtin:true,
  stats:[['1.867,10','m² construidos'],['405,00','m² de lote'],['9 + S','plantas y semisótano'],['+28,84','m nivel de cubierta']],
  foot:'Muros, columnas, ambientes y mobiliario sacados del plano aprobado (L.M. 1753/2025, septiembre 2026) a escala 1:100. Acabados y mobiliario referenciales.',
  floors:[
 {k:'S', g:'S', n:'Semisótano',lv:-3.00,h:3.90,a:234.22,u:'8 parqueos, bauleras, sala de máquinas y rampa de acceso al 20 %.'},
 {k:'PB',g:'PB',n:'Planta baja',lv:0.90,h:3.70,a:262.84,u:'Locales comerciales 1 y 2, tiendas 1 y 2, recepción, depósitos y vivienda de servicio.'},
 {k:'1', g:'1', n:'1.er piso',lv:4.60,h:3.03,a:224.62,u:'Tres departamentos: A con suite y dos dormitorios, B y C de un dormitorio con cocina y estar propios.'},
 {k:'2', g:'2', n:'2.º piso',lv:7.63,h:3.03,a:166.60,u:'Departamento A: suite con vestidor, dos dormitorios, estudio, estar, comedor, cocina, despensa y servicios.'},
 {k:'3', g:'3', n:'3.er piso',lv:10.66,h:3.03,a:166.60,u:'Departamento A: suite con vestidor, dormitorio, estudio, área de planchado, cocina, despensa y servicios.'},
 {k:'4', g:'45',n:'4.º piso',lv:13.69,h:3.03,a:166.60,u:'Planta tipo con cinco home estudios (A a E), cada uno con dormitorio, cocina y baño.'},
 {k:'5', g:'45',n:'5.º piso',lv:16.72,h:3.03,a:166.60,u:'Planta tipo con cinco home estudios (A a E), cada uno con dormitorio, cocina y baño.'},
 {k:'6', g:'6', n:'6.º piso',lv:19.75,h:3.03,a:166.60,u:'Departamento A: suite con vestidor, dormitorio, estudio, área de planchado, cocina, despensa y servicios.'},
 {k:'7', g:'7', n:'7.º piso',lv:22.78,h:3.03,a:166.60,u:'Departamento A con comedor diario, suite con vestidor, dos dormitorios, estudio y servicios.'},
 {k:'8', g:'8', n:'8.º piso',lv:25.81,h:3.03,a:145.82,u:'Área común: salón y estar de copropietarios, terraza con parrillero, lavandería y áreas de secado. Terraza libre de 20,78 m².'}
  ]};

/* ---------- renderer ---------- */
const stage=$('stage');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.82;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
const shadowsDirty=()=>{renderer.shadowMap.needsUpdate=true;};
let ENV_OUT=null,ENV_IN=null;
renderer.physicallyCorrectLights=false;
stage.prepend(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,1,0.05,1200);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.maxPolarAngle=Math.PI*0.495;controls.minDistance=3;controls.maxDistance=260;
const hemi=new THREE.HemisphereLight(0xeaf2ff,0x8d8a7c,0.45);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1dc,1.15);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);sun.shadow.bias=-0.0003;sun.shadow.normalBias=0.02;
Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:1,far:260});
scene.add(sun,sun.target);
const fillL=new THREE.DirectionalLight(0xd9e6ff,0.3);fillL.position.set(40,30,40);scene.add(fillL);

function canvasTex(w,h,draw,rep){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;if(rep)t.repeat.set(rep,rep);return t;
}
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
function noise(x,w,h,base,amp,n,size){x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=(rnd()-0.5)*amp;x.fillStyle=v>0?`rgba(255,255,255,${v})`:`rgba(0,0,0,${-v})`;const s=size*(0.5+rnd());x.fillRect(rnd()*w,rnd()*h,s,s);}}
(function(){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,'#7fa7c9');g.addColorStop(0.48,'#dfe9f0');g.addColorStop(0.52,'#b9b4a6');g.addColorStop(1,'#6d6a60');
  x.fillStyle=g;x.fillRect(0,0,1024,512);x.fillStyle='rgba(255,250,235,.9)';x.beginPath();x.arc(300,120,40,0,7);x.fill();
  const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;
  const pm=new THREE.PMREMGenerator(renderer);ENV_OUT=pm.fromEquirectangular(t).texture;scene.environment=ENV_OUT;t.dispose();
  if(THREE.RoomEnvironment)ENV_IN=pm.fromScene(new THREE.RoomEnvironment(),0.04).texture;pm.dispose();
})();

const TX={
  plaster:canvasTex(256,256,(x,w,h)=>noise(x,w,h,'#ffffff',0.025,1800,2),0.5),
  facade:canvasTex(256,256,(x,w,h)=>noise(x,w,h,'#ffffff',0.09,3000,3),0.4),
  concrete:canvasTex(256,256,(x,w,h)=>{noise(x,w,h,'#ffffff',0.14,4000,2);for(let i=0;i<40;i++){x.fillStyle='rgba(0,0,0,.08)';x.beginPath();x.arc(rnd()*w,rnd()*h,1+rnd()*2,0,7);x.fill();}},0.5),
  grass:canvasTex(256,256,(x,w,h)=>{noise(x,w,h,'#6f8f55',0.18,6000,2);},0.12),
  asphalt:canvasTex(256,256,(x,w,h)=>noise(x,w,h,'#4b4e52',0.2,9000,1.5),0.2),
  pavers:canvasTex(256,256,(x,w,h)=>{x.fillStyle='#b8b2a6';x.fillRect(0,0,w,h);const s=w/8;for(let r=0;r<8;r++)for(let c=0;c<8;c++){const v=200+Math.floor(rnd()*25-12);x.fillStyle=`rgb(${v},${v-6},${v-16})`;x.fillRect(c*s+1,r*s+1,s-2,s-2);}},0.5),
  wood:canvasTex(256,64,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);for(let i=0;i<120;i++){x.strokeStyle=`rgba(90,55,25,${0.05+rnd()*0.08})`;x.beginPath();const y=rnd()*h;x.moveTo(0,y);x.bezierCurveTo(w*.3,y+rnd()*4-2,w*.6,y+rnd()*4-2,w,y+rnd()*3-1.5);x.stroke();}},1),
  tileWall:canvasTex(128,256,(x,w,h)=>{x.fillStyle='#bdb8ae';x.fillRect(0,0,w,h);x.fillStyle='#f1eee8';x.fillRect(2,2,w-4,h-4);const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(0,0,0,.04)');x.fillStyle=g;x.fillRect(2,2,w-4,h-4);},1),
  fabric:canvasTex(128,128,(x,w,h)=>{noise(x,w,h,'#ffffff',0.12,3000,1.2);for(let i=0;i<h;i+=2){x.fillStyle='rgba(0,0,0,.03)';x.fillRect(0,i,w,1);}},2)
};
const MAT={
  slab:new THREE.MeshStandardMaterial({color:0x5f6469,map:TX.concrete,roughness:0.85}),
  cover:new THREE.MeshStandardMaterial({color:0xb7b3aa,map:TX.concrete,roughness:0.9,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2}),
  wall:new THREE.MeshStandardMaterial({color:0xe6e0d4,map:TX.plaster,roughness:0.95,envMapIntensity:0.5}),
  facade:new THREE.MeshStandardMaterial({color:0xc9b79c,map:TX.facade,roughness:0.88}),
  fac:new THREE.MeshStandardMaterial({color:new THREE.Color(0xd9c6a5).convertSRGBToLinear(),roughness:0.9,envMapIntensity:0.6}),
  band:new THREE.MeshStandardMaterial({color:new THREE.Color(0xeee6d6).convertSRGBToLinear(),roughness:0.85,envMapIntensity:0.6}),
  curtain:new THREE.MeshStandardMaterial({color:0xefe8dc,map:TX.fabric,roughness:1,side:THREE.DoubleSide,transparent:true,opacity:0.92}),
  painted:new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,map:TX.plaster,roughness:0.93,envMapIntensity:0.5}),
  tileWall:new THREE.MeshStandardMaterial({color:0xffffff,map:TX.tileWall,roughness:0.25}),
  lampOn:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff1d6,emissiveIntensity:1.1}),
  zocalo:new THREE.MeshStandardMaterial({color:0x5a3a24,roughness:0.55}),
  doorframe:new THREE.MeshStandardMaterial({color:0x6a4328,map:TX.wood,roughness:0.5}),
  doorleaf:new THREE.MeshStandardMaterial({color:0x8a5a36,map:TX.wood,roughness:0.5}),
  fence:new THREE.MeshStandardMaterial({color:0xc9c2b5,map:TX.facade,roughness:0.9}),
  col:new THREE.MeshStandardMaterial({color:0xbab8b3,map:TX.concrete,roughness:0.8}),
  glass:new THREE.MeshStandardMaterial({color:0xcfe2ea,roughness:0.03,metalness:0.15,transparent:true,opacity:0.22,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:0.9}),
  rail:new THREE.MeshStandardMaterial({color:0xbfd6de,roughness:0.05,metalness:0.4,transparent:true,opacity:0.3,depthWrite:false,side:THREE.DoubleSide}),
  frame:new THREE.MeshStandardMaterial({color:0x2c3236,roughness:0.45,metalness:0.6}),
  ceil:new THREE.MeshStandardMaterial({color:0xf3f0ea,roughness:1,side:THREE.DoubleSide,emissive:0x8a867d,emissiveIntensity:0.55}),
  ground:new THREE.MeshStandardMaterial({color:0xffffff,map:TX.grass,roughness:1,transparent:true}),
  street:new THREE.MeshStandardMaterial({color:0xffffff,map:TX.asphalt,roughness:0.95}),
  walk:new THREE.MeshStandardMaterial({color:0xffffff,map:TX.pavers,roughness:0.95}),
  curb:new THREE.MeshStandardMaterial({color:0xcfccc4,roughness:0.9}),
  paint:new THREE.MeshStandardMaterial({color:0xf2f0e6,roughness:0.7}),
  tree:new THREE.MeshStandardMaterial({color:0x5f7f4b,roughness:1,flatShading:true}),
  trunk:new THREE.MeshStandardMaterial({color:0x6b5a48,roughness:1}),
  edge:new THREE.LineBasicMaterial({color:0x2a3036,transparent:true,opacity:0.12}),
  hl:new THREE.LineBasicMaterial({color:0xc2541c})
};
const FURN_MAT={
  linen:new THREE.MeshStandardMaterial({color:0xece6da,map:TX.fabric,roughness:0.95}),
  fabric:new THREE.MeshStandardMaterial({color:0x5f6b78,map:TX.fabric,roughness:0.95}),
  wood:new THREE.MeshStandardMaterial({color:0x9a6c45,map:TX.wood,roughness:0.6}),
  light:new THREE.MeshStandardMaterial({color:0xcdb08a,map:TX.wood,roughness:0.6}),
  stone:new THREE.MeshStandardMaterial({color:0xdcd8d0,roughness:0.28,metalness:0.05}),
  porcelain:new THREE.MeshStandardMaterial({color:0xf8f8f6,roughness:0.18}),
  steel:new THREE.MeshStandardMaterial({color:0x9aa1a6,roughness:0.35,metalness:0.7})
};

/* ---------- floor finishes ---------- */
Assets.init(THREE,renderer);
Glazing.init(THREE,{envScale:()=>{try{return LIGHT.env!=null?LIGHT.env:1;}catch(e){return 1;}}});
const GLAZ_READY=Glazing.load('library/carpinteria/kit.gltf');
Doors.init(THREE,{envScale:()=>{try{return LIGHT.env!=null?LIGHT.env:1;}catch(e){return 1;}}});
const DOORS_READY=Doors.load('library/carpinteria/puertas.gltf');
Zocalos.init(THREE,{envScale:()=>{try{return LIGHT.env!=null?LIGHT.env:1;}catch(e){return 1;}},aniso:renderer.capabilities.getMaxAnisotropy?Math.min(8,renderer.capabilities.getMaxAnisotropy()):4});
const ZOC_READY=Zocalos.load('library/zocalos/kit.gltf');
Wardrobes.init(THREE,{envScale:()=>{try{return LIGHT.env!=null?LIGHT.env:1;}catch(e){return 1;}},aniso:renderer.capabilities.getMaxAnisotropy?Math.min(8,renderer.capabilities.getMaxAnisotropy()):4});
let WR_READY=null;const wrReady=()=>WR_READY||(WR_READY=Wardrobes.load('library/roperos/kit.gltf'));
Luces.init(THREE,scene,{max:3});
Cortinas.init(THREE,{onChange:()=>{try{shadowsDirty();}catch(e){}},aniso:renderer.capabilities.getMaxAnisotropy?Math.min(8,renderer.capabilities.getMaxAnisotropy()):4});
Techos.init(THREE,{plaster:()=>{try{return Mats.get('pintura-mate');}catch(e){return null;}}});
const CORT_READY=Cortinas.load('library/cortinas/cortinas.gltf','library/cortinas/telas.jpg');
const QKEY='peredo.texQ',LKEY='peredo.light';function _lsG(k){try{return localStorage.getItem(k);}catch(e){return null;}}function _lsS(k,v){try{localStorage.setItem(k,v);}catch(e){}}
Mats.init(THREE,renderer,{quality:_lsG(QKEY)||(/Mobi|Android/i.test(navigator.userAgent)?'medium':'high'),onUpdate:()=>{shadowsDirty();}});
const MATS_READY=Mats.load('library/materials/index.json').catch(e=>{console.warn('Sin biblioteca de materiales',e);return [];});
const FM=Furn.materials(THREE,TX);FM.car.forEach((m,j)=>FM['car'+j]=m);
const FIN={
  wood:{n:'Piso de madera',c:'#c49a6c'},
  tile:{n:'Cerámica',c:'#e6e2db'},
  porc:{n:'Porcelanato',c:'#d8cdbb'},
  conc:{n:'Hormigón',c:'#b5b2ab'},
  deck:{n:'Deck exterior',c:'#8a674a'},
  stone:{n:'Piedra',c:'#c7c2b6'}
};
function roomKind(s){return Rooms.kind(s);}
function makePatterns(){
  const P={};const mk=(wm,hm,fn)=>{const w=Math.round(wm*FPX),h=Math.round(hm*FPX),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn(x,w,h);return x.getImageData(0,0,w,h);};
  P.wood=mk(2.4,1.08,(x,w,h)=>{const ph=h/6;const oak=['#9c6f45','#986b42','#a07448','#956840','#9e7146'];
    for(let r=0;r<6;r++){let off=-(rnd()*w*0.5);while(off<w){const L=w*0.5;x.fillStyle=oak[(rnd()*oak.length)|0];x.fillRect(off,r*ph,L,ph);
      for(let k=0;k<6;k++){x.strokeStyle=`rgba(80,45,20,${0.04+rnd()*0.06})`;x.beginPath();const y=r*ph+rnd()*ph;x.moveTo(off,y);x.lineTo(off+L,y+rnd()*2-1);x.stroke();}
      x.fillStyle='rgba(60,35,15,.35)';x.fillRect(off,r*ph,1,ph);off+=L;}
      x.fillStyle='rgba(60,35,15,.28)';x.fillRect(0,r*ph,w,1);}});
  P.tile=mk(1.2,1.2,(x,w,h)=>{const s=w/2;x.fillStyle='#c9c4bb';x.fillRect(0,0,w,h);for(let r=0;r<2;r++)for(let c=0;c<2;c++){const v=232+((rnd()*10)|0)-5;x.fillStyle=`rgb(${v},${v-3},${v-8})`;x.fillRect(c*s+1,r*s+1,s-2,s-2);}});
  P.porc=mk(1.6,1.6,(x,w,h)=>{const s=w/2;x.fillStyle='#bdb19d';x.fillRect(0,0,w,h);for(let r=0;r<2;r++)for(let c=0;c<2;c++){const v=((rnd()*10)|0)-5;x.fillStyle=`rgb(${218+v},${207+v},${189+v})`;x.fillRect(c*s+1,r*s+1,s-2,s-2);for(let i=0;i<30;i++){x.fillStyle=`rgba(255,255,255,${rnd()*0.08})`;x.fillRect(c*s+rnd()*s,r*s+rnd()*s,rnd()*10,1);}}});
  P.conc=mk(2,2,(x,w,h)=>{noise(x,w,h,'#b6b3ad',0.12,1500,2);});
  P.deck=mk(1.2,1.2,(x,w,h)=>{const n=10,sw=h/n;for(let i=0;i<n;i++){const v=((rnd()*16)|0)-8;x.fillStyle=`rgb(${138+v},${103+v},${74+v})`;x.fillRect(0,i*sw,w,sw-1);x.fillStyle='rgba(30,20,10,.6)';x.fillRect(0,i*sw+sw-1,w,1);}});
  P.stone=mk(1.2,1.2,(x,w,h)=>{noise(x,w,h,'#c7c2b6',0.1,800,3);x.strokeStyle='rgba(90,85,75,.4)';x.strokeRect(0.5,0.5,w-1,h-1);});
  return P;
}
let PATTERNS=null;
function libPattern(k,fallback){const T=LIB.tex[k];if(!T)return fallback;const w=Math.max(8,Math.round(T.tileM*FPX)),h=Math.max(8,Math.round(T.tileM*FPX*T.img.height/T.img.width));const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(T.img,0,0,w,h);
  try{const im=x.getImageData(0,0,w,h),d=im.data;let L=0;for(let i=0;i<d.length;i+=16)L+=(0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]);L/=(d.length/16)*255;
    const tgt=T.keep?1:({wood:0.42,tile:0.72,porc:0.62,conc:0.55,deck:0.4}[k]||0.55),fac=Math.min(1,tgt/Math.max(L,0.01));if(fac<0.99)for(let i=0;i<d.length;i+=4){d[i]*=fac;d[i+1]*=fac;d[i+2]*=fac;}return im;}catch(e){return fallback;}}

function pip(pt,pl){let c=false;for(let i=0,j=pl.length-1;i<pl.length;j=i++){const a=pl[i],b=pl[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function segDist(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],L=dx*dx+dz*dz;let t=L?((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
function distToPoly(p,pl){let d=Infinity;for(let i=0,j=pl.length-1;i<pl.length;j=i++)d=Math.min(d,segDist(p,pl[j],pl[i]));return d;}

function doorLines(G,prg){return Rooms.doorLines(G,prg);}
function roomGrid(G,opts){return Rooms.roomGrid(G,opts);}
function freeRun(rg,px,pz,ux,uz){for(let k=0;k<=240;k++){const t=k*0.025;const X=Math.floor((px+ux*t-rg.mx)*rg.R),Y=Math.floor((pz+uz*t-rg.mz)*rg.R);if(X<0||Y<0||X>=rg.w||Y>=rg.h)return t;const i=Y*rg.w+X;if(rg.block.d[i]||!rg.ins.d[i])return t;}return 6;}
function backSide(rg,x0,x1,z0,z1,kind){
  const S={n:[[0,-1],(t)=>[x0+(x1-x0)*t,z0]],s:[[0,1],(t)=>[x0+(x1-x0)*t,z1]],w:[[-1,0],(t)=>[x0,z0+(z1-z0)*t]],e:[[1,0],(t)=>[x1,z0+(z1-z0)*t]]};
  const longNS=(x1-x0)>=(z1-z0);
  let cand=['n','s','w','e'];
  const dx=x1-x0,dz=z1-z0;
  if(/^(sofa|counter|wardrobe|desk|dresser|vanity|reception|shelf|tub|sink)$/.test(kind))cand=longNS?['n','s']:['w','e'];
  else if(/^(bed|bedSingle)$/.test(kind)){const lenX=(dx>=1.85&&dx<=2.3&&dz>=2.2)?true:(dz>=1.85&&dz<=2.3&&dx>=2.2)?false:dx>=dz;cand=lenX?['w','e']:['n','s'];}
  else if(/^(toilet|lounger)$/.test(kind))cand=longNS?['w','e']:['n','s'];
  let best=cand[0],bd=Infinity;
  cand.forEach(k=>{const [[ux,uz],pt]=S[k];let d=0;[0.25,0.5,0.75].forEach(t=>{const p=pt(t);d+=Math.min(1.5,freeRun(rg,p[0]+ux*0.03,p[1]+uz*0.03,ux,uz));});if(d<bd){bd=d;best=k;}});
  return best;
}
function wetRoom(G,rg,x,z){
  const cand=(G.labels||[]).filter(l=>roomKind(l[0])==='tile').map(l=>({s:l[0],d:Math.hypot(l[1]-x,l[2]-z),l})).filter(c=>c.d<4.5).sort((a,b)=>a.d-b.d);
  const clear=c=>{const n=Math.ceil(c.d/0.03);let hits=0;for(let i=1;i<n;i++){const t=i/n,px=x+(c.l[1]-x)*t,pz=z+(c.l[2]-z)*t;const X=Math.floor((px-rg.mx)*rg.R),Y=Math.floor((pz-rg.mz)*rg.R);if(X>=0&&Y>=0&&X<rg.w&&Y<rg.h&&rg.block.d[Y*rg.w+X])hits++;}return hits<=1;};
  const c=cand.find(clear);if(c)return c.s;const L=kindAt(rg,x,z);if(L&&L.wet)return L.s;return cand.length&&cand[0].d<2?cand[0].s:null;}
const ARR=new WeakMap();
function arrangeFurn(G,rg,roomOf){
  if(ARR.has(G))return ARR.get(G);
  const {R,w,h,mx,mz,lab,block,ins}=rg,N=w*h;
  const box=o=>{const xs=o.p.map(p=>p[0]),zs=o.p.map(p=>p[1]);return [Math.min(...xs),Math.min(...zs),Math.max(...xs),Math.max(...zs)];};
  const cell=(x,z)=>{const X=Math.floor((x-mx)*R),Y=Math.floor((z-mz)*R);return X<0||Y<0||X>=w||Y>=h?-1:Y*w+X;};
  const solid=j=>j<0||!!block.d[j]||!ins.d[j];
  const info=(G.furn||[]).map(o=>{const b=box(o),s=roomOf(o),dx=b[2]-b[0],dz=b[3]-b[1],lo=Math.min(dx,dz),hi=Math.max(dx,dz);const j=cell((b[0]+b[2])/2,(b[1]+b[3])/2);
    return {o,b,s,L:j>=0?lab[j]:-1,kind:Furn.kindOf(o,s,lo,hi,o.h,dx*dz),lo,hi};});
  const byRoom=new Map();info.forEach(f=>{if(f.L<0)return;if(!byRoom.has(f.L))byRoom.set(f.L,[]);byRoom.get(f.L).push(f);});
  const drop=new Set(),repl=new Map();
  const doorPts=[];(rg.doors||[]).forEach(([a,b])=>{for(let t=0;t<=1;t+=0.25)doorPts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);});
  const nearWin=(x,z)=>(G.wins||[]).some(q=>{const ax=q[0],az=q[1],bx=q[2],bz=q[3],vx=bx-ax,vz=bz-az,l2=vx*vx+vz*vz||1;let t=((x-ax)*vx+(z-az)*vz)/l2;t=Math.max(0,Math.min(1,t));return Math.hypot(ax+vx*t-x,az+vz*t-z)<0.35;});
  const DIRS={n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]};
  byRoom.forEach((fs,L)=>{
    const beds=fs.filter(f=>/^bed/.test(f.kind));
    const tables=fs.filter(f=>/^(desk|dining)$/.test(f.kind));
    const chairs=fs.filter(f=>f.kind==='chair');
    if(tables.length)chairs.forEach(f=>drop.add(f.o));
    else if(chairs.length){chairs.slice(1).forEach(f=>drop.add(f.o));const f=chairs[0];
      let best=null;Object.entries(DIRS).forEach(([k,[ux,uz]])=>{const cx=(f.b[0]+f.b[2])/2,cz=(f.b[1]+f.b[3])/2;const d=freeRunG(cx,cz,ux,uz);if(!best||d<best.d)best={k,d,ux,uz};});
      if(best&&best.d<4){const s=0.42,cx=(f.b[0]+f.b[2])/2+best.ux*(best.d-s/2-0.06),cz=(f.b[1]+f.b[3])/2+best.uz*(best.d-s/2-0.06);repl.set(f.o,{...f.o,p:rectP(cx-s/2,cz-s/2,cx+s/2,cz+s/2)});}}
    if(!beds.length)return;
    beds.slice(1).forEach(f=>drop.add(f.o));
    const bf=beds[0],dbl=bf.kind==='bed';
    fs.filter(f=>f.kind==='nightstand').forEach(f=>drop.add(f.o));
    const others=fs.filter(f=>f!==bf&&!drop.has(f.o)&&f.kind!=='skip').map(f=>f.b);
    const bw=dbl?Math.max(1.4,Math.min(1.6,bf.lo>2.25?bf.lo-0.9:bf.lo)):1.0,bl=2.05;
    const cells=[];for(let j=0;j<N;j++)if(lab[j]===L)cells.push(j);
    const fits=(x0,z0,x1,z1)=>{let n=0,bad=0;for(let z=z0+0.03;z<z1;z+=0.05)for(let x=x0+0.03;x<x1;x+=0.05){n++;const j=cell(x,z);if(solid(j)||(lab[j]!==L&&rg.zone[j]!==rg.labels[L].zone))bad++;}
      if(bad>n*0.01)return false;if(others.some(b=>b[0]<x1-0.05&&b[2]>x0+0.05&&b[1]<z1-0.05&&b[3]>z0+0.05))return false;
      if(doorPts.some(p=>inFoot(p,x0,z0,x1,z1,0.45)))return false;
      return true;};
    let best=null;
    Object.entries(DIRS).forEach(([k,[ux,uz]])=>{
      const seg=new Map();cells.forEach(j=>{const x=j%w,y=(j/w)|0,nx=x+ux,ny=y+uz;const nj=ny*w+nx;if(nx<0||ny<0||nx>=w||ny>=h||!block.d[nj])return;const key=ux?x:y;if(!seg.has(key))seg.set(key,[]);seg.get(key).push(ux?y:x);});
      seg.forEach((list,key)=>{list.sort((a,b)=>a-b);let s=0;for(let i=1;i<=list.length;i++){if(i<list.length&&list[i]===list[i-1]+1)continue;const a=list[s],b=list[i-1]+1;s=i;const len=(b-a)/R;if(len<bw+0.1)continue;
        const mid=(a+b)/2/R,wallC=(ux||uz)>0?(key+1)/R:key/R;
        const W=Math.min(len-0.02,bw+0.98);
        let x0,z0,x1,z1;
        if(ux){const wx=mx+wallC,c=mz+mid;x0=ux<0?wx:wx-bl;x1=x0+bl;z0=c-W/2;z1=c+W/2;}
        else{const wz=mz+wallC,c=mx+mid;z0=uz<0?wz:wz-bl;z1=z0+bl;x0=c-W/2;x1=c+W/2;}
        const fx0=ux?(ux<0?x0:x0-0.6):x0,fx1=ux?(ux<0?x1+0.6:x1):x1,fz0=uz?(uz<0?z0:z0-0.6):z0,fz1=uz?(uz<0?z1+0.6:z1):z1;
        if(!fits(x0+(ux?0:(W-bw)/2),z0+(uz?0:(W-bw)/2),x1-(ux?0:(W-bw)/2),z1-(uz?0:(W-bw)/2)))continue;
        if(!fits(fx0,fz0,fx1,fz1)&&!fits(x0,z0,x1,z1))continue;
        let win=0;for(let t=0;t<=1;t+=0.25){const px=ux?mx+wallC:x0+(x1-x0)*t,pz=uz?mz+wallC:z0+(z1-z0)*t;if(nearWin(px,pz))win++;}
        const score=len-(win?1.2:0)+(fits(x0,z0,x1,z1)?0.3:0);
        if(!best||score>best.score)best={score,k:{n:'n',s:'s',w:'w',e:'e'}[k],p:[x0,z0,x1,z1],full:fits(x0,z0,x1,z1),W,ux,uz};}});});
    if(!best)return;
    let [x0,z0,x1,z1]=best.p;if(!best.full){const sh=(best.W-bw-0.02)/2;if(best.ux){z0+=sh;z1-=sh;}else{x0+=sh;x1-=sh;}}
    const back={n:'n',s:'s',w:'w',e:'e'}[best.k];
    repl.set(bf.o,{...bf.o,p:rectP(x0,z0,x1,z1),b:back});});
  function rectP(x0,z0,x1,z1){return [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];}
  function inFoot(p,x0,z0,x1,z1,m){return p[0]>x0-m&&p[0]<x1+m&&p[1]>z0-m&&p[1]<z1+m;}
  function freeRunG(px,pz,ux,uz){for(let k=0;k<=240;k++){const t=k*0.025,j=cell(px+ux*t,pz+uz*t);if(solid(j))return t;}return 6;}
  const res=(G.furn||[]).filter(o=>!drop.has(o)).map(o=>repl.get(o)||o);ARR.set(G,res);
  return res;
}
function roomFor(G,rg,o){const c=[(o.p[0][0]+o.p[2][0])/2,(o.p[0][1]+o.p[2][1])/2];
  if(/^(toilet|shower|bsink|ksink|cooktop|box)$/.test(o.t||'')){const w=wetRoom(G,rg,c[0],c[1]);if(w)return w;}
  const L=kindAt(rg,c[0],c[1]);if(L&&L.grown&&!o.t&&o.h>0.7&&o.h<0.8)return 'COMEDOR';return (L&&L.s)||'';}
function extras(G,rg,f,top){
  const lamps=[],pend=[],out=[];
  (G.labels||[]).forEach(l=>{if(/PARQUEO|BAULERA|MAQUINAS|MÁQUINAS|DEP[OÓ]SITO|DESPENSA|TERRAZA|BALC/.test(l[0]))return;
    const x=l[1],z=l[2];if(blockedAt(rg,x,z))return;
    const g=new THREE.CylinderGeometry(0.16,0.16,0.03,24);g.translate(x,top-0.02,z);lamps.push(g);
    const g2=new THREE.CylinderGeometry(0.17,0.17,0.012,24);g2.translate(x,top-0.006,z);pend.push(g2);});
  if(lamps.length)out.push([MAT.lampOn,merge(lamps),false]);if(pend.length)out.push([FM.lacquer,merge(pend),false]);
  return out;
}
function kitchens(G,rg){
  const out=[],items=[],isl=[];
  (G.appl||[]).forEach(ap=>{const wr=wetRoom(G,rg,ap.x,ap.z)||'';if(!/COCIN|PARRILL|LAVANDER|SERVIC|SERV/.test(wr))return;
    const ds={};let bk=null,dist=9;[['n',[0,-1]],['s',[0,1]],['w',[-1,0]],['e',[1,0]]].forEach(([k,D])=>{const d=freeRun(rg,ap.x,ap.z,D[0],D[1]);ds[k]=d;if(d<dist){dist=d;bk=k;}});
    if(dist>0.6)return;
    {const D={n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]}[bk],hp=[ap.x+D[0]*(dist+0.03),ap.z+D[1]*(dist+0.03)],col=(G.cols||[]).find(c=>pip(hp,c));
      if(col){const xs=col.map(p=>p[0]),zs=col.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs),cx=(x0+x1)/2,cz=(z0+z1)/2,pw=D[0]?z1-z0:x1-x0,pd=D[0]?x1-x0:z1-z0,pp=[-D[1],D[0]];
        const free=(x,z)=>!blockedAt(rg,x,z),iso=pw<=0.8&&free(cx+D[0]*(pd/2+0.15),cz+D[1]*(pd/2+0.15))&&free(cx+pp[0]*(pw/2+0.15),cz+pp[1]*(pw/2+0.15))&&free(cx-pp[0]*(pw/2+0.15),cz-pp[1]*(pw/2+0.15));
        if(iso){isl.push({ap,D,col:{cx,cz,pw,pd}});return;}}}
    items.push({o:ap,bk,ds,t:ap.t});});
  items.forEach(it=>{const pref=items.find(j=>j!==it&&j.t==='cook'&&j.bk!==it.bk&&it.ds[j.bk]<0.6&&Math.hypot(j.o.x-it.o.x,j.o.z-it.o.z)<2.6);
    if(pref&&it.t!=='cook'){const ax=(pref.bk==='n'||pref.bk==='s')?0:1,D={n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]}[pref.bk];const w1=(ax===0?it.o.z:it.o.x)+(D[0]+D[1])*it.ds[pref.bk],w2=(ax===0?pref.o.z:pref.o.x)+(D[0]+D[1])*pref.ds[pref.bk];if(Math.abs(w1-w2)<0.2)it.bk=pref.bk;}
    const D={n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]}[it.bk];it.ax=(it.bk==='n'||it.bk==='s')?0:1;
    it.wall=(it.ax===0?it.o.z:it.o.x)+(D[0]+D[1])*it.ds[it.bk];it.ctr=it.ax===0?it.o.x:it.o.z;it.half=0.3;});
  const boxes=(G.furn||[]).filter(o=>o.t==='box');
  const used=new Set();
  items.forEach(it=>{if(used.has(it))return;const grp=items.filter(j=>!used.has(j)&&j.bk===it.bk&&Math.abs(j.wall-it.wall)<0.2&&Math.abs(j.ctr-it.ctr)<2.6);grp.forEach(j=>used.add(j));
    const bk=it.bk,ax=it.ax,wall=grp.reduce((s,j)=>s+j.wall,0)/grp.length,n={n:[0,1],s:[0,-1],w:[1,0],e:[-1,0]}[bk];
    let lo=Math.min(...grp.map(j=>j.ctr-Math.max(0.3,j.half))),hi=Math.max(...grp.map(j=>j.ctr+Math.max(0.3,j.half)));
    const off=0.3,at=t=>ax===0?[t,wall+n[1]*off]:[wall+n[0]*off,t];
    const stopBox=(t,dir)=>{let lim=1.4;boxes.forEach(b=>{const xs=b.p.map(p=>p[0]),zs=b.p.map(p=>p[1]);const bmin=ax===0?Math.min(...xs):Math.min(...zs),bmax=ax===0?Math.max(...xs):Math.max(...zs),dmin=ax===0?Math.min(...zs):Math.min(...xs),dmax=ax===0?Math.max(...zs):Math.max(...xs);
      const dd=ax===0?wall+n[1]*off:wall+n[0]*off;if(dd<dmin-0.05||dd>dmax+0.05)return;const g=dir>0?bmin-t:t-bmax;if(g>=-0.05)lim=Math.min(lim,Math.max(0,g-0.02));});return lim;};
    const solid=(x,z)=>{const X=Math.floor((x-rg.mx)*rg.R),Y=Math.floor((z-rg.mz)*rg.R);if(X<0||Y<0||X>=rg.w||Y>=rg.h)return true;const i=Y*rg.w+X;return !!(rg.block.d[i]||!rg.ins.d[i]);};
    const behind=q=>[0.01,0.025,0.045,0.07].some(d=>ax===0?solid(q,wall-n[1]*d):solid(wall-n[0]*d,q));
    let backed=false;
    const back=(t,dir)=>{if(!backed)return 9;let s=0;while(s<1.4){if(!behind(t+dir*(s+0.02)))break;s+=0.02;}return s;};
    const ext=(t,dir)=>{const p=at(t);const r=freeRun(rg,p[0],p[1],ax===0?dir:0,ax===0?0:dir);return Math.max(0,Math.min(r-0.01,stopBox(t,dir),back(t,dir)));};
    {const l0=lo-ext(lo,-1),h0=hi+ext(hi,1);let cov=0,cn=0;for(let q=l0+0.02;q<h0;q+=0.04){cn++;if(behind(q))cov++;}backed=cn>0&&cov/cn>=0.45;}
    lo-=ext(lo,-1);hi+=ext(hi,1);
    if(hi-lo<0.6)return;
    const a=ax===0?[lo,wall]:[wall,lo],b=ax===0?[hi,wall]:[wall,hi];
    const cook=grp.filter(j=>j.t==='cook').map(j=>j.ctr-lo),sink=grp.filter(j=>j.t==='sink').map(j=>j.ctr-lo);if(!cook.length&&!sink.length)return;
    const midp=at((lo+hi)/2),upper=!(G.wins||[]).some(w=>segDist([midp[0]-n[0]*off,midp[1]-n[1]*off],[w[0],w[1]],[w[2],w[3]])<(hi-lo)/2-0.2);
    const r0=[a[0],a[1]],r1=[b[0]+n[0]*0.6,b[1]+n[1]*0.6];
    out.push({a,b,n,cook,sink,upper,items:grp.map(j=>j.o),rect:[[Math.min(r0[0],r1[0]),Math.min(r0[1],r1[1])],[Math.max(r0[0],r1[0]),Math.min(r0[1],r1[1])],[Math.max(r0[0],r1[0]),Math.max(r0[1],r1[1])],[Math.min(r0[0],r1[0]),Math.max(r0[1],r1[1])]]});});
  const byCol=new Map();isl.forEach(q=>{const k=q.col.cx.toFixed(2)+','+q.col.cz.toFixed(2);if(!byCol.has(k))byCol.set(k,[]);byCol.get(k).push(q);});
  byCol.forEach(qs=>{const D=qs[0].D,c=qs[0].col,u=[-D[0],-D[1]],F=[c.cx-D[0]*c.pd/2,c.cz-D[1]*c.pd/2];
    const need=Math.max(...qs.map(r=>(r.ap.x-F[0])*u[0]+(r.ap.z-F[1])*u[1]))+0.4,room=freeRun(rg,F[0]+u[0]*0.02,F[1]+u[1]*0.02,u[0],u[1]);
    const Li=Math.max(need,Math.min(2.2,room-0.9));if(Li<0.6)return;
    let s=[-u[1],u[0]];if(items.length){const mx=items.reduce((t,j)=>t+j.o.x,0)/items.length,mz=items.reduce((t,j)=>t+j.o.z,0)/items.length;if((mx-c.cx)*s[0]+(mz-c.cz)*s[1]<0)s=[-s[0],-s[1]];}
    else if(freeRun(rg,c.cx+s[0]*0.35,c.cz+s[1]*0.35,s[0],s[1])<freeRun(rg,c.cx-s[0]*0.35,c.cz-s[1]*0.35,-s[0],-s[1]))s=[-s[0],-s[1]];
    const a=[F[0]-s[0]*0.3,F[1]-s[1]*0.3],b=[a[0]+u[0]*Li,a[1]+u[1]*Li],pos=t=>qs.filter(r=>r.ap.t===t).map(r=>(r.ap.x-a[0])*u[0]+(r.ap.z-a[1])*u[1]);
    const r0=a,r1=[b[0]+s[0]*0.6,b[1]+s[1]*0.6];
    out.push({a,b,n:s,cook:pos('cook'),sink:pos('sink'),upper:false,island:true,items:qs.map(r=>r.ap),rect:[[Math.min(r0[0],r1[0]),Math.min(r0[1],r1[1])],[Math.max(r0[0],r1[0]),Math.min(r0[1],r1[1])],[Math.max(r0[0],r1[0]),Math.max(r0[1],r1[1])],[Math.min(r0[0],r1[0]),Math.max(r0[1],r1[1])]]});});
  (G.kx||[]).forEach(q=>{const a=q.a,b=q.b,n=q.n,L=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],r1=[b[0]+n[0]*0.6,b[1]+n[1]*0.6];
    const rect=[[Math.min(a[0],r1[0]),Math.min(a[1],r1[1])],[Math.max(a[0],r1[0]),Math.min(a[1],r1[1])],[Math.max(a[0],r1[0]),Math.max(a[1],r1[1])],[Math.min(a[0],r1[0]),Math.max(a[1],r1[1])]];
    const ov=o=>o.rect[0][0]<rect[2][0]-0.05&&o.rect[2][0]>rect[0][0]+0.05&&o.rect[0][1]<rect[2][1]-0.05&&o.rect[2][1]>rect[0][1]+0.05;
    const cook=[],sink=[],its=[];for(let k=out.length-1;k>=0;k--){const o=out[k];if(!o.island||!ov(o))continue;o.items.forEach(ap=>{(ap.t==='cook'?cook:sink).push((ap.x-a[0])*u[0]+(ap.z-a[1])*u[1]);its.push(ap);});out.splice(k,1);}
    out.unshift({a,b,n,cook,sink,upper:false,island:true,items:its,rect});});
  return out;
}
function isBathAt(rg,x,z){const k=kindAt(rg,x,z);return !!k&&/BAÑO|WC/.test(k.s);}
function bathRuns(rg,a,u,n,L,offs){const N=Math.max(1,Math.round(L/0.05)),ok=[];
  for(let i=0;i<N;i++){const t=(i+0.5)*L/N;ok.push(offs.some(o=>isBathAt(rg,a[0]+u[0]*t+n[0]*o,a[1]+u[1]*t+n[1]*o)));}
  for(let i=1;i<N-1;i++)if(!ok[i]&&ok[i-1]&&ok[i+1])ok[i]=true;
  const R=[];let s=-1;for(let i=0;i<=N;i++){if(i<N&&ok[i]){if(s<0)s=i;}else if(s>=0){R.push([s===0?0:s*L/N,i===N?L:i*L/N]);s=-1;}}
  return R.filter(r=>r[1]-r[0]>0.03||N===1);}
function kindAt(rg,x,z){const X=Math.floor((x-rg.mx)*rg.R),Y=Math.floor((z-rg.mz)*rg.R);if(X<0||Y<0||X>=rg.w||Y>=rg.h)return null;const v=rg.lab[Y*rg.w+X];return v>=0?rg.labels[v]:null;}
function bakeFloor(G,rg,lineImg,isGround){
  if(!PATTERNS){PATTERNS=makePatterns();['wood','tile','porc','conc','deck'].forEach(k=>PATTERNS[k]=libPattern(k,PATTERNS[k]));}
  const [mx,mz,Mx,Mz]=G.tex;let W=Math.ceil((Mx-mx)*FPX),H=Math.ceil((Mz-mz)*FPX);
  const sc=Math.min(1,4096/Math.max(W,H));W=Math.round(W*sc);H=Math.round(H*sc);const fpx=FPX*sc;
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const img=x.createImageData(W,H),d=img.data;
  const def=isGround?'porc':'wood';
  const kinds=rg.labels.map(l=>l.k||def);
  for(let py=0;py<H;py++){
    const gy=Math.min(rg.h-1,Math.floor(py/fpx*rg.R));
    for(let px=0;px<W;px++){
      const gx=Math.min(rg.w-1,Math.floor(px/fpx*rg.R)),v=rg.lab[gy*rg.w+gx];
      const k=v>=0?kinds[v]:def;
      const P=PATTERNS[k],sx=Math.floor(px/sc)%P.width,sy=Math.floor(py/sc)%P.height,si=(sy*P.width+sx)*4,di=(py*W+px)*4;
      d[di]=P.data[si];d[di+1]=P.data[si+1];d[di+2]=P.data[si+2];d[di+3]=255;
    }
  }
  x.putImageData(img,0,0);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;
}

/* ---------- geometry helpers ---------- */
function toShape(pts){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s;}
function extr(pts,h,base){
  if(!pts||pts.length<3||h<=0)return null;
  const g=new THREE.ExtrudeGeometry(toShape(pts),{depth:h,bevelEnabled:false,curveSegments:12});
  g.rotateX(Math.PI/2);g.translate(0,base+h,0);return g;
}
function merge(list){list=list.filter(Boolean);if(!list.length)return null;
  const m=THREE.BufferGeometryUtils.mergeBufferGeometries(list.map(g=>g.index?g.toNonIndexed():g),false);list.forEach(g=>g.dispose());return m;}
function mesh(g,mat,shadow=true){if(!g)return null;const m=new THREE.Mesh(g,mat);m.castShadow=shadow;m.receiveShadow=true;return m;}
function box(x0,x1,z0,z1,y0,y1){const g=new THREE.BoxGeometry(Math.abs(x1-x0)||0.01,y1-y0,Math.abs(z1-z0)||0.01);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;}
const closeLoop=p=>p.concat([p[0]]);
function segs(lines,cb){lines.forEach(pts=>{for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L>0.05)cb(a,b,dx,dz,L,Math.atan2(dz,dx));}});}
function glazing(lines,y0,y1,rail){
  const panes=[],frames=[];
  segs(lines,(a,b,dx,dz,L,ang)=>{
    const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
    const p=new THREE.PlaneGeometry(L,y1-y0);p.rotateY(-ang);p.translate(mx,(y0+y1)/2,mz);panes.push(p);
    const n=rail?Math.max(1,Math.round(L/1.5)):Math.max(1,Math.round(L/1.25));
    for(let j=0;j<=n;j++){const t=j/n,x=a[0]+dx*t,z=a[1]+dz*t;
      if(L>0.4||j===0){const f=new THREE.BoxGeometry(rail?0.04:0.06,y1-y0,rail?0.04:0.08);f.rotateY(-ang);f.translate(x,(y0+y1)/2,z);frames.push(f);}}
    (rail?[y1]:[y0+0.03,y0+1.0,y1-0.04]).forEach(y=>{const f=new THREE.BoxGeometry(L,rail?0.05:0.06,rail?0.06:0.08);f.rotateY(-ang);f.translate(mx,y,mz);frames.push(f);});
  });
  return {panes:merge(panes),frames:merge(frames)};
}
function facLines(G){return (G.outline&&G.outline.length)?G.outline.map(o=>o.length>3&&Math.hypot(o[0][0]-o[o.length-1][0],o[0][1]-o[o.length-1][1])>0.05&&polyArea(o)>20?closeLoop(o):o):[closeLoop(G.slab)];}
function winStacks(p){
  const rec=[],cl=[],mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],len=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
  const R={pos:(a,b)=>{rec.push({a,b,S:null});return null;},sill:(a,b,S)=>{const m=mid(a,b);for(let k=rec.length-1;k>=0;k--){const r=rec[k];if(r.S==null&&len(mid(r.a,r.b),m)<0.02){r.S=S;break;}}return S;}};
  p.floors.forEach(f=>{if(f.k==='S'||f.lv<1.2)return;const G=p.geo[f.g],rg=p.rooms[f.g],top=f.lv+f.h-SLAB;
    const fw=facade(facLines(G),G,rg,f.lv,top,false,R);['solid','sills','tiles','curt','rods'].forEach(k=>{if(fw[k])fw[k].dispose();});});
  rec.forEach(r=>{if(r.S==null)return;const m=mid(r.a,r.b),l=len(r.a,r.b);let c=cl.find(c=>len(c.m,m)<0.25&&Math.abs(c.l-l)<0.12);
    if(!c){c={m,l,u:[(r.b[0]-r.a[0])/l,(r.b[1]-r.a[1])/l],it:[]};cl.push(c);}c.it.push(r);});
  cl.forEach(c=>{const med=v=>{v=v.slice().sort((x,y)=>x-y);return v[v.length>>1];};
    const ends=c.it.map(r=>{const s=(r.b[0]-r.a[0])*c.u[0]+(r.b[1]-r.a[1])*c.u[1];return s>=0?[r.a,r.b]:[r.b,r.a];});
    c.a=[med(ends.map(e=>e[0][0])),med(ends.map(e=>e[0][1]))];c.b=[med(ends.map(e=>e[1][0])),med(ends.map(e=>e[1][1]))];c.m=mid(c.a,c.b);c.l=len(c.a,c.b);
    const cnt=new Map();c.it.forEach(r=>cnt.set(r.S,(cnt.get(r.S)||0)+1));let S=null,n=0;cnt.forEach((v,k)=>{if(v>n||(v===n&&k>S)){n=v;S=k;}});c.S=S;});
  const find=(a,b)=>{const m=mid(a,b),l=len(a,b);let best=null,bd=0.25;cl.forEach(c=>{const d=len(c.m,m);if(d<bd&&Math.abs(c.l-l)<0.12){bd=d;best=c;}});return best;};
  return {pos:(a,b)=>{const c=find(a,b);return c&&c.it.length>1?[c.a,c.b]:null;},sill:(a,b,S)=>{const c=find(a,b);return c&&c.S!=null?c.S:S;}};
}
function facade(lines,G,rg,lv,top,ground,stk){
  const panes=[],frames=[],solid=[],sills=[];
  const S=0.9,T=Math.min(top-0.05,lv+2.2),OFF=0.075;
  const bx=(L,h,d,ang,x,y,z,arr)=>{if(h<=0.005||L<=0.005)return;const g=new THREE.BoxGeometry(L,h,d);g.rotateY(-ang);g.translate(x,y,z);arr.push(g);};
  const W=G.wins;
  const tiles=[],curt=[],rods=[],wins=[];
  const curtain=(a,ux,uz,nx,nz,t0,t1,lv,T0,ang)=>{const l=t1-t0,pw=Math.min(0.55,l*0.28),h=T0+0.12-lv-0.02,off=0.24;
    [[t0-0.08,1],[t1+0.08-pw,-1]].forEach(([st])=>{const g=new THREE.PlaneGeometry(pw,h,18,1);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i);pa.setZ(i,Math.sin((x/pw)*Math.PI*6)*0.035);}g.computeVertexNormals();
      g.rotateY(-ang);const c=st+pw/2;g.translate(a[0]+ux*c+nx*off,lv+0.02+h/2,a[1]+uz*c+nz*off);curt.push(g);});
    const r=new THREE.CylinderGeometry(0.012,0.012,l+0.4,8);r.rotateZ(Math.PI/2);r.rotateY(-ang);const c=(t0+t1)/2;r.translate(a[0]+ux*c+nx*off,T0+0.15,a[1]+uz*c+nz*off);rods.push(r);};
  let nx,nz;const cw=[];
  const cwin=(a,ux,uz,nx,nz,t0,t1,lv,top,y0,y1,rs,bath)=>{if(typeof Cortinas==='undefined'||bath||Cortinas.roomOf(rs)==='bano')return;
    const sideFace=t=>{const p=[a[0]+ux*t,a[1]+uz*t];let last=-1;for(let d=0.02;d<=0.5;d+=0.02){if(Rooms.blockedAt(rg,p[0]+nx*d,p[1]+nz*d))last=d;else if(last>0)break;}return last;};
    const fs=[sideFace(t0-0.1),sideFace(t1+0.1)].filter(v=>v>0&&v<0.45),face=fs.length?Math.max(...fs)+0.01:0.2;
    const ext=(t,sg)=>{let e=0;for(let d=0.02;d<=0.3;d+=0.02){const q=[a[0]+ux*(t+sg*d)+nx*(face+0.12),a[1]+uz*(t+sg*d)+nz*(face+0.12)];if(Rooms.blockedAt(rg,q[0],q[1]))break;e=d;}return e;};
    cw.push({o:[a[0]+ux*t0,a[1]+uz*t0],u:[ux,uz],n:[nx,nz],l:t1-t0,y0,y1,lv,top,face,extL:ext(t0,-1),extR:ext(t1,1),room:Cortinas.roomOf(rs),bath:!!bath,rs});};
  const bathIn=mm=>{const k=kindAt(rg,mm[0]+nx*0.35,mm[1]+nz*0.35);return k&&/BAÑO|WC/.test(k.s);};
  const tileStrip=(l,ang,mm,...ranges)=>{ranges.forEach(r=>{if(!r||r[1]-r[0]<0.01)return;const h=r[1]-r[0];const g=new THREE.BoxGeometry(l,h,0.012);const uv=g.attributes.uv;for(let u=0;u<uv.count;u++)uv.setXY(u,uv.getX(u)*l,uv.getY(u)*h);g.rotateY(-ang);g.translate(mm[0]+nx*0.142,(r[0]+r[1])/2,mm[1]+nz*0.142);tiles.push(g);});};
  const sl0=[];lines.forEach(pts=>{let si=0;for(let i=1;i<pts.length;i++){const st=pts[si],p=pts[i],d=Math.hypot(p[0]-st[0],p[1]-st[1]);if(d>=0.35||i===pts.length-1){
      let dev=0;for(let j=si+1;j<i;j++){const q=pts[j];dev=Math.max(dev,Math.abs((q[0]-st[0])*(p[1]-st[1])-(q[1]-st[1])*(p[0]-st[0]))/(d||1));}
      if(d>0.05)sl0.push([st,p,i-si>=3&&dev>0.012]);si=i;}}});
  /* tramos rectos partidos en pedazos (polilíneas con muchos vértices) se vuelven a unir: así una ventana no se corta en astillas */
  const sl=[];sl0.forEach(s=>{const q=sl[sl.length-1];
    if(q&&!q[2]&&!s[2]&&Math.hypot(q[1][0]-s[0][0],q[1][1]-s[0][1])<0.01){const a1=Math.atan2(q[1][1]-q[0][1],q[1][0]-q[0][0]),a2=Math.atan2(s[1][1]-s[0][1],s[1][0]-s[0][0]);let da=Math.abs(a1-a2);if(da>Math.PI)da=2*Math.PI-da;if(da<0.02){q[1]=s[1];return;}}
    sl.push([s[0],s[1],s[2]]);});
  /* ventanas tipadas leídas de las capas del plano: 'w' ventana (A-GLAZ), 'c' muro cortina (A-GLAZ-CURT), 'a' muro cortina curvo */
  const typed=!!W&&W.some(w=>typeof w[4]==='string');
  sl.forEach(([a,b,curve])=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ang=Math.atan2(dz,dx);
    const ux=dx/L,uz=dz/L;nx=-uz;nz=ux;const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    if(!pip([m[0]+nx*0.3,m[1]+nz*0.3],G.slab)){nx=-nx;nz=-nz;}
    let iv=[];
    const mid0=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    if(ground||!W)iv=[[0,L]];
    else if(typed&&curve){if(W.some(w=>w[4]==='a'&&segDist(mid0,[w[0],w[1]],[w[2],w[3]])<0.45))iv=[[0,L,'c']];}
    else{W.forEach(w=>{const kd=typed?w[4]:'w';if(kd==='a')return;const p=[[w[0],w[1]],[w[2],w[3]]].map(q=>[(q[0]-a[0])*ux+(q[1]-a[1])*uz,Math.abs((q[0]-a[0])*uz-(q[1]-a[1])*ux)]);
      const tol=typed?0.22:0.1;if(p[0][1]>tol||p[1][1]>tol)return;let t0=Math.max(0,Math.min(p[0][0],p[1][0])),t1=Math.min(L,Math.max(p[0][0],p[1][0]));if(t1-t0>(typed?0.2:0.3))iv.push([t0,t1,kd]);});
      iv.sort((x,y)=>x[0]-y[0]);const mg=[];iv.forEach(v=>{const q=mg[mg.length-1];if(q&&q[2]==='w'&&v[2]==='w'&&v[0]<=q[1]+0.05)q[1]=Math.max(q[1],v[1]);else if(q&&v[0]<q[1])v[0]=q[1],v[1]>v[0]+0.05&&mg.push(v.slice());else mg.push(v.slice());});iv=mg;
      if(stk&&stk.pos)iv.forEach(v=>{if(v[2]==='c')return;const r=stk.pos([a[0]+ux*v[0],a[1]+uz*v[0]],[a[0]+ux*v[1],a[1]+uz*v[1]]);if(!r)return;const t=r.map(q=>(q[0]-a[0])*ux+(q[1]-a[1])*uz),n0=Math.max(0,Math.min(...t)),n1=Math.min(L,Math.max(...t));if(n1-n0>0.2){v[0]=n0;v[1]=n1;}});}
    const P=t=>[a[0]+ux*t+nx*OFF,a[1]+uz*t+nz*OFF];
    if(!ground){let c=0;const gaps=[];iv.forEach(v=>{if(v[0]>c)gaps.push([c,v[0]]);c=v[1];});if(c<L)gaps.push([c,L]);
      gaps.forEach(([t0,t1])=>{const q=P((t0+t1)/2),mm=[a[0]+ux*(t0+t1)/2,a[1]+uz*(t0+t1)/2];bx(t1-t0,top-lv,0.15,ang,q[0]-nx*0.015,(lv+top)/2,q[1]-nz*0.015,solid);
        bathRuns(rg,[a[0]+ux*t0,a[1]+uz*t0],[ux,uz],[nx,nz],t1-t0,[0.25,0.4]).forEach(([s0,s1])=>{const tm=t0+(s0+s1)/2;tileStrip(s1-s0,ang,[a[0]+ux*tm,a[1]+uz*tm],[lv,top]);});});}
    iv.forEach(([t0,t1,kd])=>{
      const l=t1-t0,q=P((t0+t1)/2),mm=[a[0]+ux*(t0+t1)/2,a[1]+uz*(t0+t1)/2];
      const k=kindAt(rg,mm[0]+nx*0.6,mm[1]+nz*0.6),door=ground||(k&&k.k==='deck');
      if(kd==='c'&&!ground){/* muro cortina: vidrio de piso a techo, sin antepecho ni dintel */
        const rs=(k&&k.s)||'';if(l>0.5)cwin(a,ux,uz,nx,nz,t0,t1,lv,top,lv,top,rs,/BAÑO|WC/.test(rs));
        wins.push({o:[a[0]+ux*t0+nx*OFF,a[1]+uz*t0+nz*OFF],u:[ux,uz],n:[nx,nz],l,y0:lv,y1:top,uo:t0,bath:false,kind:'curtain',curve:!!curve});return;}
      const rs=(k&&k.s)||'',isB=/BAÑO|WC/.test(rs),isK=/COCIN|LAVANDER|SERVIC|SERV|DESPENSA/.test(rs);
      const S=(stk&&!door&&!ground)?stk.sill([a[0]+ux*t0,a[1]+uz*t0],[a[0]+ux*t1,a[1]+uz*t1],isB?1.5:isK?1.1:0.9):(isB?1.5:isK?1.1:0.9),T0=isB?Math.min(T,lv+2.2):T;
      const y0=door?lv:lv+S,y1=ground?top:T0;
      const wy0=door?y0:y0+0.04;
      if(!ground&&l>0.45)cwin(a,ux,uz,nx,nz,t0,t1,lv,top,door?lv:wy0,y1,rs,isB||bathIn(mm));
      wins.push({o:[a[0]+ux*t0+nx*OFF,a[1]+uz*t0+nz*OFF],u:[ux,uz],n:[nx,nz],l,y0:wy0,y1,uo:t0,bath:isB||bathIn(mm),kind:ground?'store':door?'door':(l<0.7?'fixed':'slide')});
      if(bathIn(mm)){tileStrip(l,ang,mm,door?null:[lv,lv+S],[y1,top]);
        if(!door)[[t0,1],[t1,-1]].forEach(([t,sg])=>{const h=y1-(lv+S);if(h<0.02)return;const g=new THREE.BoxGeometry(0.012,h,0.12);const uv=g.attributes.uv;for(let u=0;u<uv.count;u++)uv.setXY(u,uv.getX(u)*0.12,uv.getY(u)*h);g.rotateY(-ang);g.translate(a[0]+ux*(t+sg*0.006)+nx*OFF,lv+S+h/2,a[1]+uz*(t+sg*0.006)+nz*OFF);tiles.push(g);});}
    if(!door){bx(l,S,0.15,ang,q[0]-nx*0.015,lv+S/2,q[1]-nz*0.015,solid);bx(l+0.04,0.04,0.28,ang,mm[0]+nx*0.03,lv+S+0.02,mm[1]+nz*0.03,sills);}
      if(!ground)bx(l,top-y1,0.15,ang,q[0]-nx*0.015,(y1+top)/2,q[1]-nz*0.015,solid);
    });
  });
  return {wins,cw,solid:merge(solid),sills:merge(sills),tiles:merge(tiles),curt:merge(curt),rods:merge(rods)};
}
const WALLC=(()=>{const c=h=>new THREE.Color(h).convertSRGBToLinear();return {
  living:c(0xe2d3bf),dorm:c(0xc9d4c5),suite:c(0xd8c3b6),home:c(0xd2dbe2),study:c(0xc7d1da),bath:c(0xeceeec),kitchen:c(0xefe8db),
  vest:c(0xe0d2c2),comm:c(0xf0eee9),park:c(0xc2c0ba),facade:c(0xc9b79c),hall:c(0xebe5da),top:c(0xd9d3c9)};})();
function wallColorFor(s){
  s=s||'';
  if(/ESTAR|SAL[OÓ]N|SALA|LIVING|COMEDOR|COPROP/.test(s))return 'living';
  if(/SUITE/.test(s))return 'suite';if(/DORM/.test(s))return 'dorm';if(/HOME/.test(s))return 'home';
  if(/ESTUDIO|OFICINA/.test(s))return 'study';if(/BAÑO|WC/.test(s))return 'bath';
  if(/COCIN|LAVANDER|SERVIC|SERV|DESPENSA|PLANCH|SECADO|PARRILL/.test(s))return 'kitchen';
  if(/VEST|CLOSET/.test(s))return 'vest';if(/LOCAL|TIENDA|RECEPCI|DEP[OÓ]SITO|COMERCIAL/.test(s))return 'comm';
  if(/PARQUEO|BAULERA|MAQUINAS|MÁQUINAS|GARAJE/.test(s))return 'park';if(/TERRAZA|BALC/.test(s))return 'facade';
  return 'hall';
}
function wallColorAt(G,rg,fk,ov,x,z,nx,nz){const p=[x+nx*0.14,z+nz*0.14];
  if(!pip(p,G.slab))return WALLC.facade;const L=kindAt(rg,p[0],p[1])||kindAt(rg,x+nx*0.35,z+nz*0.35);const li=L?rg.labels.indexOf(L):-1,o=li>=0&&ov[fk+':'+li];return o?colorLin(o):WALLC[wallColorFor(L&&L.s)];}
function paintWalls(geo,G,rg,fi){
  const fk=fi!=null&&PROJ&&PROJ.floors[fi]?PROJ.floors[fi].k:null,ov=(fk&&VARS.walls)||{};
  const pos=geo.attributes.position,nor=geo.attributes.normal,n=pos.count,col=new Float32Array(n*3);
  for(let i=0;i<n;i+=3){
    let c;const ny=(nor.getY(i)+nor.getY(i+1)+nor.getY(i+2))/3;
    if(Math.abs(ny)>0.5)c=WALLC.top;
    else{
      const cx=(pos.getX(i)+pos.getX(i+1)+pos.getX(i+2))/3,cz=(pos.getZ(i)+pos.getZ(i+1)+pos.getZ(i+2))/3;
      let nx=(nor.getX(i)+nor.getX(i+1)+nor.getX(i+2))/3,nz=(nor.getZ(i)+nor.getZ(i+1)+nor.getZ(i+2))/3;const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;
      const ux=-nz,uz=nx,S=[0,1,2].map(k=>pos.getX(i+k)*ux+pos.getZ(i+k)*uz),s0=Math.min(...S),s1=Math.max(...S),bs=S[0],bx=pos.getX(i),bz=pos.getZ(i);
      const N=Math.max(1,Math.round((s1-s0)/0.05)),cnt=new Map();let best=null,bn=0;
      for(let k=0;k<N;k++){const t=s0+(k+0.5)*(s1-s0)/N,cc=wallColorAt(G,rg,fk,ov,bx+ux*(t-bs),bz+uz*(t-bs),nx,nz),key=cc.r.toFixed(4)+cc.g.toFixed(4)+cc.b.toFixed(4),v=(cnt.get(key)||0)+1;cnt.set(key,v);if(v>bn){bn=v;best=cc;}}
      c=best||wallColorAt(G,rg,fk,ov,cx,cz,nx,nz);
    }
    for(let k=0;k<3;k++){col[(i+k)*3]=c.r;col[(i+k)*3+1]=c.g;col[(i+k)*3+2]=c.b;}
  }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));return geo;
}
/* separa las caras que miran a la calle (fuera de la losa) para darles el material de fachada, con UV en metros */
function splitFacade(geo,G){
  if(!geo)return [null,null];
  const pos=geo.attributes.position,nor=geo.attributes.normal,n=pos.count,keep=[],fac=[];
  for(let i=0;i<n;i+=3){
    const ny=(nor.getY(i)+nor.getY(i+1)+nor.getY(i+2))/3;if(Math.abs(ny)>0.5){keep.push(i);continue;}
    const cx=(pos.getX(i)+pos.getX(i+1)+pos.getX(i+2))/3,cz=(pos.getZ(i)+pos.getZ(i+1)+pos.getZ(i+2))/3;
    let nx=(nor.getX(i)+nor.getX(i+1)+nor.getX(i+2))/3,nz=(nor.getZ(i)+nor.getZ(i+1)+nor.getZ(i+2))/3;const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;
    (pip([cx+nx*0.14,cz+nz*0.14],G.slab)?keep:fac).push(i);
  }
  if(!fac.length)return [geo,null];
  const pick=(idx,uvM)=>{if(!idx.length)return null;const P=new Float32Array(idx.length*9),N=new Float32Array(idx.length*9),U=new Float32Array(idx.length*6),C=geo.attributes.color;const Cc=C?new Float32Array(idx.length*9):null;
    idx.forEach((i,k)=>{let tx=0,tz=0;if(uvM){const nx=(nor.getX(i)+nor.getX(i+1)+nor.getX(i+2)),nz=(nor.getZ(i)+nor.getZ(i+1)+nor.getZ(i+2)),l=Math.hypot(nx,nz)||1;tx=-nz/l;tz=nx/l;}
      for(let j=0;j<3;j++){const v=i+j,o=(k*3+j)*3;P[o]=pos.getX(v);P[o+1]=pos.getY(v);P[o+2]=pos.getZ(v);N[o]=nor.getX(v);N[o+1]=nor.getY(v);N[o+2]=nor.getZ(v);
        if(Cc){Cc[o]=C.getX(v);Cc[o+1]=C.getY(v);Cc[o+2]=C.getZ(v);}
        const u=(k*3+j)*2;if(uvM){U[u]=P[o]*tx+P[o+2]*tz;U[u+1]=P[o+1];}else if(geo.attributes.uv){U[u]=geo.attributes.uv.getX(v);U[u+1]=geo.attributes.uv.getY(v);}}});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));if(Cc)g.setAttribute('color',new THREE.BufferAttribute(Cc,3));return g;};
  const a=pick(keep,false),b=pick(fac,true);geo.dispose();return [a,b];
}
/* UV en metros para cualquier geometría vertical de fachada (pretiles, núcleo de azotea) */
function facadeUV(geo){if(!geo)return geo;const pos=geo.attributes.position,nor=geo.attributes.normal,n=pos.count,U=new Float32Array(n*2);
  for(let i=0;i<n;i++){const nx=nor.getX(i),nz=nor.getZ(i),ny=nor.getY(i);if(Math.abs(ny)>0.5){U[i*2]=pos.getX(i);U[i*2+1]=pos.getZ(i);}else{const l=Math.hypot(nx,nz)||1;U[i*2]=pos.getX(i)*(-nz/l)+pos.getZ(i)*(nx/l);U[i*2+1]=pos.getY(i);}}
  geo.setAttribute('uv',new THREE.BufferAttribute(U,2));return geo;}
function blockedAt(rg,x,z){return Rooms.blockedAt(rg,x,z);}
function rayHit(G,o,u,tmin,tmax){let best=null;G.walls.concat(G.cols).forEach(P=>{for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],dx=b[0]-a[0],dz=b[1]-a[1],den=u[0]*dz-u[1]*dx;if(Math.abs(den)<1e-9)continue;
  const t=((a[0]-o[0])*dz-(a[1]-o[1])*dx)/den,s=((a[0]-o[0])*u[1]-(a[1]-o[1])*u[0])/den;if(t>tmin&&t<tmax&&s>=-1e-6&&s<=1+1e-6&&(!best||t<best.t))best={t,a,b};}});return best;}
function snapDoor(G,dd){
  let ed=null,bd=0.16;G.walls.concat(G.cols).forEach(P=>{for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<0.05||l>0.4)continue;
    const ex=(b[0]-a[0])/l,ez=(b[1]-a[1])/l;if(Math.abs(ex*dd.e[0]+ez*dd.e[1])<0.97)continue;const cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,ds=Math.hypot(cx-dd.o[0],cz-dd.o[1]);if(ds<bd){bd=ds;ed={l,cx,cz,ex,ez};}}});
  if(ed){const sg=Math.sign(ed.ex*dd.e[0]+ed.ez*dd.e[1])||1;dd.e=[ed.ex*sg,ed.ez*sg];dd.o=[ed.cx,ed.cz];dd.L=ed.l;const nn=[-dd.e[1],dd.e[0]],s2=Math.sign(nn[0]*dd.n[0]+nn[1]*dd.n[1])||1;dd.n=[nn[0]*s2,nn[1]*s2];}
  const hits=[-0.45,0,0.45].map(f=>rayHit(G,[dd.o[0]+dd.e[0]*f*dd.L,dd.o[1]+dd.e[1]*f*dd.L],dd.n,0.02,2.8)).filter(Boolean).map(h=>h.t);
  if(hits.length){const t=Math.min(...hits);if(Math.abs(t-dd.d)<0.2)dd.d=t;}
  const polys=G.walls.concat(G.cols),solid=p=>polys.some(P=>pip(p,P)),Pt=(x,z)=>[dd.o[0]+dd.n[0]*x+dd.e[0]*z,dd.o[1]+dd.n[1]*x+dd.e[1]*z];
  dd.av={};[1,-1].forEach(sd=>{const zf=sd*(dd.L/2+0.004),zb=sd*(dd.L/2-0.004);
    const side=(x0,dir)=>{const p=Pt(x0+dir*0.002,zf);if(solid(p)||!solid(Pt(x0+dir*0.012,zb)))return 0;const hh=rayHit(G,p,[dd.n[0]*dir,dd.n[1]*dir],0,1);return hh?hh.t:1;};
    dd.av[sd]=[side(0,-1),side(dd.d,1)];});
  return dd;}
function trims(G,rg,lv,top){
  const base=[],frames=[],leaves=[],infill=[],doors=[],tiles=[],dl=[],zsegs=[];
  const bx=(lx,h,lz,ang,x,y,z,arr)=>{const g=new THREE.BoxGeometry(lx,h,lz);g.rotateY(-ang);g.translate(x,y,z);arr.push(g);};
  const skipW=new Set();if(lv>-0.5&&!(lv<1.2))G.walls.forEach(w=>{let per=0;for(let a=0,b=w.length-1;a<w.length;b=a++)per+=Math.hypot(w[a][0]-w[b][0],w[a][1]-w[b][1]);if(2*polyArea(w)/per<0.11&&w.every(p=>distToPoly(p,G.slab)<0.3))skipW.add(w);});
  G.walls.concat(G.cols).forEach(w=>{
    if(skipW.has(w))return;
    let sa=0;for(let i=0,j=w.length-1;i<w.length;j=i++)sa+=(w[j][0]-w[i][0])*(w[j][1]+w[i][1]);
    const sgn=sa>0?1:-1;
    for(let i=0;i<w.length;i++){
      const a=w[i],b=w[(i+1)%w.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<0.06)continue;
      let nx=dz/L*sgn,nz=-dx/L*sgn;
      const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      if(blockedAt(rg,m[0]+nx*0.06,m[1]+nz*0.06)){nx=-nx;nz=-nz;}
      if(blockedAt(rg,m[0]+nx*0.06,m[1]+nz*0.06))continue;
      if(!pip([m[0]+nx*0.1,m[1]+nz*0.1],G.slab))continue;
      const ang=Math.atan2(dz,dx);
      const eu=[dx/L,dz/L],BR=bathRuns(rg,a,eu,[nx,nz],L,[0.12,0.25]);
      BR.forEach(([t0,t1])=>{const l=t1-t0,th=top-lv-0.01,tm=(t0+t1)/2;const g=new THREE.BoxGeometry(l,th,0.012);const uv=g.attributes.uv;for(let u=0;u<uv.count;u++)uv.setXY(u,uv.getX(u)*l,uv.getY(u)*th);g.rotateY(-ang);g.translate(a[0]+eu[0]*tm+nx*0.006,lv+th/2,a[1]+eu[1]*tm+nz*0.006);tiles.push(g);});
      {let c0=0;BR.concat([[L,L]]).forEach(([t0,t1])=>{if(t0-c0>0.1)zsegs.push({a:[a[0]+eu[0]*c0,a[1]+eu[1]*c0],u:eu,n:[nx,nz],L:t0-c0,y:lv});c0=t1;});}
      if(L>=0.07&&L<=0.32){
        let d=0;for(let t=0.03;t<=1.4;t+=0.02){if(blockedAt(rg,m[0]+nx*t,m[1]+nz*t)){d=t;break;}}
        if(d<0.55||d>1.3)continue;
        const c=[m[0]+nx*d/2,m[1]+nz*d/2];
        if(distToPoly(c,G.slab)<0.55||doors.some(q=>Math.hypot(q[0]-c[0],q[1]-c[1])<0.25))continue;
        if(!pip([c[0]-nz*0.45,c[1]+nx*0.45],G.slab)||!pip([c[0]+nz*0.45,c[1]-nx*0.45],G.slab))continue;
        if(G.doorSym&&!G.doorSym.some(q=>{const r=Math.max(q[2]-q[0],q[3]-q[1]);return Math.abs(r-d)<0.3&&c[0]>q[0]-0.2&&c[0]<q[2]+0.2&&c[1]>q[1]-0.2&&c[1]<q[3]+0.2;}))continue;
        doors.push(c);
        const dd=snapDoor(G,{o:m,n:[nx,nz],e:[dx/L,dz/L],d,L}),D=dd.d,Lw=dd.L,cc=[dd.o[0]+dd.n[0]*D/2,dd.o[1]+dd.n[1]*D/2];
        const na=Math.atan2(dd.n[1],dd.n[0]),hd=Math.min(2.1,top-lv-0.05);
        bx(D,top-(lv+hd),Lw,na,cc[0],(lv+hd+top)/2,cc[1],infill);
        [1,-1].forEach(sg=>{const ex=dd.e[0]*sg,ez=dd.e[1]*sg;if(!isBathAt(rg,cc[0]+ex*(Lw/2+0.2),cc[1]+ez*(Lw/2+0.2)))return;const h=top-(lv+hd);const g=new THREE.BoxGeometry(D,h,0.012);const uv=g.attributes.uv;for(let u=0;u<uv.count;u++)uv.setXY(u,uv.getX(u)*D,uv.getY(u)*h);g.rotateY(-na);g.translate(cc[0]+ex*(Lw/2+0.006),lv+hd+h/2,cc[1]+ez*(Lw/2+0.006));tiles.push(g);});
        dl.push({...dd,lv,hd});
      }
    }
  });
  (G.doorSym||[]).forEach(q=>{if(q.length<10)return;
    const inq=c=>c[0]>q[0]-0.2&&c[0]<q[2]+0.2&&c[1]>q[1]-0.2&&c[1]<q[3]+0.2;
    if(dl.some(d=>inq([d.o[0]+d.n[0]*d.d/2,d.o[1]+d.n[1]*d.d/2])))return;
    const A=[q[4],q[5]],Bp=[q[6],q[7]],Mi=[q[8],q[9]];
    const H=[[q[0],q[1]],[q[2],q[1]],[q[2],q[3]],[q[0],q[3]]].reduce((b,c)=>Math.hypot(c[0]-Mi[0],c[1]-Mi[1])>Math.hypot(b[0]-Mi[0],b[1]-Mi[1])?c:b);
    const bl=(x,z)=>blockedAt(rg,x,z);
    const jamb=(P,w)=>{const pp=[-w[1],w[0]];let J=null;for(let a=0.02;a<=0.22&&!J;a+=0.02)for(const k of [0,0.04,-0.04,0.08,-0.08])if(bl(P[0]+w[0]*a+pp[0]*k,P[1]+w[1]*a+pp[1]*k)){J=[P[0]+w[0]*a+pp[0]*k,P[1]+w[1]*a+pp[1]*k];break;}
      if(!J)return null;let t1=0,t2=0;while(t1<0.5&&bl(J[0]+pp[0]*(t1+0.02),J[1]+pp[1]*(t1+0.02)))t1+=0.02;while(t2<0.5&&bl(J[0]-pp[0]*(t2+0.02),J[1]-pp[1]*(t2+0.02)))t2+=0.02;
      const L=t1+t2+0.02;if(L<0.06||L>0.4)return null;const J2=[J[0]+pp[0]*(t1-t2)/2,J[1]+pp[1]*(t1-t2)/2];let f=0;while(f<0.3&&bl(J2[0]-w[0]*(f+0.02),J2[1]-w[1]*(f+0.02)))f+=0.02;
      return {o:[J2[0]-w[0]*f,J2[1]-w[1]*f],L,e:pp};};
    let best=null;
    [A,Bp].forEach(E=>{if(best)return;const l=Math.hypot(E[0]-H[0],E[1]-H[1])||1,u=[(E[0]-H[0])/l,(E[1]-H[1])/l];
      const js=jamb(E,u),jh=jamb(H,[-u[0],-u[1]]);const J=js?{...js,n:[-u[0],-u[1]]}:jh?{...jh,n:u}:null;if(!J||!(js||jh))return;if(!js&&!jh)return;
      const pair=G.doorSym.some(r=>r!==q&&Math.min(q[2],r[2])-Math.max(q[0],r[0])>-0.06&&Math.min(q[3],r[3])-Math.max(q[1],r[1])>-0.06);
      if(!pair&&!(js&&jh)&&!(js?bl(H[0]-u[0]*0.1,H[1]-u[1]*0.1)||bl(H[0]-u[0]*0.2,H[1]-u[1]*0.2):bl(E[0]+u[0]*0.1,E[1]+u[1]*0.1)||bl(E[0]+u[0]*0.2,E[1]+u[1]*0.2)))return;
      const lim=pair?Math.min(2.4,2*l+0.35):l+0.35;
      let dd=0.3;while(dd<lim&&!bl(J.o[0]+J.n[0]*dd,J.o[1]+J.n[1]*dd))dd+=0.02;const d=dd<lim?dd:l;if(d<0.5||d>(pair?2.4:1.4))return;best={...J,d};});
    if(!best)return;
    const dd=snapDoor(G,{o:best.o,n:best.n,e:best.e,d:best.d,L:best.L}),hd=Math.min(2.1,top-lv-0.05),c=[dd.o[0]+dd.n[0]*dd.d/2,dd.o[1]+dd.n[1]*dd.d/2];
    bx(dd.d,top-(lv+hd),dd.L,Math.atan2(dd.n[1],dd.n[0]),c[0],(lv+hd+top)/2,c[1],infill);
    dl.push({...dd,lv,hd,sym:true});});
  return {base:merge(base),zsegs,frames:merge(frames),leaves:merge(leaves),infill:merge(infill),tiles:merge(tiles),dl};
}
function convexHull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];for(const p of P){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  return lo.slice(0,-1).concat(up.slice(0,-1));}
const polyArea=Plan2Geo.area;

function label(text,size,weight){
  const c=document.createElement('canvas');c.width=1024;c.height=160;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false}));
  sp.userData={c,text,weight:weight||600};sp.scale.set(size*6.4,size,1);return sp;
}
function paintLabel(sp,col,bg){
  const {c,text,weight}=sp.userData,x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);
  x.font=`${weight} 72px "Archivo","Arial Narrow",sans-serif`;try{x.fontStretch='semi-condensed';}catch(e){}x.textAlign='center';x.textBaseline='middle';
  if(bg){const w=Math.min(c.width,x.measureText(text).width+56);x.fillStyle=bg;x.globalAlpha=0.9;
    const r=24,X=(c.width-w)/2,Y=28,H=104;x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+H,r);x.arcTo(X+w,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.fill();x.globalAlpha=1;}
  x.fillStyle=col;x.fillText(text,c.width/2,c.height/2+4);
  if(sp.material.map)sp.material.map.dispose();
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;sp.material.map=t;sp.material.needsUpdate=true;
}
const cap=s=>s.charAt(0)+s.slice(1).toLowerCase();

/* ---------- project build ---------- */
let PROJ=null,groups=[],site=null,roofGroup=null,bounds=new THREE.Box3(),sprites=[],ROOF=0,disposables=[];
function clearScene(){
  if(typeof disposeStruct==='function')disposeStruct();
  groups.forEach(g=>{const r=g&&g.userData.wrRoot;if(r)[...r.children].forEach(o=>Wardrobes.dispose(o));});if(typeof WR!=='undefined'){WR.box&&scene.remove(WR.box);WR.box=null;WR.sel=null;}
  [...groups,site,roofGroup].forEach(o=>{if(!o)return;scene.remove(o);o.traverse(n=>{if(n.geometry&&!n.userData.shared&&!n.isInstancedMesh)n.geometry.dispose();if(n.isSprite&&n.material.map)n.material.map.dispose();});});
  disposables.forEach(d=>d.dispose());disposables=[];
  groups=[];site=null;roofGroup=null;sprites=[];bounds=new THREE.Box3();
}
function loadImg(url){return new Promise(r=>{if(!url)return r(null);const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=url;});}

const FLOOR_PICK=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide});
const DEF_FLOOR={wood:'flot-roble-natural',tile:'porcelanato-marfil',porc:'porcelanato-marfil',conc:'cemento-pulido',deck:'deck-exterior'};
const _lin={};const colorLin=h=>_lin[h]||(_lin[h]=new THREE.Color(h).convertSRGBToLinear());
let VARS={floors:{},walls:{}},VAR_BASE=null;
function roomRects(rg){
  if(rg.rects)return rg.rects;const r=Rooms.rects(rg);rg.rects=r.by;rg.rbb=r.bb;return r.by;
}
function floorMatId(fi,li,rg){
  const f=PROJ.floors[fi],o=VARS.floors[f.k+':'+li];if(o)return 'mat:'+o;
  const k=li>=0?rg.labels[li].k:(rg.isGround?'porc':'wood');
  if(LIB.pbr&&LIB.pbr[k])return LIB.pbr[k];
  if(LIB.tex[k])return 'img:'+k;
  return 'mat:'+(DEF_FLOOR[k]||'roble-natural');
}
function resolveMat(id){
  if(id.startsWith('img:')){const k=id.slice(4),T=LIB.tex[k];if(!T)return null;return Mats.fromImage(k+':'+(libActive()[k]||''),T.img,T.tileM,{roughness:k==='wood'?0.5:0.3,relief:k==='wood'?0.8:1.4});}
  return Mats.get(id)||Mats.get('mat:'+DEF_FLOOR.wood);
}
const MAT_TRANS=new THREE.MeshStandardMaterial({color:0xb9b5ad,metalness:0.7,roughness:0.34});
function buildRoomFloors(i,G,rg,f,grpF){
  grpF.children.slice().forEach(c=>{grpF.remove(c);c.geometry.dispose();});
  const pl=Revest.plan(rg,li=>floorMatId(i,li,rg),{orient:c=>{const o=(VARS.orient||{})[f.k+':'+c.main];return o==null?null:o==='z';}});rg.floorPlan=pl;
  const y=f.lv+0.006,org=[pl.origin[0],pl.origin[1],0,0],seed=(i*17+7)|0,byMat=new Map();
  pl.comps.forEach(c=>{if(!c.rects.length)return;if(!byMat.has(c.mat))byMat.set(c.mat,[]);byMat.get(c.mat).push(c);});
  for(const[id,cs]of byMat){
    const pdef=/^mat:/.test(id)&&Mats.info(id.slice(4));
    if(pdef&&pdef.plank){const pm=Mats.get(id,{vertexColors:true}),geos=[];
      cs.forEach(c=>{const g=Planks.build(THREE,c.rects,{...pdef.plank,y,swap:c.swap,bb:org,seed});if(g)geos.push(g);});
      const g=geos.length>1?THREE.BufferGeometryUtils.mergeBufferGeometries(geos,false):geos[0];if(geos.length>1)geos.forEach(x=>x.dispose());
      if(g){const me=new THREE.Mesh(g,pm);me.receiveShadow=true;me.userData.floor=i;me.userData.matKey=id;me.userData.planks=true;grpF.add(me);}continue;}
    const m=resolveMat(id);if(!m)continue;const pos=[],uv=[];
    cs.forEach(c=>c.rects.forEach(([x0,z0,x1,z1])=>{const P=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],U=P.map(([x,z])=>c.swap?[z-org[1],x-org[0]]:[x-org[0],-(z-org[1])]);
      [0,2,1,0,3,2].forEach(q=>{pos.push(P[q][0],y,P[q][1]);uv.push(U[q][0],U[q][1]);});}));
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    const nrm=new Float32Array(pos.length);for(let k=1;k<nrm.length;k+=3)nrm[k]=1;g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));g.computeBoundingSphere();
    const me=new THREE.Mesh(g,m);me.receiveShadow=true;me.userData.floor=i;me.userData.matKey=id;grpF.add(me);}
  if(pl.trans.length){const tb=[];pl.trans.forEach(t=>{const L=t.ax==='x'?t.x1-t.x0:t.z1-t.z0,g=new THREE.BoxGeometry(t.ax==='x'?L:0.03,0.004,t.ax==='x'?0.03:L);
      g.translate(t.ax==='x'?(t.x0+t.x1)/2:t.x,y+0.001,t.ax==='x'?t.z:(t.z0+t.z1)/2);tb.push(g);});
    const g=THREE.BufferGeometryUtils.mergeBufferGeometries(tb,false);tb.forEach(x=>x.dispose());if(g){const me=new THREE.Mesh(g,MAT_TRANS);me.receiveShadow=true;me.userData.floor=i;me.userData.transitions=true;grpF.add(me);}}
}
function recolorWalls(i){const g=groups[i];if(!g)return;const f=PROJ.floors[i],G=PROJ.geo[f.g],rg=PROJ.rooms[f.g];(g.userData.painted||[]).forEach(me=>{paintWalls(me.geometry,G,rg,i);});}
function refreshFloors(i){const g=groups[i];if(!g)return;const f=PROJ.floors[i];buildRoomFloors(i,PROJ.geo[f.g],PROJ.rooms[f.g],f,g.userData.roomFloors);if(LIGHT.env!=null)setEnvScale(LIGHT.env);shadowsDirty();}
function applyWallFinish(){
  const wf=(LIB.pbr&&LIB.pbr.wallFinish)||'mat:pintura-mate',m=Mats.get(wf,{vertexColors:true})||Mats.get('mat:pintura-mate',{vertexColors:true});
  if(m){Mats.copyInto(MAT.painted,m);if(!m.vertexColors)MAT.painted.vertexColors=false;else MAT.painted.vertexColors=true;MAT.painted.needsUpdate=true;}
  let tw=null;
  if(LIB.pbr&&LIB.pbr.bathWall)tw=Mats.get(LIB.pbr.bathWall);
  else if(LIB.tex.bathWall)tw=Mats.fromImage('bathWall:'+(libActive().bathWall||''),LIB.tex.bathWall.img,LIB.tex.bathWall.tileM,{roughness:0.12,relief:1.6});
  else tw=Mats.get('mat:ceramica-blanca-pared');
  if(tw)[MAT.tileWall,FM.tileWall,FM.nicheIn].forEach(d=>{if(d)Mats.copyInto(d,tw);});
  if(FM.nicheIn)FM.nicheIn.color.set(0xd9d4cb);
}
function buildFloor(f,i,floors){
  const G=PROJ.geo[f.g],grp=new THREE.Group();grp.userData={i};
  const top=f.lv+f.h-SLAB,wallH=top-f.lv,above=floors[i+1]?PROJ.geo[floors[i+1].g]:null;
  const slab=mesh(extr(G.slab,SLAB,f.lv-SLAB),MAT.slab);slab.userData.floor=i;grp.add(slab);
  const hl=new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry,25),MAT.hl);hl.visible=false;grp.add(hl);grp.userData.hl=hl;
  const [mx,mz,Mx,Mz]=G.tex;
  const fg=new THREE.ShapeGeometry(toShape(G.slab));
  const pos=fg.attributes.position,uv=fg.attributes.uv;
  for(let j=0;j<pos.count;j++)uv.setXY(j,(pos.getX(j)-mx)/(Mx-mx),1-(pos.getY(j)-mz)/(Mz-mz));
  fg.rotateX(Math.PI/2);fg.translate(0,f.lv+0.004,0);
  const floor=new THREE.Mesh(fg,FLOOR_PICK);floor.visible=false;floor.userData.floor=i;grp.add(floor);grp.userData.floorMesh=floor;
  const rg=PROJ.rooms[f.g];
  const roomF=new THREE.Group();roomF.name='roomFloors';grp.add(roomF);grp.userData.roomFloors=roomF;buildRoomFloors(i,G,rg,f,roomF);
  grp.userData.painted=[];
  const ground=f.lv<1.2&&f.lv>-0.5;
  const ext=[],int=[],fen=[];
  const strips=[];const painted=[];
  G.walls.forEach(w=>{
    const onEdge=w.some(p=>distToPoly(p,G.slab)<0.35);
    let per=0;for(let a=0,b=w.length-1;a<w.length;b=a++)per+=Math.hypot(w[a][0]-w[b][0],w[a][1]-w[b][1]);
    const thick=2*polyArea(w)/per;
    if(thick<0.11&&f.lv>-0.5&&!ground&&w.every(p=>distToPoly(p,G.slab)<0.3))return;
    if(ground&&above&&onEdge){const c=[w.reduce((s,p)=>s+p[0],0)/w.length,w.reduce((s,p)=>s+p[1],0)/w.length];
      const near=(G.labels||[]).some(l=>Math.hypot(l[1]-c[0],l[2]-c[1])<3.2);
      if(!pip(c,above.slab)&&distToPoly(c,above.slab)>0.6&&!near){fen.push(extr(w,1.6,f.lv));return;}}
    (onEdge&&f.k!=='S'?ext:int).push(extr(w,wallH,f.lv));
  });
  const allW=merge(int.concat(ext,strips));
  if(allW){const [inW,faW]=f.k!=='S'&&f.lv>-0.5?splitFacade(allW,G):[allW,null];
    if(inW){const me=mesh(paintWalls(inW,G,rg,i),MAT.painted);me.userData.floor=i;grp.add(me);grp.userData.painted.push(me);}
    if(faW){const me=mesh(faW,MAT.fac);me.userData.floor=i;me.userData.facade=true;grp.add(me);}}
  {const me=mesh(merge(fen),MAT.fence);if(me){me.userData.floor=i;grp.add(me);}}
  let PHDL=[];
  if(f.lv>-0.5||true){const tr=trims(G,rg,f.lv,top);PHDL=tr.dl||[];
    if(tr.zsegs.length){const zm=Zocalos.build(tr.zsegs,tr.dl);if(zm){zm.userData.floor=i;grp.add(zm);}}if(tr.frames)grp.add(mesh(tr.frames,MAT.doorframe));
    if(tr.dl.length){const dg=Doors.build(tr.dl);dg.children.forEach(c=>c.userData.floor=i);grp.add(dg);grp.userData.doorGrp=dg;}
    if(tr.tiles)grp.add(mesh(tr.tiles,MAT.tileWall,false));if(tr.infill){const me=mesh(paintWalls(tr.infill,G,rg,i),MAT.painted);me.userData.floor=i;grp.add(me);grp.userData.painted.push(me);}}
  {const cg=merge(G.cols.map(c=>extr(c,wallH,f.lv)));
    if(cg&&f.k!=='S'){const [inC,faC]=f.lv>-0.5?splitFacade(cg,G):[cg,null];
      if(inC){const me=mesh(paintWalls(inC,G,rg,i),MAT.painted);me.userData.floor=i;grp.add(me);grp.userData.painted.push(me);}
      if(faC){const me=mesh(faC,MAT.col);me.userData.floor=i;grp.add(me);}}
    else{const cols=mesh(cg,MAT.col);if(cols){cols.userData.floor=i;grp.add(cols);}}}
  const fb={},fx={},pend=[];
  const FIXED=/^(toilet|shower|basin|cooktop|ksink|fridge|washer|wardrobe|island)$/;
  const nearWinF=(px,pz)=>(G.wins||[]).some(w=>segDist([px,pz],[w[0],w[1]],[w[2],w[3]])<0.5);
  const PW=Fisica.world(rg,{lv:f.lv,band:f.k==='S'?0:0.15});grp.userData.phys=PW;
  PHDL.forEach(d=>{const e=d.e||[d.n[1],-d.n[0]],L=d.L||0.15,c=[];[0,d.d].forEach(t=>[-L/2-0.7,L/2+0.7].forEach(q=>c.push([d.o[0]+d.n[0]*t+e[0]*q,d.o[1]+d.n[1]*t+e[1]*q])));
    Fisica.addClearance(PW,Fisica.box(Math.min(...c.map(p=>p[0])),Math.min(...c.map(p=>p[1])),Math.max(...c.map(p=>p[0])),Math.max(...c.map(p=>p[1])),f.lv,f.lv+2.1));});
  const inCounter=new Set();
  const KIT=LIB.models.kitchenKit,kitPend=[];
  const runs=kitchens(G,rg),inR=(p,r)=>p[0]>r[0][0]+0.02&&p[0]<r[2][0]-0.02&&p[1]>r[0][1]+0.02&&p[1]<r[2][1]-0.02;
  runs.forEach((k,ri)=>{
    if(KIT){const L=Math.hypot(k.b[0]-k.a[0],k.b[1]-k.a[1]),u=[(k.b[0]-k.a[0])/L,(k.b[1]-k.a[1])/L];
      const endPt=(e,s)=>[e[0]+u[0]*s*0.3+k.n[0]*0.3,e[1]+u[1]*s*0.3+k.n[1]*0.3];
      const blind=[endPt(k.a,1),endPt(k.b,-1)].map(p=>runs.some((o,oi)=>oi<ri&&inR(p,o.rect)));
      const R=Furn.counterKit(THREE,k.a,k.b,k.n,f.lv,0.6,k.cook,k.sink,k.upper,blind,top-f.lv);
      R.parts.forEach(([m,g])=>{if(k.island&&m==='tileWall'){g.dispose();return;}(fx[m]=fx[m]||[]).push(g);});
      R.mods.forEach(m=>{const M=KIT.M.mods[m.k];if(!M)return;kitPend.push({M,pos:new THREE.Vector3(m.pos[0],m.pos[1],m.pos[2]),rot:m.rot,s:1,sv:new THREE.Vector3(m.sv[0],m.sv[1],m.sv[2]),userData:{furn:/^D_/.test(m.k),floor:i,asset:KIT.it.id,kit:m.k}});});}
    else Furn.counter(THREE,k.a,k.b,k.n,f.lv,0.6,k.cook,k.sink,k.upper).forEach(([m,g])=>(fx[m]=fx[m]||[]).push(g));
    const r=k.rect;(G.furn||[]).forEach(o=>{if(o.t==='box')return;const ix=Math.min(o.p[2][0],r[2][0])-Math.max(o.p[0][0],r[0][0]),iz=Math.min(o.p[2][1],r[2][1])-Math.max(o.p[0][1],r[0][1]);
      if(ix>0&&iz>0&&ix*iz>0.3*(o.p[2][0]-o.p[0][0])*(o.p[2][1]-o.p[0][1]))inCounter.add(o);});
    Fisica.addStatic(PW,Fisica.box(k.rect[0][0],k.rect[0][1],k.rect[2][0],k.rect[2][1],f.lv,f.lv+2.4,'mesón'));
    if(!rg.navDone)(rg.solids=rg.solids||[]).push(k.rect);
  });
  (G.kbar||[]).forEach(r=>{const g=new THREE.BoxGeometry(r[2]-r[0],0.04,r[3]-r[1]);g.translate((r[0]+r[2])/2,f.lv+0.88,(r[1]+r[3])/2);(fx[KIT?'quartzKit':'stone']=fx[KIT?'quartzKit':'stone']||[]).push(g);Fisica.addStatic(PW,Fisica.box(r[0],r[1],r[2],r[3],f.lv+0.86,f.lv+0.9,'barra'));});
  const ARRF=arrangeFurn(G,rg,o=>roomFor(G,rg,o)),oneTable=new Set();{const grp=new Map();
    ARRF.forEach(o=>{const xs=o.p.map(p=>p[0]),zs=o.p.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs),dx=x1-x0,dz=z1-z0;
      const s=roomFor(G,rg,o);if(!/ESTAR|SAL[OÓ]N|SALA|LIVING|COPROP/.test(s||''))return;const k=Furn.kindOf(o,s,Math.min(dx,dz),Math.max(dx,dz),o.h,dx*dz);
      const L=kindAt(rg,(x0+x1)/2,(z0+z1)/2),key=L?rg.labels.indexOf(L):s;if(!grp.has(key))grp.set(key,[]);grp.get(key).push({o,k,c:[(x0+x1)/2,(z0+z1)/2]});});
    grp.forEach(list=>{const tb=list.filter(e=>e.k==='coffee'||e.k==='side');if(tb.length<2)return;const sofas=list.filter(e=>e.k==='sofa');
      const ref=e=>sofas.length?Math.min(...sofas.map(f=>Math.hypot(f.c[0]-e.c[0],f.c[1]-e.c[1]))):Math.hypot(e.c[0]-list.reduce((a,q)=>a+q.c[0],0)/list.length,e.c[1]-list.reduce((a,q)=>a+q.c[1],0)/list.length);
      const pool=tb.some(e=>e.k==='coffee')?tb.filter(e=>e.k==='coffee'):tb;const keep=pool.reduce((a,e)=>ref(e)<ref(a)?e:a);tb.forEach(e=>{if(e!==keep)oneTable.add(e.o);});});}
  const PJOBS=[];
  ARRF.filter(o=>!oneTable.has(o)).forEach(o=>{
    const s=roomFor(G,rg,o);
    const r=Furn.build(THREE,o,s,f.lv,(x0,x1,z0,z1,kind)=>backSide(rg,x0,x1,z0,z1,kind),rnd,(px,pz,ux,uz)=>freeRun(rg,px,pz,ux,uz),nearWinF,{inCounter:inCounter.has(o),hasModel:k=>!!LIB.models[k],style:k=>LIB.style&&LIB.style[k],ceilH:top-f.lv});
    const pe=[];if(r.place&&LIB.models[r.kind])placeModel(pe,r.kind,r.place,f.lv,!FIXED.test(r.kind),i);
    (r.decor||[]).forEach(d=>placeDecor(pe,d,f.lv,i));
    const fixed=FIXED.test(r.kind),bxs=r.kind==='skip'?[]:Fisica.boxesOf(r.parts).concat(pe.filter(q=>q.pos.y-f.lv<0.05).map(pendBox));
    let area=0;bxs.forEach(b=>{area+=(b.x1-b.x0)*(b.z1-b.z0);});PJOBS.push({o,r,pe,fixed,bxs,area});
  });
  PJOBS.sort((a,b)=>(a.fixed===b.fixed?b.area-a.area:(a.fixed?-1:1))).forEach(({o,r,pe,fixed,bxs})=>{
    if(bxs.length){const must=/^(toilet|shower|basin|cooktop|ksink)$/.test(r.kind);
      let cx=0,cz=0,X0=1e9,X1=-1e9,Z0=1e9,Z1=-1e9;bxs.forEach(b=>{X0=Math.min(X0,b.x0);X1=Math.max(X1,b.x1);Z0=Math.min(Z0,b.z0);Z1=Math.max(Z1,b.z1);});cx=(X0+X1)/2;cz=(Z0+Z1)/2;
      let fit=null;for(const k of [1,0.97,0.94,0.91,0.88,0.85,0.82]){const bs=k===1?bxs:bxs.map(b=>({...b,x0:cx+(b.x0-cx)*k,x1:cx+(b.x1-cx)*k,z0:cz+(b.z0-cz)*k,z1:cz+(b.z1-cz)*k}));
        const mv=Fisica.find(PW,bs,{fixed,max:k===1?0.6:0.4});if(mv){fit={mv,k,bs};break;}}
      if(!fit){if(!must)return;fit={mv:{dx:0,dz:0},k:1,bs:bxs};}
      const {mv,k}=fit;Fisica.commit(PW,fit.bs,mv.dx,mv.dz,o);
      if(k<1){r.parts.forEach(([m,g])=>{g.translate(-cx,0,-cz);g.scale(k,1,k);g.translate(cx,0,cz);});pe.forEach(q=>{q.pos.x=cx+(q.pos.x-cx)*k;q.pos.z=cz+(q.pos.z-cz)*k;q.s=(q.s||1)*k;});}
      if(mv.dx||mv.dz||k<1){r.parts.forEach(([m,g])=>{g.translate(mv.dx,0,mv.dz);g.boundingBox=null;});pe.forEach(q=>{q.pos.x+=mv.dx;q.pos.z+=mv.dz;});}}
    if(!Fisica.layerFits(PW,r.parts))r.parts=r.parts.filter(([m])=>!Fisica.FLOORLAYER.test(m));
    pe.forEach(q=>pend.push(q));
    const bucket=fixed?fx:fb;r.parts.forEach(([m,g])=>(bucket[m]=bucket[m]||[]).push(g));
    if(!rg.navDone&&r.kind!=='skip')(rg.solids=rg.solids||[]).push(o.p);
  });
  (G.labels||[]).forEach((l,j)=>{if(!/PARQUEO|GARAJE|ESTACIONAMIENTO/.test(l[0]))return;
    const fx=freeRun(rg,l[1],l[2],1,0)+freeRun(rg,l[1],l[2],-1,0),fz=freeRun(rg,l[1],l[2],0,1)+freeRun(rg,l[1],l[2],0,-1);
    Furn.car(THREE,l[1],l[2],f.lv,fx>fz?Math.PI/2:0,j%4).forEach(([m,g])=>(fb[m]=fb[m]||[]).push(g));});
  rg.navDone=true;
  if(pend.length){const ag=Assets.build(pend,{minInstances:3});ag.userData.autoAssets=true;grp.add(ag);}
  if(kitPend.length){const kg=Assets.mergeStatic(kitPend);kg.userData.autoAssets=true;kg.children.forEach(c=>c.userData.floor=i);grp.add(kg);}
  [[fb,true],[fx,false]].forEach(([B,loose])=>Object.entries(B).forEach(([k,l])=>{const me=mesh(merge(l),FM[k]||FM.oak);if(me){me.userData.floor=i;if(loose)me.userData.furn=true;if(k==='glass'){me.renderOrder=2;me.castShadow=false;}grp.add(me);}}));
  extras(G,rg,f,top).forEach(([m,g,loose])=>{const me=mesh(g,m,false);me.userData.furn=loose;grp.add(me);});
  if(f.k!=='S'&&!(f.lv<-0.5)){
    const lines=facLines(G),fw=facade(lines,G,rg,f.lv,top,ground,PROJ.winStk);
    if(fw.wins.length){const wg=Glazing.build(fw.wins);wg.children.forEach(c=>c.userData.floor=i);grp.add(wg);}
    if(fw.solid){const [inS,faS]=splitFacade(fw.solid,G);if(inS){const me=mesh(paintWalls(inS,G,rg),MAT.painted);me.userData.floor=i;grp.add(me);}
      if(faS){const me=mesh(faS,MAT.fac);me.userData.floor=i;me.userData.facade=true;grp.add(me);}}
    if(!ground){/* banda de losa: línea horizontal entre pisos, al ras de la fachada */
      const bd=[];segs(lines,(a,b,dx,dz,L,ang)=>{const g=new THREE.BoxGeometry(L+0.02,SLAB+0.02,0.3);g.rotateY(-ang);g.translate((a[0]+b[0])/2,f.lv-SLAB/2,(a[1]+b[1])/2);bd.push(g);});
      const bm=mesh(facadeUV(merge(bd)),MAT.band);if(bm){bm.userData.floor=i;bm.userData.facade=true;grp.add(bm);}}
    if(fw.sills)grp.add(mesh(fw.sills,MAT.col));
    if(fw.tiles)grp.add(mesh(fw.tiles,MAT.tileWall,false));
    if(fw.cw&&fw.cw.length&&Cortinas.ready()){const cg=Cortinas.build(fw.cw,CORT.state);cg.userData.floor=i;cg.children.forEach(c=>c.userData.floor=i);grp.add(cg);grp.userData.cortGrp=cg;}
  }
  const nextSmaller=!!above&&polyArea(above.slab)<polyArea(G.slab)*0.95;
  if(nextSmaller&&f.lv>-0.5){
    const cv=mesh(extr(G.slab,SLAB,top),MAT.cover);grp.add(cv);
    const runs=[];{const L=closeLoop(G.slab),exp=q=>!pip(q,above.slab)&&distToPoly(q,above.slab)>0.4;let cur=null,last=null;
      for(let k=0;k<L.length-1;k++){const a=L[k],b=L[k+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(d/0.2));
        for(let j=0;j<n;j++){const p0=j?last:a,p1=j===n-1?b:[a[0]+(b[0]-a[0])*(j+1)/n,a[1]+(b[1]-a[1])*(j+1)/n];
          if(exp([(p0[0]+p1[0])/2,(p0[1]+p1[1])/2])){if(!cur){cur=[p0];runs.push(cur);}cur.push(p1);}else cur=null;last=p1;}}}
    runs.forEach(x=>{for(let i=x.length-2;i>0;i--){const a=x[i-1],b=x[i],c=x[i+1];if(Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))<1e-4)x.splice(i,1);}});
    const edges=runs.filter(x=>x.length>=2&&x.reduce((t,p,i)=>i?t+Math.hypot(p[0]-x[i-1][0],p[1]-x[i-1][1]):0,0)>0.5);
    const terr=(above.labels||[]).some(l=>/TERRAZ|BALC/.test(l[0])&&!pip([l[1],l[2]],above.slab)&&pip([l[1],l[2]],G.slab));
    if(terr){const r=glazing(edges,top+SLAB,top+SLAB+1.05,true);
      if(r.panes){const p=new THREE.Mesh(r.panes,MAT.rail);p.renderOrder=2;grp.add(p);}if(r.frames)grp.add(mesh(r.frames,Glazing.mats.frame,false));}
    else{const pt=[];segs(edges,(a,b,dx,dz,L,ang)=>{const g=new THREE.BoxGeometry(L+0.15,0.6,0.15);g.rotateY(-ang);g.translate((a[0]+b[0])/2,top+SLAB+0.3,(a[1]+b[1])/2);pt.push(g);});
      const pm=mesh(facadeUV(merge(pt)),MAT.fac);if(pm){pm.userData.facade=true;grp.add(pm);}}
    grp.userData.cover=cv;
  }
  const ceil=new THREE.Mesh(extr(G.slab,0.02,top),MAT.ceil);ceil.visible=false;grp.add(ceil);grp.userData.ceil=ceil;
  grp.userData.techCtx={rg,top,lv:f.lv};
  const labs=new THREE.Group();labs.visible=false;
  (G.labels||[]).forEach(l=>{const s=label(cap(l[0]),0.34,600);s.position.set(l[1],f.lv+1.25,l[2]);s.userData.kind='room';labs.add(s);sprites.push(s);});
  (G.units||[]).forEach(u=>{const s=label(u[0],0.55,700);s.position.set(u[1],f.lv+2.3,u[2]);s.userData.kind='unit';labs.add(s);sprites.push(s);});
  grp.add(labs);grp.userData.labels=labs;
  Luces.scan(grp);scene.add(grp);groups.push(grp);try{techFill(groups.length-1);}catch(e){}
  bounds.expandByObject(slab);
}
const TREE_KEYS=['molle','jacaranda','ficus'];let TREE_P=null;const TREE_DEPTH=new Map();
function loadTrees(){if(TREE_P)return TREE_P;
  TREE_P=Promise.all(TREE_KEYS.map(k=>new Promise(res=>{if(!THREE.GLTFLoader)return res(null);new THREE.GLTFLoader().load('library/arboles/arbol-'+k+'.gltf',g=>{
    g.scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.userData.shared=true;const m=o.material;
      if(m.alphaTest>0||m.transparent||/hojas/.test(m.name)){m.transparent=false;m.alphaTest=0.5;m.side=THREE.DoubleSide;m.roughness=0.75;m.envMapIntensity=0.7;
        if(!TREE_DEPTH.has(m))TREE_DEPTH.set(m,new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:m.map,alphaTest:0.5,side:THREE.DoubleSide}));o.customDepthMaterial=TREE_DEPTH.get(m);}});
    res(g.scene);},undefined,()=>res(null));setTimeout(()=>res(null),20000);})));return TREE_P;}
let CALLES_READY=null;
function buildSite(){
  if(!CALLES_READY)CALLES_READY=Calles.init(THREE,{onLoad:()=>{try{shadowsDirty();}catch(e){}}});
  site=new THREE.Group();
  const floors=PROJ.floors;
  const gf=floors.find(f=>f.lv>-0.5)||floors[0],pb=PROJ.geo[gf.g].slab,xs=pb.map(p=>p[0]),zs=pb.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
  const gy=Math.max(-0.02,gf.lv-SLAB-0.02);
  TX.grass.repeat.set(1,1);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(320,320),MAT.ground);ground.rotation.x=-Math.PI/2;ground.position.set((x0+x1)/2,-0.03,(z0+z1)/2);ground.receiveShadow=true;site.add(ground);site.userData.ground=ground;
  ground.geometry.attributes.uv.array.forEach((v,j,a)=>a[j]=v*64);
  const pl=(w,d,x,z,m,y)=>{const g=new THREE.PlaneGeometry(w,d);g.attributes.uv.array.forEach((v,j,a)=>a[j]=v*(j%2?d:w));const p=new THREE.Mesh(g,m);p.rotation.x=-Math.PI/2;p.position.set(x,y,z);p.receiveShadow=true;site.add(p);};
  const cx=(x0+x1)/2,cz=(z0+z1)/2,NB=[[x0-14,x0-0.4,z0-0.5,z1,10.5,0],[x0-1,x1-5,z1+0.4,z1+13,7,1],[x0-26,x0-15,z0,z1,6,2]];
  const tsite=site,near=(x,z)=>Math.max(x0-x,x-x1,z0-z,z-z1)<4.5;
  Promise.all([CALLES_READY,loadTrees()]).then(([,M])=>{if(site!==tsite)return;
    const C=Calles.build({x1,z0,cx,cz});site.add(C.group);site.userData.calles=C;
    const ok=(M||[]).filter(Boolean);
    if(!ok.length){const tg=[],cg=[];C.trees.forEach(({x,y,z})=>{const t=new THREE.CylinderGeometry(0.12,0.17,2.8,8);t.translate(x,y+1.4,z);tg.push(t);
      for(let k=0;k<3;k++){const c=new THREE.IcosahedronGeometry(1.1+rnd()*0.5,0);c.translate(x+(rnd()-0.5)*1.2,y+3.4+rnd()*1.0,z+(rnd()-0.5)*1.2);cg.push(c);}});
      site.add(mesh(merge(tg),MAT.trunk));site.add(mesh(merge(cg),MAT.tree));shadowsDirty();return;}
    const obst=[...new Set(PROJ.floors.map(f=>f.g))].map(g=>PROJ.geo[g].slab).concat(NB.map(b=>[[b[0],b[2]],[b[1],b[2]],[b[1],b[3]],[b[0],b[3]]]));
    const hitB=(px,pz)=>obst.some(P=>pip([px,pz],P)||distToPoly([px,pz],P)<0.25);
    const crown=ok.map(src=>{const bb=new THREE.Box3().setFromObject(src);return bb;});
    C.trees.forEach(({x,y,z},i)=>{let best=null;
      for(let m=0;m<ok.length&&!best;m++){const mi=(i*7+3+m)%ok.length,bb=crown[mi];
        for(const s0 of [0.82,0.74,0.66,0.58,0.5,0.43,0.36]){const sc=s0+((i*37)%10)/80;let fit=null;
          for(let r=0;r<12&&!fit;r++){const a=((i*2.399)+r*Math.PI/6)%(Math.PI*2),ca=Math.cos(a),sa=Math.sin(a);let clash=false;
            for(let u=0;u<=6&&!clash;u++)for(let v=0;v<=6&&!clash;v++){const lx=(bb.min.x+(bb.max.x-bb.min.x)*u/6)*sc,lz=(bb.min.z+(bb.max.z-bb.min.z)*v/6)*sc;if(Math.hypot(lx,lz)<0.35)continue;
              if(hitB(x+lx*ca+lz*sa,z-lx*sa+lz*ca))clash=true;}
            if(!clash)fit={mi,a,sc};}
          if(fit){best=fit;break;}}}
      if(!best)return;const o=ok[best.mi].clone();o.position.set(x,y,z);o.rotation.y=best.a;o.scale.setScalar(best.sc);o.userData.arbol=true;
      o.traverse(n=>{if(n.isMesh&&TREE_DEPTH.has(n.material))n.customDepthMaterial=TREE_DEPTH.get(n.material);});site.add(o);});
    shadowsDirty();});
  const nbm=[0xd8d1c4,0xc9cdd0,0xe2d9cb].map(c=>new THREE.MeshStandardMaterial({color:c,map:TX.facade,roughness:0.95}));
  NB.forEach(b=>site.add(mesh(box(b[0],b[1],b[2],b[3],0,b[4]),nbm[b[5]])));
  scene.add(site);
}
function buildRoof(){
  roofGroup=new THREE.Group();
  const f=PROJ.floors[PROJ.floors.length-1],G=PROJ.geo[f.g];ROOF=f.lv+f.h;
  const hull=G.slab;
  roofGroup.add(mesh(extr(hull,0.25,ROOF-0.25),MAT.cover));
  const par=[];
  segs([closeLoop(hull)],(a,b,dx,dz,L,ang)=>{const g=new THREE.BoxGeometry(L,0.7,0.15);g.rotateY(-ang);g.translate((a[0]+b[0])/2,ROOF+0.35,(a[1]+b[1])/2);par.push(g);});
  roofGroup.add(mesh(facadeUV(merge(par)),MAT.fac));
  const core=PROJ.core;
  if(core)roofGroup.add(mesh(facadeUV(box(core[0],core[1],core[2],core[3],ROOF,ROOF+2.5).toNonIndexed()),MAT.fac));
  scene.add(roofGroup);
}

async function buildProject(p){
  clearScene();PROJ=p;
  $('pname').textContent=p.name;$('psub').textContent=p.sub||'';document.title=p.name;
  p.rooms={};p.floorMat={};
  const gs=[...new Set(p.floors.map(f=>f.g))];
  const imgs=gs.map(()=>null);
  gs.forEach((g,j)=>{
    const G=p.geo[g];
    const isG=p.floors.some(f=>f.g===g&&f.lv<1.2&&f.lv>-0.5);p.rooms[g]=roomGrid(G,{ground:isG,manual:boundsFor(g)});
    p.rooms[g].isGround=isG;
  });
  p.core=null;
  if(p.geo[gs[0]].core!==false){
    const top=p.floors[p.floors.length-1],G=p.geo[top.g];const has=G.cols.some(c=>Math.abs(c[0][0])<0.3&&Math.abs(c[0][1])<0.3);
    if(has||p.builtin)p.core=[-4.7,1.7,-0.75,2.05];
  }
  p.winStk=winStacks(p);
  p.floors.forEach((f,i)=>buildFloor(f,i,p.floors));
  buildSite();buildRoof();
  const b=bounds.clone();b.max.y=ROOF+2;
  const c=b.getCenter(new THREE.Vector3());
  sun.target.position.set(c.x,0,c.z);sun.position.set(c.x-35,75,c.z-30);applySun();
  if(!SHOWF)groups.forEach(g=>g.traverse(o=>{if(o.userData.furn)o.visible=false;}));
  sel=-1;mode='ext';walkState=null;
  p.floors.forEach((f,i)=>{renderManual(i);renderWr(i);});applySun();
  applyTheme();renderStats();renderList();renderDetail();renderLegend();layout();
  const v=fitView(b,new THREE.Vector3(1.05,0.55,-1.25),1.05);camera.position.copy(v.pos);controls.target.copy(v.tgt);controls.update();shadowsDirty();
}

const LAT=-17.3935,LON=-66.157,TZ=-4;
function sunPos(date,hours){
  const y=date.getFullYear(),start=Date.UTC(y,0,1),doy=Math.floor((Date.UTC(y,date.getMonth(),date.getDate())-start)/864e5)+1;
  const g=2*Math.PI/365*(doy-1+(hours-12)/24);
  const eot=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  const decl=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  const tst=hours*60+eot+4*LON-60*TZ,ha=(tst/4-180)*Math.PI/180,lat=LAT*Math.PI/180;
  const cz=Math.sin(lat)*Math.sin(decl)+Math.cos(lat)*Math.cos(decl)*Math.cos(ha),zen=Math.acos(Math.max(-1,Math.min(1,cz)));
  let az=Math.acos(Math.max(-1,Math.min(1,(Math.sin(lat)*Math.cos(zen)-Math.sin(decl))/(Math.cos(lat)*Math.sin(zen)))));
  az=ha>0?(az*180/Math.PI+180)%360:(540-az*180/Math.PI)%360;
  return {el:90-zen*180/Math.PI,az};
}
const SUN={on:false,play:false,date:new Date(),hour:10};
const LIGHT={prof:_lsG(LKEY)||'dia',pts:[],cam:null};
const PROFILES={
  dia:{sun:1.15,sc:0xfff1dc,dir:[-35,75,-30],hemi:0.45,hs:0xeaf2ff,hg:0x8d8a7c,fill:0.3,exp:0.82,env:1,envIn:0.42,expIn:0.78,hemiIn:0.3,lamp:1.1,ceil:0.35,bg:null},
  tarde:{sun:1.0,sc:0xffb877,dir:[-70,28,-10],hemi:0.3,hs:0xffd9b8,hg:0x7a6a58,fill:0.12,exp:0.92,env:0.85,envIn:0.3,expIn:0.85,hemiIn:0.2,lamp:1.4,ceil:0.25,bg:0xe9b98f},
  noche:{sun:0.0,sc:0xffffff,dir:[-35,75,-30],hemi:0.06,hs:0x6d7a99,hg:0x2a2620,fill:0.0,exp:1.05,env:0.2,envIn:0.05,expIn:1.0,hemiIn:0.03,lamp:3.2,ceil:0.04,bg:0x0f1726,night:true},
  presentacion:{sun:0.95,sc:0xfff6ea,dir:[-30,80,-25],hemi:0.62,hs:0xffffff,hg:0xbab4a8,fill:0.45,exp:0.95,env:1.15,envIn:0.55,expIn:0.85,hemiIn:0.4,lamp:1.2,ceil:0.45,bg:null}
};
function setEnvScale(s){LIGHT.env=s;scene.traverse(o=>{if(!o.material)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.envMapIntensity===undefined)return;if(m.userData.envBase===undefined)m.userData.envBase=m.envMapIntensity;m.envMapIntensity=m.userData.envBase*s;});});}
function lampGlow(v){MAT.lampOn.emissiveIntensity=v;}
function nightLights(off){
  LIGHT.pts.forEach(l=>scene.remove(l));LIGHT.pts=[];if(LIGHT.cam){camera.remove(LIGHT.cam);LIGHT.cam=null;}
  if(off||LIGHT.prof!=='noche'||SUN.on)return;
  if(sel>=0&&(mode==='int'||mode==='walk')&&PROJ){const f=PROJ.floors[sel],G=PROJ.geo[f.g],top=f.lv+f.h-SLAB;
    (G.labels||[]).filter(l=>!/PARQUEO|BAULERA|MAQUINAS|MÁQUINAS|DEP[OÓ]SITO|DESPENSA|TERRAZA|BALC/.test(l[0])).slice(0,8).forEach(l=>{const p=new THREE.PointLight(0xffc98a,0.9,5.5,2);p.position.set(l[1],top-0.35,l[2]);scene.add(p);LIGHT.pts.push(p);});}
  LIGHT.cam=new THREE.PointLight(0xffd8ae,0.35,4,2);camera.add(LIGHT.cam);if(!camera.parent)scene.add(camera);
}
function applyProfile(c){
  const P=PROFILES[LIGHT.prof]||PROFILES.dia;
  sun.position.set(c.x+P.dir[0],P.dir[1],c.z+P.dir[2]);sun.target.position.set(c.x,0,c.z);sun.intensity=P.sun;sun.color.set(P.sc);sun.castShadow=P.sun>0;
  const inside=mode==='int'||mode==='walk';
  hemi.intensity=inside?P.hemiIn:P.hemi;hemi.color.set(P.hs);hemi.groundColor.set(P.hg);fillL.intensity=P.fill;renderer.toneMappingExposure=inside?P.expIn:P.exp;
  setEnvScale(inside?P.envIn:P.env);lampGlow(P.lamp);MAT.ceil.emissiveIntensity=P.ceil;
  scene.background=new THREE.Color(P.bg!=null?P.bg:css('--sky'));if(scene.fog)scene.fog.color=scene.background;
  nightLights();fitShadow();shadowsDirty();
}
$('lightProf').value=LIGHT.prof;const lightSum=()=>{const o=$('lightProf').selectedOptions[0];$('lightSum').textContent=o?o.textContent:'';};lightSum();$('lightProf').addEventListener('change',e=>{LIGHT.prof=e.target.value;_lsS(LKEY,LIGHT.prof);applySun();lightSum();});
$('texQ').value=Mats.quality();$('texQ').addEventListener('change',e=>{_lsS(QKEY,e.target.value);Mats.setQuality(e.target.value);});

/* ---------- finishes configurator ---------- */
const FINC={on:false,room:-1,surf:'piso',ab:null,vars:[],draw:null};let BOUNDS={};
const PAINTS=['#efe9df','#e2d3bf','#d8c3b6','#c9d4c5','#d2dbe2','#c7d1da','#ece6da','#bfb5a8','#9fa89a','#8e9aa6','#c9a98a','#ffffff'];
function finAllowed(){const ed=canEditLib(),c=(LIB.settings&&LIB.settings.client)||{floors:true,walls:true};return {floors:ed||c.floors!==false,walls:ed||c.walls!==false,any:ed||c.floors!==false||c.walls!==false};}
function finPerms(){const c=(LIB.settings&&LIB.settings.client)||{floors:true,walls:true};$('permFloors').checked=c.floors!==false;$('permWalls').checked=c.walls!==false;$('finPerm').hidden=!canEditLib();}
['permFloors','permWalls'].forEach(id=>$(id).addEventListener('change',()=>{LIB.settings.client={floors:$('permFloors').checked,walls:$('permWalls').checked};saveSettings().catch(()=>{});}));
function openFin(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof FAC!=="undefined"&&FAC.on)closeFac();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(ZOC.on)closeZoc();if(FURN.on)closeFurnish();if(SHOP.on)closeShop();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();FINC.on=true;showPanel($('finPanel'));$('hint').hidden=true;toolState();if(!VAR_BASE)VAR_BASE=JSON.stringify(VARS);loadVariants();renderFin();}
function closeFin(){FINC.on=false;FINC.draw=null;hidePanel($('finPanel'));diagOverlay();toolState();}
$('finBtn').addEventListener('click',()=>FINC.on?closeFin():openFin());$('finClose').addEventListener('click',closeFin);
document.querySelectorAll('#finPanel [data-surf]').forEach(b=>b.addEventListener('click',()=>{FINC.surf=b.dataset.surf;FINC.ab=null;renderFin();}));
$('finRoom').addEventListener('change',e=>{FINC.room=+e.target.value;FINC.ab=null;renderFin();});
function curKey(){const f=PROJ.floors[sel];return f.k+':'+FINC.room;}
function setFinish(val,keepAB){
  if(sel<0||FINC.room<0)return;const key=curKey(),bag=FINC.surf==='piso'?VARS.floors:VARS.walls,prev=bag[key]||null;
  if(!keepAB)FINC.ab={a:prev,b:val,showing:'b'};
  if(val)bag[key]=val;else delete bag[key];
  PROJ.floors.forEach((f,i)=>{if(f.k===PROJ.floors[sel].k){if(FINC.surf==='piso')refreshFloors(i);else{recolorWalls(i);shadowsDirty();}}});
  renderFin();
}
function renderFin(){
  if(!PROJ||sel<0)return;const f=PROJ.floors[sel],rg=PROJ.rooms[f.g],al=finAllowed();
  if(FINC.surf==='piso'&&!al.floors)FINC.surf='pared';if(FINC.surf==='pared'&&!al.walls)FINC.surf='piso';
  document.querySelectorAll('#finPanel [data-surf]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.surf===FINC.surf);b.hidden=b.dataset.surf==='piso'?!al.floors:!al.walls;});
  const opts=rg.labels.map((l,i)=>[i,l]).filter(([i,l])=>(rg.rects&&rg.rects.has(i))||(l.wet&&l.zone>=0));
  if(FINC.room<0||!rg.labels[FINC.room])FINC.room=opts.length?opts[0][0]:-1;
  $('finRoom').innerHTML=opts.map(([i,l])=>`<option value="${i}" ${i===FINC.room?'selected':''}>${esc(titleCase(l.s))}</option>`).join('');
  const key=FINC.room>=0?curKey():'';
  if(FINC.surf==='piso'){const cur=VARS.floors[key]||null,def=FINC.room>=0?floorMatId(sel,FINC.room,rg):'';
    keepFocus($('finGrid'),'data-m',()=>{$('finGrid').innerHTML=`<div class="tiles three">${Mats.list({surface:'piso'}).map(m=>{const on=(cur||def.replace(/^mat:/,''))===m.id;return `<button type="button" class="tile sm" data-m="${esc(m.id)}" aria-pressed="${on}"><span class="tile-well"><img class="cover" src="${esc(m.thumb)}" alt="" loading="lazy">${on?'<span class="badge"><svg class="ico"><use href="#i-check"/></svg>'+(cur?'Elegido':'Actual')+'</span>':''}</span><span class="tile-name">${esc(m.name)}</span></button>`;}).join('')}</div>`;});
    $('finGrid').querySelectorAll('[data-m]').forEach(b=>b.addEventListener('click',()=>setFinish(b.dataset.m)));}
  else{const cur=VARS.walls[key]||null;
    keepFocus($('finGrid'),'data-c',()=>{$('finGrid').innerHTML=`<div class="tiles three">${PAINTS.map(c=>`<button type="button" class="tile sm" data-c="${c}" aria-pressed="${cur===c}" aria-label="Pintura ${c}"><span class="tile-well"><i style="background:${c}"></i>${cur===c?'<span class="badge"><svg class="ico"><use href="#i-check"/></svg>Elegido</span>':''}</span><span class="tile-name">${c.toUpperCase()}</span></button>`).join('')}</div><label class="tg" for="finColor" style="margin-top:12px">Otro color <input type="color" id="finColor" value="${cur||'#e2d3bf'}" style="width:40px;height:32px;border:0;background:none;padding:0"></label>`;});
    $('finGrid').querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click',()=>setFinish(b.dataset.c)));
    $('finColor').addEventListener('change',e=>setFinish(e.target.value));}
  $('finAB').disabled=!FINC.ab;$('finAB').textContent=FINC.ab?(FINC.ab.showing==='b'?'Ver A (antes)':'Ver B (nuevo)'):'Comparar A/B';
  $('finSaveRow').hidden=!(DB&&currentId!=='__preview');
  const L=FINC.room>=0?rg.labels[FINC.room]:null,canB=canEditLib()||currentId==='__preview';
  $('finBound').hidden=!(L&&(L.wet||L.bnd==='manual')&&canB);if(L){$('finBoundInfo').textContent=BND_TXT[L.bnd]||'';$('finBoundClear').hidden=L.bnd!=='manual';}
  $('finDiagL').hidden=!canB;diagOverlay();
  $('finAdv').hidden=$('finBound').hidden&&$('finDiagL').hidden&&$('finPerm').hidden;$('finVarBox').hidden=!DB;
}
const BND_TXT={fisica:'Frontera física: paredes y puertas detectadas en el plano.',inferida:'Frontera inferida: se calculó desde la mesada, los artefactos y la alineación de los tabiques. Revisala.',ambigua:'Ambiguo: no hay paredes ni artefactos suficientes para saber dónde termina. No se puso cerámica; marcá el límite.',manual:'Frontera confirmada a mano.',abierta:'Ambiente abierto, repartido con los vecinos.'};
function boundsFor(g){return BOUNDS[(currentId||'x')+'__'+g]||{};}
function applyBounds(g){const old=PROJ.rooms[g],G=PROJ.geo[g];if(!old)return;const nr=roomGrid(G,{ground:old.isGround,manual:boundsFor(g)});
  ['isGround','solids','navDone','manualRects','hideAuto'].forEach(k=>{if(old[k]!==undefined)nr[k]=old[k];});PROJ.rooms[g]=nr;
  PROJ.floors.forEach((f,i)=>{if(f.g===g){refreshFloors(i);recolorWalls(i);}});if(walkState&&sel>=0&&PROJ.floors[sel].g===g)walkState.nav=navFor(sel);if(FINC.on)renderFin();diagOverlay();shadowsDirty();}
async function saveBound(r){if(sel<0||FINC.room<0)return;const g=PROJ.floors[sel].g,key=(currentId||'x')+'__'+g,cur={...(BOUNDS[key]||{})};
  if(r)cur[FINC.room]=r.map(v=>+v.toFixed(3));else delete cur[FINC.room];BOUNDS[key]=cur;applyBounds(g);
  $('finNote').textContent=r?'Límite guardado. La cerámica ahora respeta ese rectángulo.':'Límite manual quitado.';
  if(DB&&currentId!=='__preview'){try{await DB.doc('bounds/'+key).set({rooms:cur,updatedAt:Date.now()});}catch(e){$('finNote').textContent='Se aplicó, pero no se pudo guardar (permiso o conexión).';}}}
$('finBoundDraw').addEventListener('click',()=>{FINC.draw=[];$('finNote').textContent='Tocá en el piso una esquina del área de cerámica.';});
$('finBoundClear').addEventListener('click',()=>saveBound(null));
$('finDiag').addEventListener('change',()=>diagOverlay());
let DIAG=null;
function diagOverlay(){if(DIAG){DIAG.parent&&DIAG.parent.remove(DIAG);DIAG.geometry.dispose();DIAG.material.map.dispose();DIAG.material.dispose();DIAG=null;}
  if(!$('finDiag').checked||!FINC.on||sel<0||!PROJ)return;const f=PROJ.floors[sel],G=PROJ.geo[f.g],rg=PROJ.rooms[f.g],S=4,c=document.createElement('canvas');c.width=rg.w*S;c.height=rg.h*S;const x=c.getContext('2d');
  const wet=['#d7263d','#f46036','#c2185b','#ff8f00','#8e24aa','#e53935'],dry=['#7fb069','#5da9e9','#9bc1bc','#e6c229','#6a8eae','#b5d99c','#8ecae6','#cdb4db'];
  const img=x.createImageData(rg.w,rg.h),d=img.data,hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  for(let j=0;j<rg.w*rg.h;j++){let col=null,a=200;if(!rg.ins.d[j])a=0;else if(rg.block.d[j])col=[20,20,20];else if(rg.amb[j])col=[255,235,0];else if(rg.barrier.d[j])col=[0,229,255];else if(rg.lab[j]<0)col=[200,200,200];else{const L=rg.labels[rg.lab[j]];col=hex(L.wet?wet[rg.lab[j]%wet.length]:dry[rg.lab[j]%dry.length]);}
    if(col){d[j*4]=col[0];d[j*4+1]=col[1];d[j*4+2]=col[2];}d[j*4+3]=a;}
  const t=document.createElement('canvas');t.width=rg.w;t.height=rg.h;t.getContext('2d').putImageData(img,0,0);x.imageSmoothingEnabled=false;x.drawImage(t,0,0,rg.w*S,rg.h*S);
  x.font='bold 22px system-ui';x.textAlign='center';rg.labels.forEach(l=>{if(l.seed<0)return;const px=(l.seed%rg.w+0.5)*S,py=(((l.seed/rg.w)|0)+0.5)*S;x.fillStyle='#000';x.beginPath();x.arc(px,py,6,0,7);x.fill();
    x.fillStyle='#fff';x.strokeStyle='#000';x.lineWidth=4;const tx=titleCase(l.s)+' · '+l.bnd;x.strokeText(tx,px,py-12);x.fillText(tx,px,py-12);});
  rg.labels.forEach(l=>{if(!l.rect)return;x.strokeStyle='#ffffff';x.lineWidth=3;x.setLineDash([10,6]);x.strokeRect((l.rect[0]-rg.mx)*rg.R*S,(l.rect[1]-rg.mz)*rg.R*S,(l.rect[2]-l.rect[0])*rg.R*S,(l.rect[3]-l.rect[1])*rg.R*S);x.setLineDash([]);});
  const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
  const W=rg.w/rg.R,H=rg.h/rg.R,g=new THREE.PlaneGeometry(W,H);g.rotateX(-Math.PI/2);g.translate(rg.mx+W/2,f.lv+0.03,rg.mz+H/2);
  DIAG=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0.85,depthWrite:false,toneMapped:false}));DIAG.renderOrder=5;scene.add(DIAG);}
/* ---------- productos por tienda y cotización ---------- */
const SHOP={data:null,on:false,cat:'Inodoros',store:'',quote:[],leads:{}};
const QK='peredo.quote';try{SHOP.quote=JSON.parse(localStorage.getItem(QK)||'[]');}catch(e){SHOP.quote=[];}
const saveQuote=()=>{try{localStorage.setItem(QK,JSON.stringify(SHOP.quote));}catch(e){}};
async function loadShop(){if(SHOP.data)return SHOP.data;try{const r=await fetch('library/stores.json');SHOP.data=await r.json();}catch(e){SHOP.data={stores:[],products:[]};}return SHOP.data;}
const TYPE_OF={Inodoros:'toilet'};
function openShop(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof FAC!=="undefined"&&FAC.on)closeFac();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(ZOC.on)closeZoc();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();SHOP.on=true;showPanel($('prodPanel'));$('hint').hidden=true;toolState();loadShop().then(()=>{renderShop();loadLeads();});}
function closeShop(){SHOP.on=false;hidePanel($('prodPanel'));toolState();}
$('prodBtn').addEventListener('click',()=>SHOP.on?closeShop():openShop());$('prodClose').addEventListener('click',closeShop);
$('prodCat').addEventListener('change',e=>{SHOP.cat=e.target.value;renderShop();});$('prodStore').addEventListener('change',e=>{SHOP.store=e.target.value;renderShop();});
const storeOf=id=>(SHOP.data.stores||[]).find(s=>s.id===id)||{name:id};
function mm(m){const p=[];if(m.ancho)p.push(m.ancho);if(m.fondo)p.push(m.fondo);if(m.alto)p.push(m.alto);return p.join(' × ')+' mm'+(m.asiento?' · asiento '+m.asiento+' mm':'');}
function renderShop(){const D=SHOP.data;if(!D)return;const cats=[...new Set(D.products.map(p=>p.category))];
  if(!D.products.length){$('prodList').innerHTML='<div class="empty"><b>No se pudo cargar el catálogo de tiendas</b><span>Revisá tu conexión y volvé a abrir Productos.</span></div>';$('prodCat').innerHTML='';$('prodStore').innerHTML='';renderQuote();return;}
  if(!cats.includes(SHOP.cat))SHOP.cat=cats[0];
  $('prodCat').innerHTML=cats.map(c=>`<option ${c===SHOP.cat?'selected':''}>${esc(c)}</option>`).join('');
  $('prodStore').innerHTML='<option value="">Todas las tiendas</option>'+D.stores.map(s=>`<option value="${esc(s.id)}" ${s.id===SHOP.store?'selected':''}>${esc(s.name)}</option>`).join('');
  const act=libActive(),list=D.products.filter(p=>p.category===SHOP.cat&&(!SHOP.store||p.store===SHOP.store));
  keepFocus($('prodList'),'data-try',()=>{$('prodList').innerHTML=list.map(p=>{const it=libItems().find(i=>i.id===p.model),cur=act[p.type]===p.model,st=storeOf(p.store),inQ=SHOP.quote.find(q=>q.id===p.id);
    return `<article class="prow"><span class="tile-well">${it&&thumbUrl(it)?`<img src="${esc(thumbUrl(it))}" alt="" loading="lazy">`:'<span class="tile-ph"><svg class="ico"><use href="#i-cube"/></svg></span>'}</span>
      <div><h3>${esc(p.name)}</h3><p class="by">${esc(p.brand)}, ${esc(st.name)}. Ref. ${esc(p.ref)}</p><p class="spec">${esc(mm(p.medidas))}</p>
      ${(p.features||[]).length?`<p class="feat">${esc(p.features.map((x,i)=>i&&/^[A-ZÁÉÍÓÚ][a-záéíóúñ]/.test(x)?x.charAt(0).toLowerCase()+x.slice(1):x).join(', '))}.</p>`:''}${p.incluye?`<p class="feat">Incluye ${esc(p.incluye.join(' + '))}.</p>`:''}<p class="feat">${p.price?esc(p.currency+' '+p.price):'Precio a cotizar con la tienda'}</p>
      <div class="acts"><button class="btn sm${cur?' is-done':''}" type="button" data-try="${esc(p.id)}" aria-pressed="${cur}">${cur?'<svg class="ico"><use href="#i-check"/></svg>En el departamento':'Ver en el departamento'}</button><button class="btn ghost sm" type="button" data-add="${esc(p.id)}"><svg class="ico"><use href="#i-plus"/></svg>${inQ?'Cotizar otro ('+inQ.qty+')':'Cotizar'}</button>${canEditLib()?`<button class="btn ghost sm" type="button" data-def="${esc(p.id)}">Usar para todos</button>`:''}</div></div></article>`;}).join('')||'<div class="empty"><b>Sin productos en esta categoría</b><span>Probá con otra tienda o categoría.</span></div>';});
  $('prodList').querySelectorAll('[data-try]').forEach(b=>b.addEventListener('click',()=>{const p=D.products.find(x=>x.id===b.dataset.try);if(b.getAttribute('aria-pressed')==='true')return;CLIENT_ACTIVE[p.type]=p.model;b.setAttribute('aria-busy','true');b.innerHTML='Cargando…';$('prodNote').textContent='Cargando '+p.name+'…';scheduleRebuild();setTimeout(()=>{$('prodNote').textContent=p.name+' ya está en todos los baños del edificio. Solo lo ves vos.';renderShop();toast(p.name+' ya está en tu departamento');},1600);logLead('vista',p);}));
  $('prodList').querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{const p=D.products.find(x=>x.id===b.dataset.add);const q=SHOP.quote.find(x=>x.id===p.id);if(q)q.qty++;else SHOP.quote.push({id:p.id,qty:1});saveQuote();renderShop();toast('Agregado a tu cotización');}));
  $('prodList').querySelectorAll('[data-def]').forEach(b=>b.addEventListener('click',()=>{const p=D.products.find(x=>x.id===b.dataset.def);setActive(p.type,p.model);delete CLIENT_ACTIVE[p.type];$('prodNote').textContent='Listo: '+p.name+' queda como predeterminado para todos.';toast(p.name+' queda como predeterminado');}));
  renderQuote();}
function quoteText(st,items){const lines=items.map(({p,qty})=>`• ${qty} × ${p.name} (${p.brand}, Ref. ${p.ref})`).join('\n');
  return `Hola ${st.name}, vi sus productos en el visor 3D del ${PROJ?PROJ.name:'proyecto'} (${PROJ&&PROJ.sub?PROJ.sub:'Cochabamba'}). Quisiera una cotización de:\n${lines}\n¿Me pasan precio, disponibilidad y tiempo de entrega? Gracias.`;}
function renderQuote(){const D=SHOP.data;if(!D)return;const rows=SHOP.quote.map(q=>({q,p:D.products.find(x=>x.id===q.id)})).filter(r=>r.p);
  const n=rows.reduce((t,r)=>t+r.q.qty,0);$('quoteH').innerHTML='Mi cotización'+(n?` <small>${n} producto${n>1?'s':''}</small>`:'');
  if(!rows.length){$('prodQuote').innerHTML='<p class="note">Agregá productos con «Cotizar». Se arma un pedido por tienda y lo mandás por WhatsApp.</p>';return;}
  const by={};rows.forEach(r=>{(by[r.p.store]=by[r.p.store]||[]).push(r);});
  $('prodQuote').innerHTML=`<div class="quote">${Object.entries(by).map(([sid,rs])=>{const st=storeOf(sid);return `<div class="qstore"><b>${esc(st.name)}</b>
    ${rs.map(({q,p})=>`<div class="qrow"><input type="number" min="1" value="${q.qty}" data-q="${esc(p.id)}" aria-label="Cantidad de ${esc(p.name)}"><span>${esc(p.name)}, ref. ${esc(p.ref)}</span><button class="btn ghost icon" type="button" data-rm="${esc(p.id)}" aria-label="Quitar ${esc(p.name)}"><svg class="ico"><use href="#i-close"/></svg></button></div>`).join('')}
    <a class="btn primary wide" target="_blank" rel="noopener" data-wa="${esc(sid)}" href="https://wa.me/${esc(st.whatsapp||'')}?text=${encodeURIComponent(quoteText(st,rs.map(r=>({p:r.p,qty:r.q.qty}))))}"><svg class="ico"><use href="#i-msg"/></svg>Pedir cotización por WhatsApp</a>
    ${(st.sucursales||[]).map(s=>`<small>${esc(s.ciudad)}: ${esc(s.direccion)}, tel. ${esc(s.telefono)}</small>`).join('')}<small>${esc(st.horario||'')}</small></div>`;}).join('')}</div>`;
  $('prodQuote').querySelectorAll('[data-q]').forEach(i=>i.addEventListener('change',()=>{const q=SHOP.quote.find(x=>x.id===i.dataset.q);q.qty=Math.max(1,+i.value||1);saveQuote();renderShop();}));
  $('prodQuote').querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',()=>{SHOP.quote=SHOP.quote.filter(x=>x.id!==b.dataset.rm);saveQuote();renderShop();}));
  $('prodQuote').querySelectorAll('[data-wa]').forEach(a=>a.addEventListener('click',()=>{const sid=a.dataset.wa;SHOP.quote.filter(q=>{const p=D.products.find(x=>x.id===q.id);return p&&p.store===sid;}).forEach(q=>logLead('cotizacion',D.products.find(x=>x.id===q.id),q.qty));}));}
function logLead(kind,p,qty){if(!DB||!p)return;const id=Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  DB.doc('leads/'+id).set({kind,store:p.store,product:p.id,ref:p.ref,qty:qty||1,project:currentId||'',at:Date.now()}).catch(()=>{});}
async function loadLeads(){if(!DB||!canEditLib()){$('prodStats').hidden=true;return;}try{const s=await DB.collection('leads').get();const by={};s.docs.forEach(d=>{const v=d.data();const k=v.store;by[k]=by[k]||{vista:0,cotizacion:0};by[k][v.kind]=(by[k][v.kind]||0)+(v.kind==='cotizacion'?1:1);});
  $('prodStats').hidden=false;$('prodStats').innerHTML='<p class="sub-h">Interés por tienda <small>solo lo ves vos</small></p>'+(Object.entries(by).map(([k,v])=>`<small>${esc(storeOf(k).name)}: ${v.vista||0} productos probados · ${v.cotizacion||0} pedidos de cotización</small>`).join('')||'<small>Todavía sin datos.</small>');}catch(e){}}
const titleCase=s=>(s||'').toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase());
$('finAB').addEventListener('click',()=>{if(!FINC.ab)return;FINC.ab.showing=FINC.ab.showing==='b'?'a':'b';setFinish(FINC.ab[FINC.ab.showing],true);});
$('finUndo').addEventListener('click',()=>setFinish(null));
$('finUndoAll').addEventListener('click',()=>{VARS={floors:{},walls:{}};FINC.ab=null;PROJ.floors.forEach((f,i)=>{refreshFloors(i);recolorWalls(i);});renderFin();$('finVar').value='';});
async function loadVariants(){if(!DB)return;try{const s=await DB.collection('variants').get();FINC.vars=s.docs.map(d=>({id:d.id,...d.data()})).filter(v=>v.project===currentId);
  $('finVar').innerHTML='<option value="">Sin variante</option>'+FINC.vars.map(v=>`<option value="${esc(v.id)}">${esc(v.name)}</option>`).join('');}catch(e){}}
$('finVarApply').addEventListener('click',()=>{const v=FINC.vars.find(x=>x.id===$('finVar').value);VARS=v?{floors:{...(v.floors||{})},walls:{...(v.walls||{})}}:{floors:{},walls:{}};FINC.ab=null;PROJ.floors.forEach((f,i)=>{refreshFloors(i);recolorWalls(i);});shadowsDirty();renderFin();});
$('finVarSave').addEventListener('click',async()=>{const name=$('finVarName').value.trim();if(!name){$('finVarName').focus();return;}if(!DB)return;
  const id=(currentId+'__'+name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-')).slice(0,120);
  try{await DB.doc('variants/'+id).set({project:currentId,name,floors:VARS.floors,walls:VARS.walls,updatedAt:Date.now()});$('finNote').textContent='Variante «'+name+'» guardada.';toast('Variante «'+name+'» guardada');$('finVarName').value='';await loadVariants();$('finVar').value=id;}
  catch(e){$('finNote').textContent='No se pudo guardar la variante (permiso o conexión).';toast('No se pudo guardar la variante.','err');}});
/* ---------- ventanas: tipo de vidrio y color de marco ---------- */
const WKEY='peredo.win';
const WIN={on:false,def:null,local:null};
const pickWin=o=>{const r={};if(!o)return r;if(Glazing.GLASS.some(g=>g.id===o.glass))r.glass=o.glass;if(Glazing.FRAMES.some(f=>f.id===o.frame))r.frame=o.frame;if(typeof o.bathFrosted==='boolean')r.bathFrosted=o.bathFrosted;return r;};
function winLoadLocal(){try{const v=JSON.parse(localStorage.getItem(WKEY)||'null');if(v){WIN.local=pickWin(v);Glazing.set(WIN.local);}}catch(e){}}
function winSaveLocal(){try{if(WIN.local)localStorage.setItem(WKEY,JSON.stringify(WIN.local));else localStorage.removeItem(WKEY);}catch(e){}}
function openWin(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof FAC!=="undefined"&&FAC.on)closeFac();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(ZOC.on)closeZoc();if(DOOR.on)closeDoor();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(SHOP.on)closeShop();if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();WIN.on=true;showPanel($('winPanel'));$('hint').hidden=true;toolState();renderWin();}
function closeWin(){WIN.on=false;hidePanel($('winPanel'));toolState();}
$('winBtn').addEventListener('click',()=>WIN.on?closeWin():openWin());$('winClose').addEventListener('click',closeWin);
function setWin(o){const st={...Glazing.state,...o},v={glass:st.glass,frame:st.frame,bathFrosted:!!st.bathFrosted};Glazing.set(v);WIN.local=v;winSaveLocal();renderWin();}
const chk='<span class="badge"><svg class="ico"><use href="#i-check"/></svg>Elegido</span>';
function swTile(attr,id,on,img,name,sub,title){return `<button type="button" class="tile sm" ${attr}="${id}" aria-pressed="${on}"${title?` title="${esc(title)}"`:''}><span class="tile-well"><img class="cover" src="${img}" alt="" loading="lazy">${on?chk:''}</span><span class="tile-name">${esc(name)}${sub?`<small>${esc(sub)}</small>`:''}</span></button>`;}
function renderWin(){
  const S=Glazing.state,ed=canEditLib();
  keepFocus($('winGlass'),'data-g',()=>{$('winGlass').innerHTML=Glazing.GLASS.map(g=>swTile('data-g',g.id,S.glass===g.id,`library/carpinteria/thumbs/${g.id}.webp`,g.name,g.spec)).join('');});
  keepFocus($('winFrame'),'data-f',()=>{$('winFrame').innerHTML=Glazing.FRAMES.map(f=>swTile('data-f',f.id,S.frame===f.id,`library/carpinteria/thumbs/${f.id}.webp`,f.name,'',f.name)).join('');});
  $('winBath').checked=!!S.bathFrosted;
  const sm=Glazing.summary();$('winSum').textContent=`${sm.glass.name} (${sm.glass.spec}). ${sm.glass.desc} Marco de aluminio ${sm.frame.name.toLowerCase()}, línea corrediza.`;
  const isDef=!!WIN.def&&WIN.def.glass===S.glass&&WIN.def.frame===S.frame&&!!WIN.def.bathFrosted===!!S.bathFrosted;
  const d=$('winDef');d.hidden=!ed;d.disabled=false;d.classList.toggle('is-done',isDef);d.classList.toggle('primary',!isDef);d.setAttribute('aria-disabled',String(isDef));d.innerHTML=isDef?'<svg class="ico"><use href="#i-check"/></svg>Predeterminado del edificio':'Usar para todo el edificio';
  $('winReset').hidden=!WIN.local;
  $('winNote').textContent=ed?'Probá combinaciones. «Usar para todo el edificio» lo deja como predeterminado para todos los que abran la página.':'Probá combinaciones de vidrio y color de marco. Lo que elijas solo lo ves vos.';
  $('winGlass').querySelectorAll('[data-g]').forEach(b=>b.addEventListener('click',()=>setWin({glass:b.dataset.g})));
  $('winFrame').querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>setWin({frame:b.dataset.f})));
}
$('winBath').addEventListener('change',e=>setWin({bathFrosted:e.target.checked}));
$('winReset').addEventListener('click',()=>{WIN.local=null;winSaveLocal();Glazing.set({glass:'transparente',frame:'negro',bathFrosted:true,...pickWin(WIN.def)});renderWin();});
$('winDef').addEventListener('click',async()=>{if(!DB||$('winDef').getAttribute('aria-disabled')==='true')return;const S=Glazing.state,v={glass:S.glass,frame:S.frame,bathFrosted:!!S.bathFrosted,updatedAt:Date.now()};
  $('winDef').setAttribute('aria-busy','true');
  try{await DB.doc('settings/windows').set(v);WIN.def=v;WIN.local=null;winSaveLocal();renderWin();$('winNote').textContent='Listo: queda como predeterminado para todo el edificio.';toast('Ventanas: predeterminado guardado');}catch(e){$('winNote').textContent='No se pudo guardar (permiso o conexión).';toast('No se pudo guardar. Revisá tu conexión.','err');}
  $('winDef').removeAttribute('aria-busy');});
/* ---------- marcos de puerta: estilo, color y material ---------- */
const DKEY='peredo.door';
const DOOR={on:false,def:null,local:null};
const pickDoor=o=>{const r={};if(!o)return r;if(Doors.STYLES.some(x=>x.id===o.style))r.style=o.style;if(Doors.COLORS.some(x=>x.id===o.color))r.color=o.color;if(Doors.MATERIALS.some(x=>x.id===o.material))r.material=o.material;return r;};
function applyDoor(o){if(Doors.set(o)){groups.forEach((g,i)=>{const dg=g.userData.doorGrp;if(dg){Doors.rebuild(dg);dg.children.forEach(c=>c.userData.floor=i);}});Zocalos.rebuildAll();}if(LIGHT.env!=null)setEnvScale(LIGHT.env);shadowsDirty();}
function doorLoadLocal(){try{const v=JSON.parse(localStorage.getItem(DKEY)||'null');if(v){DOOR.local=pickDoor(v);Doors.set(DOOR.local);}}catch(e){}}
function doorSaveLocal(){try{if(DOOR.local)localStorage.setItem(DKEY,JSON.stringify(DOOR.local));else localStorage.removeItem(DKEY);}catch(e){}}
function openDoor(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof FAC!=="undefined"&&FAC.on)closeFac();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(ZOC.on)closeZoc();if(WIN.on)closeWin();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(SHOP.on)closeShop();if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();DOOR.on=true;showPanel($('doorPanel'));$('hint').hidden=true;toolState();renderDoor();}
function closeDoor(){DOOR.on=false;hidePanel($('doorPanel'));toolState();}
$('doorBtn').addEventListener('click',()=>DOOR.on?closeDoor():openDoor());$('doorClose').addEventListener('click',closeDoor);
function setDoor(o){const st={...Doors.state,...o},v={style:st.style,color:st.color,material:st.material};applyDoor(v);DOOR.local=v;doorSaveLocal();renderDoor();}
function renderDoor(){
  const S=Doors.state,ed=canEditLib(),P='library/carpinteria/puertas/';
  keepFocus($('doorStyle'),'data-s',()=>{$('doorStyle').innerHTML=Doors.STYLES.map(x=>swTile('data-s',x.id,S.style===x.id,`${P}e-${x.id}.webp`,x.name,'',x.desc)).join('');});
  keepFocus($('doorColor'),'data-c',()=>{$('doorColor').innerHTML=Doors.COLORS.map(x=>swTile('data-c',x.id,S.color===x.id,`${P}c-${x.id}.webp`,x.name,'',x.name)).join('');});
  keepFocus($('doorMat'),'data-m',()=>{$('doorMat').innerHTML=Doors.MATERIALS.map(x=>swTile('data-m',x.id,S.material===x.id,`${P}m-${x.id}.webp`,x.name,'',x.note)).join('');});
  const sm=Doors.summary();$('doorSum').textContent=`Marco ${sm.style.name.toLowerCase()}: ${sm.style.desc} ${sm.material.note}, acabado ${sm.color.name.toLowerCase()}.`;
  const isDef=!!DOOR.def&&DOOR.def.style===S.style&&DOOR.def.color===S.color&&DOOR.def.material===S.material;
  const d=$('doorDef');d.hidden=!ed;d.disabled=false;d.classList.toggle('is-done',isDef);d.classList.toggle('primary',!isDef);d.setAttribute('aria-disabled',String(isDef));d.innerHTML=isDef?'<svg class="ico"><use href="#i-check"/></svg>Predeterminado del edificio':'Usar para todo el edificio';
  $('doorReset').hidden=!DOOR.local;
  $('doorNote').textContent=ed?'Elegí estilo, color y material. «Usar para todo el edificio» lo deja como predeterminado para todos.':'Probá estilos, colores y materiales de marco. Lo que elijas solo lo ves vos.';
  $('doorStyle').querySelectorAll('[data-s]').forEach(b=>b.addEventListener('click',()=>setDoor({style:b.dataset.s})));
  $('doorColor').querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click',()=>setDoor({color:b.dataset.c})));
  $('doorMat').querySelectorAll('[data-m]').forEach(b=>b.addEventListener('click',()=>setDoor({material:b.dataset.m})));
}
$('doorReset').addEventListener('click',()=>{DOOR.local=null;doorSaveLocal();applyDoor({style:'recto',color:'roble',material:'madera',...pickDoor(DOOR.def)});renderDoor();});
$('doorDef').addEventListener('click',async()=>{if(!DB||$('doorDef').getAttribute('aria-disabled')==='true')return;const S=Doors.state,v={style:S.style,color:S.color,material:S.material,updatedAt:Date.now()};
  $('doorDef').setAttribute('aria-busy','true');
  try{await DB.doc('settings/doors').set(v);DOOR.def=v;DOOR.local=null;doorSaveLocal();renderDoor();$('doorNote').textContent='Listo: queda como predeterminado para todo el edificio.';toast('Puertas: predeterminado guardado');}catch(e){$('doorNote').textContent='No se pudo guardar (permiso o conexión).';toast('No se pudo guardar. Revisá tu conexión.','err');}
  $('doorDef').removeAttribute('aria-busy');});
/* ---------- zócalos: perfil, color y acabado (kit de Blender) ---------- */
const ZKEY='peredo.zoc';
const ZOC={on:false,def:null,local:null};
function zocLoadLocal(){try{const v=JSON.parse(localStorage.getItem(ZKEY)||'null');if(v){ZOC.local=Zocalos.pick(v);Zocalos.set(ZOC.local);}}catch(e){}}
function zocSaveLocal(){try{if(ZOC.local)localStorage.setItem(ZKEY,JSON.stringify(ZOC.local));else localStorage.removeItem(ZKEY);}catch(e){}}
function openZoc(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof FAC!=="undefined"&&FAC.on)closeFac();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(SHOP.on)closeShop();if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();ZOC.on=true;showPanel($('zocPanel'));$('hint').hidden=true;toolState();renderZoc();}
function closeZoc(){ZOC.on=false;hidePanel($('zocPanel'));toolState();}
$('zocBtn').addEventListener('click',()=>ZOC.on?closeZoc():openZoc());$('zocClose').addEventListener('click',closeZoc);
function applyZoc(o){Zocalos.set(o);if(LIGHT.env!=null)setEnvScale(LIGHT.env);shadowsDirty();}
function setZoc(o){const v={...Zocalos.state,...o};applyZoc(v);ZOC.local={type:v.type,color:v.color,finish:v.finish};zocSaveLocal();renderZoc();}
function renderZoc(){
  const S=Zocalos.state,ed=canEditLib(),P='library/zocalos/thumbs/';
  keepFocus($('zocType'),'data-t',()=>{$('zocType').innerHTML=Zocalos.TYPES.map(t=>swTile('data-t',t.id,S.type===t.id,`${P}t-${t.id}.webp`,t.name,`${Math.round(t.h*1000)} × ${Math.round(t.d*1000)} mm`,t.desc)).join('');});
  keepFocus($('zocColor'),'data-c',()=>{$('zocColor').innerHTML=Zocalos.COLORS.map(c=>swTile('data-c',c.id,S.color===c.id,`${P}c-${c.id}.webp`,c.name,c.kind,c.name)).join('');});
  keepFocus($('zocFinish'),'data-f',()=>{$('zocFinish').innerHTML=Zocalos.FINISHES.map(f=>swTile('data-f',f.id,S.finish===f.id,`${P}f-${f.id}.webp`,f.name,'',f.desc)).join('');});
  const sm=Zocalos.summary();$('zocSvg').innerHTML=Zocalos.svg(sm.type.id);
  $('zocSum').textContent=`${sm.type.name}: ${sm.type.desc} ${sm.type.material}, ${sm.color.name.toLowerCase()}, acabado ${sm.finish.name.toLowerCase()}. Alto ${Math.round(sm.type.h*1000)} mm, espesor ${Math.round(sm.type.d*1000)} mm, barras de 2,40 m.`;
  const isDef=!!ZOC.def&&ZOC.def.type===S.type&&ZOC.def.color===S.color&&ZOC.def.finish===S.finish;
  const d=$('zocDef');d.hidden=!ed;d.disabled=false;d.classList.toggle('is-done',isDef);d.classList.toggle('primary',!isDef);d.setAttribute('aria-disabled',String(isDef));d.innerHTML=isDef?'<svg class="ico"><use href="#i-check"/></svg>Predeterminado del edificio':'Usar para todo el edificio';
  $('zocReset').hidden=!ZOC.local;
  $('zocNote').textContent=ed?'Elegí perfil, color y acabado. «Usar para todo el edificio» lo deja como predeterminado para todos.':'Probá perfiles, colores y acabados de zócalo. Lo que elijas solo lo ves vos.';
  $('zocType').querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',()=>setZoc({type:b.dataset.t})));
  $('zocColor').querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click',()=>setZoc({color:b.dataset.c})));
  $('zocFinish').querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>setZoc({finish:b.dataset.f})));
}
$('zocReset').addEventListener('click',()=>{ZOC.local=null;zocSaveLocal();applyZoc({type:'recto',color:'nogal',finish:'mate',...Zocalos.pick(ZOC.def)});renderZoc();});
$('zocDef').addEventListener('click',async()=>{if(!DB||$('zocDef').getAttribute('aria-disabled')==='true')return;const S=Zocalos.state,v={type:S.type,color:S.color,finish:S.finish,updatedAt:Date.now()};
  $('zocDef').setAttribute('aria-busy','true');
  try{await DB.doc('settings/zocalos').set(v);ZOC.def=v;ZOC.local=null;zocSaveLocal();renderZoc();$('zocNote').textContent='Listo: queda como predeterminado para todo el edificio.';toast('Zócalos: predeterminado guardado');}catch(e){$('zocNote').textContent='No se pudo guardar (permiso o conexión).';toast('No se pudo guardar. Revisá tu conexión.','err');}
  $('zocDef').removeAttribute('aria-busy');});
/* ---------- fachada: color, textura y bandas entre pisos ---------- */
const FKEY='peredo.fachada';
const FAC_COLORS=[{id:'crema',name:'Crema',c:'#ece0c3'},{id:'beige',name:'Beige',c:'#dac7a6'},{id:'arena',name:'Arena',c:'#c9b38f'},{id:'marfil',name:'Marfil',c:'#f0e9da'},
  {id:'greige',name:'Greige',c:'#c8c0b2'},{id:'piedra',name:'Gris piedra',c:'#a8a397'},{id:'terracota',name:'Terracota suave',c:'#c99a7c'},{id:'blanco',name:'Blanco',c:'#f4f3ee'}];
const FAC_TEX=[{id:'pintura-mate',name:'Pintura lisa',sub:'Látex mate',tint:true},{id:'estuco',name:'Estuco',sub:'A la llana',tint:true},{id:'grano',name:'Texturizado',sub:'Grano grueso',tint:true},
  {id:'microcemento',name:'Microcemento',sub:'Color propio',tint:false},{id:'hormigon-visto',name:'Hormigón visto',sub:'Color propio',tint:false},{id:'travertino',name:'Travertino',sub:'Color propio',tint:false}];
const FAC_BANDS=[{id:'tono',name:'Al tono'},{id:'blanco',name:'Blancas'},{id:'grafito',name:'Grafito'},{id:'ninguna',name:'Sin bandas'}];
const FAC_DEFAULT={color:'beige',tex:'estuco',band:'tono'};
const FAC={on:false,def:null,local:null,state:{...FAC_DEFAULT}};
const isHex=c=>/^#[0-9a-f]{6}$/i.test(c||'');
const facHex=c=>{const k=FAC_COLORS.find(x=>x.id===c);return k?k.c:isHex(c)?c:FAC_COLORS[1].c;};
function facPick(v){v=v||{};return {color:(FAC_COLORS.some(x=>x.id===v.color)||isHex(v.color))?v.color:FAC_DEFAULT.color,tex:FAC_TEX.some(x=>x.id===v.tex)?v.tex:FAC_DEFAULT.tex,band:FAC_BANDS.some(x=>x.id===v.band)?v.band:FAC_DEFAULT.band};}
let _grano=null;
function granoCanvas(){if(_grano)return _grano;const n=512,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),im=x.createImageData(n,n),d=im.data;let r=11;const R=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let i=0;i<n*n;i++){const v=228+(R()-0.5)*30;d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;}x.putImageData(im,0,0);
  for(let k=0;k<11000;k++){const px=R()*n,py=R()*n,rr=0.6+R()*2.4,v=R()<0.55?(186+R()*34)|0:(240+R()*14)|0;x.fillStyle=`rgb(${v},${v},${v})`;
    for(const ox of [0,-n,n])for(const oy of [0,-n,n]){if((ox&&Math.min(px,n-px)>rr+1)||(oy&&Math.min(py,n-py)>rr+1))continue;x.beginPath();x.arc(px+ox,py+oy,rr,0,7);x.fill();}}
  return _grano=c;}
let _granoThumb=null;const facThumb=id=>id==='grano'?(_granoThumb||(_granoThumb=granoCanvas().toDataURL('image/webp',0.7))):`library/materials/${id}/thumb.webp`;
async function applyFac(v){FAC.state=facPick(v);const S=FAC.state,t=FAC_TEX.find(x=>x.id===S.tex);
  try{await MATS_READY;}catch(e){}
  const src=S.tex==='grano'?Mats.fromImage('fac-grano',granoCanvas(),0.9,{roughness:0.95,relief:2.4}):Mats.get(S.tex);
  if(src){Mats.copyInto(MAT.fac,src,true);Mats.copyInto(MAT.band,src,true);}
  const col=new THREE.Color(t.tint?facHex(S.color):'#ffffff').convertSRGBToLinear(),L=h=>new THREE.Color(h).convertSRGBToLinear();
  MAT.fac.color.copy(col);MAT.fac.envMapIntensity=0.6;
  MAT.band.color.copy(S.band==='blanco'?L('#f2efe8'):S.band==='grafito'?L('#4a4c4e'):S.band==='ninguna'?col:col.clone().lerp(L('#ffffff'),0.5));MAT.band.envMapIntensity=0.6;
  MAT.fac.needsUpdate=MAT.band.needsUpdate=true;if(typeof shadowsDirty==='function')shadowsDirty();}
function facLoadLocal(){try{const v=JSON.parse(localStorage.getItem(FKEY)||'null');if(v)FAC.local=facPick(v);}catch(e){}}
function facSaveLocal(){try{if(FAC.local)localStorage.setItem(FKEY,JSON.stringify(FAC.local));else localStorage.removeItem(FKEY);}catch(e){}}
function openFac(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(ZOC.on)closeZoc();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(SHOP.on)closeShop();if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();FAC.on=true;showPanel($('facPanel'));$('hint').hidden=true;toolState();renderFac();}
function closeFac(){FAC.on=false;hidePanel($('facPanel'));toolState();}
$('facBtn').addEventListener('click',()=>FAC.on?closeFac():openFac());$('facClose').addEventListener('click',closeFac);
function setFac(o){const v=facPick({...FAC.state,...o});FAC.local=v;facSaveLocal();applyFac(v).then(renderFac);renderFac(v);}
function renderFac(pv){
  const S=pv||FAC.state,ed=canEditLib(),t=FAC_TEX.find(x=>x.id===S.tex),hex=facHex(S.color);
  const tint=(c,img,on,attr,id,name,sub)=>`<button type="button" class="tile sm" ${attr}="${id}" aria-pressed="${on}" title="${esc(name)}"><span class="tile-well tint" style="background:${c}"><img class="cover" src="${img}" alt="" loading="lazy">${on?chk:''}</span><span class="tile-name">${esc(name)}${sub?`<small>${esc(sub)}</small>`:''}</span></button>`;
  keepFocus($('facColor'),'data-c',()=>{$('facColor').innerHTML=FAC_COLORS.map(c=>tint(c.c,facThumb(t.tint?S.tex:'pintura-mate'),S.color===c.id,'data-c',c.id,c.name,'')).join('');});
  $('facColor').classList.toggle('is-off',!t.tint);$('facColor').querySelectorAll('button').forEach(b=>b.disabled=!t.tint);
  const pk=$('facPick');pk.value=hex;pk.disabled=!t.tint;$('facPick').parentElement.classList.toggle('is-on',isHex(S.color));
  keepFocus($('facTex'),'data-x',()=>{$('facTex').innerHTML=FAC_TEX.map(x=>tint(x.tint?hex:'#ffffff',facThumb(x.id),S.tex===x.id,'data-x',x.id,x.name,x.sub)).join('');});
  keepFocus($('facBand'),'data-b',()=>{$('facBand').innerHTML=FAC_BANDS.map(b=>`<button type="button" data-b="${b.id}" aria-pressed="${S.band===b.id}">${b.name}</button>`).join('');});
  const cn=(FAC_COLORS.find(c=>c.id===S.color)||{name:'color '+hex.toUpperCase()}).name;
  $('facSum').textContent=t.tint?`${t.name} (${t.sub.toLowerCase()}) en ${cn.toLowerCase()}. Bandas entre pisos: ${FAC_BANDS.find(b=>b.id===S.band).name.toLowerCase()}.`:`${t.name}: el material trae su propio color, por eso el color no se aplica. Bandas entre pisos: ${FAC_BANDS.find(b=>b.id===S.band).name.toLowerCase()}.`;
  const D=facPick(FAC.def||FAC_DEFAULT),isDef=!!FAC.def&&D.color===S.color&&D.tex===S.tex&&D.band===S.band;
  const d=$('facDef');d.hidden=!ed;d.classList.toggle('is-done',isDef);d.classList.toggle('primary',!isDef);d.setAttribute('aria-disabled',String(isDef));d.innerHTML=isDef?'<svg class="ico"><use href="#i-check"/></svg>Predeterminado del edificio':'Usar para todo el edificio';
  $('facReset').hidden=!FAC.local;
  $('facNote').textContent=ed?'Elegí color, textura y bandas para todo el exterior. «Usar para todo el edificio» lo deja como predeterminado para todos.':'Probá colores y texturas para la fachada. Lo que elijas solo lo ves vos.';
  $('facColor').querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click',()=>setFac({color:b.dataset.c})));
  $('facTex').querySelectorAll('[data-x]').forEach(b=>b.addEventListener('click',()=>setFac({tex:b.dataset.x})));
  $('facBand').querySelectorAll('[data-b]').forEach(b=>b.addEventListener('click',()=>setFac({band:b.dataset.b})));
}
$('facPick').addEventListener('input',e=>{const v=facPick({...FAC.state,color:e.target.value});FAC.local=v;applyFac(v);});
$('facPick').addEventListener('change',e=>{setFac({color:e.target.value});});
$('facReset').addEventListener('click',()=>{FAC.local=null;facSaveLocal();applyFac(FAC.def||FAC_DEFAULT).then(()=>renderFac());});
$('facDef').addEventListener('click',async()=>{if(!DB||$('facDef').getAttribute('aria-disabled')==='true')return;const v={...facPick(FAC.state),updatedAt:Date.now()};
  $('facDef').setAttribute('aria-busy','true');
  try{await DB.doc('settings/fachada').set(v);FAC.def=v;FAC.local=null;facSaveLocal();renderFac();$('facNote').textContent='Listo: queda como predeterminada para todo el edificio.';toast('Fachada: predeterminado guardado');}catch(e){$('facNote').textContent='No se pudo guardar (permiso o conexión).';toast('No se pudo guardar. Revisá tu conexión.','err');}
  $('facDef').removeAttribute('aria-busy');});
facLoadLocal();applyFac(FAC.local||FAC_DEFAULT);
/* ---------- cortinas: catálogo por ambiente ---------- */
const CKEY='peredo.cortinas';
const CORT={on:false,def:null,local:null,room:'todos',state:Cortinas.pick(Cortinas.DEFAULT),sprite:null,cells:new Map()};
const CSPR={tw:300,th:225,sw:150,sy:675,per:6};
function cortSwatchList(){return [...Cortinas.FABRICS,...Cortinas.SCREENS,...Cortinas.WOODS,...Cortinas.DUOS];}
function cortCell(kind,idx){const key=kind+idx;if(CORT.cells.has(key))return CORT.cells.get(key);if(!CORT.sprite)return '';
  const im=CORT.sprite,c=document.createElement('canvas');let sx,sy,w,h;
  if(kind==='t'){w=CSPR.tw;h=CSPR.th;sx=(idx%3)*w;sy=((idx/3)|0)*h;}else{w=h=CSPR.sw;sx=(idx%CSPR.per)*w;sy=CSPR.sy+((idx/CSPR.per)|0)*h;}
  c.width=w;c.height=h;c.getContext('2d').drawImage(im,sx,sy,w,h,0,0,w,h);let u='';try{u=c.toDataURL('image/jpeg',0.85);}catch(e){}CORT.cells.set(key,u);return u;}
(()=>{const im=new Image();im.onload=()=>{CORT.sprite=im;CORT.cells.clear();if(CORT.on)renderCort();};im.src='library/cortinas/catalogo.jpg';})();
function cortLoadLocal(){try{const v=JSON.parse(localStorage.getItem(CKEY)||'null');if(v){CORT.local=Cortinas.pick(v);CORT.state=CORT.local;}}catch(e){}}
function cortSaveLocal(){try{if(CORT.local)localStorage.setItem(CKEY,JSON.stringify(CORT.local));else localStorage.removeItem(CKEY);}catch(e){}}
let _cortT=0;
function applyCort(v,quick){CORT.state=Cortinas.pick(v);clearTimeout(_cortT);const run=()=>{groups.forEach((g,i)=>{const cg=g.userData.cortGrp;if(cg){Cortinas.rebuild(cg,CORT.state);cg.children.forEach(c=>c.userData.floor=i);}});if(LIGHT.env!=null)setEnvScale(LIGHT.env);shadowsDirty();};if(quick)_cortT=setTimeout(run,60);else run();}
function cortSel(){const S=CORT.state,r=CORT.room==='todos'?'living':CORT.room;return S[r];}
function setCort(o){const S={...CORT.state};const rooms=CORT.room==='todos'?Cortinas.ROOMS.map(r=>r.id):[CORT.room];
  rooms.forEach(r=>{let n={...S[r],...o};if(o.style&&!o.fabric){const prev=S[r];const ok=Cortinas.optionsFor(o.style).some(x=>x.id===prev.fabric);n.fabric=ok?prev.fabric:Cortinas.style(o.style).def;}
    if(CORT.room==='todos'&&r==='bano'&&Cortinas.style(n.style).kind==='drape')return;S[r]=Cortinas.fix(n);});
  const v=Cortinas.pick(S);CORT.local=v;cortSaveLocal();applyCort(v);renderCort();}
function openCort(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(FAC.on)closeFac();if(ZOC.on)closeZoc();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(SHOP.on)closeShop();if(typeof TECH!=='undefined'&&TECH.on)closeTech();CORT.on=true;showPanel($('cortPanel'));$('hint').hidden=true;toolState();renderCort();}
function closeCort(){CORT.on=false;hidePanel($('cortPanel'));toolState();}
$('cortBtn').addEventListener('click',()=>CORT.on?closeCort():openCort());$('cortClose').addEventListener('click',closeCort);
function renderCort(){
  const S=CORT.state,ed=canEditLib(),sel=cortSel(),st=Cortinas.style(sel.style),opts=Cortinas.optionsFor(st.id),all=cortSwatchList();
  const rooms=[{id:'todos',name:'Todos'},...Cortinas.ROOMS.filter(r=>r.id!=='bano').map(r=>({id:r.id,name:r.name.split(' ')[0]}))];
  keepFocus($('cortRoom'),'data-r',()=>{$('cortRoom').innerHTML=rooms.map(r=>`<button type="button" data-r="${r.id}" aria-pressed="${CORT.room===r.id}">${esc(r.name)}</button>`).join('');});
  const mixed=CORT.room==='todos'&&new Set(Cortinas.ROOMS.filter(r=>r.id!=='bano').map(r=>S[r.id].style+'|'+S[r.id].fabric+'|'+S[r.id].color)).size>1;
  keepFocus($('cortType'),'data-t',()=>{$('cortType').innerHTML=Cortinas.STYLES.map((x,k)=>{const on=!mixed&&sel.style===x.id,img=cortCell('t',k);
    return `<button type="button" class="tile sm" data-t="${x.id}" aria-pressed="${on}" title="${esc(x.desc)}"><span class="tile-well" style="background:#e9e4da">${img?`<img class="cover" src="${img}" alt="" loading="lazy">`:''}${on?chk:''}</span><span class="tile-name">${esc(x.name)}<small>${esc(x.tags.join(' · '))}</small></span></button>`;}).join('');});
  $('cortFabH').textContent=st.kind==='veneciana'?'Madera y acabado':st.kind==='roller'?'Tejido screen':st.kind==='duo'?'Color de las bandas':'Tela';
  keepFocus($('cortFab'),'data-f',()=>{$('cortFab').innerHTML=opts.map(x=>{const on=!mixed&&sel.fabric===x.id,img=cortCell('s',all.indexOf(x));
    return `<button type="button" class="tile sm" data-f="${x.id}" aria-pressed="${on}" title="${esc(x.name)}"><span class="tile-well" style="background:${x.color}">${img?`<img class="cover" src="${img}" alt="" loading="lazy">`:''}${on?chk:''}</span><span class="tile-name">${esc(x.name)}<small>${esc(x.sub)}</small></span></button>`;}).join('');});
  const colorable=Cortinas.colorable(st.id);$('cortColW').hidden=!colorable;
  if(colorable){const fab=opts.find(o=>o.id===sel.fabric)||opts[0];
    $('cortCol').innerHTML=Cortinas.COLORS.map(c=>`<button type="button" data-c="${c.id}" aria-pressed="${!mixed&&(sel.color||'')===c.id}" title="${esc(c.name)}" aria-label="${esc(c.name)}" style="background:${c.id||fab.color}">${c.id?'':''}</button>`).join('');}
  $('cortOpen').value=Math.round(S.open*100);$('cortOpenV').textContent=Math.round(S.open*100)+' %';
  const fab=opts.find(o=>o.id===sel.fabric)||opts[0],cn=sel.color?(Cortinas.COLORS.find(c=>c.id===sel.color)||{}).name:null;
  const where=CORT.room==='todos'?'todo el departamento':(Cortinas.ROOMS.find(r=>r.id===CORT.room).name).toLowerCase();
  $('cortSum').textContent=mixed?'Cada ambiente tiene su propia cortina. Elegí un tipo para aplicarlo a todos, o entrá a un ambiente para cambiar solo ese.':`${st.name} en ${fab.name.toLowerCase()}${cn?', color '+cn.toLowerCase():''} para ${where}. ${st.desc}`;
  const D=Cortinas.pick(CORT.def||Cortinas.DEFAULT),isDef=!!CORT.def&&JSON.stringify(D)===JSON.stringify(Cortinas.pick(S));
  const d=$('cortDef');d.hidden=!ed;d.classList.toggle('is-done',isDef);d.classList.toggle('primary',!isDef);d.setAttribute('aria-disabled',String(isDef));d.innerHTML=isDef?'<svg class="ico"><use href="#i-check"/></svg>Predeterminado del edificio':'Usar para todo el edificio';
  $('cortReset').hidden=!CORT.local;
  $('cortNote').textContent=ed?'Elegí cortinas por ambiente. «Usar para todo el edificio» las deja como predeterminadas para todos.':'Probá tipos de cortina, telas y colores por ambiente. Lo que elijas solo lo ves vos.';
  $('cortRoom').querySelectorAll('[data-r]').forEach(b=>b.addEventListener('click',()=>{CORT.room=b.dataset.r;renderCort();}));
  $('cortType').querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',()=>setCort({style:b.dataset.t})));
  $('cortFab').querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>setCort({fabric:b.dataset.f,style:cortSel().style})));
  $('cortCol').querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click',()=>setCort({color:b.dataset.c})));
}
$('cortOpen').addEventListener('input',e=>{const v=Cortinas.pick({...CORT.state,open:e.target.value/100});CORT.state=v;$('cortOpenV').textContent=e.target.value+' %';applyCort(v,true);});
$('cortOpen').addEventListener('change',e=>{const v=Cortinas.pick({...CORT.state,open:e.target.value/100});CORT.local=v;cortSaveLocal();applyCort(v);renderCort();});
$('cortReset').addEventListener('click',()=>{CORT.local=null;cortSaveLocal();applyCort(CORT.def||Cortinas.DEFAULT);renderCort();});
$('cortDef').addEventListener('click',async()=>{if(!DB||$('cortDef').getAttribute('aria-disabled')==='true')return;const v={...Cortinas.pick(CORT.state),updatedAt:Date.now()};
  $('cortDef').setAttribute('aria-busy','true');
  try{await DB.doc('settings/cortinas').set(v);CORT.def=Cortinas.pick(v);CORT.local=null;cortSaveLocal();renderCort();$('cortNote').textContent='Listo: quedan como predeterminadas para todo el edificio.';toast('Cortinas: predeterminado guardado');}catch(e){$('cortNote').textContent='No se pudo guardar (permiso o conexión).';toast('No se pudo guardar. Revisá tu conexión.','err');}
  $('cortDef').removeAttribute('aria-busy');});
/* ---------- techos drywall: catálogo por ambiente ---------- */
const TKEY='peredo.techos';
const TECH={on:false,room:null,filt:{style:'',light:'',kind:''},zoom:-1,local:null,def:null,state:{rooms:{},price:{}},im:null,cells:new Map(),tab:'catalogo'};
(()=>{const im=new Image();im.onload=()=>{TECH.im=im;TECH.cells.clear();if(TECH.on)renderTech();};im.src='library/techos/catalogo.jpg';})();
function techCell(k){if(TECH.cells.has(k))return TECH.cells.get(k);if(!TECH.im)return '';const c=document.createElement('canvas'),w=480,h=300;c.width=w;c.height=h;c.getContext('2d').drawImage(TECH.im,(k%4)*w,((k/4)|0)*h,w,h,0,0,w,h);let u='';try{u=c.toDataURL('image/jpeg',0.86);}catch(e){}TECH.cells.set(k,u);return u;}
function techPick(v){v=v||{};const o={rooms:{},price:{}};Object.entries(v.rooms||{}).forEach(([k,c])=>{if(/^\d+:\d+$/.test(k)&&c&&c.style)o.rooms[k]=Techos.fix(c);});Object.entries(v.price||{}).forEach(([k,p])=>{if(Techos.STYLES.some(s=>s.id===k)&&isFinite(+p)&&+p>=0)o.price[k]=+p;});return o;}
function techLoadLocal(){try{const v=JSON.parse(localStorage.getItem(TKEY)||'null');if(v){TECH.local=techPick(v);TECH.state=TECH.local;}}catch(e){}}
function techSaveLocal(){try{if(TECH.local)localStorage.setItem(TKEY,JSON.stringify(TECH.local));else localStorage.removeItem(TKEY);}catch(e){}}
const techPrice=id=>{const v=TECH.state.price[id];return v!=null?v:Techos.style(id).price;};
function techRect(i,li){const g=groups[i];if(!g||!g.userData.techCtx)return null;return Techos.maxRect(g.userData.techCtx.rg,li);}
function techFill(i){const g=groups[i];if(!g||!g.userData.techCtx)return;const C=g.userData.techCtx;let tg=g.userData.techGrp;
  if(tg){Techos.dispose(tg);}else{tg=new THREE.Group();tg.name='techos_piso';g.add(tg);g.userData.techGrp=tg;}
  const list=[];Object.entries(TECH.state.rooms).forEach(([k,c])=>{const [fi,li]=k.split(':').map(Number);if(fi!==i)return;const rect=Techos.maxRect(C.rg,li);if(!rect)return;list.push({cfg:Techos.fix(c,rect),rect,y:C.top-0.001});});
  if(list.length){const n=Techos.build(list);n.children.slice().forEach(c=>{c.userData.floor=i;tg.add(c);});}
  tg.visible=mode==='walk'&&i===sel;if(typeof Luces!=='undefined')Luces.dirty=true;if(LIGHT.env!=null)setEnvScale(LIGHT.env);shadowsDirty();}
function techApplyAll(){groups.forEach((g,i)=>techFill(i));}
function techRooms(){if(sel<0||!PROJ)return [];const rg=PROJ.rooms[PROJ.floors[sel].g];if(!rg)return [];return rg.labels.map((l,li)=>({li,s:l.s,rect:Techos.maxRect(rg,li)})).filter(r=>r.rect&&(r.rect[2]-r.rect[0])>=1.2&&(r.rect[3]-r.rect[1])>=1.2&&!/PARQUEO|GARAJE|BAULERA|TERRAZA|BALC|PATIO|JARD|DUCTO|SHAFT/i.test(r.s));}
function techSet(key,cfg){const S={rooms:{...TECH.state.rooms},price:{...TECH.state.price}};if(cfg)S.rooms[key]=Techos.fix(cfg,techRect(...key.split(':').map(Number)));else delete S.rooms[key];TECH.local=techPick(S);TECH.state=TECH.local;techSaveLocal();techFill(+key.split(':')[0]);}
let _techT=0;
function techTweak(patch,quick){const key=TECH.room,c=TECH.state.rooms[key];if(!c)return;const n={...c,...patch,p:{...c.p,...(patch.p||{})}};TECH.state.rooms[key]=Techos.fix(n,techRect(...key.split(':').map(Number)));clearTimeout(_techT);
  const run=()=>{techSet(key,TECH.state.rooms[key]);if(!quick)renderTech();else techSum();};if(quick)_techT=setTimeout(run,50);else run();}
function openTech(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(typeof CORT!=="undefined"&&CORT.on)closeCort();if(FAC.on)closeFac();if(ZOC.on)closeZoc();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(SHOP.on)closeShop();
  TECH.on=true;showPanel($('techPanel'));$('hint').hidden=true;toolState();if(mode==='ext'){const fi=sel>=0?sel:Math.max(0,PROJ.floors.findIndex(f=>f.lv>1));enterInterior(fi);}
  const rs=techRooms();if(!TECH.room||!rs.some(r=>`${sel}:${r.li}`===TECH.room)){const pref=rs.find(r=>/ESTAR|SAL|LIVING|COMEDOR/.test(r.s))||rs[0];TECH.room=pref?`${sel}:${pref.li}`:null;}renderTech();}
function closeTech(){TECH.on=false;TECH.zoom=-1;$('techZoom').hidden=true;hidePanel($('techPanel'));toolState();}
$('techBtn').addEventListener('click',()=>TECH.on?closeTech():openTech());$('techClose').addEventListener('click',closeTech);
function techLook(){const key=TECH.room;if(!key)return;const [fi,li]=key.split(':').map(Number);if(fi!==sel)return;const r=techRect(fi,li);if(!r)return;
  startWalk([(r[0]+r[2])/2,(r[1]+r[3])/2]);if(walkState){const W=r[2]-r[0],L=r[3]-r[1];walkState.pos.x=r[0]+W*0.18;walkState.pos.z=r[1]+L*0.82;const nv=walkState.nav;if(nv&&typeof navFree==='function'&&!navFree(nv,walkState.pos.x,walkState.pos.z)){walkState.pos.x=(r[0]+r[2])/2;walkState.pos.z=(r[1]+r[3])/2;}
    walkState.yaw=Math.atan2(-((r[0]+r[2])/2+W*0.2-walkState.pos.x),-((r[1]+r[3])/2-L*0.2-walkState.pos.z));walkState.pitch=0.55;camera.position.copy(walkState.pos);}
  groups.forEach((g,i)=>{if(g.userData.techGrp)g.userData.techGrp.visible=mode==='walk'&&i===sel;});}
function techSum(){const el2=$('techSum');if(!el2)return;const c=TECH.state.rooms[TECH.room];if(!c){el2.textContent='';return;}const S=Techos.style(c.style),a=Techos.area(c),pr=techPrice(S.id);
  el2.innerHTML=`<b>${String(a).replace('.',',')} m²</b> × Bs ${pr}/m² = <b>Bs ${Math.round(a*pr).toLocaleString('es-BO')}</b> <small>estimado, incluye placa, estructura y pintura</small>`;}
function renderTech(){
  const b=$('techBody');if(!b||!PROJ)return;const rs=techRooms();if(!TECH.room||!rs.some(r=>`${sel}:${r.li}`===TECH.room)){const pref=rs.find(r=>/ESTAR|SAL|LIVING|COMEDOR/.test(r.s))||rs[0];TECH.room=pref?`${sel}:${pref.li}`:null;}const key=TECH.room,c=key?TECH.state.rooms[key]:null,ed=canEditLib();
  const roomName=r=>cap(r.s)+' · '+(r.rect[2]-r.rect[0]).toFixed(1).replace('.',',')+' × '+(r.rect[3]-r.rect[1]).toFixed(1).replace('.',',')+' m';
  let h=`<p class="note">${rs.length?'Elegí el ambiente (o tocalo en el plano) y aplicale un techo del catálogo. Lo ves en 3D con «Ver en 3D».':'Este piso no tiene ambientes con espacio para un techo decorativo.'}</p>`;
  if(rs.length)h+=`<label class="field" for="techRoom">Ambiente<select id="techRoom">${rs.map(r=>{const k=`${sel}:${r.li}`,has=TECH.state.rooms[k];return `<option value="${k}" ${k===key?'selected':''}>${esc(roomName(r))}${has?' — '+esc(Techos.style(has.style).name):''}</option>`;}).join('')}</select></label>`;
  if(c){const S=Techos.style(c.style),R=key?techRect(...key.split(':').map(Number)):null,W=R?R[2]-R[0]:(c.w||3),L=R?R[3]-R[1]:(c.l||3);if(c.w==null)c.w=+W.toFixed(2);if(c.l==null)c.l=+L.toFixed(2);const lim=Techos.limits(c,c.w,c.l);
    const rng=(k,lbl,v,mn,mx,st,unit,attr)=>`<label class="wr-range">${lbl}<input type="range" ${attr}="${k}" min="${mn}" max="${mx}" step="${st}" value="${v}"><output id="tO_${k}">${unit==='u'?v:unit==='si/no'?(+v?'Sí':'No'):(Math.round(v*100))+' cm'}</output></label>`;
    h+=`<section class="tech-cur"><div class="tech-head"><img src="${techCell(Techos.STYLES.indexOf(S))||''}" alt=""><div><b>${esc(S.name)}</b><span>${esc(S.desc)}</span></div></div>
      <div class="wr-acts"><button class="btn sm primary" type="button" data-ta="look"><svg class="ico"><use href="#i-walk"/></svg>Ver en 3D</button><button class="btn sm" type="button" data-ta="zoom">Detalles</button><button class="btn sm danger" type="button" data-ta="del"><svg class="ico"><use href="#i-trash"/></svg>Quitar techo</button></div>
      <p class="sub-h">Medidas</p>${rng('w','Ancho',c.w,1,+W.toFixed(2),0.05,'m','data-td')}${rng('l','Largo',c.l,1,+L.toFixed(2),0.05,'m','data-td')}
      ${S.params.map(q=>rng(q.k,q.label,c.p[q.k],q.min,Math.min(q.max,lim[q.k]!=null?+lim[q.k].toFixed(2):q.max),q.step,q.unit,'data-tp')).join('')}
      <p class="sub-h">Iluminación</p>${S.light.includes('led')?`<label class="tg" for="techLed"><input type="checkbox" id="techLed" ${c.led?'checked':''}> Tira LED indirecta encendida</label>`:''}
      <div class="seg" role="group" aria-label="Temperatura de color">${Techos.TEMPS.map(t=>`<button type="button" data-tk="${t.k}" aria-pressed="${c.k===t.k}">${t.name}</button>`).join('')}</div>
      <label class="wr-range">Intensidad<input type="range" id="techI" min="0.1" max="1.5" step="0.05" value="${c.i}"><output id="tO_i">${Math.round(c.i*100)} %</output></label>
      <p class="sub-h">Color y acabado</p><div class="cort-cols">${Techos.COLORS.map(x=>`<button type="button" data-tc="${x.id}" aria-pressed="${c.color===x.id}" title="${esc(x.name)}" aria-label="${esc(x.name)}" style="background:${x.id}"></button>`).join('')}</div>
      <div class="seg" role="group" aria-label="Acabado">${Techos.FINISHES.map(f=>`<button type="button" data-tf="${f.id}" aria-pressed="${c.finish===f.id}">${f.name}</button>`).join('')}</div>
      <p class="note tech-sum" id="techSum"></p></section>`;}
  const F=TECH.filt,flt=(grp,arr,lbl)=>`<div class="tech-filt" role="group" aria-label="${lbl}"><span>${lbl}</span>${[{id:'',name:'Todos'},...arr].map(x=>`<button type="button" class="chip" data-tg="${grp}|${x.id}" aria-pressed="${F[grp]===x.id}">${esc(x.name)}</button>`).join('')}</div>`;
  const list=Techos.STYLES.map((S,k)=>({S,k})).filter(({S})=>(!F.style||S.style===F.style)&&(!F.light||S.light.includes(F.light))&&(!F.kind||S.kind===F.kind));
  h+=`<p class="sub-h">${c?'Cambiar por otro diseño':'Catálogo de techos'}<small>${list.length} de ${Techos.STYLES.length}</small></p>${flt('style',Techos.FILTERS.style,'Estilo')}${flt('light',Techos.FILTERS.light,'Luz')}${flt('kind',Techos.FILTERS.kind,'Tipo')}
    <div class="tech-cards">${list.map(({S,k})=>{const on=c&&c.style===S.id,img=techCell(k);return `<article class="tech-card${on?' is-on':''}"><button type="button" class="tech-img" data-tz="${k}" aria-label="Ver ${esc(S.name)} en grande">${img?`<img src="${img}" alt="">`:''}${on?chk:''}</button>
      <div class="tech-meta"><b>${esc(S.name)}</b><span>${esc(Techos.FILTERS.style.find(x=>x.id===S.style).name)} · ${S.light.map(x=>x==='led'?'LED':'focos').join(' y ')}</span><span>Desde Bs ${techPrice(S.id)}/m²</span></div>
      <button class="btn sm ${on?'':'primary'}" type="button" data-tapply="${S.id}" ${!key?'disabled':''}>${on?'Aplicado':'Aplicar'}</button></article>`;}).join('')||'<p class="note">Ningún techo coincide con esos filtros.</p>'}</div>`;
  const D=TECH.def?techPick(TECH.def):null,isDef=!!D&&JSON.stringify(D)===JSON.stringify(techPick(TECH.state));
  h+=`<div class="row">${ed?`<button class="btn ${isDef?'is-done':'primary'}" type="button" id="techDef" ${isDef?'aria-disabled="true"':''}>${isDef?'<svg class="ico"><use href="#i-check"/></svg>Predeterminado del edificio':'Usar para todo el edificio'}</button>`:''}${TECH.local?'<button class="btn ghost" type="button" id="techReset">Volver al predeterminado</button>':''}</div>`;
  keepFocus(b,'data-tz',()=>{b.innerHTML=h;});techSum();
  const rsel=$('techRoom');if(rsel)rsel.addEventListener('change',()=>{TECH.room=rsel.value;renderTech();});
  b.querySelectorAll('[data-tg]').forEach(x=>x.addEventListener('click',()=>{const [g2,v]=x.dataset.tg.split('|');TECH.filt[g2]=v;renderTech();}));
  b.querySelectorAll('[data-tz]').forEach(x=>x.addEventListener('click',()=>techZoom(+x.dataset.tz)));
  b.querySelectorAll('[data-tapply]').forEach(x=>x.addEventListener('click',()=>{if(!TECH.room)return;const prev=TECH.state.rooms[TECH.room];const n=Techos.defaults(x.dataset.tapply);if(prev){n.color=prev.color;n.finish=prev.finish;n.k=prev.k;n.i=prev.i;}techSet(TECH.room,n);renderTech();toast(Techos.style(n.style).name+' aplicado');}));
  b.querySelectorAll('[data-ta]').forEach(x=>x.addEventListener('click',()=>{const a=x.dataset.ta;if(a==='look')techLook();else if(a==='zoom')techZoom(Techos.STYLES.indexOf(Techos.style(c.style)));else if(a==='del'){techSet(TECH.room,null);renderTech();toast('Techo quitado');}}));
  b.querySelectorAll('[data-td]').forEach(x=>{x.addEventListener('input',()=>{const k=x.dataset.td;$('tO_'+k).textContent=Math.round(x.value*100)+' cm';techTweak({[k]:+x.value},true);});x.addEventListener('change',()=>renderTech());});
  b.querySelectorAll('[data-tp]').forEach(x=>{x.addEventListener('input',()=>{const k=x.dataset.tp,q=Techos.style(c.style).params.find(p=>p.k===k);$('tO_'+k).textContent=q.unit==='u'?x.value:q.unit==='si/no'?(+x.value?'Sí':'No'):Math.round(x.value*100)+' cm';techTweak({p:{[k]:+x.value}},true);});x.addEventListener('change',()=>renderTech());});
  const tl=$('techLed');if(tl)tl.addEventListener('change',()=>techTweak({led:tl.checked}));
  const ti=$('techI');if(ti)ti.addEventListener('input',()=>{$('tO_i').textContent=Math.round(ti.value*100)+' %';techTweak({i:+ti.value},true);});
  b.querySelectorAll('[data-tk]').forEach(x=>x.addEventListener('click',()=>techTweak({k:+x.dataset.tk})));
  b.querySelectorAll('[data-tc]').forEach(x=>x.addEventListener('click',()=>techTweak({color:x.dataset.tc})));
  b.querySelectorAll('[data-tf]').forEach(x=>x.addEventListener('click',()=>techTweak({finish:x.dataset.tf})));
  const td=$('techDef');if(td)td.addEventListener('click',async()=>{if(!DB||td.getAttribute('aria-disabled')==='true')return;const v={...techPick(TECH.state),updatedAt:Date.now()};td.setAttribute('aria-busy','true');
    try{await DB.doc('settings/techos').set(v);TECH.def=techPick(v);TECH.local=null;techSaveLocal();renderTech();toast('Techos: predeterminado guardado');}catch(e){toast('No se pudo guardar. Revisá tu conexión.','err');}td.removeAttribute('aria-busy');});
  const tr=$('techReset');if(tr)tr.addEventListener('click',()=>{TECH.local=null;techSaveLocal();TECH.state=TECH.def?techPick(TECH.def):{rooms:{},price:{}};techApplyAll();renderTech();});
}
function techZoom(k){TECH.zoom=k;const z=$('techZoom');if(k<0){z.hidden=true;return;}const S=Techos.STYLES[k],ed=canEditLib(),key=TECH.room,c=key?TECH.state.rooms[key]:null;
  z.innerHTML=`<div class="tz-card" role="dialog" aria-modal="true" aria-labelledby="tzTitle"><button class="btn ghost icon tz-x" type="button" data-z="x" aria-label="Cerrar"><svg class="ico"><use href="#i-close"/></svg></button>
    <div class="tz-img"><img src="${techCell(k)||''}" alt="Render del ${esc(S.name)}"><button class="btn icon tz-prev" type="button" data-z="prev" aria-label="Anterior"><svg class="ico"><use href="#i-back"/></svg></button><button class="btn icon tz-next" type="button" data-z="next" aria-label="Siguiente"><svg class="ico" style="transform:scaleX(-1)"><use href="#i-back"/></svg></button></div>
    <div class="tz-body"><p class="tz-n">${k+1} de ${Techos.STYLES.length}</p><h3 id="tzTitle">${esc(S.name)}</h3><p>${esc(S.desc)}</p>
      <dl><dt>Estilo</dt><dd>${esc(Techos.FILTERS.style.find(x=>x.id===S.style).name)}</dd><dt>Iluminación</dt><dd>${S.light.map(x=>x==='led'?'Tira LED indirecta regulable (2700–6000 K)':'Focos empotrados').join(' · ')}</dd>
      <dt>Se ajusta</dt><dd>Ancho, largo, ${S.params.map(q=>q.label.toLowerCase()).join(', ')}, color y acabado</dd><dt>Precio</dt><dd>${ed?`Bs <input type="number" min="0" step="5" id="tzPrice" value="${techPrice(S.id)}" aria-label="Precio por metro cuadrado"> por m²`:`Desde Bs ${techPrice(S.id)} por m²`}</dd></dl>
      <ul>${S.feat.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
      <div class="row"><button class="btn primary" type="button" data-z="apply" ${!key?'disabled':''}>${c&&c.style===S.id?'Ya está aplicado':'Aplicar a este ambiente'}</button></div></div></div>`;
  z.hidden=false;z.querySelectorAll('[data-z]').forEach(x=>x.addEventListener('click',()=>{const a=x.dataset.z,n=Techos.STYLES.length;
    if(a==='x')techZoom(-1);else if(a==='prev')techZoom((k-1+n)%n);else if(a==='next')techZoom((k+1)%n);else if(a==='apply'&&key){const prev=TECH.state.rooms[key],nn=Techos.defaults(S.id);if(prev){nn.color=prev.color;nn.finish=prev.finish;nn.k=prev.k;nn.i=prev.i;}techSet(key,nn);techZoom(-1);renderTech();toast(S.name+' aplicado');}}));
  const pi=$('tzPrice');if(pi)pi.addEventListener('change',()=>{const v=Math.max(0,+pi.value||0),S2={rooms:{...TECH.state.rooms},price:{...TECH.state.price,[S.id]:v}};TECH.local=techPick(S2);TECH.state=TECH.local;techSaveLocal();renderTech();});
  z.querySelector('[data-z="x"]').focus();}
$('techZoom').addEventListener('click',e=>{if(e.target.id==='techZoom')techZoom(-1);});
document.addEventListener('keydown',e=>{if(TECH.zoom<0||$('techZoom').hidden)return;if(e.key==='Escape')techZoom(-1);else if(e.key==='ArrowRight')techZoom((TECH.zoom+1)%Techos.STYLES.length);else if(e.key==='ArrowLeft')techZoom((TECH.zoom-1+Techos.STYLES.length)%Techos.STYLES.length);});
/* ---------- roperos: catálogo, colocación y configurador ---------- */
const WRKEY='peredo.roperos',WAUTO='peredo.roperos.auto';
const WR={on:false,sel:null,ghost:null,press:null,drag:false,tab:'medidas',box:null,hideAuto:false,msg:null,note:''};
let WRL={};try{WRL=JSON.parse(localStorage.getItem(WRKEY)||'{}')||{};}catch(e){}
try{WR.hideAuto=localStorage.getItem(WAUTO)==='1';}catch(e){}
const wrOwner=()=>!!(DB&&ASSETS&&currentId!=='__preview');
function wrItems(i){const k=layoutKey(i),L=curLayout(i);if(!wrOwner()&&WRL[k])return WRL[k];return L.wr||(L.wr=[]);}
function wrSave(i){if(wrOwner()){saveLayout(i);return;}const k=layoutKey(i);WRL[k]=wrItems(i);try{localStorage.setItem(WRKEY,JSON.stringify(WRL));}catch(e){}}
const wrCur=()=>{const s=WR.sel;return s?wrItems(s.floor).find(u=>u.uid===s.uid)||null:null;};
const wrSeed=uid=>{let h=7;for(const ch of String(uid))h=(h*31+ch.charCodeAt(0))%100003;return 0.05+(h%9000)/10000;};
const wrAutoId=()=>{const E=LIB.models&&LIB.models.wardrobe;return E?E.it.id:null;};
function wrFoot(u,pad){const w=u.cfg.w/2+(pad||0),d=u.cfg.d/2+(pad||0),c=Math.cos(u.rot||0),s=Math.sin(u.rot||0);return [[-w,-d],[w,-d],[w,d],[-w,d]].map(([x,z])=>[u.x+x*c+z*s,u.z-x*s+z*c]);}
function wallAt(rg,x,z){const X=Math.floor((x-rg.mx)*rg.R),Y=Math.floor((z-rg.mz)*rg.R);if(X<0||Y<0||X>=rg.w||Y>=rg.h)return true;return !!rg.block.d[Y*rg.w+X];}
function wrSnaps(i,x,z,c){const rg=PROJ.rooms[PROJ.floors[i].g];if(!rg||!rg.block)return [];const out=[];
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dz])=>{for(let s=0;s<=2.5;s+=0.01){if(wallAt(rg,x+dx*s,z+dz*s)){
    const off=c.d/2+0.012,wx=x+dx*(s-0.005),wz=z+dz*(s-0.005);let cx=wx-dx*off,cz=wz-dz*off;const tx=-dz,tz=dx;
    for(const sd of[-1,1])for(let q=0;q<=c.w/2+0.01;q+=0.01){if(wallAt(rg,cx+tx*sd*q,cz+tz*sd*q)){const sh=c.w/2+0.01-q;cx-=tx*sd*sh;cz-=tz*sd*sh;break;}}
    out.push({s,x:cx,z:cz,rot:Math.atan2(-dx,-dz),dx,dz});break;}}});
  return out.sort((p,q)=>p.s-q.s);}
function wrSnap(i,x,z,c){return wrSnaps(i,x,z,c)[0]||null;}
function wrAABB(u,lv,pad){const f=wrFoot(u,pad||0),xs=f.map(p=>p[0]),zs=f.map(p=>p[1]);return Fisica.box(Math.min(...xs),Math.min(...zs),Math.max(...xs),Math.max(...zs),lv+0.02,lv+u.cfg.h);}
function wrCtx(i,uid){const g=groups[i],W=g&&g.userData.phys,f=PROJ.floors[i];if(!W)return null;const L=curLayout(i),Wv=(L.hideAuto||!SHOWF)?{...W,bodies:W.bodies.filter(o=>o.stat)}:W;
  const extra=wrItems(i).filter(o=>o.uid!==uid).map(o=>wrAABB(o,f.lv,-0.005));const mg=g.userData.manual;if(mg)mg.children.forEach(c=>{const q=new THREE.Box3().setFromObject(c);if(!q.isEmpty())extra.push(Fisica.box(q.min.x,q.min.z,q.max.x,q.max.z,q.min.y,q.max.y));});
  return {Wv,extra,lv:f.lv};}
function wrPhysHit(C,u){return C?Fisica.hits(C.Wv,[wrAABB(u,C.lv,-0.006)],0,0,{extra:C.extra}):null;}
function wrFit(i,x,z,cfg,rot0,uid){const rg=PROJ.rooms[PROJ.floors[i].g],C=wrCtx(i,uid),S=wrSnaps(i,x,z,cfg);
  for(const s of S){const tx=-s.dz,tz=s.dx,bk=cfg.d/2+0.05,hw=cfg.w/2-0.06;
    const backed=(px,pz)=>[-hw,0,hw].every(a=>wallAt(rg,px+tx*a+s.dx*bk,pz+tz*a+s.dz*bk));
    for(let k=0;k<=80;k++){const o=((k+1)>>1)*0.025*(k&1?1:-1),px=s.x+tx*o,pz=s.z+tz*o,u={x:px,z:pz,rot:s.rot,cfg};
      if(!backed(px,pz))continue;if(!wrCollides(i,u)&&!wrPhysHit(C,u))return {x:px,z:pz,rot:s.rot,snap:true,ok:true};}}
  if(S.length)return {x:S[0].x,z:S[0].z,rot:S[0].rot,snap:true,ok:false};
  const u={x,z,rot:rot0||0,cfg};if(!C)return {...u,snap:false,ok:!wrCollides(i,u)};
  const r=Fisica.find(C.Wv,[wrAABB(u,C.lv,-0.006)],{extra:C.extra,max:1.2});
  return r?{x:x+r.dx,z:z+r.dz,rot:u.rot,snap:false,ok:true}:{x,z,rot:u.rot,snap:false,ok:false};}
function wrBlocked(i,u){return wrCollides(i,u)||!!wrPhysHit(wrCtx(i,u.uid),u);}
function wrCollides(i,u){const rg=PROJ.rooms[PROJ.floors[i].g];if(!rg||!rg.block)return false;const c=Math.cos(u.rot||0),s=Math.sin(u.rot||0),W=u.cfg.w/2-0.02,D=u.cfg.d/2-0.02;
  for(let a=-W;a<=W+1e-6;a+=Math.max(0.04,W/6))for(let b=-D;b<=D+1e-6;b+=Math.max(0.04,D/4)){if(wallAt(rg,u.x+a*c+b*s,u.z-a*s+b*c))return true;}return false;}
function wrTag(o,i){o.traverse(n=>{if(n.isMesh)n.userData.floor=i;});}
function wrMirror(o){setTimeout(()=>{try{if(o.parent)Wardrobes.refreshMirror(o,renderer,scene);}catch(e){}},80);}
async function renderWr(i){
  const g=groups[i];if(!g||!PROJ)return;const f=PROJ.floors[i],list=wrItems(i);
  let root=g.userData.wrRoot;if(!root){root=new THREE.Group();root.name='roperos';g.add(root);g.userData.wrRoot=root;}
  if(list.length){await wrReady();if(groups[i]!==g)return;}
  const have=new Map(root.children.map(o=>[o.userData.uid,o]));
  list.forEach(u=>{let o=have.get(u.uid);
    if(o){have.delete(u.uid);if(JSON.stringify(o.userData.wr.cfg)!==JSON.stringify(Wardrobes.clean(u.cfg)))Wardrobes.update(o,u.cfg);}
    else{o=Wardrobes.build(u.cfg,{seed:wrSeed(u.uid)});o.userData.uid=u.uid;root.add(o);}
    wrTag(o,i);o.position.set(u.x,f.lv+0.006,u.z);o.rotation.y=u.rot||0;});
  have.forEach(o=>{if(WR.sel&&WR.sel.obj===o)wrDeselect();Wardrobes.dispose(o);});
  root.updateMatrixWorld(true);applyWrAuto(i);if(LIGHT.env!=null)setEnvScale(LIGHT.env);updateNavManual(i);
  root.children.forEach(o=>{if(o.userData.wr.cfg.mirror)wrMirror(o);});
  if(WR.sel&&WR.sel.floor===i){const o=root.children.find(c=>c.userData.uid===WR.sel.uid);if(o){WR.sel.obj=o;wrBox();}}
  shadowsDirty();if(WR.on)renderWrPanel();
}
function applyWrAuto(i){const g=groups[i],aid=wrAutoId();if(!g||!aid)return;const L=curLayout(i);
  g.traverse(o=>{if(o.userData&&o.userData.asset===aid&&!o.userData.manual)o.visible=SHOWF&&!L.hideAuto&&!WR.hideAuto;});shadowsDirty();}
function wrBox(){if(WR.box){scene.remove(WR.box);WR.box=null;}const o=WR.sel&&WR.sel.obj;if(!o||!o.parent)return;WR.box=new THREE.BoxHelper(o.userData.wr.groups.cuerpo,new THREE.Color(css('--accent')));scene.add(WR.box);}
function wrDeselect(){WR.sel=null;WR.msg=null;if(WR.box){scene.remove(WR.box);WR.box=null;}if(!WR.ghost)wrMini(false);wrFloatRender();}
function wrSelect(o,i){WR.sel={uid:o.userData.uid,floor:i,obj:o};WR.msg=null;wrBox();if(wrMob())wrMini(true);if(!WR.on)openWr();else renderWrPanel();}
async function wrStartPlace(mid){wrCancel();wrDeselect();WR.note='Cargando el ropero…';renderWrPanel();await wrReady();
  if(!WR.on)return;const cfg=Wardrobes.defaults(mid),o=Wardrobes.build(cfg,{seed:0.5});o.visible=false;scene.add(o);WR.ghost={o,cfg,model:mid,rot:0};
  WR.note='Tocá el piso donde va el ropero. Se apoya solo contra la pared más cercana. Esc cancela.';if(wrMob())wrMini(true);renderWrPanel();}
function wrCancel(){if(WR.ghost){Wardrobes.dispose(WR.ghost.o);WR.ghost=null;WR.note='';}if(!WR.sel)wrMini(false);wrFloatRender();}
function wrRay(e){const r=el.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);}
function wrShown(o){while(o){if(!o.visible)return false;o=o.parent;}return true;}
function wrHit(e){if(sel<0||!groups[sel])return null;const root=groups[sel].userData.wrRoot;if(!root||!root.children.length)return null;wrRay(e);
  const h=ray.intersectObject(groups[sel],true).find(x=>x.object.isMesh&&wrShown(x.object)&&!x.object.userData.glass);if(!h)return null;const o=Wardrobes.rootOf(h.object);if(!o||o===(WR.ghost&&WR.ghost.o))return null;
  return {h,o,g:Wardrobes.groupOf(h.object)};}
function wrExact(i,x,z,cfg,rot0){const rg=PROJ.rooms[PROJ.floors[i].g];if(!rg||!rg.block)return {x,z,rot:rot0||0,snap:false,ok:true};let best=null;
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dz])=>{for(let s=0;s<=0.7;s+=0.01){if(wallAt(rg,x+dx*s,z+dz*s)){if(!best||s<best.s)best={s,dx,dz};break;}}});
  if(!best)return {x,z,rot:rot0||0,snap:false,ok:true};
  const rot=Math.atan2(-best.dx,-best.dz)+(rot0||0),back=(Math.abs(Math.sin(rot0||0))>0.5?cfg.w:cfg.d)/2+0.012,push=Math.max(0,back-best.s);
  return {x:x-best.dx*push,z:z-best.dz*push,rot,snap:true,ok:true};}
function wrPlaceAt(p){const g=WR.ghost,f=PROJ.floors[sel],s=wrExact(sel,p.x,p.z,g.cfg,g.rot||0);const x=s.x,z=s.z,rot=s.rot;
  g.o.visible=true;g.o.position.set(x,f.lv+0.006,z);g.o.rotation.y=rot;g.pos={x,z,rot,snap:s.snap,ok:s.ok};g.lastP={x:p.x,z:p.z};}
function wrPointerDown(e){if(!WR.on||!(mode==='int'||mode==='walk')||WR.ghost||!WR.sel)return false;const H=wrHit(e);if(!H||H.o!==WR.sel.obj)return false;
  WR.press={x:e.clientX,y:e.clientY,g:H.g};controls.enabled=false;const p=floorHit(e),u=wrCur();WR.dragOff=p&&u?[u.x-p.x,u.z-p.z]:[0,0];return true;}
function wrPointerMove(e){if(!WR.on||!(mode==='int'||mode==='walk'))return;if(WR.ghost&&e.pointerType==='touch')return;
  if(WR.ghost){const p=floorHit(e);if(p)wrPlaceAt(p);else WR.ghost.o.visible=false;return;}
  if(WR.press){if(!WR.drag&&Math.hypot(e.clientX-WR.press.x,e.clientY-WR.press.y)>6)WR.drag=true;
    if(WR.drag){const p=floorHit(e),u=wrCur();if(!p||!u)return;const nx=p.x+WR.dragOff[0],nz=p.z+WR.dragOff[1],s=wrExact(sel,nx,nz,u.cfg,0);
      u.x=s.x;u.z=s.z;u.rot=s.rot;u.snap=s.snap;
      const o=WR.sel.obj;o.position.x=u.x;o.position.z=u.z;o.rotation.y=u.rot;WR.box&&WR.box.update();}}}
async function wrPlace(){const g=WR.ghost;if(!g||!g.pos)return;const u={uid:'w'+Date.now().toString(36),x:+g.pos.x.toFixed(3),z:+g.pos.z.toFixed(3),rot:+g.pos.rot.toFixed(4),snap:g.pos.snap,cfg:Wardrobes.clean(g.cfg)};
  const i=sel;wrItems(i).push(u);wrSave(i);wrCancel();await renderWr(i);const o=groups[i].userData.wrRoot.children.find(c=>c.userData.uid===u.uid);
  WR.tab='medidas';if(o)wrSelect(o,i);toast('Ropero colocado');}
function wrPointerUp(e,click){
  if(WR.ghost&&WR.on&&(mode==='int'||mode==='walk')){if(!click)return false;const p=floorHit(e);if(!p)return true;wrPlaceAt(p);wrPlace();return true;}
  if(WR.press){const pr=WR.press;WR.press=null;controls.enabled=true;
    if(WR.drag){WR.drag=false;const u=wrCur(),i=WR.sel.floor;if(u){u.x=+u.x.toFixed(3);u.z=+u.z.toFixed(3);wrSave(i);updateNavManual(i);if(u.cfg.mirror)wrMirror(WR.sel.obj);}shadowsDirty();renderWrPanel();return true;}
    if(click&&pr.g&&pr.g!=='cuerpo'){Wardrobes.setOpen(WR.sel.obj,pr.g);renderWrPanel();}return true;}
  if(!click||!(mode==='int'||mode==='walk')||FURN.on||FINC.on)return false;
  const H=wrHit(e);if(!H){if(WR.on&&WR.sel&&mode==='int'){wrDeselect();renderWrPanel();return true;}return false;}
  if(mode==='walk'){Wardrobes.setOpen(H.o,H.g&&H.g!=='cuerpo'?H.g:'puertas');return true;}
  wrSelect(H.o,sel);return true;}
function openWr(){if(typeof FAC!=='undefined'&&FAC.on)closeFac();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(ZOC.on)closeZoc();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(SHOP.on)closeShop();if(PISO.on)closePiso();
  if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();WR.on=true;showPanel($('wrPanel'));$('hint').hidden=true;toolState();renderWrPanel();wrReady();}
function closeWr(){WR.on=false;wrCancel();wrDeselect();wrMini(false);hidePanel($('wrPanel'));toolState();wrFloatRender();}
$('wrBtn').addEventListener('click',()=>WR.on?closeWr():openWr());$('wrClose').addEventListener('click',closeWr);
const svgUri=s=>'data:image/svg+xml;utf8,'+encodeURIComponent(s);
function wrPresetSvg(id){const L='stroke="#6b665f" stroke-width="2" fill="none"',S=(y)=>`<line x1="8" y1="${y}" x2="52" y2="${y}" ${L}/>`,rod=y=>`<line x1="10" y1="${y}" x2="50" y2="${y}" stroke="#9aa0a6" stroke-width="2.5"/>`+[16,24,32,40].map(x=>`<path d="M${x} ${y}v3l-5 5h10l-5-5" stroke="#8a8780" stroke-width="1.2" fill="none"/>`).join(''),
  hang=(y,h,c)=>[14,21,28,35,42].map(x=>`<rect x="${x-2}" y="${y+7}" width="5" height="${h}" rx="1.5" fill="${c}" opacity=".55"/>`).join(''),drw=(y)=>`<rect x="9" y="${y}" width="42" height="9" rx="1" ${L}/><line x1="26" y1="${y+4.5}" x2="34" y2="${y+4.5}" stroke="#6b665f" stroke-width="1.6"/>`;
  let b=S(18);
  if(id==='colgar')b+=rod(23)+hang(23,46,'#7b8fa6');
  else if(id==='colgar_corto')b+=rod(23)+hang(23,26,'#7b8fa6')+S(62)+S(72);
  else if(id==='doble_barra')b=rod(12)+hang(12,26,'#7b8fa6')+S(48)+rod(52)+hang(52,22,'#5d6470');
  else if(id==='estantes')b+=S(32)+S(46)+S(60)+S(72);
  else if(id==='cajonera')b+=S(34)+S(50)+drw(56)+drw(67);
  else if(id==='zapatero')b+=S(34)+S(48)+`<path d="M9 62l42 -5M9 74l42 -5" ${L}/>`;
  else if(id==='pantalonero')b+=`<rect x="9" y="24" width="42" height="4" rx="1" ${L}/>`+[13,19,25,31,37,43,49].map(x=>`<rect x="${x-2}" y="28" width="4" height="26" rx="1.5" fill="#5d6470" opacity=".55"/>`).join('')+S(62)+S(72);
  else if(id==='accesorios')b+=`<line x1="26" y1="18" x2="26" y2="36" ${L}/><line x1="38" y1="18" x2="38" y2="36" ${L}/>`+S(36)+`<rect x="9" y="44" width="42" height="7" rx="1" ${L}/><path d="M19 44v7M29 44v7M39 44v7" stroke="#6b665f" stroke-width="1"/>`+S(62);
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 84" width="60" height="84"><rect width="60" height="84" fill="#ece9e3"/><rect x="6" y="5" width="48" height="74" fill="#f7f5f1" stroke="#6b665f" stroke-width="2"/>${b}</svg>`);}
function wrHandleSvg(id){const door=`<rect x="10" y="6" width="40" height="72" fill="#f4f2ee" stroke="#6b665f" stroke-width="2"/>`;let h='';
  if(id==='alu')h='<rect x="40" y="26" width="4" height="30" rx="2" fill="#b9bcbf"/>';else if(id==='negro')h='<rect x="40" y="26" width="4" height="30" rx="2" fill="#26282a"/>';
  else if(id==='gola')h='<rect x="46" y="6" width="4" height="72" fill="#b9bcbf"/>';else h='<circle cx="42" cy="18" r="3" fill="none" stroke="#6b665f" stroke-width="1.5"/><path d="M42 24v6M39 27l3 3 3-3" stroke="#6b665f" stroke-width="1.5" fill="none"/>';
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 84" width="60" height="84"><rect width="60" height="84" fill="#ece9e3"/>${door}${h}</svg>`);}
const wrSwatch=F=>F.tex?'library/roperos/tex/'+F.id+'/swatch.webp':svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="${F.hex}"/></svg>`);
const cm=v=>Math.round(v*100);
function wrSpec(c){const s=Wardrobes.summary(c);return `${s.dims} · ${s.doors?s.doors+' puertas '+s.open.toLowerCase()+'s':'abierto'} · ${String(s.hang).replace('.',',')} m de barra · ${s.shelves} estantes · ${s.drawers} cajones · ${String(s.vol).replace('.',',')} m³`;}
function wrStatus(){const box=$('wrMsg');if(!box)return;const u=wrCur(),m=WR.msg||{},out=[];
  if(m.err&&m.err.length)out.push(...m.err.map(t=>'No se aplicó: '+t));if(m.warn&&m.warn.length)out.push(...m.warn);
  if(u&&WR.sel&&wrBlocked(WR.sel.floor,u))out.push('El ropero choca con una pared, un mueble o el paso de una puerta: arrastralo o achicalo.');
  box.hidden=!out.length;box.className='wr-msg'+(m.err&&m.err.length?'':' ok');box.innerHTML=out.map(esc).join('<br>');
  const sp=$('wrSpecTxt');if(sp&&u)sp.textContent=wrSpec(u.cfg);}
function wrSet(patch,quiet){const u=wrCur();if(!u)return false;const v=Wardrobes.validate({...u.cfg,...patch});
  if(!v.ok){WR.msg={err:v.err};if(quiet)wrStatus();else renderWrPanel();return false;}
  const o=WR.sel.obj,i=WR.sel.floor,old=u.cfg;u.cfg=v.cfg;Wardrobes.update(o,u.cfg);wrTag(o,i);
  if(u.snap&&old.d!==u.cfg.d){const dl=(u.cfg.d-old.d)/2;u.x+=Math.sin(u.rot)*dl;u.z+=Math.cos(u.rot)*dl;o.position.x=u.x;o.position.z=u.z;}
  if((old.w!==u.cfg.w||old.d!==u.cfg.d)&&wrBlocked(i,u)){const r=wrFit(i,u.x,u.z,u.cfg,u.rot,u.uid);if(r.ok&&Math.hypot(r.x-u.x,r.z-u.z)<0.6){u.x=r.x;u.z=r.z;u.rot=r.rot;u.snap=r.snap;o.position.x=u.x;o.position.z=u.z;o.rotation.y=u.rot;}}
  WR.msg={warn:v.warn};wrSave(i);updateNavManual(i);if(u.cfg.mirror)wrMirror(o);if(LIGHT.env!=null)setEnvScale(LIGHT.env);wrBox();shadowsDirty();
  if(quiet)wrStatus();else renderWrPanel();return true;}
const WRS={im:null,cells:new Map()};
(()=>{const im=new Image();im.onload=()=>{WRS.im=im;WRS.cells.clear();if(WR.on)renderWrPanel();};im.src='library/roperos/catalogo.jpg';})();
function wrCell(kind,idx){const key=kind+idx;if(WRS.cells.has(key))return WRS.cells.get(key);if(!WRS.im)return '';const L={m:[240,280,0],d:[240,200,280],x:[240,200,480]}[kind],c=document.createElement('canvas');c.width=L[0];c.height=L[1];
  c.getContext('2d').drawImage(WRS.im,idx*L[0],L[2],L[0],L[1],0,0,L[0],L[1]);let u='';try{u=c.toDataURL('image/jpeg',0.86);}catch(e){}WRS.cells.set(key,u);return u;}
function renderWrPanel(){
  const b=$('wrBody');if(!b)return;const M=Wardrobes.MODELS,u=wrCur(),i=sel;
  if(!u){const list=i>=0&&PROJ?wrItems(i):[];
    b.innerHTML=`<p class="note">${WR.note?esc(WR.note):'Elegí un modelo y ubicalo en el plano. Después ajustás medidas, acabados, distribución interior y extras.'}</p>
      <div class="wr-cards">${M.map(m=>{const s=Wardrobes.summary(Wardrobes.defaults(m.id)),pl=WR.ghost&&WR.ghost.model===m.id;
        return `<article class="wr-card"><img src="${wrCell('m',Wardrobes.MODELS.indexOf(m))||''}" alt="Render del ${esc(m.name)}" loading="lazy"><div><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p>
        <dl><dt>Medidas</dt><dd>${s.dims}</dd><dt>Apertura</dt><dd>${m.kind==='open'?'Abierto, sin puertas':s.doors+' puertas, '+esc(m.open.toLowerCase())}</dd><dt>Interior</dt><dd>${s.rods} barra, ${s.shelves} estantes, ${s.drawers} cajones</dd><dt>Acabados</dt><dd>${Wardrobes.FINISHES.length} colores y maderas</dd></dl>
        <button class="btn ${pl?'':'primary'} sm" type="button" data-wp="${m.id}">${pl?'Cancelar':'Colocar en el plano'}</button></div></article>`;}).join('')}</div>
      ${list.length?`<p class="sub-h">En este piso<small>${list.length}</small></p><div class="chips">${list.map((x,k)=>`<button class="chip" type="button" data-ws="${esc(x.uid)}">${esc(Wardrobes.model(x.cfg.model).name)} · ${cm(x.cfg.w)} cm</button>`).join('')}</div>`:''}
      <label class="tg" for="wrAuto"><input type="checkbox" id="wrAuto" ${WR.hideAuto?'checked':''}> Ocultar los roperos automáticos del plano</label>
      `;
    b.querySelectorAll('[data-wp]').forEach(x=>x.addEventListener('click',()=>{if(WR.ghost&&WR.ghost.model===x.dataset.wp){wrCancel();renderWrPanel();}else{if(mode!=='int'&&mode!=='walk'){const fi=sel>=0?sel:Math.max(0,PROJ.floors.findIndex(f=>f.lv>1));enterInterior(fi);}wrStartPlace(x.dataset.wp);}}));
    b.querySelectorAll('[data-ws]').forEach(x=>x.addEventListener('click',()=>{const o=groups[i].userData.wrRoot.children.find(c=>c.userData.uid===x.dataset.ws);if(o)wrSelect(o,i);}));
    wrAutoBind();wrFloatRender();return;}
  const c=u.cfg,m=Wardrobes.model(c.model),o=WR.sel.obj,R=m.range,openD=Wardrobes.anyOpen(o,'puertas'),openC=c.drawers&&Wardrobes.isOpen(o,'cajon_0'),MK=m.kind;
  const tabs=[['medidas','Medidas'],['exterior','Exterior'],['interior','Interior'],['extras','Extras']];
  const rng=(k,lbl)=>`<label class="wr-range">${lbl}<input type="range" data-dim="${k}" min="${cm(R[k][0])}" max="${cm(R[k][1])}" step="5" value="${cm(c[k])}" aria-label="${lbl} en centímetros"><output id="wrOut_${k}">${cm(c[k])} cm</output></label>`;
  let body='';
  if(WR.tab==='medidas')body=(MK==='corner'?`${rng('w','Lado A')}${rng('d','Lado B')}${rng('h','Alto')}${rng('dc','Fondo')}`:`${rng('w','Ancho')}${rng('h','Alto')}${rng('d','Fondo')}`)+(m.noDrawers?'':`<p class="sub-h">Cajones exteriores</p><div class="seg">${[0,2,3].map(n=>`<button type="button" data-drw="${n}" aria-pressed="${c.drawers===n}">${n?n+' cajones':'Sin cajones'}</button>`).join('')}</div>`);
  else if(WR.tab==='exterior')body=`<p class="sub-h">Frentes</p><div class="tiles three">${Wardrobes.FINISHES.map(F=>swTile('data-ff',F.id,c.front===F.id,wrSwatch(F),F.name,F.kind,F.name)).join('')}</div>
    <label class="tg" for="wrSame"><input type="checkbox" id="wrSame" ${c.body===c.front?'checked':''}> Cuerpo del mismo acabado que los frentes</label>
    ${c.body!==c.front?`<p class="sub-h">Cuerpo</p><div class="tiles three">${Wardrobes.FINISHES.filter(F=>!F.front).map(F=>swTile('data-fb',F.id,c.body===F.id,wrSwatch(F),F.name,F.kind,F.name)).join('')}</div>`:''}
    <p class="sub-h">Acabado de los frentes</p><div class="seg">${Wardrobes.SURFS.map(S=>`<button type="button" data-sf="${S.id}" aria-pressed="${c.surf===S.id}" title="${esc(S.desc)}" ${S.id==='texturizado'&&!Wardrobes.finish(c.front).tex?'disabled':''}>${esc(S.name.replace('Lacado ','').replace('Madera ',''))}</button>`).join('')}</div>
    ${MK==='open'?'':`<p class="sub-h">Tiradores</p><div class="tiles four">${Wardrobes.HANDLES.map(H=>swTile('data-hd',H.id,c.handle===H.id,wrHandleSvg(H.id),H.name,'',H.desc)).join('')}</div>
    <label class="tg" for="wrMir"><input type="checkbox" id="wrMir" ${c.mirror?'checked':''}> Espejo de cuerpo entero en la puerta ${MK==='slide'?'izquierda':'derecha'}</label>`}`;
  else if(WR.tab==='interior'){const nb=c.bays.length,sides=MK==='corner'?['Lado A (con rincón)','Lado B']:nb===1?['Interior']:nb===2?['Lado izquierdo','Lado derecho']:c.bays.map((_,k)=>'Espacio '+(k+1)),cd=Wardrobes.distOf(c);
    body=`<p class="sub-h">Distribución interior</p><div class="tiles three">${Wardrobes.DISTS.map((D,k)=>{const img=wrCell('d',k);return `<button type="button" class="tile sm" data-dist="${D.id}" aria-pressed="${cd===D.id}" title="${esc(D.desc)}"><span class="tile-well" style="aspect-ratio:6/5;background:#e9e4da">${img?`<img class="cover" src="${img}" alt="" loading="lazy">`:''}${cd===D.id?chk:''}</span><span class="tile-name">${esc(D.name)}<small>${esc(D.desc)}</small></span></button>`;}).join('')}</div><p class="sub-h">Cada espacio</p>`+(m.id==='2p'?`<label class="tg" for="wrDiv"><input type="checkbox" id="wrDiv" ${c.divider?'checked':''}> División central (dos espacios independientes)</label>`:'')+c.bays.map((bay,k)=>{const P=Wardrobes.preset(bay.p),lbl=bay.p==='cajonera'?'Cajones':bay.p==='zapatero'?'Bandejas':bay.p==='accesorios'?'Estantes abajo':'Estantes';
      return `<section class="wr-bay"><h4>${sides[k]}${P.n?`<span class="wr-step">${lbl}<button class="btn sm icon" type="button" data-bn="${k}|-1" aria-label="Menos"><svg class="ico"><use href="#i-minus"/></svg></button><output>${bay.n}</output><button class="btn sm icon" type="button" data-bn="${k}|1" aria-label="Más"><svg class="ico"><use href="#i-plus"/></svg></button></span>`:''}</h4>
      <div class="tiles four">${Wardrobes.PRESETS.map(Q=>swTile('data-bp',k+'|'+Q.id,bay.p===Q.id,wrPresetSvg(Q.id),Q.name,'',Q.desc)).join('')}</div></section>`;}).join('');}
  else body=`<p class="sub-h">Opciones adicionales</p><label class="tg" for="wrLed"><input type="checkbox" id="wrLed" ${c.led?'checked':''}> Iluminación LED bajo el maletero</label>
    ${MK==='open'?'':`<label class="tg" for="wrMir2"><input type="checkbox" id="wrMir2" ${c.mirror?'checked':''}> Espejo integrado</label>`}
    <label class="tg" for="wrLock"><input type="checkbox" id="wrLock" ${c.lock?'checked':''}> Cajones con cerradura</label>
    <label class="tg" for="wrOrg"><input type="checkbox" id="wrOrg" ${c.org?'checked':''}> Organizadores internos en los cajones</label>
    <label class="tg" for="wrRopa"><input type="checkbox" id="wrRopa" ${c.clothes?'checked':''}> Mostrar ropa de muestra</label>
    <label class="tg" for="wrAuto"><input type="checkbox" id="wrAuto" ${WR.hideAuto?'checked':''}> Ocultar los roperos automáticos del plano</label>
    <p class="sub-h">Detalles que marcan la diferencia</p><div class="tiles two">${Wardrobes.DETAILS.map((D,k)=>{const img=wrCell('x',k);return `<div class="tile sm is-static"><span class="tile-well" style="aspect-ratio:6/5">${img?`<img class="cover" src="${img}" alt="" loading="lazy">`:''}</span><span class="tile-name">${esc(D.name)}<small>${esc(D.desc)}</small></span></div>`;}).join('')}</div>
    <p class="sub-h">Herrajes incluidos</p><p class="wr-spec">${MK==='slide'?'Puertas corredizas sobre riel superior de aluminio con guía inferior y amortiguador':MK==='open'?'Estructura abierta con copete superior':'Bisagras de cazoleta de 35 mm con cierre suave ('+(c.h-0.2>1.6?4:3)+' por puerta)'}, correderas telescópicas de extracción total en los cajones, barra oval cromada con soportes, soportes de estante regulables y niveladores bajo el zócalo.</p>`;
  b.innerHTML=`<div class="insp-h"><h3>${esc(m.name)}</h3><p id="wrSpecTxt">${wrSpec(c)}</p></div>
    <div class="wr-acts">${MK==='open'?'':`<button class="btn sm" type="button" data-wa="puertas">${openD?'Cerrar':'Abrir'} ${MK==='slide'?'corrediza':'puertas'}</button>`}${c.drawers?`<button class="btn sm" type="button" data-wa="cajones">${openC?'Cerrar':'Abrir'} cajones</button>`:''}
      <button class="btn sm ghost" type="button" data-wa="rot" title="Girar 90°"><svg class="ico"><use href="#i-rotr"/></svg>Girar</button><button class="btn sm ghost" type="button" data-wa="dup"><svg class="ico"><use href="#i-copy"/></svg>Duplicar</button><button class="btn sm danger" type="button" data-wa="del"><svg class="ico"><use href="#i-trash"/></svg>Quitar</button></div>
    <div class="wr-steps" role="group" aria-label="Configuración">${tabs.map(([k,v])=>`<button type="button" data-wt="${k}" aria-pressed="${WR.tab===k}">${v}</button>`).join('')}</div>
    <div class="wr-msg" id="wrMsg" hidden role="status"></div>
    ${body}
    <div class="row"><button class="btn ghost sm" type="button" id="wrBack"><svg class="ico"><use href="#i-back"/></svg>Catálogo</button></div>
    <p class="note">${wrOwner()?'Arrastrá el ropero para moverlo; tocá una puerta o cajón para abrirlo. Los cambios se guardan para todos.':'Arrastrá el ropero para moverlo; tocá una puerta o cajón para abrirlo. Tu diseño se guarda en este navegador.'}</p>`;
  wrStatus();
  b.querySelectorAll('[data-wt]').forEach(x=>x.addEventListener('click',()=>{WR.tab=x.dataset.wt;WR.msg=null;renderWrPanel();}));
  b.querySelectorAll('[data-dim]').forEach(x=>{x.addEventListener('input',()=>{const k=x.dataset.dim,v=(+x.value)/100;$('wrOut_'+k).textContent=x.value+' cm';wrSet({[k]:v},true);});x.addEventListener('change',()=>renderWrPanel());});
  b.querySelectorAll('[data-drw]').forEach(x=>x.addEventListener('click',()=>wrSet({drawers:+x.dataset.drw})));
  b.querySelectorAll('[data-ff]').forEach(x=>x.addEventListener('click',()=>{const same=c.body===c.front,f=x.dataset.ff,F=Wardrobes.finish(f);wrSet({front:f,...(same?{body:f}:{}),...(c.surf==='texturizado'&&!F.tex?{surf:'mate'}:{})});}));
  b.querySelectorAll('[data-fb]').forEach(x=>x.addEventListener('click',()=>wrSet({body:x.dataset.fb})));
  const same=$('wrSame');if(same)same.addEventListener('change',()=>wrSet({body:same.checked?c.front:(Wardrobes.finish(c.front).tex?'blanco-mate':'roble-natural')}));
  b.querySelectorAll('[data-sf]').forEach(x=>x.addEventListener('click',()=>wrSet({surf:x.dataset.sf})));
  b.querySelectorAll('[data-hd]').forEach(x=>x.addEventListener('click',()=>wrSet({handle:x.dataset.hd})));
  b.querySelectorAll('[data-dist]').forEach(x=>x.addEventListener('click',()=>{const n=Wardrobes.applyDist(c,x.dataset.dist);wrSet({bays:n.bays});}));
  [['wrMir','mirror'],['wrMir2','mirror'],['wrLed','led'],['wrRopa','clothes'],['wrDiv','divider'],['wrLock','lock'],['wrOrg','org']].forEach(([id,k])=>{const x=$(id);if(x)x.addEventListener('change',()=>{const p={[k]:x.checked};if(k==='divider'&&x.checked)p.bays=[c.bays[0],{p:'estantes',n:4}];if(k==='clothes'&&x.checked)Wardrobes.setOpen(o,'puertas',1);if(!wrSet(p))x.checked=!x.checked;});});
  b.querySelectorAll('[data-bp]').forEach(x=>x.addEventListener('click',()=>{const[k,id]=x.dataset.bp.split('|'),bays=c.bays.map(q=>({...q}));bays[+k]={p:id,n:Wardrobes.preset(id).dn||0};wrSet({bays});}));
  b.querySelectorAll('[data-bn]').forEach(x=>x.addEventListener('click',()=>{const[k,d]=x.dataset.bn.split('|').map(Number),bays=c.bays.map(q=>({...q})),P=Wardrobes.preset(bays[k].p);bays[k].n=Math.max(P.n[0],Math.min(P.n[1],bays[k].n+d));if(bays[k].n===c.bays[k].n)return;wrSet({bays});}));
  b.querySelectorAll('[data-wa]').forEach(x=>x.addEventListener('click',()=>{const a=x.dataset.wa,i2=WR.sel.floor;
    if(a==='puertas'){Wardrobes.setOpen(o,'puertas',openD?0:1);setTimeout(renderWrPanel,30);}
    else if(a==='cajones'){Wardrobes.setOpen(o,'cajones',openC?0:1);setTimeout(renderWrPanel,30);}
    else if(a==='rot'){const nr=((u.rot||0)+Math.PI/2)%(Math.PI*2),C=wrCtx(i2,u.uid),t={...u,rot:nr},r=C?Fisica.find(C.Wv,[wrAABB(t,C.lv,-0.006)],{extra:C.extra,max:1.0}):{dx:0,dz:0};if(!r){toast('No hay lugar para girarlo ahí: movelo primero.','err');return;}u.rot=nr;u.x=+(u.x+r.dx).toFixed(3);u.z=+(u.z+r.dz).toFixed(3);u.snap=false;o.rotation.y=u.rot;o.position.x=u.x;o.position.z=u.z;wrSave(i2);updateNavManual(i2);wrBox();shadowsDirty();wrStatus();}
    else if(a==='dup'){const n={...JSON.parse(JSON.stringify(u)),uid:'w'+Date.now().toString(36)},ex=Math.cos(u.rot||0),ez=-Math.sin(u.rot||0);let r=null;for(const sd of[1,-1]){const q=wrFit(i2,u.x+ex*sd*(u.cfg.w+0.02),u.z+ez*sd*(u.cfg.w+0.02),u.cfg,u.rot,n.uid);if(q.ok){r=q;break;}}
      if(!r){toast('No hay lugar al lado para duplicarlo.','err');return;}Object.assign(n,{x:+r.x.toFixed(3),z:+r.z.toFixed(3),rot:+r.rot.toFixed(4),snap:r.snap});wrItems(i2).push(n);wrSave(i2);
      renderWr(i2).then(()=>{const no=groups[i2].userData.wrRoot.children.find(q=>q.userData.uid===n.uid);if(no)wrSelect(no,i2);});}
    else if(a==='del'){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.classList.add('armed');x.textContent='Confirmar';setTimeout(()=>{if(x.isConnected){x.dataset.sure='';x.classList.remove('armed');x.innerHTML='<svg class="ico"><use href="#i-trash"/></svg>Quitar';}},3000);return;}
      const L=wrItems(i2),k=L.findIndex(q=>q.uid===u.uid);if(k>=0)L.splice(k,1);wrDeselect();wrSave(i2);renderWr(i2);toast('Ropero quitado');}}));
  $('wrBack').addEventListener('click',()=>{wrDeselect();renderWrPanel();});
  wrAutoBind();wrFloatRender();
}
const WRMQ=matchMedia('(max-width:820px)'),wrMob=()=>WRMQ.matches;
function wrMini(on){const st=$('stage');if(st)st.classList.toggle('wr-mini',!!on);}
function wrFloatRender(){const f=$('wrFloat');if(!f)return;const g=WR.ghost,u=wrCur(),mini=$('stage').classList.contains('wr-mini');
  if(!WR.on||!wrMob()||!mini||(!g&&!u)){f.hidden=true;return;}f.hidden=false;let h='';
  if(g){const M=Wardrobes.model(g.model);h=`<div class="insp-main"><div class="insp-id"><b>${esc(M.name)}</b><span>Tocá el piso: el ropero queda justo ahí, con la espalda a la pared más cercana.</span></div><div class="insp-acts"><button class="btn ghost" type="button" data-wf="grot"><svg class="ico"><use href="#i-rotr"/></svg><span>Girar</span></button><button class="btn ghost" type="button" data-wf="cancel"><svg class="ico"><use href="#i-close"/></svg><span>Cancelar</span></button></div></div>`;}
  else{const M=Wardrobes.model(u.cfg.model),o=WR.sel.obj,openD=o&&Wardrobes.anyOpen(o,'puertas');h=`<div class="insp-main"><div class="insp-id"><b>${esc(M.name)}</b><span>${cm(u.cfg.w)} × ${cm(u.cfg.h)} cm · arrastralo para moverlo</span></div><div class="insp-acts"><button class="btn primary" type="button" data-wf="edit"><svg class="ico"><use href="#i-sliders"/></svg><span>Editar</span></button><button class="btn ghost" type="button" data-wf="rot"><svg class="ico"><use href="#i-rotr"/></svg><span>Girar</span></button>${M.kind==='open'?'':`<button class="btn ghost" type="button" data-wf="puertas"><svg class="ico"><use href="#i-ropero"/></svg><span>${openD?'Cerrar':'Abrir'}</span></button>`}<button class="btn ghost" type="button" data-wf="dup"><svg class="ico"><use href="#i-copy"/></svg><span>Duplicar</span></button><button class="btn danger" type="button" data-wf="del"><svg class="ico"><use href="#i-trash"/></svg><span>Quitar</span></button><button class="btn ghost icon" type="button" data-wf="close" aria-label="Listo"><svg class="ico"><use href="#i-close"/></svg></button></div></div>`;}
  f.innerHTML=h;
  f.querySelectorAll('[data-wf]').forEach(x=>x.addEventListener('click',()=>{const a=x.dataset.wf,pb=k=>{const y=$('wrBody').querySelector('[data-wa="'+k+'"]');if(y)y.click();};
    if(a==='ok')wrPlace();
    else if(a==='grot'){const gg=WR.ghost;if(!gg)return;gg.rot=((gg.rot||0)+Math.PI/2)%(Math.PI*2);toast('El ropero se colocará girado '+Math.round(gg.rot*180/Math.PI)+'°');}
    else if(a==='cancel'){wrCancel();wrMini(false);renderWrPanel();}
    else if(a==='edit'){wrMini(false);WR.tab='medidas';renderWrPanel();}
    else if(a==='close'){wrDeselect();closeWr();}
    else if(a==='del'){if(x.dataset.sure!=='1'){x.dataset.sure='1';x.classList.add('armed');x.lastChild.textContent='Confirmar';return;}pb('del');pb('del');}
    else{pb(a);setTimeout(wrFloatRender,40);}}));}
WRMQ.addEventListener&&WRMQ.addEventListener('change',()=>{if(!wrMob())wrMini(false);wrFloatRender();});
function wrAutoBind(){const x=$('wrAuto');if(x)x.addEventListener('change',()=>{WR.hideAuto=x.checked;try{localStorage.setItem(WAUTO,x.checked?'1':'0');}catch(e){}if(PROJ)PROJ.floors.forEach((f,i)=>applyWrAuto(i));});}

/* ---------- pisos flotantes: catálogo con muestra 3D ---------- */
const PKEY='peredo.piso';
const PISO={on:false,ab:null,pv:null};
const flotList=()=>Mats.list().filter(m=>m.plank);
function curPiso(){const id=(libActive().wood||'').replace(/^mat:/,'');return Mats.info(id)&&Mats.info(id).plank?id:null;}
function pisoLoadLocal(){try{const v=localStorage.getItem(PKEY);if(v&&/^flot-/.test(v))CLIENT_ACTIVE.wood='mat:'+v;}catch(e){}}
function releaseFlot(){const used=new Set();scene.traverse(o=>{if(o.material)used.add(o.material);});Mats.release(used,k=>/^flot-/.test(k));}
function floorsNow(){if(PROJ)PROJ.floors.forEach((f,i)=>refreshFloors(i));releaseFlot();}
function applyPiso(id,keepAB){const prev=curPiso();if(!keepAB&&prev!==id)PISO.ab={a:prev,b:id,showing:'b'};
  CLIENT_ACTIVE.wood='mat:'+id;LIB.pbr=LIB.pbr||{};LIB.pbr.wood='mat:'+id;try{localStorage.setItem(PKEY,id);}catch(e){}
  floorsNow();renderPiso();}
function openPiso(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof FAC!=="undefined"&&FAC.on)closeFac();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(ZOC.on)closeZoc();if(FURN.on)closeFurnish();if(FINC.on)closeFin();if(SHOP.on)closeShop();if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();PISO.on=true;showPanel($('pisoPanel'));$('hint').hidden=true;toolState();renderPiso();}
function closePiso(){PISO.on=false;hidePanel($('pisoPanel'));toolState();}
$('pisoBtn').addEventListener('click',()=>PISO.on?closePiso():openPiso());$('pisoClose').addEventListener('click',closePiso);
$('pisoAB').addEventListener('click',()=>{const A=PISO.ab;if(!A)return;A.showing=A.showing==='b'?'a':'b';applyPiso(A[A.showing],true);});
$('pisoReset').addEventListener('click',()=>{delete CLIENT_ACTIVE.wood;try{localStorage.removeItem(PKEY);}catch(e){}const id=(libActive().wood||'mat:'+DEF_FLOOR.wood).replace(/^mat:/,'');LIB.pbr=LIB.pbr||{};LIB.pbr.wood='mat:'+id;PISO.ab=null;floorsNow();renderPiso();});
$('pisoDef').addEventListener('click',async()=>{const b=$('pisoDef'),id=curPiso();if(!id||!canEditLib()||b.getAttribute('aria-disabled')==='true')return;b.setAttribute('aria-busy','true');
  delete CLIENT_ACTIVE.wood;try{localStorage.removeItem(PKEY);}catch(e){}const ok=await setActive('wood','mat:'+id);b.removeAttribute('aria-busy');renderPiso();
  $('pisoNote').textContent=ok?'Listo: queda como piso predeterminado de todo el edificio.':'No se pudo guardar (permiso o conexión).';toast(ok?'Pisos: predeterminado guardado':'No se pudo guardar. Revisá tu conexión.',ok?'ok':'err');});
function renderPiso(){
  const L=flotList(),cur=curPiso(),ed=canEditLib();
  keepFocus($('pisoGrid'),'data-p',()=>{$('pisoGrid').innerHTML=L.map(m=>swTile('data-p',esc(m.id),cur===m.id,esc(m.thumb),m.name,m.especie||'',m.name+(m.especie?' · '+m.especie:''))).join('');});
  $('pisoGrid').querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.p!==curPiso())applyPiso(b.dataset.p);}));
  $('pisoCount').textContent=L.length+' opciones';
  const m=Mats.info(cur)||L[0];
  if(m){const sp=m.specs||{};$('pisoInfo').innerHTML=`<div class="insp-h"><h3>${esc(m.name)}</h3><p class="note">${esc(m.especie||'')}${m.finish?' · '+esc(m.finish):''} · instalación ${esc((sp.instalacion||'click').toLowerCase())}</p></div><dl class="dims"><div><dt>Tabla</dt><dd>${esc(sp.medidas||'')}</dd></div><div><dt>Espesor</dt><dd>${esc(sp.espesor||'')}</dd></div><div><dt>Uso</dt><dd>${esc((sp.uso||'').split(' ')[0])}</dd></div></dl>`;pisoSample(m);}
  const A=PISO.ab;$('pisoAB').disabled=!A;$('pisoAB').textContent=A?(A.showing==='b'?'Ver el anterior':'Ver el nuevo'):'Comparar con el anterior';
  $('pisoReset').hidden=!CLIENT_ACTIVE.wood;
  const defId=((LIB.settings.active||{}).wood||LIB.seed.active.wood||'').replace(/^mat:/,''),isDef=!CLIENT_ACTIVE.wood||cur===defId;
  const d=$('pisoDef');d.hidden=!ed;d.classList.toggle('is-done',isDef);d.classList.toggle('primary',!isDef);d.setAttribute('aria-disabled',String(isDef));d.innerHTML=isDef?'<svg class="ico"><use href="#i-check"/></svg>Predeterminado del edificio':'Usar para todo el edificio';
  $('pisoNote').textContent='Tablas reales de 1380 × 193 mm con bisel y juntas alternadas. El acabado se aplica a todos los pisos de madera'+(ed?'.':'; solo lo ves vos.')+' En «Acabados» lo podés cambiar por ambiente.';
}
function pisoSample(m){
  const c=$('pisoCanvas');let S=PISO.pv;
  if(!S){const r=new THREE.WebGLRenderer({canvas:c,antialias:true});r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=0.72;r.setPixelRatio(Math.min(devicePixelRatio,2));
    const sc=new THREE.Scene();sc.background=new THREE.Color(css('--well')||'#d8d5cf');if(THREE.RoomEnvironment){const pm=new THREE.PMREMGenerator(r);sc.environment=pm.fromScene(new THREE.RoomEnvironment(),0.04).texture;pm.dispose();}
    const dl=new THREE.DirectionalLight(0xfff4e6,2.2);dl.position.set(-1.5,0.35,0.5);sc.add(dl);sc.add(new THREE.HemisphereLight(0xffffff,0x9a958c,0.2));
    const cam=new THREE.PerspectiveCamera(32,16/10,0.01,20);cam.position.set(-0.18,0.24,0.62);
    const ctl=new THREE.OrbitControls(cam,c);ctl.target.set(-0.52,0,0.12);ctl.enableDamping=true;ctl.minDistance=0.12;ctl.maxDistance=2.5;ctl.maxPolarAngle=Math.PI*0.48;ctl.update();
    const mat=new THREE.MeshStandardMaterial({color:0xffffff,envMapIntensity:0.45});const grp=new THREE.Group();sc.add(grp);
    S=PISO.pv={r,sc,cam,ctl,mat,grp,id:null,tex:[]};
    new THREE.GLTFLoader().load('library/pisos/tabla.gltf',gl=>{gl.scene.traverse(o=>{if(o.isMesh){o.material=mat;}});grp.add(gl.scene);},undefined,()=>{});
    (function tick(){requestAnimationFrame(tick);if(!PISO.on||!PISO.pv)return;const w=c.clientWidth,h=c.clientHeight;if(w&&c.width!==Math.round(w*r.getPixelRatio())){r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}ctl.update();r.render(sc,cam);})();}
  if(S.id===m.id)return;S.id=m.id;S.tex.forEach(t=>t.dispose());const tl=new THREE.TextureLoader(),q=s=>s.replace(/\.webp$/,'-512.webp');
  const ld=(u,srgb)=>{const t=tl.load(q(u));t.flipY=false;t.anisotropy=8;if(srgb)t.encoding=THREE.sRGBEncoding;return t;};
  const map=ld(m.maps.color,true),rough=ld(m.maps.rough),nrm=ld(m.maps.normal);S.tex=[map,rough,nrm];
  Object.assign(S.mat,{map,roughnessMap:rough,normalMap:nrm,roughness:1});S.mat.normalScale.set(1,1);S.mat.needsUpdate=true;
}
function applySun(){
  const c=bounds.isEmpty()?new THREE.Vector3():bounds.getCenter(new THREE.Vector3());
  if(!SUN.on){applyProfile(c);$('sunInfo').textContent='';return;}
  setEnvScale(1);lampGlow(1.1);nightLights(true);sun.castShadow=true;
  const p=sunPos(SUN.date,SUN.hour),el=p.el*Math.PI/180,az=p.az*Math.PI/180;
  const dir=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el));
  sun.position.copy(c).addScaledVector(dir,140);sun.target.position.set(c.x,0,c.z);
  const day=Math.max(0,Math.min(1,(p.el+2)/12)),warm=Math.max(0,Math.min(1,1-(p.el-3)/25));
  sun.intensity=1.35*day;sun.color.setRGB(1,0.93-0.25*warm,0.85-0.45*warm);
  hemi.intensity=0.08+0.24*day;fillL.intensity=0.04*day;renderer.toneMappingExposure=0.6+0.3*day;fitShadow();shadowsDirty();
  const sky=new THREE.Color(0x0e1626).lerp(new THREE.Color(0xd99a6c),Math.min(1,day*2)*warm*0.9).lerp(new THREE.Color(0x9fc3e0),Math.max(0,day-warm*0.6));
  scene.background=sky;if(scene.fog)scene.fog.color=sky;
  const card=['N','NE','E','SE','S','SO','O','NO'][Math.round(p.az/45)%8];
  $('sunInfo').textContent=p.el>0?`Sol a ${p.el.toFixed(0)}° de altura, desde el ${card} (azimut ${p.az.toFixed(0)}°). Al mediodía en Cochabamba el sol pasa por el norte en invierno y casi vertical en verano.`:'El sol está bajo el horizonte.';
}
function fmtH(h){const m=Math.round(h*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
(function(){const d=new Date();$('sunDate').value=d.toISOString().slice(0,10);SUN.date=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  $('sunCtl').setAttribute('aria-disabled','true');
  $('sunOn').addEventListener('change',e=>{SUN.on=e.target.checked;$('sunCtl').setAttribute('aria-disabled',String(!SUN.on));if(SUN.on){sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;sun.shadow.camera.far=320;sun.shadow.camera.updateProjectionMatrix();}applySun();});
  $('sunDate').addEventListener('input',e=>{const v=e.target.value;if(!v)return;const[y,m,dd]=v.split('-').map(Number);SUN.date=new Date(y,m-1,dd);applySun();});
  $('sunHour').addEventListener('input',e=>{SUN.hour=+e.target.value;$('sunOut').textContent=fmtH(SUN.hour);applySun();});
  $('sunPlay').addEventListener('click',()=>{SUN.play=!SUN.play;$('sunPlay').textContent=SUN.play?'❚❚':'▶';if(SUN.play&&!SUN.on){$('sunOn').checked=true;$('sunOn').dispatchEvent(new Event('change'));}});
  document.querySelectorAll('#sunBlk .chip').forEach(b=>b.addEventListener('click',()=>{const y=new Date().getFullYear();$('sunDate').value=y+'-'+b.dataset.d;$('sunDate').dispatchEvent(new Event('input'));if(!SUN.on){$('sunOn').checked=true;$('sunOn').dispatchEvent(new Event('change'));}}));
  $('furnOn').addEventListener('change',e=>{SHOWF=e.target.checked;groups.forEach((g,i)=>{g.traverse(o=>{if(o.userData.manual)o.visible=SHOWF;});applyHideAuto(i);});shadowsDirty();});
})();
let SHOWF=true;
if(document.fonts)document.fonts.load('600 72px "Archivo"').then(()=>{if(typeof PROJ!=='undefined'&&PROJ)applyTheme();}).catch(()=>{});
function applyTheme(){
  scene.background=new THREE.Color(css('--sky'));scene.fog=new THREE.Fog(new THREE.Color(css('--sky')),120,330);
  MAT.hl.color=new THREE.Color(css('--accent'));
  const fg=css('--fg'),pn=css('--panel'),ac=css('--accent'),af=css('--accent-fg');
  sprites.forEach(s=>{if(s.userData.kind==='unit')paintLabel(s,af,ac);else paintLabel(s,fg,pn);});
  if(typeof SUN!=='undefined'&&SUN.on)applySun();
}

/* ---------- UI state ---------- */
let sel=-1,mode='ext',walkState=null,tween=null;
function fitView(box,dir,dist){const c=box.getCenter(new THREE.Vector3()),s=box.getSize(new THREE.Vector3()).length();return {tgt:c,pos:c.clone().add(dir.clone().normalize().multiplyScalar(s*(dist||1.15)))};}
function flyTo(v,ms=900){tween={p0:camera.position.clone(),t0:controls.target.clone(),p1:v.pos,t1:v.tgt,s:performance.now(),ms};}
function homeView(){const b=bounds.clone();b.max.y=ROOF+2;flyTo(fitView(b,new THREE.Vector3(1.05,0.55,-1.25),1.05));}
function floorBox(i){const b=new THREE.Box3().setFromObject(groups[i].children[0]);b.max.y=PROJ.floors[i].lv+2.6;return b;}
const SH_DEF={l:-45,r:45,t:45,b:-45,far:260};
function fitShadow(){
  const cam=sun.shadow.camera,dir=sun.position.clone().sub(sun.target.position).normalize();
  if(mode!=='ext'&&sel>=0&&groups[sel]){const b=floorBox(sel),c=b.getCenter(new THREE.Vector3()),sz=b.getSize(new THREE.Vector3()),R=Math.max(sz.x,sz.z)*0.62+1;
    cam.left=-R;cam.right=R;cam.top=R;cam.bottom=-R;cam.far=200;sun.target.position.set(c.x,c.y-1,c.z);sun.position.copy(sun.target.position).addScaledVector(dir,90);}
  else{const big=SUN&&SUN.on?60:45;cam.left=-big;cam.right=big;cam.top=big;cam.bottom=-big;cam.far=SUN&&SUN.on?320:SH_DEF.far;
    if(!bounds.isEmpty()){const c=bounds.getCenter(new THREE.Vector3());sun.target.position.set(c.x,0,c.z);sun.position.copy(sun.target.position).addScaledVector(dir,SUN&&SUN.on?140:90);}}
  cam.updateProjectionMatrix();sun.target.updateMatrixWorld();
}
function layout(){
  if(!PROJ)return;
  const ex=+$('explode').value,F=PROJ.floors;
  groups.forEach((g,i)=>{
    g.position.y=mode==='ext'?Math.max(0,i-1)*ex:0;
    g.visible=mode==='ext'?true:i===sel;
    g.userData.hl.visible=mode==='ext'&&i===sel;
    g.userData.labels.visible=mode==='int'&&i===sel;
    g.userData.ceil.visible=mode==='walk'&&i===sel;if(g.userData.techGrp)g.userData.techGrp.visible=mode==='walk'&&i===sel;
    if(g.userData.cover)g.userData.cover.visible=mode!=='int';
  });
  roofGroup.visible=mode==='ext';roofGroup.position.y=(F.length-1)*(mode==='ext'?ex:0);
  const isS=sel>=0&&F[sel].lv<-0.5;
  site.visible=mode==='ext'||mode==='walk'||(sel>=0&&F[sel].lv<1.2);
  const g=site.userData.ground;g.material.opacity=isS?0.3:1;g.material.depthWrite=!isS;
  Glazing.setMode(mode);
  $('back').hidden=mode==='ext';$('explodeL').hidden=mode!=='ext';$('walkBtn').hidden=mode!=='int';
  $('resetTxt').textContent=mode==='ext'?'Vista inicial':'Encuadrar';$('reset').title=$('resetTxt').textContent;
  stage.classList.toggle('walking',mode==='walk');
  const h=$('hint');
  if(mode==='walk'){h.hidden=false;h.textContent=matchMedia('(pointer:coarse)').matches?'Arrastrá para mirar · tocá el piso para caminar ahí':'Arrastrá para mirar · clic en el piso para ir · W A S D para caminar · Shift para correr';}
  else if(mode==='int'){h.hidden=false;h.textContent='Girá y acercate · tocá el piso o un ambiente de la lista para recorrerlo';}
  else h.hidden=true;
  scene.environment=(mode==='ext'||!ENV_IN)?ENV_OUT:ENV_IN;applySun();fitShadow();shadowsDirty();
  $('furnBtn').hidden=!(mode==='int'&&canEditLayout());if(mode!=='int'&&FURN.on)closeFurnish();
  $('wrBtn').hidden=!(mode==='int'||mode==='walk');if(!(mode==='int'||mode==='walk')&&WR.on)closeWr();
  $('finBtn').hidden=!((mode==='int'||mode==='walk')&&finAllowed().any);if(!(mode==='int'||mode==='walk')&&FINC.on)closeFin();if(LIGHT.prof==='noche')nightLights();
  resize();
  $('crumb').textContent=mode==='ext'?(sel>=0?F[sel].n:''):(mode==='int'?'Interior · ':'Recorrido · ')+F[sel].n;
  applyStruct();
}
const STRUCT={on:false,grp:null,proj:null,stats:null};
const MAT_EST={losa:new THREE.MeshStandardMaterial({color:0x8d8880,map:TX.concrete,roughness:0.9}),col:new THREE.MeshStandardMaterial({color:0x5c5853,map:TX.concrete,roughness:0.8}),
  viga:new THREE.MeshStandardMaterial({color:0x6f6a63,map:TX.concrete,roughness:0.85}),muro:new THREE.MeshStandardMaterial({color:0x9c978e,map:TX.concrete,roughness:0.9,transparent:true,opacity:0.55,depthWrite:false}),
  zap:new THREE.MeshStandardMaterial({color:0x7d7870,map:TX.concrete,roughness:0.9})};
function buildStruct(){
  const root=new THREE.Group();root.name='estructura';const F=PROJ.floors;let nCol=0,lViga=0,vol=0,nZap=0;
  const cen=p=>{let x=0,z=0;p.forEach(q=>{x+=q[0];z+=q[1];});return [x/p.length,z/p.length];};
  const beam=(a,b,y0,y1,w,arr)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.05)return 0;const g=new THREE.BoxGeometry(L,y1-y0,w);g.rotateY(-Math.atan2(b[1]-a[1],b[0]-a[0]));g.translate((a[0]+b[0])/2,(y0+y1)/2,(a[1]+b[1])/2);arr.push(g);return L;};
  F.forEach((f,i)=>{const G=PROJ.geo[f.g],sub=new THREE.Group();sub.userData.floorIdx=i;root.add(sub);
    const top=f.lv+f.h-SLAB,H=top-f.lv,VD=0.45,VW=0.2;
    const sl=mesh(extr(G.slab,SLAB,f.lv-SLAB),MAT_EST.losa);sl.userData.floor=i;sub.add(sl);vol+=polyArea(G.slab)*SLAB;
    const cm=mesh(merge(G.cols.map(c=>extr(c,H,f.lv))),MAT_EST.col);if(cm){cm.userData.floor=i;sub.add(cm);}nCol+=G.cols.length;G.cols.forEach(c=>{vol+=polyArea(c)*H;});
    const mw=[];G.walls.forEach(w=>{let per=0;for(let a=0,b=w.length-1;a<w.length;b=a++)per+=Math.hypot(w[a][0]-w[b][0],w[a][1]-w[b][1]);const A=polyArea(w);if(2*A/per>=0.17){mw.push(extr(w,H,f.lv));vol+=A*H;}});
    const mm=mesh(merge(mw),MAT_EST.muro,false);if(mm){mm.userData.floor=i;mm.renderOrder=2;sub.add(mm);}
    const vg=[],C=G.cols.map(c=>{const xs=c.map(q=>q[0]),zs=c.map(q=>q[1]);return {c:cen(c),w:Math.max(...xs)-Math.min(...xs),d:Math.max(...zs)-Math.min(...zs)};}),done=new Set();
    for(let a=0;a<C.length;a++)for(let b=a+1;b<C.length;b++){const p=C[a].c,q=C[b].c,dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz);
      if(L<0.8||L>9||(Math.abs(dx)>0.35&&Math.abs(dz)>0.35))continue;
      const ux=dx/L,uz=dz/L;if(C.some((o,k)=>k!==a&&k!==b&&(()=>{const rx=o.c[0]-p[0],rz=o.c[1]-p[1],t=rx*ux+rz*uz;return t>0.1&&t<L-0.1&&Math.abs(rx*uz-rz*ux)<0.4;})()))continue;
      const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];if(!pip(m,G.slab))continue;let ok=true;for(let t=0.15;t<0.9&&ok;t+=0.15)if(!pip([p[0]+dx*t,p[1]+dz*t],G.slab))ok=false;if(!ok)continue;
      const L2=beam(p,q,top-VD,top,VW,vg);lViga+=L2;vol+=L2*VW*(VD-0.0);}
    const lp=closeLoop(G.slab);for(let k=0;k<lp.length-1;k++){const a=lp[k],b=lp[k+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<0.05)continue;
      let nx=-dz/L,nz=dx/L;const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(!pip([m[0]+nx*0.2,m[1]+nz*0.2],G.slab)){nx=-nx;nz=-nz;}
      const o=VW/2;const L2=beam([a[0]+nx*o,a[1]+nz*o],[b[0]+nx*o,b[1]+nz*o],top-VD,top,VW,vg);lViga+=L2;vol+=L2*VW*VD;}
    const vm=mesh(merge(vg),MAT_EST.viga);if(vm){vm.userData.floor=i;sub.add(vm);}
    if(i===0){const zp=[];C.forEach(o=>{const s=Math.max(1.2,Math.max(o.w,o.d)+0.8);zp.push(box(o.c[0]-s/2,o.c[0]+s/2,o.c[1]-s/2,o.c[1]+s/2,f.lv-SLAB-0.55,f.lv-SLAB-0.05));zp.push(box(o.c[0]-o.w/2,o.c[0]+o.w/2,o.c[1]-o.d/2,o.c[1]+o.d/2,f.lv-SLAB-0.05,f.lv-SLAB));vol+=s*s*0.5;nZap++;});
      const zm=mesh(merge(zp),MAT_EST.zap);if(zm){zm.userData.floor=i;sub.add(zm);}}
  });
  {const f=F[F.length-1],G=PROJ.geo[f.g],sub=new THREE.Group();sub.userData.roof=true;const r=mesh(extr(G.slab,0.25,f.lv+f.h-0.25),MAT_EST.losa);r.userData.floor=F.length-1;sub.add(r);root.add(sub);vol+=polyArea(G.slab)*0.25;}
  return {root,stats:{nCol,lViga,vol,nZap}};
}
function disposeStruct(){if(!STRUCT.grp)return;scene.remove(STRUCT.grp);STRUCT.grp.traverse(n=>{if(n.geometry)n.geometry.dispose();});STRUCT.grp=null;STRUCT.proj=null;}
function applyStruct(){
  if(!STRUCT.on){if(STRUCT.grp)STRUCT.grp.visible=false;return;}
  if(!PROJ||!groups.length)return;
  if(!STRUCT.grp||STRUCT.proj!==PROJ){disposeStruct();const r=buildStruct();STRUCT.grp=r.root;STRUCT.stats=r.stats;STRUCT.proj=PROJ;scene.add(r.root);}
  STRUCT.grp.visible=true;const n=PROJ.floors.length;
  groups.forEach((g,i)=>{const s=STRUCT.grp.children[i];if(s){s.position.y=g.position.y;s.visible=mode==='ext'||i===sel;}g.visible=false;});
  const rs=STRUCT.grp.children[n];if(rs){rs.position.y=roofGroup?roofGroup.position.y:0;rs.visible=mode==='ext';}
  if(roofGroup)roofGroup.visible=false;
  const S=STRUCT.stats,h=$('hint');h.hidden=false;
  h.textContent=`Estructura: ${S.nCol} columnas · ${Math.round(S.lViga).toLocaleString('es-BO')} m de vigas · ${S.nZap} zapatas · ≈ ${Math.round(S.vol).toLocaleString('es-BO')} m³ de hormigón (estimado a partir del plano)`;
  shadowsDirty();
}
function toggleStruct(){STRUCT.on=!STRUCT.on;if(!STRUCT.on){if(STRUCT.grp)STRUCT.grp.visible=false;}layout();toolState();shadowsDirty();}
$('estBtn').addEventListener('click',toggleStruct);
const fmt=n=>(+n||0).toLocaleString('es-BO',{minimumFractionDigits:2,maximumFractionDigits:2});
const lvF=v=>(v>=0?'+':'−')+fmt(Math.abs(v));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function renderStats(){
  const st=PROJ.stats||(()=>{const F=PROJ.floors,tot=F.reduce((s,f)=>s+(+f.a||0),0),last=F[F.length-1];
    return [[fmt(tot),'m² construidos'],[String(F.length),'pisos'],[lvF(F[0].lv),'m nivel inferior'],[lvF(last.lv+last.h),'m nivel de cubierta']];})();
  $('stats').innerHTML=st.map(s=>`<div class="stat"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join('');
  $('foot').textContent=(PROJ.foot||'Muros, columnas, ambientes y mobiliario detectados automáticamente desde el plano en PDF. Acabados y mobiliario referenciales.')+(LIB.credits&&LIB.credits.length?' Modelos y texturas: '+LIB.credits.join('; ')+'.':'');
}
function renderLegend(){$('legend').innerHTML=Object.values(FIN).map(f=>`<span><i style="background:${f.c}"></i>${f.n}</span>`).join('');}
function renderList(){
  const list=$('list');list.innerHTML='';
  [...PROJ.floors].map((f,i)=>({f,i})).reverse().forEach(({f,i})=>{
    const b=document.createElement('button');b.className='fl';b.type='button';b.setAttribute('aria-pressed',String(i===sel));
    b.innerHTML=`<span class="lv">${lvF(f.lv)}</span><span class="nm">${esc(f.n)}</span><span class="ar">${fmt(f.a)}</span>`;
    b.addEventListener('click',()=>{if(mode==='ext')select(sel===i?-1:i);else enterInterior(i);});
    list.appendChild(b);
  });
}
function renderDetail(){
  const d=$('detail');
  if(sel<0){d.innerHTML=`<p class="sec-h">Elegí una planta</p><p class="note">Tocá un piso en el edificio o en la lista. Desde ahí podés ver su plano y entrar a recorrerlo por dentro.</p>`;return;}
  const f=PROJ.floors[sel],G=PROJ.geo[f.g],units=G.units||[];
  d.innerHTML=`<h2>${esc(f.n)}</h2>
   <dl class="facts"><div><dt>Nivel</dt><dd>${lvF(f.lv)} m</dd></div><div><dt>Superficie</dt><dd>${fmt(f.a)} m²</dd></div><div><dt>Altura</dt><dd>${fmt(f.h)} m</dd></div></dl>
   ${f.u?`<p>${esc(f.u)}</p>`:''}
   <div class="acts">${mode==='ext'?'<button class="btn primary" id="goIn" type="button">Ver por dentro</button>':'<button class="btn primary" id="goWalk" type="button"><svg class="ico"><use href="#'+(mode==='walk'?'i-frame':'i-walk')+'"/></svg>'+(mode==='walk'?'Vista desde arriba':'Recorrer a pie')+'</button>'}${PROJ.planUrl[f.g]?'<button class="btn" id="goPlan" type="button"><svg class="ico"><use href="#i-plan"/></svg>Ver plano</button>':''}</div>
   ${mode!=='ext'&&(units.length||(G.labels||[]).length)?`<p class="sub-h">Ir a un ambiente</p><div class="chips">${units.map((u,j)=>`<button class="chip" data-u="${j}" type="button">${esc(u[0])}</button>`).join('')}${(G.labels||[]).map((l,j)=>`<button class="chip" data-r="${j}" type="button">${esc(cap(l[0]))}</button>`).join('')}</div>`:''}`;
  $('goIn')&&$('goIn').addEventListener('click',()=>enterInterior(sel));
  $('goWalk')&&$('goWalk').addEventListener('click',()=>mode==='walk'?enterInterior(sel):startWalk());
  $('goPlan')&&$('goPlan').addEventListener('click',openPlan);
  d.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{const l=c.dataset.u!==undefined?units[+c.dataset.u]:G.labels[+c.dataset.r];startWalk([l[1],l[2]]);}));
}
function select(i){sel=i;renderList();renderDetail();layout();}
function enterInterior(i){walkState=null;sel=i;mode='int';renderList();renderDetail();layout();controls.enabled=true;flyTo(fitView(floorBox(i),new THREE.Vector3(0.3,1.25,0.85),0.8));}
function exitInterior(){walkState=null;mode='ext';renderList();renderDetail();layout();controls.enabled=true;homeView();}

/* ---------- walk ---------- */
const keys={};
function navFor(i){
  const f=PROJ.floors[i],rg=PROJ.rooms[f.g];if(rg.nav)return rg.nav;
  const g=new Plan2Geo.Grid(rg.w,rg.h);
  for(let j=0;j<g.d.length;j++)g.d[j]=(rg.block.d[j]||!rg.ins.d[j])?1:0;
  (rg.hideAuto?[]:(rg.solids||[])).concat(rg.manualRects||[]).forEach(p=>{const xs=p.map(q=>q[0]),zs=p.map(q=>q[1]);
    const x0=Math.floor((Math.min(...xs)+0.04-rg.mx)*rg.R),x1=Math.ceil((Math.max(...xs)-0.04-rg.mx)*rg.R),y0=Math.floor((Math.min(...zs)+0.04-rg.mz)*rg.R),y1=Math.ceil((Math.max(...zs)-0.04-rg.mz)*rg.R);
    for(let y=Math.max(0,y0);y<Math.min(rg.h,y1);y++)for(let x=Math.max(0,x0);x<Math.min(rg.w,x1);x++)g.d[y*rg.w+x]=1;});
  rg.nav={g:Plan2Geo.morph(g,5,true),R:rg.R,w:rg.w,h:rg.h,mx:rg.mx,mz:rg.mz};return rg.nav;
}
const cellOf=(n,x,z)=>[Math.floor((x-n.mx)*n.R),Math.floor((z-n.mz)*n.R)];
function navFree(n,x,z){const[X,Y]=cellOf(n,x,z);return X>=0&&Y>=0&&X<n.w&&Y<n.h&&!n.g.d[Y*n.w+X];}
function nearestFree(n,x,z){const[X,Y]=cellOf(n,x,z);for(let r=0;r<80;r++)for(let oy=-r;oy<=r;oy++)for(let ox=-r;ox<=r;ox++){if(Math.max(Math.abs(ox),Math.abs(oy))!==r)continue;const a=X+ox,b=Y+oy;if(a>=0&&b>=0&&a<n.w&&b<n.h&&!n.g.d[b*n.w+a])return[(a+0.5)/n.R+n.mx,(b+0.5)/n.R+n.mz];}return[x,z];}
function sightClear(n,a,b){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(L*n.R*2));for(let i=0;i<=k;i++){const t=i/k;if(!navFree(n,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))return false;}return true;}
function findPath(n,from,to){
  to=nearestFree(n,to[0],to[1]);
  const[sx,sy]=cellOf(n,from[0],from[1]),[tx,ty]=cellOf(n,to[0],to[1]),W=n.w,N=W*n.h,prev=new Int32Array(N).fill(-1),q=new Int32Array(N);
  const s0=sy*W+sx,t0=ty*W+tx;if(s0<0||s0>=N)return[to];let qh=0,qt=0;q[qt++]=s0;prev[s0]=s0;
  const D=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  while(qh<qt){const j=q[qh++];if(j===t0)break;const x=j%W,y=(j/W)|0;
    for(const[dx,dy]of D){const a=x+dx,b=y+dy;if(a<0||b<0||a>=W||b>=n.h)continue;const k=b*W+a;if(prev[k]>=0||n.g.d[k])continue;if(dx&&dy&&(n.g.d[y*W+a]||n.g.d[b*W+x]))continue;prev[k]=j;q[qt++]=k;}}
  if(prev[t0]<0)return null;
  const cells=[];for(let j=t0;j!==s0;j=prev[j])cells.push([((j%W)+0.5)/n.R+n.mx,(((j/W)|0)+0.5)/n.R+n.mz]);cells.reverse();
  const out=[];let cur=from,i=0;while(i<cells.length){let k=cells.length-1;while(k>i&&!sightClear(n,cur,cells[k]))k--;out.push(cells[k]);cur=cells[k];i=k+1;}
  return out;
}
function startWalk(at){
  const f=PROJ.floors[sel],G=PROJ.geo[f.g];
  if(!at){const u=(G.units&&G.units[0])||(G.labels||[]).find(l=>/ESTAR|SAL|LOCAL|PARQUEO|LIVING/.test(l[0]))||(G.labels||[])[0]||[0,0,0];at=[u[1],u[2]];}
  const n=navFor(sel);at=nearestFree(n,at[0],at[1]);
  mode='walk';tween=null;controls.enabled=false;renderDetail();layout();
  const fwd=new THREE.Vector3();camera.getWorldDirection(fwd);
  walkState={pos:new THREE.Vector3(at[0],f.lv+EYE,at[1]),yaw:Math.atan2(-fwd.x,-fwd.z),pitch:-0.08,path:null,y:f.lv+EYE,nav:n};
  camera.position.copy(walkState.pos);
}
function tryMove(w,dx,dz){
  const n=w.nav,p=w.pos;
  if(navFree(n,p.x+dx,p.z+dz)){p.x+=dx;p.z+=dz;return true;}
  if(navFree(n,p.x+dx,p.z)){p.x+=dx;return true;}
  if(navFree(n,p.x,p.z+dz)){p.z+=dz;return true;}
  return false;
}
addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;keys[e.key.toLowerCase()]=true;if(e.key==='Escape'){if(!$('modal').hidden)closePlan();else if(!$('libModal').hidden)closeLib();else if(!$('upModal').hidden)$('upModal').hidden=true;else if(SHOP.on)closeShop();else if(WIN.on)closeWin();else if(DOOR.on)closeDoor();else if(ZOC.on)closeZoc();else if(FAC.on)closeFac();else if(PISO.on)closePiso();else if(WR.on){if(WR.ghost)wrCancel();else closeWr();}else if(FINC.on&&!FINC.draw)closeFin();else if(FURN.on&&!FURN.item&&!FURN.sel)closeFurnish();}});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let down=null;
const el=renderer.domElement;
el.addEventListener('pointerdown',e=>{if(wrPointerDown(e)){down={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,wr:true};return;}if(furnPointerDown(e)){down={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,furn:true};return;}down={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY};if(mode==='walk')el.setPointerCapture(e.pointerId);});
el.addEventListener('pointermove',e=>{wrPointerMove(e);furnPointerMove(e);if(!down||mode!=='walk')return;const dx=e.clientX-down.lx,dy=e.clientY-down.ly;down.lx=e.clientX;down.ly=e.clientY;walkState.yaw+=dx*0.0045;walkState.pitch=Math.max(-1.2,Math.min(1.2,walkState.pitch+dy*0.0045));});
el.addEventListener('pointerup',e=>{
  if(!down||!PROJ)return;const click=Math.hypot(e.clientX-down.x,e.clientY-down.y)<(e.pointerType==='touch'?12:6);down=null;
  if(wrPointerUp(e,click))return;if(furnPointerUp(e,click))return;if(!click)return;
  const r=el.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
  if(TECH.on&&sel>=0&&mode==='int'){const h=ray.intersectObject(groups[sel].userData.floorMesh,false)[0];if(h){const rg=PROJ.rooms[PROJ.floors[sel].g],L=kindAt(rg,h.point.x,h.point.z);if(L){const k=sel+':'+rg.labels.indexOf(L);if(techRooms().some(r=>sel+':'+r.li===k)){TECH.room=k;renderTech();}else toast('Ese ambiente no lleva techo decorativo.');}}return;}
  if(FINC.on&&sel>=0&&(mode==='int'||mode==='walk')){const h=ray.intersectObject(groups[sel].userData.floorMesh,false)[0];if(h&&FINC.draw){FINC.draw.push([h.point.x,h.point.z]);if(FINC.draw.length===2){const[a,b]=FINC.draw;FINC.draw=null;saveBound([a[0],a[1],b[0],b[1]]);}else $('finNote').textContent='Ahora tocá la esquina opuesta.';return;}if(h){const rg=PROJ.rooms[PROJ.floors[sel].g],L=kindAt(rg,h.point.x,h.point.z);if(L){FINC.room=rg.labels.indexOf(L);renderFin();}}return;}
  if(mode==='walk'){const h=ray.intersectObject(groups[sel].userData.floorMesh,false)[0];if(h){const p=findPath(walkState.nav,[walkState.pos.x,walkState.pos.z],[h.point.x,h.point.z]);walkState.path=p&&p.length?p:null;}return;}
  if(mode==='int'){const h=ray.intersectObject(groups[sel].userData.floorMesh,false)[0];if(h)startWalk([h.point.x,h.point.z]);return;}
  const hit=ray.intersectObjects(groups.filter(g=>g.visible).concat(STRUCT.on&&STRUCT.grp?[STRUCT.grp]:[]),true).find(h=>h.object.userData.floor!==undefined&&h.object.visible);
  select(hit?hit.object.userData.floor:-1);
});
el.addEventListener('dblclick',()=>{if(mode==='ext'&&sel>=0)enterInterior(sel);});
el.addEventListener('wheel',e=>{if(mode!=='walk')return;e.preventDefault();const s=Math.max(-0.4,Math.min(0.4,-e.deltaY*0.004)),n=Math.ceil(Math.abs(s)/0.05);for(let i=0;i<n;i++)tryMove(walkState,-Math.sin(walkState.yaw)*s/n,-Math.cos(walkState.yaw)*s/n);walkState.path=null;},{passive:false});
function stepWalk(dt){
  const w=walkState,f=new THREE.Vector3(-Math.sin(w.yaw),0,-Math.cos(w.yaw)),r=new THREE.Vector3(-f.z,0,f.x),v=new THREE.Vector3();
  if(keys.w||keys.arrowup)v.add(f);if(keys.s||keys.arrowdown)v.sub(f);if(keys.d)v.add(r);if(keys.a)v.sub(r);
  if(keys.arrowleft)w.yaw+=dt*1.6;if(keys.arrowright)w.yaw-=dt*1.6;
  const sp=keys.shift?3.6:2.2;
  if(v.lengthSq()){w.path=null;v.normalize().multiplyScalar(sp*dt);tryMove(w,v.x,v.z);}
  else if(w.path&&w.path.length){const t=w.path[0],dx=t[0]-w.pos.x,dz=t[1]-w.pos.z,L=Math.hypot(dx,dz);
    if(L<0.06){w.path.shift();}else{const st=Math.min(L,dt*2.6);if(!tryMove(w,dx/L*st,dz/L*st))w.path=null;
      const ty=Math.atan2(-dx,-dz);let dy=ty-w.yaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;w.yaw+=dy*Math.min(1,dt*3);}}
  const moving=v.lengthSq()>0||(w.path&&w.path.length>0),bob=moving?Math.sin(performance.now()/160)*0.012:0;
  camera.position.set(camera.position.x+(w.pos.x-camera.position.x)*0.4,w.pos.y+bob,camera.position.z+(w.pos.z-camera.position.z)*0.4);
  camera.rotation.order='YXZ';camera.rotation.set(w.pitch,w.yaw,0);
}

/* ---------- furnish mode (manual placement) ---------- */
const FURN={on:false,item:null,ghost:null,sel:null,drag:false,box:null};
let LAYOUTS={};
const layoutKey=i=>(currentId||'x')+'__'+PROJ.floors[i].k;
const canEditLayout=()=>!!(PROJ&&((DB&&ASSETS)||currentId==='__preview'));
function curLayout(i){const k=layoutKey(i);return LAYOUTS[k]||(LAYOUTS[k]={items:[],hideAuto:false});}
let saveT=null;
function saveLayout(i){const k=layoutKey(i),L=curLayout(i);clearTimeout(saveT);if(!DB||currentId==='__preview')return;
  saveT=setTimeout(()=>{DB.doc('layouts/'+k).set({items:L.items,hideAuto:!!L.hideAuto,wr:L.wr||[],updatedAt:Date.now()}).then(()=>toast('Cambios guardados')).catch(()=>{$('furnNote').textContent='No se pudo guardar. Revisá tu conexión.';toast('No se pudo guardar. Revisá tu conexión.','err');});},500);}
function manualItem(id){return libItems().find(i=>i.id===id&&i.kind==='model');}
async function renderManual(i){
  const g=groups[i];if(!g)return;const f=PROJ.floors[i],L=curLayout(i);
  if(g.userData.manual){g.remove(g.userData.manual);}
  const mg=new THREE.Group();mg.userData.manualRoot=true;g.add(mg);g.userData.manual=mg;
  const loaded=await Promise.all(L.items.map(async u=>{const it=manualItem(u.asset);if(!it)return null;try{return {u,it,M:await loadModel(u.fin&&it.finishes?{...it,finish:u.fin}:it)};}catch(e){return null;}}));
  if(g.userData.manual!==mg)return;
  loaded.forEach(x=>{if(!x)return;const o=x.M.proto.clone(true);const s=(+x.it.scale||1)*(x.u.s||1);o.scale.setScalar(s);o.rotation.y=x.u.rot||0;
    o.position.set(x.u.x,f.lv+(x.it.anchor==='ceiling'?(f.h-SLAB):0),x.u.z);o.userData={manual:true,uid:x.u.uid};mg.add(o);if(x.it.light)Luces.applyTo(o,x.it,x.u);});
  applyHideAuto(i);updateNavManual(i);shadowsDirty();
  if(FURN.sel&&FURN.sel.floor===i){const o=mg.children.find(c=>c.userData.uid===FURN.sel.uid);if(o)selectManual(o,i);else deselect();}
}
function applyHideAuto(i){const g=groups[i],L=curLayout(i);g.traverse(o=>{if(o.userData&&o.userData.furn&&!o.userData.manual)o.visible=SHOWF&&!L.hideAuto&&!(WR.hideAuto&&o.userData.asset===wrAutoId());});}
function updateNavManual(i){const f=PROJ.floors[i],rg=PROJ.rooms[f.g],mg=groups[i].userData.manual;rg.manualRects=[];
  if(mg)mg.children.forEach(o=>{const b=new THREE.Box3().setFromObject(o);if(b.max.y-f.lv<0.25||b.min.y-f.lv>1.6)return;rg.manualRects.push([[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]]);});
  wrItems(i).forEach(u=>{rg.manualRects.push(wrFoot(u,0));});
  rg.hideAuto=curLayout(i).hideAuto;rg.nav=null;if(walkState&&sel===i)walkState.nav=navFor(i);}
function openFurnish(){if(typeof WR!=="undefined"&&WR.on)closeWr();if(typeof FAC!=="undefined"&&FAC.on)closeFac();if(typeof PISO!=="undefined"&&PISO.on)closePiso();if(ZOC.on)closeZoc();if(FINC.on)closeFin();if(SHOP.on)closeShop();if(WIN.on)closeWin();if(DOOR.on)closeDoor();if(typeof CORT!=='undefined'&&CORT.on)closeCort();if(typeof TECH!=='undefined'&&TECH.on)closeTech();FURN.on=true;showPanel($('furnPanel'));$('hideAuto').checked=!!curLayout(sel).hideAuto;renderFurnGrid();$('hint').hidden=true;toolState();
  if(!DB&&currentId!=='__preview')$('furnNote').textContent='Estás en modo lectura: lo que coloques no se guardará.';}
function closeFurnish(){FURN.on=false;hidePanel($('furnPanel'));cancelPlacing();deselect();toolState();}
$('furnBtn').addEventListener('click',()=>FURN.on?closeFurnish():openFurnish());
$('furnClose').addEventListener('click',closeFurnish);
$('hideAuto').addEventListener('change',e=>{const L=curLayout(sel);L.hideAuto=e.target.checked;applyHideAuto(sel);updateNavManual(sel);saveLayout(sel);shadowsDirty();});
FURN.cat='all';
const furnCatOf=i=>i.category||(Assets.TYPES[i.type]||['deco'])[0];
const furnModels=()=>libItems().filter(i=>i.kind==='model'&&i.type!=='kitchenKit');
function renderFurnCats(){const all=furnModels(),n={};all.forEach(i=>{const c=furnCatOf(i);n[c]=(n[c]||0)+1;});
  const cats=[['all','Todo',all.length]].concat(Object.entries(Assets.CATEGORIES).filter(([k])=>n[k]).map(([k,v])=>[k,v,n[k]]));
  if(!cats.some(c=>c[0]===FURN.cat))FURN.cat='all';
  keepFocus($('furnCats'),'data-fc',()=>{$('furnCats').innerHTML=cats.map(([k,v,c])=>`<button class="cat" role="tab" type="button" data-fc="${k}" aria-selected="${FURN.cat===k}">${esc(v)} <small>${c}</small></button>`).join('');});
  $('furnCats').querySelectorAll('[data-fc]').forEach(b=>b.addEventListener('click',()=>{FURN.cat=b.dataset.fc;renderFurnGrid();$('furnBody').scrollTop=0;}));}
function renderFurnGrid(){renderFurnCats();const c=FURN.cat,items=furnModels().filter(i=>c==='all'||furnCatOf(i)===c);
  keepFocus($('furnGrid'),'data-fi',()=>{$('furnGrid').innerHTML=items.length?`<div class="tiles two">${items.map(i=>{const on=!!(FURN.item&&FURN.item.id===i.id);
    return `<button class="tile" type="button" data-fi="${esc(i.id)}" aria-pressed="${on}"${on&&!FURN.ghost?' aria-busy="true"':''}><span class="tile-well">${thumbUrl(i)?`<img src="${esc(thumbUrl(i))}" alt="" loading="lazy">`:`<span class="tile-ph"><svg class="ico"><use href="#i-cube"/></svg></span>`}${on&&FURN.ghost?'<span class="badge">Tocá el piso</span>':''}</span><span class="tile-name">${esc(i.name)}</span><span class="tile-meta">${esc(dimsTxt(i))}</span></button>`;}).join('')}</div>`
    :`<div class="empty"><b>No hay modelos en esta categoría</b><span>Agregalos desde el Catálogo.</span></div>`;});
  $('furnGrid').querySelectorAll('[data-fi]').forEach(b=>b.addEventListener('click',()=>{if(FURN.item&&FURN.item.id===b.dataset.fi)cancelPlacing();else startPlacing(b.dataset.fi);}));}
async function startPlacing(id){cancelPlacing();deselect();const it=manualItem(id);if(!it)return;FURN.item=it;renderFurnGrid();
  $('furnNote').textContent='Cargando '+it.name+'…';
  try{const M=await loadModel(it);if(FURN.item!==it)return;const o=M.proto.clone(true);o.scale.setScalar(+it.scale||1);o.traverse(n=>{if(n.isMesh){n.castShadow=false;}});o.visible=false;scene.add(o);FURN.ghost=o;
    $('furnNote').textContent='Tocá el piso para colocar '+it.name+'. R gira, Esc cancela.';renderFurnGrid();}catch(e){$('furnNote').textContent='No se pudo cargar este modelo.';FURN.item=null;renderFurnGrid();toast('No se pudo cargar '+it.name+'. Probá de nuevo.','err');}}
function cancelPlacing(){if(FURN.ghost){scene.remove(FURN.ghost);FURN.ghost=null;}if(FURN.item)$('furnNote').textContent='Elegí un mueble y tocá el piso para colocarlo. Tocá un mueble colocado para moverlo, girarlo o cambiar su acabado.';FURN.item=null;if(!$('furnPanel').hidden)renderFurnGrid();}
function floorHit(e){const r=el.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);const h=ray.intersectObject(groups[sel].userData.floorMesh,false)[0];return h?h.point:null;}
const snap=v=>Math.round(v*20)/20;
function selectManual(o,i){FURN.sel={uid:o.userData.uid,floor:i,obj:o};if(FURN.box)scene.remove(FURN.box);FURN.box=new THREE.BoxHelper(o,new THREE.Color(css('--accent')));scene.add(FURN.box);
  const u=curLayout(i).items.find(x=>x.uid===o.userData.uid),it=u&&manualItem(u.asset);showPanel($('selTool'));selInfo(o,it,u);}
function selInfo(o,it,u){const b=new THREE.Box3().setFromObject(o),d=b.getSize(new THREE.Vector3()),th=it&&thumbUrl(it);
  const fins=it&&it.finishes||[];$('selFinW').hidden=$('selFin').hidden=!fins.length;
  $('selFin').innerHTML=fins.map(f=>{const F=Assets.FINISHES[f]||{};const on=((u&&u.fin)||it.finish)===f;return `<button type="button" class="swatch" data-fin="${f}" aria-pressed="${on}" title="${esc(F.label||f)}" aria-label="Acabado ${esc(F.label||f)}" style="--sw:${F.swatch||'#999'}"></button>`;}).join('');
  const alt=it?libItems().filter(x=>x.kind==='model'&&x.type===it.type):[];$('selSwapW').hidden=alt.length<2;
  $('selSwap').innerHTML=alt.map(x=>`<option value="${esc(x.id)}" ${x.id===it.id?'selected':''}>${esc(x.name)}</option>`).join('');
  renderLuz(it,u);
  $('selTitle').textContent=it?it.name:'Mueble';$('selName').textContent=`${fmt(d.x)} × ${fmt(d.z)} m en planta`;$('selThumb').hidden=!th;if(th)$('selThumb').src=th;$('selScale').textContent=Math.round(((u&&u.s)||1)*100)+' %';}
function renderLuz(it,u){const box=$('selLuz');if(!it||!it.light){box.hidden=true;box.innerHTML='';return;}
  const c=Luces.cfg(it,u);box.hidden=false;
  box.innerHTML=`<button type="button" class="btn sm${c.on?' is-done':''}" data-luz="on" aria-pressed="${c.on}">${c.on?'<svg class="ico"><use href="#i-check"/></svg>Encendida':'Apagada'}</button>`+
    `<span class="grp" role="group" aria-label="Temperatura de color">${Luces.TEMPS.map(t=>`<button type="button" class="swatch" data-k="${t.k}" aria-pressed="${c.k===t.k}" title="${esc(t.name)}" aria-label="${esc(t.name)}" style="--sw:${t.hex}"></button>`).join('')}</span>`+
    `<label for="luzI">Intensidad <input type="range" id="luzI" min="0.2" max="1.6" step="0.05" value="${c.i}" data-luz="i"><output id="luzIo">${Math.round(c.i*100)} %</output></label>`+
    (it.light.drop?`<label for="luzD">Cable <input type="range" id="luzD" min="20" max="160" step="5" value="${Math.round((c.drop||it.light.drop)*100)}" data-luz="drop"><output id="luzDo">${Math.round((c.drop||it.light.drop)*100)} cm</output></label>`:'');}
function setLuz(ch,full){const u=selU();if(!u||!FURN.sel)return;const it=manualItem(u.asset);if(!it||!it.light)return;
  u.light={...(u.light||{}),...ch};Luces.applyTo(FURN.sel.obj,it,u);FURN.box&&FURN.box.update();
  if(ch.drop!=null)updateNavManual(FURN.sel.floor);saveLayout(FURN.sel.floor);if(full)renderLuz(it,u);}
$('selLuz').addEventListener('click',e=>{const b=e.target.closest('[data-luz="on"],[data-k]');if(!b)return;const u=selU();if(!u)return;const it=manualItem(u.asset),c=Luces.cfg(it,u);
  if(b.dataset.luz==='on')setLuz({on:!c.on},true);else setLuz({k:+b.dataset.k,on:true},true);});
$('selLuz').addEventListener('input',e=>{const r=e.target.closest('[data-luz]');if(!r||r.type!=='range')return;
  if(r.dataset.luz==='i'){setLuz({i:+r.value,on:true});$('luzIo').textContent=Math.round(r.value*100)+' %';}
  else{setLuz({drop:+r.value/100});$('luzDo').textContent=r.value+' cm';}});
function deselect(){FURN.sel=null;FURN.drag=false;if(FURN.box){scene.remove(FURN.box);FURN.box=null;}hidePanel($('selTool'));}
function selU(){if(!FURN.sel)return null;return curLayout(FURN.sel.floor).items.find(x=>x.uid===FURN.sel.uid);}
function applySel(prev){const u=selU();if(!u)return;const o=FURN.sel.obj,it=manualItem(u.asset);o.position.x=u.x;o.position.z=u.z;o.rotation.y=u.rot;o.scale.setScalar((+it.scale||1)*(u.s||1));
  {const mv=physFit(FURN.sel.floor,o);if(mv){u.x=+(u.x+mv.dx).toFixed(3);u.z=+(u.z+mv.dz).toFixed(3);}else if(prev){Object.assign(u,{x:prev.x,z:prev.z,rot:prev.rot,s:prev.s});toast('Ahí no entra: choca con una pared u otro mueble.','err');}
    o.position.x=u.x;o.position.z=u.z;o.rotation.y=u.rot;o.scale.setScalar((+it.scale||1)*(u.s||1));}
  FURN.box&&FURN.box.update();
  selInfo(o,it,u);updateNavManual(FURN.sel.floor);shadowsDirty();saveLayout(FURN.sel.floor);}
$('selFin').addEventListener('click',e=>{const b=e.target.closest('[data-fin]');const u=selU();if(!b||!u)return;u.fin=b.dataset.fin;saveLayout(FURN.sel.floor);renderManual(FURN.sel.floor);});
$('selSwap').addEventListener('change',e=>{const u=selU();if(!u)return;const it=manualItem(e.target.value);if(!it)return;u.asset=it.id;if(!(it.finishes||[]).includes(u.fin))delete u.fin;saveLayout(FURN.sel.floor);renderManual(FURN.sel.floor);toast('Cambiado por '+it.name);});
$('selMore').addEventListener('click',()=>{const f=$('selFine'),o=f.hidden;f.hidden=!o;$('selMore').setAttribute('aria-expanded',String(o));});
$('selTool').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||!FURN.sel)return;const u=selU();if(!u)return;const prev={...u};const a=b.dataset.act;
  if(a==='rl')u.rot+=Math.PI/12;else if(a==='rr')u.rot-=Math.PI/12;else if(a==='r90')u.rot+=Math.PI/2;
  else if(a==='sd')u.s=Math.max(0.5,+((u.s||1)-0.05).toFixed(2));else if(a==='su')u.s=Math.min(2,+((u.s||1)+0.05).toFixed(2));
  else if(a==='dup'){const n={...u,uid:'m'+Date.now().toString(36),x:u.x+0.5,z:u.z+0.5};curLayout(FURN.sel.floor).items.push(n);FURN.sel.uid=n.uid;saveLayout(FURN.sel.floor);renderManual(FURN.sel.floor);return;}
  else if(a==='del'){const L=curLayout(FURN.sel.floor),it=manualItem(u.asset);L.items=L.items.filter(x=>x.uid!==u.uid);const fi=FURN.sel.floor;deselect();saveLayout(fi);renderManual(fi);toast((it?it.name:'Mueble')+' eliminado');return;}
  applySel();});
function furnPointerDown(e){if(!FURN.on||mode!=='int'||!FURN.sel||FURN.item)return false;
  const r=el.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
  const h=ray.intersectObject(FURN.sel.obj,true)[0];if(h){FURN.drag=true;controls.enabled=false;const p=floorHit(e);const u=selU();FURN.prev=u?{...u}:null;FURN.dragOff=p&&u?[u.x-p.x,u.z-p.z]:[0,0];return true;}return false;}
function furnPointerMove(e){if(!FURN.on||mode!=='int')return;
  if(FURN.ghost){const p=floorHit(e);if(p){FURN.ghost.visible=true;FURN.ghost.position.set(snap(p.x),PROJ.floors[sel].lv+(FURN.item.anchor==='ceiling'?PROJ.floors[sel].h-SLAB:0),snap(p.z));}else FURN.ghost.visible=false;return;}
  if(FURN.drag&&FURN.sel){const p=floorHit(e);const u=selU();if(p&&u){u.x=snap(p.x+FURN.dragOff[0]);u.z=snap(p.z+FURN.dragOff[1]);FURN.sel.obj.position.x=u.x;FURN.sel.obj.position.z=u.z;FURN.box&&FURN.box.update();}}}
function furnPointerUp(e,click){if(!FURN.on||mode!=='int')return false;
  if(FURN.drag){FURN.drag=false;controls.enabled=true;applySel(FURN.prev);return true;}
  if(!click)return false;
  if(FURN.item&&FURN.ghost){const p=floorHit(e);if(!p)return true;const u={uid:'m'+Date.now().toString(36),asset:FURN.item.id,x:snap(p.x),z:snap(p.z),rot:FURN.ghost.rotation.y||0,s:1};
    {FURN.ghost.position.x=u.x;FURN.ghost.position.z=u.z;FURN.ghost.visible=true;const mv=physFit(sel,FURN.ghost);if(!mv){toast('Ahí no entra: choca con una pared u otro mueble.','err');return true;}u.x=+(u.x+mv.dx).toFixed(3);u.z=+(u.z+mv.dz).toFixed(3);}
    curLayout(sel).items.push(u);saveLayout(sel);FURN.sel={uid:u.uid,floor:sel,obj:null};cancelPlacing();renderManual(sel);return true;}
  const r=el.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
  const mg=groups[sel].userData.manual;const h=mg&&ray.intersectObject(mg,true)[0];
  if(h){let o=h.object;while(o.parent&&o.parent!==mg)o=o.parent;selectManual(o,sel);}else deselect();return true;}
addEventListener('keydown',e=>{if(!FURN.on||(e.target.closest&&e.target.closest('input,textarea,select')))return;
  if(e.key==='Escape'){cancelPlacing();deselect();}
  if(FURN.ghost&&(e.key==='r'||e.key==='R'))FURN.ghost.rotation.y+=Math.PI/2;
  if(FURN.sel&&(e.key==='Delete'||e.key==='Backspace')){e.preventDefault();$('selTool').querySelector('[data-act="del"]').click();}
  if(FURN.sel&&(e.key==='r'||e.key==='R'))$('selTool').querySelector('[data-act="r90"]').click();});

/* ---------- plan modal ---------- */
let zoom=1;
function openPlan(){const f=PROJ.floors[sel];$('modalT').textContent='Plano · '+f.n;const img=$('modalImg');zoom=1;img.onload=fitImg;img.src=PROJ.planUrl[f.g];$('modal').hidden=false;$('mClose').focus();}
function fitImg(){const img=$('modalImg'),sc=img.parentElement;if(!img.naturalWidth)return;const base=Math.min(sc.clientWidth-32,img.naturalWidth);img.style.width=Math.round(base*zoom)+'px';}
function closePlan(){$('modal').hidden=true;}
$('mClose').addEventListener('click',closePlan);
$('zIn').addEventListener('click',()=>{zoom=Math.min(4,zoom*1.4);fitImg();});
$('zOut').addEventListener('click',()=>{zoom=Math.max(0.5,zoom/1.4);fitImg();});
$('explode').addEventListener('input',layout);
$('back').addEventListener('click',exitInterior);
$('walkBtn').addEventListener('click',()=>startWalk());
$('reset').addEventListener('click',()=>{if(mode==='ext')homeView();else enterInterior(sel);});

function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mode==='walk'?(w<600?75:65):(w<600?52:40);camera.updateProjectionMatrix();}
new ResizeObserver(()=>{resize();if(!$('modal').hidden)fitImg();}).observe(stage);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
new MutationObserver(applyTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
let last=performance.now();
function loop(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(SUN.play){SUN.hour+=dt*0.9;if(SUN.hour>19.5)SUN.hour=5.5;$('sunHour').value=SUN.hour;$('sunOut').textContent=fmtH(SUN.hour);applySun();}
  if(Wardrobes.tick(dt))shadowsDirty();
  if(mode==='walk'&&walkState)stepWalk(dt);
  else{if(tween){const t=Math.min(1,(now-tween.s)/tween.ms),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;camera.position.lerpVectors(tween.p0,tween.p1,e);controls.target.lerpVectors(tween.t0,tween.t1,e);if(t>=1)tween=null;}controls.update();}
  Luces.update(dt,camera,sel>=0?groups[sel]:null,mode!=='ext');
  renderer.render(scene,camera);requestAnimationFrame(loop);
}

/* ---------- projects & storage ---------- */
let DB=null,ASSETS=null,USER=null,savedProjects=[],preview=null,currentId='peredo',builtinGeo=null;
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function builtinProject(){const g=[...new Set(BUILTIN.floors.map(f=>f.g))];return {...BUILTIN,geo:builtinGeo,texUrl:Object.fromEntries(g.map(k=>[k,'tex/'+k+'.png'])),planUrl:Object.fromEntries(g.map(k=>[k,'plan/'+k+'.png']))};}
function renderProjSel(){
  const s=$('projSel');const opts=[['peredo',BUILTIN.name]].concat(savedProjects.map(p=>[p.id,p.name]));if(preview)opts.push(['__preview','Vista previa: '+preview.name]);
  s.innerHTML=opts.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('');s.value=currentId;
  $('previewBanner').hidden=currentId!=='__preview';
  $('ownerActs').hidden=!(DB&&currentId!=='peredo'&&currentId!=='__preview'&&canManage);$('delConfirm').hidden=true;
}
let canManage=false;
async function openProject(id){
  currentId=id;renderProjSel();
  $('loading').hidden=false;$('loading').textContent='Cargando modelo…';
  try{
    if(id==='peredo')await buildProject(builtinProject());
    else if(id==='__preview')await buildProject(preview.project);
    else{
      let meta=savedProjects.find(p=>p.id===id);
      if(!meta&&DB){const s=await DB.doc('projects/'+id).get();if(s.exists)meta={id,...s.data()};}
      if(!meta)throw new Error('no');
      const gs=Object.keys(meta.plans||{});const geo={};
      await Promise.all(gs.map(async g=>{const s=await DB.doc(`projects/${id}/geo/${g}`).get();if(s.exists)geo[g]=JSON.parse(s.data().json);}));
      const floors=meta.floors.filter(f=>geo[f.g]);if(!floors.length)throw new Error('vacío');
      await buildProject({id,name:meta.name,sub:meta.sub,floors,geo,texUrl:Object.fromEntries(gs.map(g=>[g,meta.plans[g].tex?(window.BLOB_BASE||'/_blob/')+meta.plans[g].tex:null])),planUrl:Object.fromEntries(gs.map(g=>[g,meta.plans[g].plan?(window.BLOB_BASE||'/_blob/')+meta.plans[g].plan:null]))});
      lsSet('proj',id);
    }
    if(id==='peredo')lsSet('proj','peredo');
    $('loading').hidden=true;
  }catch(err){console.error('OPENFAIL',err&&err.stack||err);$('loading').textContent='No se pudo abrir este proyecto. Elegí otro de la lista.';}
}
$('projSel').addEventListener('change',e=>openProject(e.target.value));
$('delProj').addEventListener('click',()=>{$('delConfirm').hidden=false;});
$('delNo').addEventListener('click',()=>{$('delConfirm').hidden=true;});
$('delYes').addEventListener('click',async()=>{
  const meta=savedProjects.find(p=>p.id===currentId);if(!meta)return;$('delYes').disabled=true;
  try{for(const g of Object.keys(meta.plans||{})){await DB.doc(`projects/${meta.id}/geo/${g}`).delete();if(ASSETS){for(const k of['tex','plan'])if(meta.plans[g][k])try{await ASSETS.delete(meta.plans[g][k]);}catch(e){}}}
    await DB.doc(`projects/${meta.id}`).delete();openProject('peredo');}
  catch(e){$('delConfirm').querySelector('span').textContent='No se pudo eliminar. Probá de nuevo.';}
  $('delYes').disabled=false;
});

(async()=>{
  try{const r=await fetch('geo.json');builtinGeo=await r.json();}catch(e){$('loading').textContent='No se pudo cargar el modelo. Recargá la página.';return;}
  renderLegend();
  try{const r=await fetch('library/index.json');if(r.ok)LIB.seed=await r.json();}catch(e){}
  pisoLoadLocal();
  await resolveLibrary();
  await GLAZ_READY;await DOORS_READY;await ZOC_READY;await CORT_READY;cortLoadLocal();techLoadLocal();winLoadLocal();doorLoadLocal();zocLoadLocal();
  await openProject('peredo');
  requestAnimationFrame(loop);
  window.VISOR_LISTO=true;window.dispatchEvent(new Event('visor:listo'));
  document.fonts&&document.fonts.ready.then(applyTheme);
  if(!window.claude||!claude.use)return;
  const [db,assets,user]=await Promise.all([claude.use('db'),claude.use('assets'),claude.use('user')]);
  DB=db;ASSETS=assets;USER=user;
  canManage=!!assets||(user?await user.canEdit().catch(()=>false):false);
  $('upBtn').hidden=!(DB&&ASSETS);
  if(DB){
    DB.collection('library').onSnapshot(s=>{LIB.db=s.docs.map(d=>({id:d.id,...d.data()}));if(!$('libModal').hidden)renderLib();scheduleRebuild();},()=>{});
    DB.collection('bounds').onSnapshot(s=>{const ch=new Set();s.docs.forEach(d=>{const v=d.data().rooms||{};if(JSON.stringify(BOUNDS[d.id])!==JSON.stringify(v)){BOUNDS[d.id]=v;ch.add(d.id);}});ch.forEach(k=>{const[pid,g]=k.split('__');if(PROJ&&pid===currentId&&PROJ.geo[g])applyBounds(g);});},()=>{});
    DB.collection('layouts').onSnapshot(s=>{const n={};s.docs.forEach(d=>{n[d.id]=d.data();});const prev=LAYOUTS;LAYOUTS={...LAYOUTS,...n};
      if(PROJ&&!FURN.drag)PROJ.floors.forEach((f,i)=>{const k=layoutKey(i);if(n[k]&&(JSON.stringify(n[k].items)!==JSON.stringify((prev[k]||{}).items)||JSON.stringify(n[k].wr||[])!==JSON.stringify((prev[k]||{}).wr||[]))){if(WR.drag)return;LAYOUTS[k]={items:n[k].items||[],hideAuto:!!n[k].hideAuto,wr:n[k].wr||[]};renderManual(i);renderWr(i);}});},()=>{});
    DB.doc('settings/techos').onSnapshot(s=>{TECH.def=s.exists?techPick(s.data()):null;if(!TECH.local){TECH.state=TECH.def||{rooms:{},price:{}};techApplyAll();}if(TECH.on)renderTech();},()=>{});
    DB.doc('settings/cortinas').onSnapshot(s=>{CORT.def=s.exists?Cortinas.pick(s.data()):null;if(!CORT.local)applyCort(CORT.def||Cortinas.DEFAULT);if(CORT.on)renderCort();},()=>{});
    DB.doc('settings/fachada').onSnapshot(s=>{FAC.def=s.exists?facPick(s.data()):null;if(!FAC.local)applyFac(FAC.def||FAC_DEFAULT);if(FAC.on)renderFac();},()=>{});
    DB.doc('settings/zocalos').onSnapshot(s=>{ZOC.def=s.exists?s.data():null;if(!ZOC.local&&ZOC.def)Zocalos.set(Zocalos.pick(ZOC.def));if(ZOC.on)renderZoc();},()=>{});
    DB.doc('settings/doors').onSnapshot(s=>{DOOR.def=s.exists?s.data():null;if(!DOOR.local&&DOOR.def)applyDoor(pickDoor(DOOR.def));if(DOOR.on)renderDoor();},()=>{});
    DB.doc('settings/windows').onSnapshot(s=>{WIN.def=s.exists?s.data():null;if(!WIN.local&&WIN.def)Glazing.set(pickWin(WIN.def));if(WIN.on)renderWin();},()=>{});
    DB.doc('settings/library').onSnapshot(s=>{const d=s.exists?s.data():{};LIB.settings={active:d.active||{},paint:d.paint||{},rot:d.rot||{},over:d.over||{},client:d.client||{floors:true,walls:true}};finPerms();
      Object.entries(LIB.settings.rot).forEach(([id,r])=>{const m=LIB.seed.models.find(x=>x.id===id);if(m)m.rotY=r;});if(!$('libModal').hidden)renderLib();scheduleRebuild();},()=>{});
  }
  if(DB){
    DB.collection('projects').orderBy('createdAt','desc').onSnapshot(s=>{
      savedProjects=s.docs.map(d=>({id:d.id,...d.data()}));renderProjSel();
      const want=lsGet('proj');if(currentId==='peredo'&&want&&want!=='peredo'&&savedProjects.some(p=>p.id===want)&&!openProject._auto){openProject._auto=1;openProject(want);}
    },()=>{});
  }
})();

/* ---------- library ---------- */
const LIB_TYPES=Object.fromEntries(Object.entries(Assets.TYPES).map(([k,v])=>[k,v[1]]));
const LIB_SLOTS={wood:'Piso de madera',tile:'Cerámica de piso (baños, cocina y servicios)',porc:'Porcelanato (locales)',conc:'Hormigón (parqueos)',deck:'Deck (terrazas y balcones)',bathWall:'Cerámica de pared (baños, piso a techo)',wallFinish:'Acabado de paredes interiores'};
const PAINT_LABELS={living:'Estar y comedor',dorm:'Dormitorios',suite:'Suite',home:'Home estudio',study:'Estudio',bath:'Baños (sobre azulejo)',kitchen:'Cocina y servicios',vest:'Vestidor',comm:'Locales y recepción',park:'Parqueos',hall:'Pasillos y otros',facade:'Fachada',top:'Cantos de muros'};
const WALLC_DEF={};Object.keys(WALLC).forEach(k=>WALLC_DEF[k]='#'+WALLC[k].clone().convertLinearToSRGB().getHexString());
const LIB={seed:{models:[],textures:[],active:{}},db:[],settings:{active:{},paint:{}},models:{},tex:{},credits:[]};let CLIENT_ACTIVE={};
const gltfLoader=new THREE.GLTFLoader();
const PROC=[{id:'proc:toilet-tank',type:'toilet',style:'tank',name:'Inodoro con tanque, línea curva'},{id:'proc:toilet-wall',type:'toilet',style:'wall',name:'Inodoro suspendido con pulsador'},{id:'proc:basin-vessel',type:'basin',style:'vessel',name:'Vanitorio de teca con bacha de apoyo'},{id:'proc:basin-integrated',type:'basin',style:'integrated',name:'Mueble flotante blanco con bacha integrada'},{id:'proc:basin-pedestal',type:'basin',style:'pedestal',name:'Lavamanos de pedestal'}];
let CLIENT_OVER={};try{CLIENT_OVER=JSON.parse(localStorage.getItem('peredo.over')||'{}');}catch(e){}
const withOver=m=>{const o=(LIB.settings.over||{})[m.id],c=CLIENT_OVER[m.id];return o||c?{...m,...(o||{}),...(c||{})}:m;};
const matItems=()=>Mats.list().map(m=>({id:'mat:'+m.id,kind:'material',seed:true,name:m.name,category:m.category,surfaces:m.surfaces,thumb:m.thumb,sizeM:m.sizeM,finish:m.finish,credit:''}));
const SLOT_FILTER={wood:m=>m.surfaces.includes('piso'),tile:m=>m.surfaces.includes('piso'),porc:m=>m.surfaces.includes('piso'),conc:m=>m.surfaces.includes('piso'),deck:m=>m.surfaces.includes('piso'),
  bathWall:m=>m.surfaces.includes('pared')&&/ceramicas|piedras/.test(m.category),wallFinish:m=>m.surfaces.includes('pared')&&/pinturas|exteriores/.test(m.category)};
const libItems=()=>PROC.map(p=>({...p,kind:'proc',seed:true,credit:'Diseño propio',thumb:'library/thumbs/'+p.id.replace('proc:','proc-')+'.png'})).concat(matItems()).concat(LIB.seed.models.map(m=>withOver({...m,kind:'model',seed:true})).concat(LIB.seed.textures.map(t=>({...t,kind:'texture',seed:true})))).concat(LIB.db);
const libUrl=it=>it.seed?it.file:(window.BLOB_BASE||'/_blob/')+it.asset;
const thumbUrl=it=>it.thumbAsset?(window.BLOB_BASE||'/_blob/')+it.thumbAsset:(it.thumb||null);
const asAsset=it=>({...it,url:libUrl(it)});
function libActive(){const a={...LIB.seed.active,...(LIB.settings.active||{}),...CLIENT_ACTIVE};Object.keys(a).forEach(k=>{if(!a[k]||!libItems().some(i=>i.id===a[k]))delete a[k];});return a;}
function loadModel(it){return it.type==='kitchenKit'?Assets.loadKit(asAsset(it)):Assets.load(asAsset(it));}
function loadImage(url){return new Promise((res,rej)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=rej;i.src=url;});}
async function resolveLibrary(){
  await MATS_READY;
  const act=libActive(),items=libItems(),models={},tex={},credits=[],pbr={};
  LIB.style={};
  await Promise.all(Object.entries(act).map(async([k,id])=>{const it=items.find(i=>i.id===id);if(!it)return;if(it.kind==='proc'){LIB.style[k]=it.style;return;}
    if(it.kind==='material'){pbr[k]=it.id;return;}
    try{if(it.kind==='model'){models[k]={M:await loadModel(it),it};}else{tex[k]={img:await loadImage(libUrl(it)),tileM:+it.tileM||1.2,keep:!!it.keep};}if(it.credit)credits.push(it.credit);}catch(e){console.warn('No se pudo cargar',it.name,e);}}));
  LIB.models=models;LIB.tex=tex;LIB.credits=credits;LIB.pbr=pbr;
  if(models.kitchenKit&&models.kitchenKit.M.quartz)FM.quartzKit=models.kitchenKit.M.quartz;
  Assets.gc(10*60*1000);
  const P=LIB.settings.paint||{};Object.keys(WALLC).forEach(k=>{WALLC[k]=new THREE.Color(P[k]||WALLC_DEF[k]).convertSRGBToLinear();});
  PATTERNS=null;
  applyWallFinish();
}
const WALL_KINDS=/^(bed|bedSingle|sofa|wardrobe|desk|dresser|fridge|washer|toilet|basin|shower|nightstand|shelf)$/;
function pendBox(q){const d=q.M.dims,s=q.s||1,sw=Math.abs(Math.sin(q.rot||0))>0.5;const hx=(sw?d.z:d.x)*s/2,hz=(sw?d.x:d.z)*s/2;return Fisica.box(q.pos.x-hx,q.pos.z-hz,q.pos.x+hx,q.pos.z+hz,q.pos.y,q.pos.y+d.y*s,'modelo');}
function physFit(fi,obj,max){const g=groups[fi],W=g&&g.userData.phys;if(!W||!obj)return {dx:0,dz:0};obj.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(obj),b=Fisica.box(bb.min.x,bb.min.z,bb.max.x,bb.max.z,bb.min.y,bb.max.y),mg=g.userData.manual,extra=[];
  if(mg)mg.children.forEach(c=>{if(c===obj)return;const q=new THREE.Box3().setFromObject(c);extra.push(Fisica.box(q.min.x,q.min.z,q.max.x,q.max.z,q.min.y,q.max.y));});
  const hide=curLayout(fi).hideAuto,Wv=hide?{...W,bodies:W.bodies.filter(o=>o.stat)}:W;
  return Fisica.find(Wv,[b],{extra,max:max||1.0});}
function placeModel(pend,kind,pl,lv,loose,floorIdx){
  const E=LIB.models[kind];if(!E||!pl)return false;const M=E.M;
  let fp={W:pl.W,D:pl.D};if(pl.bed)fp={W:pl.bed.bw+0.1,D:pl.bed.bl+0.08};
  const s=Assets.scaleFor(M,E.it,fp),d=M.dims;
  const zo=WALL_KINDS.test(kind)?(-pl.D/2+d.z*s/2+0.01):0;
  pend.push({M,pos:new THREE.Vector3(pl.cx+zo*Math.sin(pl.rot),lv,pl.cz+zo*Math.cos(pl.rot)),rot:pl.rot,s,userData:{furn:loose,floor:floorIdx,asset:E.it.id}});
  return true;
}
function placeDecor(pend,d,lv,floorIdx){
  const E=LIB.models[d.k];if(!E)return;const M=E.M;const ex=d.ex||{};
  const s=ex.W?Assets.scaleFor(M,E.it,{W:ex.W,D:ex.D}):Assets.scaleFor(M,E.it,null);
  const zo=ex.wall?(M.dims.z*s/2+0.01):0;
  pend.push({M,pos:new THREE.Vector3(d.x+zo*Math.sin(d.rot),lv+d.y,d.z+zo*Math.cos(d.rot)),rot:d.rot,s,userData:{furn:!/^(toilet|basin|pendant|paperHolder)$/.test(d.k),floor:floorIdx,asset:E.it.id}});
}
let libTimer=null;
function scheduleRebuild(){clearTimeout(libTimer);libTimer=setTimeout(async()=>{await resolveLibrary();if(PROJ){const pos=camera.position.clone(),tgt=controls.target.clone(),m=mode,sl=sel,ws=walkState&&{x:walkState.pos.x,z:walkState.pos.z,yaw:walkState.yaw,pitch:walkState.pitch};
  await openProject(currentId);camera.position.copy(pos);controls.target.copy(tgt);controls.update();
  if(sl>=0&&m!=='ext'){enterInterior(sl);tween=null;camera.position.copy(pos);controls.target.copy(tgt);if(m==='walk'&&ws){startWalk([ws.x,ws.z]);walkState.yaw=ws.yaw;walkState.pitch=ws.pitch;}}}},250);}

/* ---------- library UI ---------- */
let LIB_TAB='m',LIB_CAT='all',LIB_FOCUS=null,pv=null,pvItem=null,mPending=null;
function canEditLib(){return !!(DB&&ASSETS);}
function openLib(){showPanel($('libModal'));$('libRO').hidden=canEditLib();['mAdd','tAdd','pSave','pReset'].forEach(id=>{$(id).hidden=!canEditLib();});
  renderLib();initPv();$('libClose').focus();}
$('libBtn').addEventListener('click',openLib);
function closeLib(){hidePanel($('libModal'));$('libBtn').focus({preventScroll:true});}
$('libClose').addEventListener('click',closeLib);
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{LIB_TAB=b.dataset.tab;document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',String(x===b)));
  $('libTabM').hidden=LIB_TAB!=='m';$('libTabT').hidden=LIB_TAB!=='t';$('libTabP').hidden=LIB_TAB!=='p';}));
$('mType').innerHTML=Object.entries(LIB_TYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
$('mCat').innerHTML=Object.entries(Assets.CATEGORIES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
$('mType').addEventListener('change',()=>{$('mCat').value=Assets.TYPES[$('mType').value][0];});
$('tSlot').innerHTML=Object.entries(LIB_SLOTS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
const SRC_TXT={blender:'Blender',higgsfield:'Higgsfield',khronos:'Khronos'};
function libTile(k,t,inUse,focus,attr,isStatic){
  const well=`<span class="tile-well">${t.thumb?`<img${t.cover?' class="cover"':''} src="${esc(t.thumb)}" alt="" loading="lazy">`:`<span class="tile-ph"><svg class="ico"><use href="#${t.ph?'i-frame':'i-cube'}"/></svg></span>`}${inUse?'<span class="badge"><svg class="ico"><use href="#i-check"/></svg>En uso</span>':''}</span><span class="tile-name">${esc(t.name)}</span><span class="tile-meta">${esc(t.meta||'')}</span>`;
  return isStatic?`<div class="tile is-static">${well}</div>`:`<button class="tile" type="button" ${attr}="${k}|${esc(t.id)}" aria-current="${!!focus}">${well}</button>`;}
function renderLib(){
  const act=libActive(),items=libItems(),ed=canEditLib();
  const cats=Assets.CATEGORIES,byCat={};Object.entries(Assets.TYPES).forEach(([k,[c]])=>(byCat[c]=byCat[c]||[]).push(k));
  const modelsOf=k=>items.filter(i=>(i.kind==='model'||i.kind==='proc')&&i.type===k);
  const count=c=>(byCat[c]||[]).reduce((t,k)=>t+modelsOf(k).length,0),total=Object.keys(byCat).reduce((t,c)=>t+count(c),0);
  keepFocus($('mNav'),'data-cat',()=>{$('mNav').innerHTML=[['all','Todo el catálogo',total]].concat(Object.entries(cats).filter(([c])=>byCat[c]).map(([c,v])=>[c,v,count(c)])).map(([c,v,n])=>`<button class="cat" type="button" data-cat="${c}" aria-pressed="${LIB_CAT===c}">${esc(v)}<small>${n}</small></button>`).join('');});
  const groups=Object.entries(byCat).filter(([c])=>LIB_CAT==='all'||LIB_CAT===c).map(([c,types])=>{
    const blocks=types.map(k=>{const ms=modelsOf(k);if(!ms.length&&LIB_CAT==='all')return '';
      const tiles=[{id:'',name:'Generado a medida',meta:'Se ajusta a cada ambiente',ph:true}].concat(ms.map(m=>({id:m.id,name:m.name,meta:m.kind==='proc'?'Paramétrico, a la medida':dimsTxt(m),thumb:thumbUrl(m)})));
      return `<section class="lib-sec"><h3>${esc(LIB_TYPES[k])}<small>${ms.length?ms.length+(ms.length>1?' modelos':' modelo'):'solo generado'}</small></h3><div class="tiles">${tiles.map(t=>libTile(k,t,(act[k]||'')===t.id,LIB_FOCUS&&LIB_FOCUS.k===k&&LIB_FOCUS.id===t.id,'data-lt')).join('')}</div></section>`;}).join('');
    return blocks?`<div class="cat-group"><h2 class="cat-title">${esc(cats[c])}</h2>${blocks}</div>`:'';}).join('');
  keepFocus($('mList'),'data-lt',()=>{$('mList').innerHTML=groups||`<div class="empty"><b>Todavía no hay modelos en ${esc(cats[LIB_CAT]||'esta categoría')}</b><span>${ed?'Agregá uno desde «Agregar un modelo 3D».':'El visor usa piezas generadas a la medida del plano.'}</span></div>`;});
  document.querySelectorAll('#mNav [data-cat]').forEach(b=>b.addEventListener('click',()=>{LIB_CAT=b.dataset.cat;renderLib();$('mList').scrollTop=0;}));
  document.querySelectorAll('#mList [data-lt]').forEach(b=>b.addEventListener('click',()=>{const [k,id]=b.dataset.lt.split('|');LIB_FOCUS={k,id};$('mEdit').hidden=true;renderLib();focusLib();}));
  $('tList').innerHTML=Object.entries(LIB_SLOTS).map(([k,v])=>{const ts=items.filter(i=>i.kind==='texture'&&i.slot===k),ms=items.filter(i=>i.kind==='material'&&SLOT_FILTER[k]&&SLOT_FILTER[k](i));
    const tiles=[{id:'',name:'Predeterminado',meta:'Material PBR del sistema',ph:true}].concat(ms.map(t=>({id:t.id,name:t.name,meta:(t.finish?cap(t.finish)+', módulo ':'Módulo ')+t.sizeM[0]+' × '+t.sizeM[1]+' m',thumb:t.thumb,cover:true}))).concat(ts.map(t=>({id:t.id,name:t.name,meta:'Cubre '+fmt(t.tileM)+' m'+(t.credit?', '+t.credit:''),thumb:libUrl(t),cover:true,del:ed&&!t.seed})));
    return `<section class="lib-sec"><h3>${esc(v)}<small>${tiles.length-1} opciones</small></h3><div class="tiles">${tiles.map(t=>`<div style="display:flex;flex-direction:column;gap:4px;min-width:0">${libTile(k,t,(act[k]||'')===t.id,false,'data-tt',!ed)}${t.del?`<button class="ib danger" type="button" data-del="${esc(t.id)}" style="align-self:flex-start">Quitar</button>`:''}</div>`).join('')}</div></section>`;}).join('');
  document.querySelectorAll('#tList [data-tt]').forEach(b=>b.addEventListener('click',async()=>{const [k,id]=b.dataset.tt.split('|');if((libActive()[k]||'')===id)return;b.setAttribute('aria-busy','true');delete CLIENT_ACTIVE[k];const ok=await setActive(k,id||null);renderLib();toast(ok?'Aplicado en todo el edificio':'No se pudo guardar el cambio.',ok?'ok':'err');}));
  const P=LIB.settings.paint||{};
  $('pList').innerHTML=Object.entries(PAINT_LABELS).map(([k,v])=>`<label for="pc-${k}"><input type="color" id="pc-${k}" data-k="${k}" value="${P[k]||WALLC_DEF[k]}" ${ed?'':'disabled'}>${esc(v)}</label>`).join('');
  document.querySelectorAll('#tList [data-del]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();delItem(b.dataset.del,b);}));
  $('foot').textContent=(PROJ&&PROJ.foot||'')+(LIB.credits.length?' Modelos y texturas: '+LIB.credits.join('; ')+'.':'');
  renderInsp(pvItem&&LIB_FOCUS&&pvItem.id===LIB_FOCUS.id?pvItem._M:null);
}
function focusLib(){const f=LIB_FOCUS;if(!f)return;$('mInsp').classList.remove('is-empty');
  if(!f.id){pvItem=null;initPv();if(pv.obj){pv.sc.remove(pv.obj);pv.obj=null;}$('mInsp').classList.add('is-empty');$('pvInfo').textContent='';renderInsp(null);}
  else{const it=libItems().find(i=>i.id===f.id);if(it)showPv(it);}
  if(matchMedia('(max-width:820px)').matches)$('mInsp').scrollIntoView({block:'start',behavior:RM.matches?'auto':'smooth'});}
function renderInsp(M){const box=$('pvDetail'),ins=$('mInsp');
  if(!LIB_FOCUS){box.innerHTML='';ins.classList.toggle('is-empty',!pv||!pv.obj);return;}
  const {k,id}=LIB_FOCUS,act=libActive(),ed=canEditLib(),it=id?libItems().find(i=>i.id===id):null,inUse=(act[k]||'')===id;
  if(id&&!it){LIB_FOCUS=null;box.innerHTML='';return;}
  const name=it?it.name:'Generado a medida',sc=it?(+it.scale||1):1,d=it&&it.dims;
  box.innerHTML=`<div class="insp-h"><h3>${esc(name)}</h3><p>${esc(LIB_TYPES[k]||'')}${it&&it.brand?', '+esc(it.brand):''}${it&&SRC_TXT[it.source]?', modelado en '+SRC_TXT[it.source]:''}</p></div>
   ${d?`<dl class="dims"><div><dt>Ancho</dt><dd>${cmR(d[0]*sc)} cm</dd></div><div><dt>Fondo</dt><dd>${cmR(d[2]*sc)} cm</dd></div><div><dt>Alto</dt><dd>${cmR(d[1]*sc)} cm</dd></div></dl>`:`<p class="note">${it?'Se arma con las medidas de cada baño del plano.':'El visor lo genera con las medidas exactas de cada ambiente del plano.'}</p>`}
   ${it&&(it.finishes||[]).length?`<div class="fin-row"><span class="note" style="color:var(--ink)">Acabado <b id="iFinName">${esc((Assets.FINISHES[it.finish]||{}).label||'')}</b></span><span class="grp" id="iFin">${it.finishes.map(f=>{const F=Assets.FINISHES[f]||{};return `<button type="button" class="swatch" data-fin="${f}" aria-pressed="${it.finish===f}" title="${esc(F.label||f)}" aria-label="Acabado ${esc(F.label||f)}" style="--sw:${F.swatch||'#999'}"></button>`;}).join('')}</span></div>`:''}
   <div class="insp-acts2">${ed?`<button class="btn wide ${inUse?'is-done':'primary'}" type="button" id="iUse"${inUse?' aria-disabled="true"':''}>${inUse?'<svg class="ico"><use href="#i-check"/></svg>En uso en el edificio':'Usar en el edificio'}</button>`:(inUse?'<p class="note">Es el que se usa hoy en el edificio.</p>':'')}
   ${ed&&it&&(it.kind!=='proc'||!it.seed)?`<div class="row">${it.kind!=='proc'?`<button class="btn" type="button" id="iEdit" aria-expanded="${!$('mEdit').hidden}" aria-controls="mEdit"><svg class="ico"><use href="#i-edit"/></svg>Editar medidas y materiales</button>`:''}${!it.seed?`<button class="btn danger" type="button" id="iDel" data-del="${esc(it.id)}"><svg class="ico"><use href="#i-trash"/></svg>Quitar</button>`:''}</div>`:''}</div>
   ${M?`<details class="disc"><summary>Detalles técnicos<svg class="ico"><use href="#i-chev"/></svg></summary><div class="disc-body"><p class="note">${M.tris.toLocaleString('es-BO')} triángulos. Materiales: ${esc(M.slots.join(', '))}.${it&&it.credit?' '+esc(it.credit)+'.':''}</p></div></details>`:''}`;
  const u=$('iUse');if(u)u.addEventListener('click',async()=>{if(u.getAttribute('aria-disabled')==='true')return;u.setAttribute('aria-busy','true');u.textContent='Aplicando…';delete CLIENT_ACTIVE[k];const ok=await setActive(k,id||null);renderLib();toast(ok?name+' ahora se usa en el edificio':'No se pudo guardar el cambio.',ok?'ok':'err');});
  const e=$('iEdit');if(e)e.addEventListener('click',()=>{if($('mEdit').hidden){openEditor(id);e.setAttribute('aria-expanded','true');}else{$('mEdit').hidden=true;e.setAttribute('aria-expanded','false');}});
  const x=$('iDel');if(x)x.addEventListener('click',()=>delItem(x.dataset.del,x));
  const fz=$('iFin');if(fz)fz.addEventListener('click',async e=>{const b=e.target.closest('[data-fin]');if(!b||!it)return;const f=b.dataset.fin;let ok=true;
    if(ed){LIB.settings.over={...(LIB.settings.over||{}),[it.id]:{...((LIB.settings.over||{})[it.id]||{}),finish:f}};try{await saveSettings();}catch(err){ok=false;}}
    else{CLIENT_OVER[it.id]={...(CLIENT_OVER[it.id]||{}),finish:f};try{localStorage.setItem('peredo.over',JSON.stringify(CLIENT_OVER));}catch(err){}}
    const nit=libItems().find(i=>i.id===it.id);showPv(nit);scheduleRebuild();toast(ok?'Acabado: '+(Assets.FINISHES[f]||{}).label+(ed?'':' (solo lo ves vos)'):'No se pudo guardar el acabado.',ok?'ok':'err');});}
async function openEditor(id){
  const it=libItems().find(i=>i.id===id);if(!it)return;const box=$('mEdit');box.hidden=false;
  let M=null;try{M=await loadModel(it);}catch(e){}
  const slots=(M&&M.slots)||it.materialSlots||[],presets=Assets.PBR.presets,cur=it.materials||{};
  const opt=(sel)=>`<option value="">Automático</option><option value="original" ${sel==='original'?'selected':''}>Original del modelo</option>`+Object.values(presets).map(p=>`<option value="${p.id}" ${sel===p.id?'selected':''}>${esc(p.label)}</option>`).join('');
  const dimsX=M?M.dims.x:(it.dims?it.dims[0]:1);
  box.innerHTML=`<h4>Editar medidas y materiales</h4><form class="form" id="eForm">
    <label>Nombre<input type="text" id="eName" value="${esc(it.name)}"></label>
    <label>Categoría<select id="eCat">${Object.entries(Assets.CATEGORIES).map(([k,v])=>`<option value="${k}" ${it.category===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
    <label>Tipo<select id="eType">${Object.entries(LIB_TYPES).map(([k,v])=>`<option value="${k}" ${it.type===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
    <label>Ancho real (m)<input type="number" id="eWidth" step="0.01" min="0.05" value="${(dimsX*(+it.scale||1)).toFixed(2)}"></label>
    <label>Orientación inicial<select id="eRot">${[0,90,180,270].map(r=>`<option value="${r}" ${(+it.rotY||0)===r?'selected':''}>${r}°</option>`).join('')}</select></label>
    <label>Apoyo<select id="eAnchor">${Object.entries(Assets.ANCHORS).map(([k,v])=>`<option value="${k}" ${(it.anchor||'floor')===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
    <label>Tamaño en el edificio<select id="eFit"><option value="real" ${(it.fit||'real')==='real'?'selected':''}>Medidas reales</option><option value="fit" ${it.fit==='fit'?'selected':''}>Ajustar al espacio del plano</option></select></label>
    ${slots.map((sl,i)=>`<label>Material “${esc(sl)}”<select data-slot="${esc(sl)}">${opt(cur[sl]||'')}</select></label>`).join('')}
    <div class="acts" style="grid-column:1/-1"><button class="btn primary" type="submit">Guardar cambios</button><button class="btn ghost" type="button" id="eCancel">Cancelar</button></div></form>`;
  $('eCancel').onclick=()=>{box.hidden=true;const e=$('iEdit');if(e)e.setAttribute('aria-expanded','false');};
  $('eForm').onsubmit=async e=>{e.preventDefault();const materials={};box.querySelectorAll('[data-slot]').forEach(s=>{if(s.value)materials[s.dataset.slot]=s.value;});
    const ch={name:$('eName').value.trim()||it.name,category:$('eCat').value,type:$('eType').value,scale:+((+$('eWidth').value||dimsX)/dimsX).toFixed(4),rotY:+$('eRot').value,anchor:$('eAnchor').value,fit:$('eFit').value,materials};
    if(M)ch.dims=[M.dims.x*ch.scale,M.dims.y*ch.scale,M.dims.z*ch.scale].map(v=>+v.toFixed(3));
    const sb=box.querySelector('[type=submit]');sb.setAttribute('aria-busy','true');sb.textContent='Guardando…';let ok=true;
    try{if(it.seed){LIB.settings.over={...(LIB.settings.over||{}),[id]:ch};await saveSettings();}else await DB.doc('library/'+id).update(ch);}catch(err){ok=false;}
    box.hidden=true;showPv({...it,...ch});scheduleRebuild();renderLib();toast(ok?'Cambios guardados':'No se pudo guardar. Revisá tu conexión.',ok?'ok':'err');};
}
async function saveSettings(){if(!DB)return;await DB.doc('settings/library').set({active:LIB.settings.active||{},paint:LIB.settings.paint||{},rot:LIB.settings.rot||{},over:LIB.settings.over||{},client:LIB.settings.client||{floors:true,walls:true}});}
async function setActive(k,id){LIB.settings.active={...(LIB.settings.active||{}),[k]:id||''};let ok=true;try{await saveSettings();}catch(e){ok=false;}scheduleRebuild();return ok;}
async function rotateItem(id){const it=libItems().find(i=>i.id===id);if(!it)return;const r=(((it.rotY||0)+90)%360);
  if(it.seed){LIB.settings.rot={...(LIB.settings.rot||{}),[id]:r};it.rotY=r;const sm=LIB.seed.models.find(m=>m.id===id);if(sm)sm.rotY=r;try{await saveSettings();}catch(e){}}
  else{try{await DB.doc('library/'+id).update({rotY:r});}catch(e){}}
  if(pvItem&&pvItem.id===id)showPv({...it,rotY:r});scheduleRebuild();}
async function delItem(id,btn){const it=LIB.db.find(i=>i.id===id);if(!it)return;
  if(btn.dataset.sure!=='1'){const old=btn.innerHTML;btn.dataset.sure='1';btn.classList.add('armed');btn.textContent='Confirmar: quitar';setTimeout(()=>{if(!btn.isConnected)return;btn.dataset.sure='';btn.classList.remove('armed');btn.innerHTML=old;},3000);return;}
  try{await DB.doc('library/'+id).delete();if(it.asset&&ASSETS)try{await ASSETS.delete(it.asset);}catch(e){}toast(it.name+' quitado del catálogo');if(LIB_FOCUS&&LIB_FOCUS.id===id){LIB_FOCUS=null;$('mEdit').hidden=true;}}catch(e){toast('No se pudo quitar. Revisá tu conexión.','err');}
  if(libActive()[it.type||it.slot]===id)await setActive(it.type||it.slot,null);}
function initPv(){if(pv)return;const c=$('pvCanvas');const r=new THREE.WebGLRenderer({canvas:c,antialias:true});r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=0.9;r.setPixelRatio(Math.min(devicePixelRatio,2));
  const sc=new THREE.Scene(),WC=new THREE.Color(css('--well')||'#e6e3dd');sc.background=WC;if(THREE.RoomEnvironment){const pm=new THREE.PMREMGenerator(r);sc.environment=pm.fromScene(new THREE.RoomEnvironment(),0.04).texture;pm.dispose();}sc.add(new THREE.HemisphereLight(0xffffff,0x888888,0.6));const dl=new THREE.DirectionalLight(0xffffff,0.9);dl.position.set(2,4,3);sc.add(dl);
  const fl=new THREE.Mesh(new THREE.CircleGeometry(3,48),new THREE.MeshStandardMaterial({color:0xd9d4ca,roughness:1}));fl.rotation.x=-Math.PI/2;sc.add(fl);
  const cam=new THREE.PerspectiveCamera(35,4/3,0.05,50);pv={r,sc,cam,obj:null,t:0};r.setClearColor(WC,1);r.clear();
  (function tick(){if(!$('libModal').hidden&&pv.obj){const w=c.clientWidth,h=c.clientHeight;if(w&&(c.width!==Math.round(w*r.getPixelRatio()))){r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
    pv.obj.rotation.y+=0.006;r.render(sc,cam);}requestAnimationFrame(tick);})();}
function frameObj(o,d){const R=Math.max(d.x,d.y,d.z);pv.cam.position.set(R*1.55,d.y*0.5+R*0.95,R*1.95);pv.cam.lookAt(0,d.y*0.45,0);}
function procObj(it){const W=it.type==='toilet'?0.6:0.8,D=it.type==='toilet'?0.75:0.55;const o={p:[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],h:0.8,t:it.type==='toilet'?'toilet':'bsink'};
  const r=Furn.build(THREE,o,'BAÑO',0,()=>'n',rnd,()=>0.3,()=>false,{style:k=>k===it.type?it.style:null});const g=new THREE.Group();const by={};r.parts.forEach(([m,q])=>(by[m]=by[m]||[]).push(q));
  Object.entries(by).forEach(([m,l])=>{const me=new THREE.Mesh(merge(l),FM[m]||FM.oak);g.add(me);});const box=new THREE.Box3().setFromObject(g);const c=box.getCenter(new THREE.Vector3());g.children.forEach(ch=>ch.position.set(-c.x,0,-c.z));return {proto:g,dims:box.getSize(new THREE.Vector3())};}
async function showPv(it){initPv();pvItem=it;$('pvInfo').textContent='Cargando '+it.name+'…';$('mInsp').setAttribute('aria-busy','true');
  try{if(it.kind==='proc'){const M=procObj(it);if(pv.obj)pv.sc.remove(pv.obj);pv.obj=M.proto;pv.sc.add(pv.obj);frameObj(pv.obj,M.dims);$('pvInfo').textContent='';renderInsp(null);return;}
    const M=await loadModel(it);if(pvItem!==it)return;if(pv.obj)pv.sc.remove(pv.obj);pv.obj=M.proto.clone(true);pv.obj.scale.setScalar(+it.scale||1);pv.sc.add(pv.obj);frameObj(pv.obj,M.dims);
    it._M=M;$('pvInfo').textContent='';renderInsp(M);}
  catch(e){$('pvInfo').textContent='No se pudo abrir este modelo. Revisá el archivo o probá de nuevo.';}
  finally{if(pvItem===it)$('mInsp').removeAttribute('aria-busy');}}
function b64(buf){const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
function glbToGltf(buf){const dv=new DataView(buf);if(dv.getUint32(0,true)!==0x46546C67)throw new Error('no-glb');let off=12,json=null,bin=null;
  while(off<buf.byteLength){const len=dv.getUint32(off,true),type=dv.getUint32(off+4,true);const chunk=buf.slice(off+8,off+8+len);if(type===0x4E4F534A)json=JSON.parse(new TextDecoder().decode(chunk));else if(type===0x004E4942)bin=chunk;off+=8+len;}
  if(bin&&json.buffers&&json.buffers[0])json.buffers[0].uri='data:application/octet-stream;base64,'+b64(bin);return JSON.stringify(json);}
$('mFile').addEventListener('change',async e=>{const f=e.target.files[0];$('mSave').disabled=true;mPending=null;if(!f)return;const P=t=>{$('mProg').textContent=t;};
  try{P('Leyendo modelo…');const buf=await f.arrayBuffer();let text;
    if(/\.glb$/i.test(f.name))text=glbToGltf(buf);else{text=new TextDecoder().decode(buf);const j=JSON.parse(text);if((j.buffers||[]).some(b=>b.uri&&!/^data:/.test(b.uri))||(j.images||[]).some(i=>i.uri&&!/^data:/.test(i.uri)))throw new Error('ext');}
    if(text.length>19.5*1024*1024){P('El modelo pesa más de 20 MB. Reducí las texturas (por ejemplo con gltf.report) y probá de nuevo.');return;}
    const M=await Assets.parse(text,{anchor:$('mAnchor').value});
    mPending={text,M,dims:[M.dims.x,M.dims.y,M.dims.z],slots:M.slots};$('mWidth').value=M.dims.x.toFixed(2);if(!$('mName').value)$('mName').value=f.name.replace(/\.(glb|gltf)$/i,'').replace(/[_-]+/g,' ');
    initPv();if(pv.obj)pv.sc.remove(pv.obj);pv.obj=M.proto.clone(true);pv.sc.add(pv.obj);frameObj(pv.obj,M.dims);LIB_FOCUS=null;pvItem=null;$('pvDetail').innerHTML='';$('mEdit').hidden=true;$('mInsp').classList.remove('is-empty');
    $('pvInfo').textContent=`Vista previa del archivo: ${cmR(M.dims.x)} × ${cmR(M.dims.z)} × ${cmR(M.dims.y)} cm (ancho × fondo × alto). Elegí el tipo y agregalo.`;
    P('Listo para agregar.');$('mSave').disabled=false;}
  catch(err){P(err.message==='ext'?'Este .gltf usa archivos externos. Exportalo como .glb (un solo archivo) y subilo de nuevo.':'No pude leer este archivo. Probá exportarlo como .glb.');}});
$('mForm').addEventListener('submit',async e=>{e.preventDefault();if(!mPending||!canEditLib())return;const P=t=>{$('mProg').textContent=t;};$('mSave').disabled=true;
  try{P('Subiendo…');const up=await ASSETS.upload(new Blob([mPending.text],{type:'application/json'}),{type:'application/json'});
    let thumbAsset=null;try{const url=Assets.thumbnail(mPending.M,256);const tb=await (await fetch(url)).blob();thumbAsset=(await ASSETS.upload(tb,{type:'image/png'})).id;}catch(e){}
    const type=$('mType').value,wReal=+$('mWidth').value||mPending.dims[0],scale=+(wReal/mPending.dims[0]).toFixed(4);
    const ref=await DB.collection('library').add({kind:'model',type,category:$('mCat').value||Assets.TYPES[type][0],name:$('mName').value.trim()||LIB_TYPES[type],credit:$('mCredit').value.trim(),asset:up.id,thumbAsset,
      dims:mPending.dims.map(v=>+(v*scale).toFixed(3)),scale,anchor:$('mAnchor').value,pivot:$('mAnchor').value==='wall'?'base-back':($('mAnchor').value==='ceiling'?'top-center':'base-center'),fit:$('mFit').value,rotY:0,materials:{},materialSlots:mPending.slots,source:$('mSource').value,createdAt:Date.now()});
    P('Agregado. Ya podés elegirlo como activo en "'+LIB_TYPES[type]+'".');mPending=null;$('mFile').value='';$('mName').value='';$('mCredit').value='';
    await setActive(type,ref.id);}
  catch(err){P(err&&err.code==='quota_or_state'?'Se llenó el espacio de la página. Quitá modelos que no uses.':err&&err.code==='too_large'?'El archivo es muy grande (máx. 20 MB).':'No se pudo subir. Probá de nuevo.');$('mSave').disabled=false;}});
let tPending=null;
$('tFile').addEventListener('change',e=>{tPending=e.target.files[0]||null;$('tSave').disabled=!tPending;if(tPending&&!$('tName').value)$('tName').value=tPending.name.replace(/\.\w+$/,'').replace(/[_-]+/g,' ');});
$('tForm').addEventListener('submit',async e=>{e.preventDefault();if(!tPending||!canEditLib())return;const P=t=>{$('tProg').textContent=t;};$('tSave').disabled=true;
  try{P('Subiendo…');let blob=tPending;
    const img=await loadImage(URL.createObjectURL(blob));if(Math.max(img.width,img.height)>2048){const k=2048/Math.max(img.width,img.height),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.88));}
    const up=await ASSETS.upload(blob,{type:blob.type||'image/jpeg'});const slot=$('tSlot').value;
    const ref=await DB.collection('library').add({kind:'texture',slot,name:$('tName').value.trim()||LIB_SLOTS[slot],tileM:Math.max(0.1,+$('tSize').value||1.2),asset:up.id,createdAt:Date.now()});
    P('Agregada y activada.');tPending=null;$('tFile').value='';$('tName').value='';await setActive(slot,ref.id);}
  catch(err){P('No se pudo subir la imagen. Probá con un .jpg más liviano.');$('tSave').disabled=false;}});
$('pSave').addEventListener('click',async()=>{const P={};document.querySelectorAll('#pList input[type=color]').forEach(i=>{if(i.value.toLowerCase()!==WALLC_DEF[i.dataset.k].toLowerCase())P[i.dataset.k]=i.value;});
  LIB.settings.paint=P;try{await saveSettings();$('pProg').textContent='Colores guardados.';toast('Colores guardados');}catch(e){$('pProg').textContent='No se pudo guardar. Revisá tu conexión y probá de nuevo.';toast('No se pudo guardar los colores.','err');}scheduleRebuild();});
$('pReset').addEventListener('click',()=>{document.querySelectorAll('#pList input[type=color]').forEach(i=>i.value=WALLC_DEF[i.dataset.k]);});
document.addEventListener('input',e=>{if(e.target.closest&&e.target.closest('#pList')){const P={...(LIB.settings.paint||{})};P[e.target.dataset.k]=e.target.value;LIB.settings.paint=P;scheduleRebuild();}});

/* ---------- upload module ---------- */
const UP={pdf:null,page:null,plans:[],rows:[],thumbs:{},crops:{},scale:100};
let pdfReady=null;
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function ensurePdf(){if(!pdfReady)pdfReady=(async()=>{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';return pdfjsLib;})();return pdfReady;}
$('upBtn').addEventListener('click',()=>{$('upModal').hidden=false;$('upName').focus();ensurePdf().catch(()=>{});});
$('upClose').addEventListener('click',()=>{$('upModal').hidden=true;});
const drop=$('drop');
['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('over');}));
['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('over');}));
drop.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)processPdf(f);});
$('upFile').addEventListener('change',e=>{const f=e.target.files[0];if(f)processPdf(f);e.target.value='';});
const prog=(t,id)=>{$(id||'upProg').textContent=t;};
const tick=()=>new Promise(r=>setTimeout(r,30));
async function processPdf(file){
  if(!/pdf$/i.test(file.type)&&!/\.pdf$/i.test(file.name)){prog('Ese archivo no es un PDF. Elegí el plano en PDF.');return;}
  if(file.size>20*1024*1024){prog('El PDF pesa más de 20 MB. Exportalo de nuevo con menos páginas.');return;}
  try{
    prog('Abriendo PDF…');const lib=await ensurePdf();
    const data=new Uint8Array(await file.arrayBuffer());
    const doc=await lib.getDocument({data,isEvalSupported:false,disableFontFace:true,useSystemFonts:true}).promise;
    const pn=Math.min(Math.max(1,+$('upPage').value||1),doc.numPages);
    const page=await doc.getPage(pn);UP.page=page;
    prog('Leyendo vectores del plano…');await tick();
    const ex=await Plan2Geo.extractPage(lib,page);
    if(ex.paths.length<200){prog('Este PDF no tiene dibujo vectorial (parece escaneado). Exportá el plano desde el programa de dibujo como PDF vectorial.');return;}
    UP.scale=+$('upScale').value;
    prog(`Analizando ${ex.paths.length.toLocaleString('es-BO')} trazos…`);await tick();
    const res=Plan2Geo.analyze(ex,{mPerPt:0.000352778*UP.scale});
    if(!res.plans.length){prog('No encontré plantas: los muros deben tener relleno gris. Revisá la escala o el plano.');return;}
    UP.plans=res.plans;
    prog('Generando vistas previas…');await tick();
    const vp=page.getViewport({scale:1}),s=Math.min(1.6,6000/Math.max(vp.width,vp.height));
    const cv=document.createElement('canvas'),v2=page.getViewport({scale:s});cv.width=Math.ceil(v2.width);cv.height=Math.ceil(v2.height);
    const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);
    await page.render({canvasContext:cx,viewport:v2}).promise;
    UP.plans.forEach(p=>{const[r0,r1,r2,r3]=p.region.map(v=>v*s);const c=document.createElement('canvas');c.width=Math.max(1,Math.round(r2-r0));c.height=Math.max(1,Math.round(r3-r1));
      c.getContext('2d').drawImage(cv,r0,r1,c.width,c.height,0,0,c.width,c.height);UP.crops[p.idx]=c;
      const t=document.createElement('canvas'),k=Math.min(1,440/c.width);t.width=c.width*k;t.height=c.height*k;t.getContext('2d').drawImage(c,0,0,t.width,t.height);UP.thumbs[p.idx]=t.toDataURL('image/jpeg',0.8);
      p.dx=0;p.dz=0;});
    cv.width=cv.height=1;
    UP.rows=Plan2Geo.guessFloors(UP.plans).map(r=>({...r,a:UP.plans.find(p=>p.idx===r.p).area,u:''}));
    if(!$('upName').value)$('upName').value=file.name.replace(/\.pdf$/i,'').replace(/[_-]+/g,' ');
    renderUpCards();renderUpRows();$('upStep2').hidden=false;prog(`Listo: ${UP.plans.length} plantas detectadas.`);
    $('upStep2').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){console.error(err);prog('No pude leer este PDF. Probá exportarlo de nuevo como PDF vectorial.');}
}
function renderUpCards(){
  $('upCards').innerHTML=UP.plans.map(p=>`<div class="card"><img src="${UP.thumbs[p.idx]}" alt="${esc(p.title||'Planta '+(p.idx+1))}"><div class="cb"><b>P${p.idx+1} · ${esc(p.title||'Planta sin título')}</b>
    <span>${p.walls.length} muros · ${p.labels.length} ambientes · ${fmt(p.area)} m²</span>
    <span class="tag ${p.core?'ok':'warn'}">${p.core?'Núcleo de ascensor encontrado':'Sin núcleo: ajustá la posición'}</span>
    <div class="off"><label>Ajuste X (m)<input type="number" step="0.05" value="${p.dx}" data-dx="${p.idx}" id="dx${p.idx}"></label><label>Ajuste Z (m)<input type="number" step="0.05" value="${p.dz}" data-dz="${p.idx}" id="dz${p.idx}"></label></div></div></div>`).join('');
  $('upCards').querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>{const p=UP.plans.find(q=>q.idx===+(i.dataset.dx??i.dataset.dz));p[i.dataset.dx!==undefined?'dx':'dz']=+i.value||0;}));
}
function renderUpRows(){
  const opts=p=>UP.plans.map(q=>`<option value="${q.idx}"${q.idx===p?' selected':''}>P${q.idx+1} · ${esc((q.title||'Planta').slice(0,28))}</option>`).join('');
  $('upRows').innerHTML=UP.rows.map((r,i)=>`<tr><td><input type="text" id="rn${i}" value="${esc(r.n)}" data-i="${i}" data-f="n" aria-label="Nombre del piso"></td>
    <td><select id="rp${i}" data-i="${i}" data-f="p" aria-label="Planta">${opts(r.p)}</select></td>
    <td class="num"><input type="number" step="0.01" id="rl${i}" value="${r.lv}" data-i="${i}" data-f="lv" aria-label="Nivel"></td>
    <td class="num"><input type="number" step="0.01" min="2" id="rh${i}" value="${r.h}" data-i="${i}" data-f="h" aria-label="Altura"></td>
    <td class="num"><input type="number" step="0.01" id="ra${i}" value="${r.a}" data-i="${i}" data-f="a" aria-label="Área"></td>
    <td><textarea rows="1" id="ru${i}" data-i="${i}" data-f="u" aria-label="Descripción" placeholder="Ej. 2 departamentos de 3 dormitorios">${esc(r.u)}</textarea></td>
    <td><button class="btn" type="button" data-del="${i}" aria-label="Quitar piso">✕</button></td></tr>`).join('');
  $('upRows').querySelectorAll('[data-f]').forEach(el=>el.addEventListener('input',()=>{const r=UP.rows[+el.dataset.i],f=el.dataset.f;r[f]=['lv','h','a','p'].includes(f)?+el.value:el.value;
    if(f==='p'){r.a=UP.plans.find(q=>q.idx===r.p).area;$('ra'+el.dataset.i).value=r.a;}}));
  $('upRows').querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{UP.rows.splice(+b.dataset.del,1);renderUpRows();}));
}
$('upAdd').addEventListener('click',()=>{const l=UP.rows[UP.rows.length-1];UP.rows.push({n:'Nuevo piso',p:l?l.p:UP.plans[0].idx,lv:l?+(l.lv+l.h).toFixed(2):0,h:l?l.h:3,a:l?l.a:0,u:''});renderUpRows();});
$('upRestack').addEventListener('click',()=>{let lv=UP.rows.length?UP.rows[0].lv:0;UP.rows.forEach(r=>{r.lv=+lv.toFixed(2);lv+=+r.h||3;});renderUpRows();});
function shiftGeo(p){
  const dx=p.dx||0,dz=p.dz||0,S=q=>[+(q[0]+dx).toFixed(3),+(q[1]+dz).toFixed(3)],SL=a=>a.map(S);
  return {walls:p.walls.map(SL),cols:p.cols.map(SL),outline:p.outline.map(SL),slab:SL(p.slab),labels:p.labels.map(l=>[l[0],+(l[1]+dx).toFixed(3),+(l[2]+dz).toFixed(3)]),units:p.units.map(l=>[l[0],+(l[1]+dx).toFixed(3),+(l[2]+dz).toFixed(3)]),
    furn:p.furn.map(o=>({p:SL(o.p),h:o.h})),tex:[p.tex[0]+dx,p.tex[1]+dz,p.tex[2]+dx,p.tex[3]+dz].map(v=>+v.toFixed(3)),core:p.core};
}
function maskCanvas(m){const c=document.createElement('canvas');c.width=m.w;c.height=m.h;const x=c.getContext('2d'),img=x.createImageData(m.w,m.h);
  for(let i=0;i<m.d.length;i++){const v=m.d[i]?100:255;img.data[i*4]=img.data[i*4+1]=img.data[i*4+2]=v;img.data[i*4+3]=255;}x.putImageData(img,0,0);
  if(m.w>2048){const c2=document.createElement('canvas');c2.width=2048;c2.height=Math.round(m.h*2048/m.w);c2.getContext('2d').drawImage(c,0,0,c2.width,c2.height);return c2;}return c;}
function collect(){
  const rows=UP.rows.filter(r=>r.n&&UP.plans.some(p=>p.idx===r.p)).sort((a,b)=>a.lv-b.lv);
  if(!rows.length)return null;
  const used=[...new Set(rows.map(r=>r.p))],geo={},texImg={},planUrl={},texUrl={};
  used.forEach(i=>{const p=UP.plans.find(q=>q.idx===i),g='p'+i;geo[g]=shiftGeo(p);texImg[g]=maskCanvas(p.lineMask);planUrl[g]=UP.crops[i].toDataURL('image/png');});
  const floors=rows.map((r,j)=>({k:'f'+j,g:'p'+r.p,n:r.n,lv:+r.lv,h:+r.h||3,a:+r.a||0,u:r.u||''}));
  return {name:$('upName').value.trim()||'Proyecto sin nombre',sub:$('upSub').value.trim(),floors,geo,texImg,planUrl,texUrl};
}
$('upPreview').addEventListener('click',async()=>{
  const p=collect();if(!p){prog('Agregá al menos un piso.','upProg2');return;}
  preview={name:p.name,project:p};$('upModal').hidden=true;await openProject('__preview');
});
$('pbEdit').addEventListener('click',()=>{$('upModal').hidden=false;});
$('pbDiscard').addEventListener('click',()=>{preview=null;openProject('peredo');});
$('pbSave').addEventListener('click',()=>saveProject());
$('upSave').addEventListener('click',()=>saveProject());
const toBlob=c=>new Promise(r=>c.toBlob(r,'image/png'));
async function saveProject(){
  const p=collect();if(!p){prog('Agregá al menos un piso.','upProg2');return;}
  if(!DB||!ASSETS){prog('No tenés permiso para guardar en esta página. Pedile al dueño acceso de edición.','upProg2');return;}
  const btns=[$('upSave'),$('pbSave')];btns.forEach(b=>b.disabled=true);
  $('upModal').hidden=false;
  try{
    const id='p'+Date.now().toString(36),plans={};
    const gs=Object.keys(p.geo);let n=0;
    for(const g of gs){
      n++;prog(`Subiendo planta ${n} de ${gs.length}…`,'upProg2');
      const tex=await ASSETS.upload(await toBlob(p.texImg[g]),{type:'image/png'});
      const crop=UP.crops[+g.slice(1)];let plan=null;
      if(crop){let c=crop;if(c.width>4000){const c2=document.createElement('canvas');c2.width=4000;c2.height=Math.round(c.height*4000/c.width);c2.getContext('2d').drawImage(c,0,0,c2.width,c2.height);c=c2;}plan=(await ASSETS.upload(await toBlob(c),{type:'image/png'})).id;}
      let G=p.geo[g],json=JSON.stringify(G);if(json.length>240000){G={...G,furn:[]};json=JSON.stringify(G);}
      await DB.doc(`projects/${id}/geo/${g}`).set({json});
      plans[g]={tex:tex.id,plan};
    }
    prog('Guardando proyecto…','upProg2');
    await DB.doc(`projects/${id}`).set({name:p.name,sub:p.sub,floors:p.floors,plans,createdAt:Date.now()});
    preview=null;prog('Proyecto guardado.','upProg2');$('upModal').hidden=true;
    lsSet('proj',id);currentId=id;
    setTimeout(()=>openProject(id),400);
  }catch(err){console.error(err);prog(err&&err.code==='quota_or_state'?'Se llenó el espacio de la página. Eliminá un proyecto viejo e intentá de nuevo.':'No se pudo guardar. Revisá tu conexión e intentá de nuevo.','upProg2');}
  btns.forEach(b=>b.disabled=false);
}

(function(root){
const Luces={};
let T=null,POOL=[],OPT={},tAcc=0;
const EMIT=/^lc_emisor/;

Luces.TEMPS=[
  {k:3000,name:'Cálida 3000 K',hex:'#ffb46b'},
  {k:4000,name:'Neutra 4000 K',hex:'#ffd6aa'},
  {k:6500,name:'Fría 6500 K',hex:'#eef2ff'}
];
Luces.DEF={on:true,k:3000,i:1};
Luces.FINISHES={
  'lamp-negro':{label:'Negro mate',swatch:'#1d1d1e',cuerpo:{c:'#1d1d1e',m:0,r:0.6},herraje:{c:'#1d1d1e',m:0,r:0.5}},
  'lamp-blanco':{label:'Blanco mate',swatch:'#eceae5',cuerpo:{c:'#e9e7e2',m:0,r:0.55},herraje:{c:'#e9e7e2',m:0,r:0.5}},
  'lamp-gris':{label:'Gris grafito',swatch:'#6c6e70',cuerpo:{c:'#6a6c6e',m:0,r:0.5},herraje:{c:'#6a6c6e',m:0,r:0.45}},
  'lamp-dorado':{label:'Dorado satinado',swatch:'#c8a165',cuerpo:{c:'#d6b07a',m:1,r:0.3},herraje:{c:'#d6b07a',m:1,r:0.28}},
  'lamp-cromo':{label:'Cromo',swatch:'#dfe2e5',cuerpo:{c:'#e8eaec',m:1,r:0.07},herraje:{c:'#e8eaec',m:1,r:0.07}},
  'lamp-negro-laton':{label:'Negro con latón',swatch:'linear-gradient(135deg,#1d1d1e 55%,#c8a165 55%)',cuerpo:{c:'#1d1d1e',m:0,r:0.6},herraje:{c:'#d6b07a',m:1,r:0.28}}
};
if(root.Assets)Object.assign(root.Assets.FINISHES,Luces.FINISHES);

Luces.init=function(THREE,scene,opts){
  T=THREE;OPT=opts||{};const n=OPT.max||3;
  for(let j=0;j<n;j++){const p=new T.PointLight(0xffb46b,0,4.5,2);p.castShadow=false;p.name='lampara_'+j;scene.add(p);POOL.push(p);}
};
Luces.cfg=function(it,u){return {...Luces.DEF,...((it&&it.light)||{}),...((u&&u.light)||{})};};
const tempHex=k=>(Luces.TEMPS.find(t=>t.k===k)||Luces.TEMPS[0]).hex;
const lin=h=>new T.Color(h).convertSRGBToLinear();
const MC=new Map();
function emitMat(base,c){
  const key=base.uuid+'|'+(c.on?1:0)+'|'+c.k+'|'+(+c.i).toFixed(2);if(MC.has(key))return MC.get(key);
  const m=base.clone();m.name=base.name;m.userData={...base.userData,lampBase:base};
  m.emissive=c.on?lin(tempHex(c.k)):new T.Color(0,0,0);m.emissiveIntensity=c.on?1.35*c.i:0;
  m.color=c.on?lin('#f7f3ea'):lin('#e4e1db');
  MC.set(key,m);return m;
}
function patchBase(m){if(!m||m.userData.lampPatched)return;m.userData.lampPatched=true;m.emissive=lin(tempHex(Luces.DEF.k));m.emissiveIntensity=1.35;m.color=lin('#f7f3ea');}

Luces.applyTo=function(obj,it,u){
  if(!obj||!it||!it.light)return;const c=Luces.cfg(it,u);
  let cable=null,pant=null;obj.traverse(o=>{if(o.name==='lc_cable')cable=o;else if(o.name==='lc_pantalla')pant=o;});
  if(cable&&pant&&it.light.drop){
    if(!cable.userData.base)cable.userData.base={sy:cable.scale.y,py:pant.position.y};
    const B=cable.userData.base,d0=it.light.drop,d=Math.max(0.2,Math.min(1.8,+c.drop||d0));
    cable.scale.y=B.sy*d/d0;pant.position.y=B.py-(d-d0);
  }
  obj.traverse(o=>{if(!o.isMesh||!o.material||!EMIT.test(o.material.name||''))return;
    const base=o.material.userData.lampBase||o.material;patchBase(base);o.material=emitMat(base,c);o.userData.lampEmit=true;o.userData.lampCfg=c;});
  obj.updateMatrixWorld(true);Luces.dirty=true;
};
Luces.scan=function(group){
  group.traverse(o=>{if(!o.isMesh||!o.material||!EMIT.test(o.material.name||''))return;o.userData.lampEmit=true;if(!o.material.userData.lampBase)patchBase(o.material);});
};

function points(group){
  const out=[],v=new T.Vector3(),m=new T.Matrix4();
  group.traverse(o=>{if(!o.userData||!o.userData.lampEmit||!o.visible)return;
    let vis=true,p=o;while(p){if(p.visible===false){vis=false;break;}p=p.parent;}if(!vis)return;
    const c=o.userData.lampCfg||Luces.DEF;if(!c.on)return;
    if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const ctr=o.geometry.boundingSphere.center;
    if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);v.copy(ctr).applyMatrix4(m).applyMatrix4(o.matrixWorld);out.push({p:v.clone(),c});}}
    else{v.copy(ctr).applyMatrix4(o.matrixWorld);out.push({p:v.clone(),c});}});
  return out;
}
Luces.update=function(dt,camera,group,active){
  const now=performance.now();if(now-tAcc<250&&!Luces.dirty)return;tAcc=now;Luces.dirty=false;
  const pts=active&&group?points(group):[];
  pts.forEach(q=>q.d=q.p.distanceToSquared(camera.position));pts.sort((a,b)=>a.d-b.d);
  POOL.forEach((L,j)=>{const q=pts[j];if(!q){L.intensity=0;return;}
    L.position.set(q.p.x,q.p.y-0.14,q.p.z);L.color.copy(lin(tempHex(q.c.k)));L.intensity=0.95*q.c.i;});
  Luces.lit=pts.length;
};
Luces.stats=()=>({pool:POOL.length,lit:Luces.lit||0,materials:MC.size});

if(typeof module!=='undefined'&&module.exports)module.exports=Luces;else root.Luces=Luces;
})(typeof globalThis!=='undefined'?globalThis:this);

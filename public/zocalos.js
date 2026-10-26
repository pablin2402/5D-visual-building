(function(root){
const Zocalos={};
let T=null,KIT=null,OPT={},TEX=null;
const REG=[];

Zocalos.TYPES=[{"id":"recto","name":"Recto","desc":"Líneas limpias y minimalistas.","material":"MDF hidrófugo","h":0.08,"d":0.015,"pts":[[0,0],[0.015,0],[0.015,0.077],[0.01477,0.07815],[0.01412,0.07912],[0.01315,0.07977],[0.012,0.08],[0.0,0.08],[0.0,0.032],[0.004,0.032],[0.004,0.02],[0.0,0.02]]},{"id":"clasico","name":"Clásico","desc":"Diseño atemporal con elegancia y calidez.","material":"MDF hidrófugo","h":0.08,"d":0.015,"pts":[[0,0],[0.015,0],[0.015,0.058],[0.01488,0.05917],[0.01454,0.0603],[0.01399,0.06133],[0.01324,0.06224],[0.01233,0.06299],[0.0113,0.06354],[0.01017,0.06388],[0.009,0.064],[0.007,0.064],[0.007,0.074],[0.00688,0.07517],[0.00654,0.0763],[0.00599,0.07733],[0.00524,0.07824],[0.00433,0.07899],[0.0033,0.07954],[0.00217,0.07988],[0.001,0.08],[0.0,0.08],[0.0,0.032],[0.004,0.032],[0.004,0.02],[0.0,0.02]]},{"id":"moldurado","name":"Moldurado","desc":"Detalles decorativos para un acabado sofisticado.","material":"MDF hidrófugo","h":0.09,"d":0.016,"pts":[[0,0],[0.016,0],[0.016,0.066],[0.01463,0.06613],[0.01332,0.06653],[0.01211,0.06718],[0.01105,0.06805],[0.01018,0.06911],[0.00953,0.07032],[0.00913,0.07163],[0.009,0.073],[0.009,0.08],[0.01055,0.08024],[0.01194,0.08095],[0.01305,0.08206],[0.01376,0.08345],[0.014,0.085],[0.01376,0.08655],[0.01305,0.08794],[0.01194,0.08905],[0.01055,0.08976],[0.009,0.09],[0.004,0.09],[0.0,0.09],[0.0,0.034],[0.004,0.034],[0.004,0.02],[0.0,0.02]]},{"id":"oculto","name":"Oculto","desc":"Coplanar con la pared, estética contemporánea.","material":"Aluminio","h":0.08,"d":0.004,"pts":[[0,0],[0.004,0],[0.004,0.066],[0.0012,0.066],[0.0012,0.08],[0,0.08]]},{"id":"escalonado","name":"Escalonado","desc":"Escalones que dan textura y un efecto moderno.","material":"MDF hidrófugo","h":0.09,"d":0.016,"pts":[[0,0],[0.016,0],[0.016,0.048],[0.014,0.05],[0.011,0.05],[0.011,0.07],[0.009,0.072],[0.006,0.072],[0.006,0.088],[0.004,0.09],[0.0,0.09],[0.0,0.034],[0.004,0.034],[0.004,0.02],[0.0,0.02]]},{"id":"ancho","name":"Ancho","desc":"Mayor presencia visual para espacios amplios.","material":"MDF hidrófugo","h":0.12,"d":0.015,"pts":[[0,0],[0.015,0],[0.015,0.113],[0.009,0.119],[0.007,0.12],[0.0,0.12],[0.0,0.04],[0.004,0.04],[0.004,0.024],[0.0,0.024]]},{"id":"curvo","name":"Curvo","desc":"Suaviza la transición entre piso y pared.","material":"PVC","h":0.08,"d":0.022,"pts":[[0,0],[0.022,0],[0.02063,0.00013],[0.01932,0.00053],[0.01811,0.00118],[0.01705,0.00205],[0.01618,0.00311],[0.01553,0.00432],[0.01513,0.00563],[0.015,0.007],[0.015,0.068],[0.0149,0.06957],[0.01459,0.07111],[0.01409,0.07259],[0.01339,0.074],[0.01252,0.07531],[0.01149,0.07649],[0.01031,0.07752],[0.009,0.07839],[0.00759,0.07909],[0.00611,0.07959],[0.00457,0.0799],[0.003,0.08],[0.0,0.08],[0.0,0.034],[0.004,0.034],[0.004,0.02],[0.0,0.02]]},{"id":"doble","name":"Doble perfil","desc":"Diseño versátil y funcional.","material":"MDF hidrófugo","h":0.1,"d":0.016,"pts":[[0,0],[0.016,0],[0.016,0.04],[0.013,0.042],[0.013,0.048],[0.016,0.05],[0.016,0.084],[0.01586,0.08504],[0.01546,0.086],[0.01483,0.08683],[0.014,0.08746],[0.01304,0.08786],[0.012,0.088],[0.01,0.088],[0.01,0.098],[0.00985,0.09877],[0.00941,0.09941],[0.00877,0.09985],[0.008,0.1],[0.0,0.1],[0.0,0.034],[0.004,0.034],[0.004,0.02],[0.0,0.02]]},{"id":"canal","name":"Con canal","desc":"Oculta cables o pequeños conductos.","material":"PVC","h":0.08,"d":0.018,"pts":[[0,0],[0.018,0],[0.018,0.04],[0.0172,0.0405],[0.0172,0.0415],[0.018,0.042],[0.018,0.077],[0.01777,0.07815],[0.01712,0.07912],[0.01615,0.07977],[0.015,0.08],[0,0.08],[0,0.062],[0.011,0.062],[0.011,0.018],[0,0.018]]},{"id":"rustico","name":"Rústico","desc":"Madera natural para ambientes cálidos.","material":"Madera maciza","h":0.09,"d":0.015,"pts":[[0,0],[0.015,0],[0.015,0.086],[0.01486,0.08704],[0.01446,0.088],[0.01383,0.08883],[0.013,0.08946],[0.01204,0.08986],[0.011,0.09],[0.0,0.09]]}];
Zocalos.COLORS=[
  {id:'blanco',name:'Blanco',kind:'Mate',hex:'#f2f1ec'},
  {id:'marfil',name:'Marfil',kind:'Mate',hex:'#ebe3d2'},
  {id:'gris-claro',name:'Gris claro',kind:'Mate',hex:'#b7b6b2'},
  {id:'grafito',name:'Gris grafito',kind:'Mate',hex:'#545556'},
  {id:'negro',name:'Negro',kind:'Mate',hex:'#262727'},
  {id:'beige',name:'Beige',kind:'Mate',hex:'#dcd2c3'},
  {id:'roble',name:'Roble natural',kind:'Madera',wood:'roble',hex:'#f4e6d2'},
  {id:'nogal',name:'Nogal',kind:'Madera',wood:'nogal',hex:'#ffffff'},
  {id:'wengue',name:'Wengué',kind:'Madera',wood:'nogal',hex:'#5d4a3c'}
];
Zocalos.FINISHES=[
  {id:'mate',name:'Mate',desc:'Elegante y discreto.',rough:0.82,env:0.45},
  {id:'satinado',name:'Satinado',desc:'Suave al tacto y fácil de limpiar.',rough:0.32,env:0.9},
  {id:'texturizado',name:'Texturizado',desc:'Veta en relieve, mayor realismo.',rough:0.66,env:0.5,grain:0.9}
];
Zocalos.state={type:'recto',color:'nogal',finish:'mate'};

const byId=(arr,id,def)=>arr.find(x=>x.id===id)||arr.find(x=>x.id===def)||arr[0];
Zocalos.type=id=>byId(Zocalos.TYPES,id||Zocalos.state.type,'recto');
Zocalos.pick=function(o){const r={};if(!o)return r;
  if(Zocalos.TYPES.some(x=>x.id===o.type))r.type=o.type;if(Zocalos.COLORS.some(x=>x.id===o.color))r.color=o.color;if(Zocalos.FINISHES.some(x=>x.id===o.finish))r.finish=o.finish;return r;};

Zocalos.init=function(THREE,opts){
  T=THREE;OPT=opts||{};
  Zocalos.mat=new T.MeshStandardMaterial({color:0xffffff,roughness:0.8,metalness:0});
  Zocalos.mat.name='zocalo';
  const L=new T.TextureLoader(),base=OPT.base||'library/tex3d/';
  const tx=(f,srgb)=>{const t=L.load(base+f,()=>{if(OPT.onChange)OPT.onChange();});t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1/0.32,1/0.6);t.anisotropy=OPT.aniso||8;if(srgb)t.encoding=T.sRGBEncoding;return t;};
  TEX={roble:tx('roble_diff.webp',true),nogal:tx('nogal_diff.webp',true),grain:tx('roble_nrm.webp',false)};
  Zocalos.apply();
};

Zocalos.apply=function(){
  const m=Zocalos.mat;if(!m)return;const S=Zocalos.state;
  const c=byId(Zocalos.COLORS,S.color,'nogal'),f=byId(Zocalos.FINISHES,S.finish,'mate'),t=Zocalos.type();
  m.color.set(c.hex).convertSRGBToLinear();
  const map=c.wood?TEX[c.wood]:null;
  let g=f.grain||0;if(!g&&c.wood)g=0.35;if(t.id==='rustico')g=Math.max(g,0.7);
  const nm=g?TEX.grain:null;
  if(m.map!==map||m.normalMap!==nm){m.map=map;m.normalMap=nm;m.needsUpdate=true;}
  m.normalScale.set(g,g);
  m.roughness=f.rough+(c.wood&&S.finish!=='satinado'?-0.12:0);
  m.metalness=t.id==='oculto'&&!c.wood?0.25:0;
  m.userData.envBase=f.env;m.envMapIntensity=f.env*(OPT.envScale?OPT.envScale():1);
  if(OPT.onChange)OPT.onChange();
};
Zocalos.set=function(o){
  const prev=Zocalos.state.type;Object.assign(Zocalos.state,Zocalos.pick(o));
  if(Zocalos.state.type!==prev)Zocalos.rebuildAll();
  Zocalos.apply();
};
Zocalos.summary=function(){const S=Zocalos.state;return {type:Zocalos.type(),color:byId(Zocalos.COLORS,S.color,'nogal'),finish:byId(Zocalos.FINISHES,S.finish,'mate')};};

function procGeo(pts){
  const n=pts.length,pos=[],nor=[],idx=[];
  const en=[];for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy)||1;en.push([dy/l,-dz/l]);}
  const cosT=Math.cos(32*Math.PI/180);
  const vn=(i,e)=>{const p=en[(i-1+n)%n],q=en[i];if(p[0]*q[0]+p[1]*q[1]>cosT){const z=p[0]+q[0],y=p[1]+q[1],l=Math.hypot(z,y)||1;return [z/l,y/l];}return e;};
  for(let i=0;i<n;i++){const j=(i+1)%n,a=pts[i],b=pts[j],na=vn(i,en[i]),nb=vn(j,en[i]),v=pos.length/3;
    pos.push(0,a[1],a[0],1,a[1],a[0],1,b[1],b[0],0,b[1],b[0]);
    nor.push(0,na[1],na[0],0,na[1],na[0],0,nb[1],nb[0],0,nb[1],nb[0]);
    idx.push(v,v+3,v+2,v,v+2,v+1);}
  const tris=T.ShapeUtils.triangulateShape(pts.map(p=>new T.Vector2(p[0],p[1])),[]);
  [[0,-1],[1,1]].forEach(([x,s])=>{const v=pos.length/3;pts.forEach(p=>{pos.push(x,p[1],p[0]);nor.push(s,0,0);});
    tris.forEach(t=>{if(s>0)idx.push(v+t[0],v+t[1],v+t[2]);else idx.push(v+t[0],v+t[2],v+t[1]);});});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setIndex(idx);return g;
}
function procKit(){const K={};Zocalos.TYPES.forEach(t=>{K[t.id]=procGeo(t.pts);});return K;}

Zocalos.load=function(url){
  return new Promise(res=>{
    const done=(K,ok)=>{const fb=procKit();Zocalos.TYPES.forEach(t=>{if(!K[t.id])K[t.id]=fb[t.id];});KIT=K;Zocalos.fromBlender=ok;Zocalos.rebuildAll();res(ok);};
    if(!T.GLTFLoader)return done({},false);
    new T.GLTFLoader().load(url,gl=>{const K={};gl.scene.traverse(o=>{if(o.isMesh&&/^zocalo_/.test(o.name)){const g=o.geometry.clone();o.updateMatrixWorld();g.applyMatrix4(o.matrixWorld);['uv','uv2','tangent','color'].forEach(a=>{if(g.attributes[a])g.deleteAttribute(a);});K[o.name.slice(7)]=g;}});done(K,Object.keys(K).length>0);},undefined,()=>done({},false));
  });
};

const EPS=0.012;
function depthFn(t){const P=t.pts,n=P.length;return y=>{let m=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];if((a[1]-y)*(b[1]-y)>0)continue;
  if(Math.abs(b[1]-a[1])<1e-9){m=Math.max(m,a[0],b[0]);continue;}m=Math.max(m,a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));}return m;};}
function clipSegs(segs,doors){
  const D=root.Doors,out=[];
  segs.forEach(s=>{let iv=[[0,s.L]];const A=s.a,B=[s.a[0]+s.u[0]*s.L,s.a[1]+s.u[1]*s.L];
    (doors||[]).forEach(d=>{if(!iv.length)return;
      const loc=p=>[(p[0]-d.o[0])*d.n[0]+(p[1]-d.o[1])*d.n[1],(p[0]-d.o[0])*d.e[0]+(p[1]-d.o[1])*d.e[1]],la=loc(A),lb=loc(B),h=d.L/2;
      const C=D&&D.clipFor?D.clipFor(d):{tapa:false,t:0,x:{1:[0,d.d],'-1':[0,d.d]}},hz=h+(C.tapa?C.t:0);
      const cut=(t0,t1)=>{if(t0>t1){const q=t0;t0=t1;t1=q;}const nv=[];iv.forEach(([p,q])=>{if(t1<=p||t0>=q){nv.push([p,q]);return;}if(t0>p)nv.push([p,t0]);if(t1<q)nv.push([t1,q]);});iv=nv;};
      {let u0=0,u1=1;const dd=[lb[0]-la[0],lb[1]-la[1]],lo=[-EPS,-hz-EPS],hi=[d.d+EPS,hz+EPS];let ok=true;
        for(let c=0;c<2&&ok;c++){if(Math.abs(dd[c])<1e-9){if(la[c]<lo[c]||la[c]>hi[c])ok=false;continue;}let ta=(lo[c]-la[c])/dd[c],tb=(hi[c]-la[c])/dd[c];if(ta>tb){const q=ta;ta=tb;tb=q;}u0=Math.max(u0,ta);u1=Math.min(u1,tb);if(u0>=u1)ok=false;}
        if(ok)cut(u0*s.L,u1*s.L);if(!iv.length)return;}
      if(Math.abs(la[1]-lb[1])>EPS)return;const zs=(la[1]+lb[1])/2;if(Math.abs(Math.abs(zs)-h)>EPS)return;
      const sd=zs>0?1:-1;if((s.n[0]*d.e[0]+s.n[1]*d.e[1])*sd<0.5)return;
      const x0=C.x[sd][0],x1=C.x[sd][1],dx=lb[0]-la[0];if(Math.abs(dx)<1e-6)return;
      cut((x0-la[0])/dx*s.L,(x1-la[0])/dx*s.L);});
    iv.forEach(([p,q])=>{if(q-p<0.02)return;out.push({a:[A[0]+s.u[0]*p,A[1]+s.u[1]*p],u:s.u,n:s.n,L:q-p,y:s.y,uo:(s.uo||0)+p,cut:[p>1e-6,q<s.L-1e-6]});});});
  return out;
}
function joints(S){
  const cr=(a,b)=>a[0]*b[1]-a[1]*b[0],dt=(a,b)=>a[0]*b[0]+a[1]*b[1],ends=[];
  S.forEach((s,i)=>{s.j=[null,null];ends.push({i,k:0,p:s.a,d:[-s.u[0],-s.u[1]]});ends.push({i,k:1,p:[s.a[0]+s.u[0]*s.L,s.a[1]+s.u[1]*s.L],d:s.u});});
  ends.forEach(E=>{const s=S[E.i];if(s.cut[E.k])return;let best=null,bc=-1;
    ends.forEach(F=>{if(F.i===E.i||Math.hypot(F.p[0]-E.p[0],F.p[1]-E.p[1])>EPS)return;const c=Math.abs(cr(E.d,F.d));if(c>bc){bc=c;best=F;}});
    if(best){const nF=S[best.i].n;if(bc<0.05){s.j[E.k]={k:0};return;}
      const k=cr([nF[0]-s.n[0],nF[1]-s.n[1]],best.d)/cr(E.d,best.d);s.j[E.k]={k:Math.max(-3,Math.min(3,k))};return;}
    for(let g=0;g<S.length;g++){if(g===E.i)continue;const G=S[g],rx=E.p[0]-G.a[0],rz=E.p[1]-G.a[1],al=rx*G.u[0]+rz*G.u[1],off=Math.abs(rx*G.u[1]-rz*G.u[0]);
      if(off>EPS||al<EPS||al>G.L-EPS)continue;const dn=dt(E.d,G.n);if(dn>-0.3)continue;s.j[E.k]={t:true,nB:G.n,dn,nn:dt(s.n,G.n)};return;}});
}
function geoFor(segs,doors){
  if(!KIT)KIT=procKit();
  const t=Zocalos.type(),g=KIT[t.id],P=g.attributes.position,N=g.attributes.normal,I=g.index,dep=depthFn(t);
  const keep=clipSegs(segs,doors).filter(s=>s.L>0.02);if(!keep.length)return null;joints(keep);
  const nv=keep.length*P.count,ni=keep.length*(I?I.count:P.count);
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
  const endOff=(J,lz,ly)=>{if(!J)return 0;if(J.t)return (dep(ly)-0.0005-lz*J.nn)/J.dn;return J.k*lz;};
  let v=0,k=0;
  keep.forEach(s=>{
    let ux=s.u[0],uz=s.u[1];const nx=s.n[0],nz=s.n[1],flip=uz*nx-ux*nz>0;if(flip){ux=-ux;uz=-uz;}
    const base=v,y0=s.y,off=s.uo||0;
    for(let q=0;q<P.count;q++){
      const x01=P.getX(q),ly=P.getY(q),lz=P.getZ(q),ei=(x01<0.5)!==flip?0:1;
      const so=ei===0?-endOff(s.j[0],lz,ly):s.L+endOff(s.j[1],lz,ly);
      pos[v*3]=s.a[0]+s.u[0]*so+nx*lz;pos[v*3+1]=y0+ly;pos[v*3+2]=s.a[1]+s.u[1]*so+nz*lz;
      const a=N.getX(q),b=N.getY(q),c=N.getZ(q);
      nor[v*3]=ux*a+nx*c;nor[v*3+1]=b;nor[v*3+2]=uz*a+nz*c;
      uv[v*2]=ly+lz;uv[v*2+1]=off+so;
      v++;}
    if(I)for(let q=0;q<I.count;q++)idx[k++]=base+I.getX(q);else for(let q=0;q<P.count;q++)idx[k++]=base+q;
  });
  const G=new T.BufferGeometry();G.setAttribute('position',new T.BufferAttribute(pos,3));G.setAttribute('normal',new T.BufferAttribute(nor,3));G.setAttribute('uv',new T.BufferAttribute(uv,2));G.setIndex(new T.BufferAttribute(idx,1));G.computeBoundingSphere();
  return G;
}
Zocalos.build=function(segs,doors){
  const g=geoFor(segs,doors);if(!g)return null;
  const me=new T.Mesh(g,Zocalos.mat);me.castShadow=false;me.receiveShadow=true;me.name='zocalos';me.userData.zocalos=true;
  REG.push({me,segs,doors});return me;
};
Zocalos.rebuildAll=function(){
  const rootOf=o=>{while(o.parent)o=o.parent;return o;};
  for(let i=REG.length-1;i>=0;i--){const r=REG[i],live=!!rootOf(r.me).isScene;
    if(!live&&r.seen){REG.splice(i,1);continue;}if(live)r.seen=true;
    const g=geoFor(r.segs,r.doors);if(!g)continue;r.me.geometry.dispose();r.me.geometry=g;}
  if(OPT.onChange)OPT.onChange();
};

Zocalos.svg=function(id,opt){
  const t=Zocalos.type(id),S=(opt&&opt.scale)||1000,pad=4;
  const W=t.d*S,H=t.h*S,ox=pad+18,oy=pad;
  const pts=t.pts.map(p=>[(ox+p[0]*S).toFixed(2),(oy+H-p[1]*S).toFixed(2)].join(',')).join(' ');
  const w=ox+W+pad+40,h=oy+H+pad+16;
  return `<svg viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" role="img" aria-label="Corte del perfil ${t.name}: ${Math.round(t.h*1000)} por ${Math.round(t.d*1000)} mm">`+
    `<line x1="${ox}" y1="${oy-2}" x2="${ox}" y2="${oy+H+2}" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="2 2"/>`+
    `<polygon points="${pts}" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="1"/>`+
    `<line x1="${ox-9}" y1="${oy}" x2="${ox-9}" y2="${oy+H}" stroke="currentColor" stroke-opacity=".6"/>`+
    `<text x="${ox-12}" y="${oy+H/2}" font-size="9" fill="currentColor" text-anchor="end" dominant-baseline="central" transform="rotate(-90 ${ox-12} ${oy+H/2})">${Math.round(t.h*1000)} mm</text>`+
    `<line x1="${ox}" y1="${oy+H+7}" x2="${ox+W}" y2="${oy+H+7}" stroke="currentColor" stroke-opacity=".6"/>`+
    `<text x="${ox+W+4}" y="${oy+H+8}" font-size="9" fill="currentColor" dominant-baseline="central">${Math.round(t.d*1000)} mm</text></svg>`;
};

if(typeof module!=='undefined'&&module.exports)module.exports=Zocalos;else root.Zocalos=Zocalos;
})(typeof globalThis!=='undefined'?globalThis:this);

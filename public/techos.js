(function(root){
const Te={};
let T=null,OPT={};

const P=(k,label,min,max,step,unit,def)=>({k,label,min,max,step,unit:unit||'m',def});
Te.STYLES=[
  {id:'plano',name:'Techo plano',sub:'Minimalista',style:'minimalista',kind:'plano',light:['focos'],desc:'Acabado limpio y minimalista, con junta perimetral de sombra.',feat:['Acabado liso','Instalación rápida','Ideal para todos los ambientes'],
   params:[P('drop','Altura bajo losa',0.06,0.4,0.01,'m',0.1),P('spots','Focos empotrados',0,16,1,'u',4)],price:120},
  {id:'perimetral',name:'Techo con luces perimetrales',sub:'Foseado LED',style:'contemporaneo',kind:'foseado',light:['led','focos'],desc:'Foseado perimetral con luz indirecta que baña el techo central.',feat:['Iluminación LED indirecta','Diseño personalizable','Salas, dormitorios y áreas sociales'],
   params:[P('band','Ancho del foseado',0.3,0.9,0.05,'m',0.5),P('depth','Profundidad del desnivel',0.18,0.45,0.01,'m',0.26),P('spots','Focos en el foseado',0,12,1,'u',0)],price:220},
  {id:'niveles',name:'Techo de niveles',sub:'Volúmenes',style:'contemporaneo',kind:'niveles',light:['led','focos'],desc:'Dos escalones con luz en cada nivel: profundidad y dinamismo.',feat:['Diseño moderno','Gran versatilidad','Salas, comedores y oficinas'],
   params:[P('band','Ancho del primer nivel',0.3,0.8,0.05,'m',0.45),P('band2','Ancho del segundo nivel',0.2,0.6,0.05,'m',0.3),P('depth','Profundidad total',0.28,0.55,0.01,'m',0.38),P('spots','Focos en el borde',0,16,1,'u',8)],price:280},
  {id:'flotante',name:'Techo flotante',sub:'Panel suspendido',style:'contemporaneo',kind:'flotante',light:['led'],desc:'Panel central suspendido que parece flotar sobre un halo de luz.',feat:['Iluminación LED oculta','Acabado premium','Dormitorios y salas'],
   params:[P('gap','Separación a los muros',0.25,0.9,0.05,'m',0.45),P('drop','Separación del panel',0.12,0.4,0.01,'m',0.2),P('thick','Espesor del panel',0.06,0.2,0.01,'m',0.1)],price:260},
  {id:'curvo',name:'Techo curvo',sub:'Orgánico',style:'organico',kind:'curvo',light:['led','focos'],desc:'Bordes con curvas suaves y acabado continuo, para espacios creativos.',feat:['Alta flexibilidad de diseño','Acabado uniforme','Comercios y viviendas'],
   params:[P('band','Ancho del foseado',0.35,1.0,0.05,'m',0.55),P('wave','Curvatura',0.1,0.6,0.05,'m',0.35),P('depth','Profundidad',0.2,0.45,0.01,'m',0.28),P('spots','Focos',0,10,1,'u',3)],price:300},
  {id:'caseton',name:'Techo tipo casetón',sub:'Modular',style:'clasico',kind:'modular',light:['focos'],desc:'Cuadrícula de vigas con módulos hundidos: clásico y elegante.',feat:['Aislamiento térmico y acústico','Estilo atemporal','Oficinas, halls y espacios amplios'],
   params:[P('cell','Tamaño del módulo',0.6,1.6,0.05,'m',1.0),P('beam','Ancho de viga',0.08,0.25,0.01,'m',0.14),P('depth','Profundidad de viga',0.08,0.3,0.01,'m',0.16),P('spots','Foco por módulo',0,1,1,'si/no',1)],price:320},
  {id:'ranuras',name:'Techo con ranuras',sub:'Lineal',style:'minimalista',kind:'lineal',light:['led'],desc:'Líneas limpias y canales decorativos con luz lineal opcional.',feat:['Diseño contemporáneo','Permite integrar iluminación','Salas, pasillos y oficinas'],
   params:[P('slots','Cantidad de ranuras',2,9,1,'u',4),P('slotw','Ancho de ranura',0.03,0.12,0.01,'m',0.05),P('drop','Altura bajo losa',0.08,0.35,0.01,'m',0.12)],price:240},
  {id:'integrada',name:'Techo con iluminación integrada',sub:'LED + focos',style:'contemporaneo',kind:'foseado',light:['led','focos'],desc:'Foseado, panel central con líneas LED y focos: luz uniforme sin deslumbrar.',feat:['Luz uniforme y sin deslumbramiento','Bajo consumo energético','Dormitorios y áreas sociales'],
   params:[P('band','Ancho del foseado',0.35,0.8,0.05,'m',0.45),P('depth','Profundidad del desnivel',0.2,0.45,0.01,'m',0.3),P('lines','Líneas LED centrales',1,4,1,'u',2),P('spots','Focos',0,12,1,'u',6)],price:340}
];
Te.FILTERS={
  style:[{id:'minimalista',name:'Minimalista'},{id:'contemporaneo',name:'Contemporáneo'},{id:'clasico',name:'Clásico'},{id:'organico',name:'Orgánico'}],
  light:[{id:'led',name:'Con LED'},{id:'focos',name:'Con focos'}],
  kind:[{id:'plano',name:'Plano'},{id:'foseado',name:'Foseado'},{id:'niveles',name:'Niveles'},{id:'flotante',name:'Flotante'},{id:'curvo',name:'Curvo'},{id:'modular',name:'Modular'},{id:'lineal',name:'Lineal'}]
};
Te.COLORS=[{id:'#f4f2ee',name:'Blanco'},{id:'#efe8dc',name:'Marfil'},{id:'#e4e1db',name:'Gris perla'},{id:'#e6dccb',name:'Arena'},{id:'#cfd3d3',name:'Gris niebla'},{id:'#3f4144',name:'Grafito'}];
Te.FINISHES=[{id:'mate',name:'Mate',rough:0.92},{id:'satinado',name:'Satinado',rough:0.5}];
Te.TEMPS=[{k:2700,name:'2700 K',hex:'#ffb36b'},{k:3000,name:'3000 K',hex:'#ffc489'},{k:4000,name:'4000 K',hex:'#ffe2c2'},{k:6000,name:'6000 K',hex:'#eef3ff'}];
Te.style=id=>Te.STYLES.find(s=>s.id===id)||Te.STYLES[0];
Te.defaults=function(id){const S=Te.style(id),p={};S.params.forEach(q=>p[q.k]=q.def);return {style:S.id,p,w:null,l:null,led:S.light.includes('led'),k:3000,i:0.8,color:'#f4f2ee',finish:'mate'};};
const cl=(v,a,b)=>Math.min(b,Math.max(a,v));
Te.fix=function(c,R){const S=Te.style(c&&c.style),d=Te.defaults(S.id),o={...d,...(c||{}),p:{...d.p,...((c&&c.p)||{})}};o.style=S.id;
  S.params.forEach(q=>{const v=+o.p[q.k];o.p[q.k]=Math.round(cl(isFinite(v)?v:q.def,q.min,q.max)/q.step)*q.step;o.p[q.k]=+o.p[q.k].toFixed(3);});
  if(R){const W=R[2]-R[0],L=R[3]-R[1];o.w=o.w==null?W:+cl(+o.w,1.0,W).toFixed(2);o.l=o.l==null?L:+cl(+o.l,1.0,L).toFixed(2);}
  o.led=!!o.led&&S.light.includes('led');o.k=Te.TEMPS.some(t=>t.k===+o.k)?+o.k:3000;o.i=+cl(+o.i||0.8,0.1,1.5).toFixed(2);
  if(!/^#[0-9a-f]{6}$/i.test(o.color||''))o.color=d.color;if(!Te.FINISHES.some(f=>f.id===o.finish))o.finish='mate';
  return o;};
Te.limits=function(c,W,L){const S=Te.style(c.style),m=Math.min(W,L),out={};
  if(c.p.band!=null)out.band=Math.max(0.3,Math.min(0.9,m/2-0.5));
  if(c.p.band2!=null)out.band2=Math.max(0.2,Math.min(0.6,m/2-(c.p.band||0.4)-0.35));
  if(c.p.gap!=null)out.gap=Math.max(0.25,Math.min(0.9,m/2-0.4));
  return out;};
Te.validate=function(c,W,L){const lim=Te.limits(c,W,L),p={...c.p},warn=[];Object.entries(lim).forEach(([k,mx])=>{if(p[k]>mx){warn.push(k);p[k]=+mx.toFixed(2);}});
  if(c.style==='niveles'&&p.depth<0.28)p.depth=0.28;return {p,warn};};

/* ---------- materiales ---------- */
const lin=h=>new T.Color(h).convertSRGBToLinear();
const MC=new Map();let GRAD=null,BASE=null;
function grad(){if(GRAD)return GRAD;const c=document.createElement('canvas');c.width=4;c.height=128;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,128);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.18,'rgba(255,255,255,0.55)');g.addColorStop(0.5,'rgba(255,255,255,0.16)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,4,128);
  GRAD=new T.CanvasTexture(c);GRAD.wrapS=T.RepeatWrapping;return GRAD;}
function boardMat(color,finish){const key='b|'+color+'|'+finish;if(MC.has(key))return MC.get(key);
  const m=new T.MeshStandardMaterial({color:lin(color),roughness:(Te.FINISHES.find(f=>f.id===finish)||Te.FINISHES[0]).rough,metalness:0});
  if(OPT.plaster){try{const src=OPT.plaster();if(src){m.normalMap=src.normalMap||null;m.roughnessMap=null;if(m.normalMap)m.normalScale=new T.Vector2(0.35,-0.35);}}catch(e){}}
  m.name='techo_placa';m.userData.envBase=0.5;m.envMapIntensity=0.5;MC.set(key,m);return m;}
function fixed(k){const key='f|'+k;if(MC.has(key))return MC.get(key);let m;
  if(k==='gap')m=new T.MeshStandardMaterial({color:0x2a2a2a,roughness:1});
  else if(k==='trim')m=new T.MeshStandardMaterial({color:0xf2f2f0,roughness:0.35,metalness:0.4});
  else if(k==='reflector')m=new T.MeshStandardMaterial({color:0xd8d8d8,roughness:0.18,metalness:1});
  else if(k==='perfil')m=new T.MeshStandardMaterial({color:0xcfd1d2,roughness:0.35,metalness:0.8});
  m.name='techo_'+k;m.userData.envBase=0.8;MC.set(key,m);return m;}
const tempHex=k=>(Te.TEMPS.find(t=>t.k===k)||Te.TEMPS[1]).hex;
function ledMat(k,i,on){const key='l|'+k+'|'+i+'|'+on;if(MC.has(key))return MC.get(key);
  const m=new T.MeshStandardMaterial({color:on?0xffffff:0xe8e6e0,roughness:0.6,emissive:on?lin(tempHex(k)):new T.Color(0),emissiveIntensity:on?1.6*i:0});m.toneMapped=!on;m.name='techo_led';MC.set(key,m);return m;}
function lensMat(k,i,on){const key='s|'+k+'|'+i+'|'+on;if(MC.has(key))return MC.get(key);
  const m=new T.MeshStandardMaterial({color:on?0xffffff:0xdedcd6,roughness:0.3,emissive:on?lin(tempHex(k)):new T.Color(0),emissiveIntensity:on?2.2*i:0});m.toneMapped=!on;m.name='techo_lens';MC.set(key,m);return m;}
function glowMat(k,i){const key='g|'+k+'|'+i;if(MC.has(key))return MC.get(key);
  const m=new T.MeshBasicMaterial({color:lin(tempHex(k)),map:grad(),transparent:true,opacity:Math.min(1,0.55*i),blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});m.name='techo_glow';MC.set(key,m);return m;}

/* ---------- geometría ---------- */
function Acc(){this.p=[];this.n=[];this.u=[];this.i=[];this.v=0;}
Acc.prototype.quad=function(a,b,c,d,n,uv){const v=this.v;[a,b,c,d].forEach((q,k)=>{this.p.push(q[0],q[1],q[2]);this.n.push(n[0],n[1],n[2]);const t=uv?uv[k]:(Math.abs(n[1])>0.5?[q[0],q[2]]:Math.abs(n[0])>0.5?[q[2],q[1]]:[q[0],q[1]]);this.u.push(t[0],t[1]);});
  const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
  if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]>=0)this.i.push(v,v+1,v+2,v,v+2,v+3);else this.i.push(v,v+2,v+1,v,v+3,v+2);this.v+=4;};
Acc.prototype.box=function(x0,y0,z0,x1,y1,z1,noTop){if(x1-x0<1e-4||y1-y0<1e-4||z1-z0<1e-4)return;
  this.quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0]);
  if(!noTop)this.quad([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[0,1,0]);
  this.quad([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[0,0,-1]);this.quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]);
  this.quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]);this.quad([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],[1,0,0]);};
Acc.prototype.plane=function(x0,z0,x1,z1,y){this.quad([x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],[0,-1,0]);};
Acc.prototype.geo=function(){if(!this.v)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));g.setIndex(this.v>65535?new T.Uint32BufferAttribute(this.i,1):new T.Uint16BufferAttribute(this.i,1));g.computeBoundingSphere();return g;};
Acc.prototype.addGeo=function(g,M){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,I=g.index,b=this.v,v=new T.Vector3(),n=new T.Vector3(),NM=new T.Matrix3().getNormalMatrix(M);
  for(let k=0;k<P.count;k++){v.fromBufferAttribute(P,k).applyMatrix4(M);this.p.push(v.x,v.y,v.z);n.fromBufferAttribute(N,k).applyMatrix3(NM).normalize();this.n.push(n.x,n.y,n.z);this.u.push(U?U.getX(k):0,U?U.getY(k):0);}
  if(I)for(let k=0;k<I.count;k++)this.i.push(b+I.getX(k));else for(let k=0;k<P.count;k++)this.i.push(b+k);this.v+=P.count;};
/* franja de brillo sobre el techo: desde el borde (a→b) hacia el interior n, ancho w */
function glowStrip(acc,a,b,n,w,y,miter){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),t=[(b[0]-a[0])/L,(b[1]-a[1])/L],m=miter===false?0:Math.min(w,L/2);
  const c=[a[0]+n[0]*w+t[0]*m,a[1]+n[1]*w+t[1]*m],d=[b[0]+n[0]*w-t[0]*m,b[1]+n[1]*w-t[1]*m];
  acc.quad([a[0],y,a[1]],[b[0],y,b[1]],[d[0],y,d[1]],[c[0],y,c[1]],[0,-1,0],[[0,0],[L,0],[L,1],[0,1]]);}
function glowLoop(acc,pts,w,y,cx,cz){const n=pts.length,inn=pts.map((p,k)=>{const a=pts[(k-3+n)%n],b=pts[(k+3)%n];let tx=b[0]-a[0],tz=b[1]-a[1];const L=Math.hypot(tx,tz)||1;tx/=L;tz/=L;let nx=-tz,nz=tx;if((cx-p[0])*nx+(cz-p[1])*nz<0){nx=-nx;nz=-nz;}
    let ww=w;for(let j=0;j<n;j++){if(Math.min(Math.abs(j-k),n-Math.abs(j-k))<8)continue;const d=Math.hypot(pts[j][0]-(p[0]+nx*ww),pts[j][1]-(p[1]+nz*ww));if(d<ww*0.9)ww=Math.max(0.05,ww*0.6);}
    return [p[0]+nx*ww,p[1]+nz*ww];});
  for(let it=0;it<3;it++){const c2=inn.map((q,k)=>{const a=inn[(k-1+n)%n],b=inn[(k+1)%n];return [(a[0]+2*q[0]+b[0])/4,(a[1]+2*q[1]+b[1])/4];});c2.forEach((q,k)=>inn[k]=q);}
  let s=0;for(let k=0;k<n;k++){const p=pts[k],q=pts[(k+1)%n],ip=inn[k],iq=inn[(k+1)%n],L=Math.hypot(q[0]-p[0],q[1]-p[1]);acc.quad([p[0],y,p[1]],[q[0],y,q[1]],[iq[0],y,iq[1]],[ip[0],y,ip[1]],[0,-1,0],[[s,0],[s+L,0],[s+L,1],[s,1]]);s+=L;}}

let SPOT=null;
function spotGeos(){if(SPOT)return SPOT;const r=0.045;
  const trim=new T.CylinderGeometry(r+0.012,r+0.012,0.006,28,1,false);trim.translate(0,-0.003,0);
  const refl=new T.CylinderGeometry(r*0.55,r,0.05,28,1,true);refl.translate(0,0.025,0);refl.scale(-1,1,1);
  const lens=new T.CircleGeometry(r*0.5,24);lens.rotateX(Math.PI/2);lens.translate(0,0.045,0);
  SPOT={trim,refl,lens};return SPOT;}
function spot(B,x,y,z){const S=spotGeos(),M=new T.Matrix4().makeTranslation(x,y,z);B.trim.addGeo(S.trim,M);B.refl.addGeo(S.refl,M);B.lensPts.push([x,y+0.045,z]);}
function spotRow(B,pts,y){pts.forEach(p=>spot(B,p[0],y,p[1]));}
function spotsOnRing(x0,z0,x1,z1,n){if(n<=0)return [];const W=x1-x0,L=z1-z0,per=2*(W+L),out=[];
  for(let k=0;k<n;k++){let s=(k+0.5)*per/n;if(s<W)out.push([x0+s,z0]);else if((s-=W)<L)out.push([x1,z0+s]);else if((s-=L)<W)out.push([x1-s,z1]);else{s-=W;out.push([x0,z1-s]);}}return out;}
function spotsGrid(x0,z0,x1,z1,n){if(n<=0)return [];const W=x1-x0,L=z1-z0;let best=[1,n];for(let a=1;a<=n;a++){const b=Math.ceil(n/a);if(Math.abs(W/a-L/b)<Math.abs(W/best[0]-L/best[1]))best=[a,b];}
  const out=[];for(let i=0;i<best[0];i++)for(let j=0;j<best[1];j++){if(out.length>=n)break;out.push([x0+W*(i+0.5)/best[0],z0+L*(j+0.5)/best[1]]);}return out;}

/* foseado perimetral: banda baja alrededor, techo central arriba, LED en la cara superior de la banda */
function cove(B,x0,z0,x1,z1,band,yb,ytop,yc,c,led){
  const th=0.1,ix0=x0+band,iz0=z0+band,ix1=x1-band,iz1=z1-band;
  B.board.box(x0,yb,z0,x1,yb+th,iz0,true);B.board.box(x0,yb,iz1,x1,yb+th,z1,true);B.board.box(x0,yb,iz0,ix0,yb+th,iz1,true);B.board.box(ix1,yb,iz0,x1,yb+th,iz1,true);
  B.board.box(x0,yb+th,z0,x1,ytop,z0+0.02,true);B.board.box(x0,yb+th,z1-0.02,x1,ytop,z1,true);B.board.box(x0,yb+th,z0,x0+0.02,ytop,z1,true);B.board.box(x1-0.02,yb+th,z0,x1,ytop,z1,true);
  const lip=0.06;B.board.box(ix0-0.012,yb+th,iz0-0.012,ix1+0.012,yb+th+lip,iz0,true);B.board.box(ix0-0.012,yb+th,iz1,ix1+0.012,yb+th+lip,iz1+0.012,true);
  B.board.box(ix0-0.012,yb+th,iz0,ix0,yb+th+lip,iz1,true);B.board.box(ix1,yb+th,iz0,ix1+0.012,yb+th+lip,iz1,true);
  B.board.plane(ix0-0.18,iz0-0.18,ix1+0.18,iz1+0.18,yc);
  const ly=yb+th+0.008,o=0.05;
  if(led!==false){B.led.box(ix0-o-0.012,ly,iz0-o-0.012,ix1+o+0.012,ly+0.008,iz0-o,true);B.led.box(ix0-o-0.012,ly,iz1+o,ix1+o+0.012,ly+0.008,iz1+o+0.012,true);
    B.led.box(ix0-o-0.012,ly,iz0-o,ix0-o,ly+0.008,iz1+o,true);B.led.box(ix1+o,ly,iz0-o,ix1+o+0.012,ly+0.008,iz1+o,true);}
  if(c.led){const gw=Math.min(0.9,Math.min(ix1-ix0,iz1-iz0)*0.35),y=yc-0.003;
    glowStrip(B.glow,[ix0-0.15,iz0-0.15],[ix1+0.15,iz0-0.15],[0,1],gw,y);glowStrip(B.glow,[ix1+0.15,iz1+0.15],[ix0-0.15,iz1+0.15],[0,-1],gw,y);
    glowStrip(B.glow,[ix0-0.15,iz1+0.15],[ix0-0.15,iz0-0.15],[1,0],gw,y);glowStrip(B.glow,[ix1+0.15,iz0-0.15],[ix1+0.15,iz1+0.15],[-1,0],gw,y);}
  return [ix0,iz0,ix1,iz1];}

const BUILD={
  plano(B,R,Y,c){const [x0,z0,x1,z1]=R,y=Y-c.p.drop,g=0.015;B.board.box(x0+g,y,z0+g,x1-g,y+0.0125,z1-g,true);
    B.gap.box(x0,y+0.0125,z0,x1,y+0.03,z1,true);B.board.box(x0,y+0.03,z0,x1,Y,z0+0.01,true);
    spotRow(B,spotsGrid(x0+0.3,z0+0.3,x1-0.3,z1-0.3,c.p.spots),y);},
  perimetral(B,R,Y,c){const [x0,z0,x1,z1]=R,yb=Y-c.p.depth,yc=Y-0.03;const ins=cove(B,x0,z0,x1,z1,c.p.band,yb,Y,yc,c);
    spotRow(B,spotsOnRing(x0+c.p.band/2,z0+c.p.band/2,x1-c.p.band/2,z1-c.p.band/2,c.p.spots),yb);},
  niveles(B,R,Y,c){const [x0,z0,x1,z1]=R,d=c.p.depth,b1=c.p.band,b2=c.p.band2,yb1=Y-d,yb2=Y-d*0.55,yc=Y-0.03;
    const th=0.1,ix0=x0+b1,iz0=z0+b1,ix1=x1-b1,iz1=z1-b1;
    B.board.box(x0,yb1,z0,x1,yb1+th,iz0,true);B.board.box(x0,yb1,iz1,x1,yb1+th,z1,true);B.board.box(x0,yb1,iz0,ix0,yb1+th,iz1,true);B.board.box(ix1,yb1,iz0,x1,yb1+th,iz1,true);
    B.board.box(x0,yb1+th,z0,x1,Y,z0+0.02,true);B.board.box(x0,yb1+th,z1-0.02,x1,Y,z1,true);B.board.box(x0,yb1+th,z0,x0+0.02,Y,z1,true);B.board.box(x1-0.02,yb1+th,z0,x1,Y,z1,true);
    B.board.box(ix0-0.01,yb1+th,iz0-0.01,ix1+0.01,yb2,iz0,true);B.board.box(ix0-0.01,yb1+th,iz1,ix1+0.01,yb2,iz1+0.01,true);B.board.box(ix0-0.01,yb1+th,iz0,ix0,yb2,iz1,true);B.board.box(ix1,yb1+th,iz0,ix1+0.01,yb2,iz1,true);
    cove(B,ix0,iz0,ix1,iz1,b2,yb2,Y,yc,c);
    spotRow(B,spotsOnRing(x0+b1/2,z0+b1/2,x1-b1/2,z1-b1/2,c.p.spots),yb1);},
  flotante(B,R,Y,c){const [x0,z0,x1,z1]=R,g=c.p.gap,yt=Y-c.p.drop,yb=yt-c.p.thick,yc=Y-0.02;
    B.board.plane(x0,z0,x1,z1,yc);B.board.box(x0+g,yb,z0+g,x1-g,yt,z1-g);
    B.perfil.box(x0+g+0.25,yt,z0+g+0.25,x0+g+0.27,yc,z0+g+0.27);B.perfil.box(x1-g-0.27,yt,z0+g+0.25,x1-g-0.25,yc,z0+g+0.27);B.perfil.box(x0+g+0.25,yt,z1-g-0.27,x0+g+0.27,yc,z1-g-0.25);B.perfil.box(x1-g-0.27,yt,z1-g-0.27,x1-g-0.25,yc,z1-g-0.25);
    const o=0.03,ly=yt;B.led.box(x0+g+o,ly,z0+g+o,x1-g-o,ly+0.01,z0+g+o+0.012,true);B.led.box(x0+g+o,ly,z1-g-o-0.012,x1-g-o,ly+0.01,z1-g-o,true);B.led.box(x0+g+o,ly,z0+g+o,x0+g+o+0.012,ly+0.01,z1-g-o,true);B.led.box(x1-g-o-0.012,ly,z0+g+o,x1-g-o,ly+0.01,z1-g-o,true);
    if(c.led){const y=yc-0.003,w=Math.min(0.75,g+0.2);
      glowStrip(B.glow,[x0+g,z0+g],[x1-g,z0+g],[0,-1],Math.min(g,w),y,false);glowStrip(B.glow,[x1-g,z1-g],[x0+g,z1-g],[0,1],Math.min(g,w),y,false);glowStrip(B.glow,[x0+g,z1-g],[x0+g,z0+g],[-1,0],Math.min(g,w),y,false);glowStrip(B.glow,[x1-g,z0+g],[x1-g,z1-g],[1,0],Math.min(g,w),y,false);
      glowStrip(B.glow,[x0+g,z0+g],[x1-g,z0+g],[0,1],0.35,y);glowStrip(B.glow,[x1-g,z1-g],[x0+g,z1-g],[0,-1],0.35,y);glowStrip(B.glow,[x0+g,z1-g],[x0+g,z0+g],[1,0],0.35,y);glowStrip(B.glow,[x1-g,z0+g],[x1-g,z1-g],[-1,0],0.35,y);}},
  curvo(B,R,Y,c){const [x0,z0,x1,z1]=R,band=c.p.band,yb=Y-c.p.depth,yc=Y-0.03,th=0.1,a=c.p.wave;
    const W=x1-x0,L=z1-z0,long=W>=L,N=48;
    const hole=[];const ix0=x0+band,ix1=x1-band,iz0=z0+band,iz1=z1-band;
    const rad=Math.min(0.6,(Math.min(ix1-ix0,iz1-iz0))*0.35);
    const edge=(t,side)=>{const s=Math.sin(t*Math.PI*2)*a*(side?1:-0.6);return s;};
    if(long){for(let k=0;k<=N;k++){const t=k/N,x=ix0+rad+(ix1-ix0-2*rad)*t;hole.push([x,iz0+Math.max(0,edge(t,1))]);}
      for(let k=0;k<=8;k++){const q=-Math.PI/2+k/8*Math.PI/2;hole.push([ix1-rad+Math.cos(q)*rad,iz0+rad+Math.sin(q)*rad]);}
      for(let k=0;k<=8;k++){const q=k/8*Math.PI/2;hole.push([ix1-rad+Math.cos(q)*rad,iz1-rad+Math.sin(q)*rad]);}
      for(let k=0;k<=N;k++){const t=1-k/N,x=ix0+rad+(ix1-ix0-2*rad)*t;hole.push([x,iz1-Math.max(0,-edge(t,0))-a*0.5*Math.sin(t*Math.PI)]);}
      for(let k=0;k<=8;k++){const q=Math.PI/2+k/8*Math.PI/2;hole.push([ix0+rad+Math.cos(q)*rad,iz1-rad+Math.sin(q)*rad]);}
      for(let k=0;k<=8;k++){const q=Math.PI+k/8*Math.PI/2;hole.push([ix0+rad+Math.cos(q)*rad,iz0+rad+Math.sin(q)*rad]);}}
    else{for(let k=0;k<=N;k++){const t=k/N,z=iz0+rad+(iz1-iz0-2*rad)*t;hole.push([ix1-Math.max(0,edge(t,1)),z]);}
      for(let k=0;k<=8;k++){const q=k/8*Math.PI/2;hole.push([ix1-rad+Math.cos(q)*rad,iz1-rad+Math.sin(q)*rad]);}
      for(let k=0;k<=8;k++){const q=Math.PI/2+k/8*Math.PI/2;hole.push([ix0+rad+Math.cos(q)*rad,iz1-rad+Math.sin(q)*rad]);}
      for(let k=0;k<=N;k++){const t=1-k/N,z=iz0+rad+(iz1-iz0-2*rad)*t;hole.push([ix0+Math.max(0,-edge(t,0))+a*0.5*Math.sin(t*Math.PI),z]);}
      for(let k=0;k<=8;k++){const q=Math.PI+k/8*Math.PI/2;hole.push([ix0+rad+Math.cos(q)*rad,iz0+rad+Math.sin(q)*rad]);}
      for(let k=0;k<=8;k++){const q=-Math.PI/2+k/8*Math.PI/2;hole.push([ix1-rad+Math.cos(q)*rad,iz0+rad+Math.sin(q)*rad]);}}
    const H=[];hole.forEach(p=>{const q=H[H.length-1];if(!q||Math.hypot(q[0]-p[0],q[1]-p[1])>0.004)H.push(p);});
    let area=0;for(let k=0;k<H.length;k++){const p=H[k],q=H[(k+1)%H.length];area+=p[0]*q[1]-q[0]*p[1];}if(area<0)H.reverse();
    const sh=new T.Shape([new T.Vector2(x0,-z0),new T.Vector2(x0,-z1),new T.Vector2(x1,-z1),new T.Vector2(x1,-z0)]);
    sh.holes.push(new T.Path(H.slice().reverse().map(p=>new T.Vector2(p[0],-p[1]))));
    const g=new T.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false,curveSegments:4});g.rotateX(-Math.PI/2);g.translate(0,yb,0);
    if(g.index)g.computeVertexNormals();const gi=g.index?g.toNonIndexed():g;gi.computeVertexNormals();B.board.addGeo(gi,new T.Matrix4());g.dispose();if(gi!==g)gi.dispose();
    B.board.box(x0,yb+th,z0,x1,Y,z0+0.02,true);B.board.box(x0,yb+th,z1-0.02,x1,Y,z1,true);B.board.box(x0,yb+th,z0,x0+0.02,Y,z1,true);B.board.box(x1-0.02,yb+th,z0,x1,Y,z1,true);
    B.board.plane(x0+0.02,z0+0.02,x1-0.02,z1-0.02,yc);
    let cx=0,cz=0;H.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=H.length;cz/=H.length;
    const ly=yb+th+0.006;for(let k=0;k<H.length;k++){const p=H[k],q=H[(k+1)%H.length],dx=q[0]-p[0],dz=q[1]-p[1],L2=Math.hypot(dx,dz)||1,nx=-dz/L2,nz=dx/L2,s=((cx-p[0])*nx+(cz-p[1])*nz)>0?-1:1;
      const o=0.05,a2=[p[0]+nx*o*s,p[1]+nz*o*s],b2=[q[0]+nx*o*s,q[1]+nz*o*s];B.led.quad([a2[0],ly+0.008,a2[1]],[b2[0],ly+0.008,b2[1]],[b2[0]+nx*0.012*s,ly+0.008,b2[1]+nz*0.012*s],[a2[0]+nx*0.012*s,ly+0.008,a2[1]+nz*0.012*s],[0,1,0]);
      }
    if(c.led){const off=H.map((p,k)=>{const a2=H[(k-1+H.length)%H.length],b2=H[(k+1)%H.length];let tx=b2[0]-a2[0],tz=b2[1]-a2[1];const L3=Math.hypot(tx,tz)||1;let nx=-tz/L3,nz=tx/L3;if((cx-p[0])*nx+(cz-p[1])*nz>0){nx=-nx;nz=-nz;}return [p[0]+nx*0.12,p[1]+nz*0.12];});glowLoop(B.glow,off,0.55,yc-0.003,cx,cz);}
    spotRow(B,spotsOnRing(x0+band/2,z0+band/2,x1-band/2,z1-band/2,c.p.spots),yb);},
  caseton(B,R,Y,c){const [x0,z0,x1,z1]=R,W=x1-x0,L=z1-z0,nx=Math.max(1,Math.round(W/c.p.cell)),nz=Math.max(1,Math.round(L/c.p.cell)),bw=c.p.beam,d=c.p.depth,yc=Y-0.03,yb=yc-d;
    B.board.plane(x0,z0,x1,z1,yc);
    for(let i=0;i<=nx;i++){const x=x0+W*i/nx,a=Math.max(x0,x-bw/2),b=Math.min(x1,x+bw/2);B.board.box(a,yb,z0,b,yc,z1,true);}
    for(let j=0;j<=nz;j++){const z=z0+L*j/nz,a=Math.max(z0,z-bw/2),b=Math.min(z1,z+bw/2);for(let i=0;i<nx;i++){const xa=x0+W*i/nx+bw/2,xb=x0+W*(i+1)/nx-bw/2;B.board.box(xa,yb,a,xb,yc,b,true);}}
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const xa=x0+W*i/nx+bw/2,xb=x0+W*(i+1)/nx-bw/2,za=z0+L*j/nz+bw/2,zb=z0+L*(j+1)/nz-bw/2;
      B.board.box(xa,yc-0.035,za,xb,yc,za+0.03,true);B.board.box(xa,yc-0.035,zb-0.03,xb,yc,zb,true);B.board.box(xa,yc-0.035,za+0.03,xa+0.03,yc,zb-0.03,true);B.board.box(xb-0.03,yc-0.035,za+0.03,xb,yc,zb-0.03,true);
      if(c.p.spots)spot(B,(xa+xb)/2,yc,(za+zb)/2);}},
  ranuras(B,R,Y,c){const [x0,z0,x1,z1]=R,W=x1-x0,L=z1-z0,alongX=W>=L,n=c.p.slots,sw=c.p.slotw,y=Y-c.p.drop,sd=0.06;
    const span=alongX?L:W,cuts=[];for(let k=1;k<=n;k++)cuts.push(span*k/(n+1));
    let prev=0;cuts.concat([span]).forEach((cu,k)=>{const a=prev,b=k<n?cu-sw/2:span;if(b-a>0.01){if(alongX)B.board.box(x0,y,z0+a,x1,y+0.0125,z0+b,true);else B.board.box(x0+a,y,z0,x0+b,y+0.0125,z1,true);}prev=k<n?cu+sw/2:span;});
    cuts.forEach(cu=>{const a=cu-sw/2,b=cu+sw/2;
      if(alongX){B.gap.box(x0+0.08,y,z0+a,x1-0.08,y+sd,z0+a+0.004,true);B.gap.box(x0+0.08,y,z0+b-0.004,x1-0.08,y+sd,z0+b,true);B.gap.plane(x0+0.08,z0+a,x1-0.08,z0+b,y+sd);B.board.box(x0,y,z0+a,x0+0.08,y+0.0125,z0+b,true);B.board.box(x1-0.08,y,z0+a,x1,y+0.0125,z0+b,true);
        B.led.box(x0+0.1,y+sd-0.012,z0+a+0.008,x1-0.1,y+sd-0.004,z0+b-0.008,false);}
      else{B.gap.box(x0+a,y,z0+0.08,x0+a+0.004,y+sd,z1-0.08,true);B.gap.box(x0+b-0.004,y,z0+0.08,x0+b,y+sd,z1-0.08,true);B.gap.plane(x0+a,z0+0.08,x0+b,z1-0.08,y+sd);B.board.box(x0+a,y,z0,x0+b,y+0.0125,z0+0.08,true);B.board.box(x0+a,y,z1-0.08,x0+b,y+0.0125,z1,true);
        B.led.box(x0+a+0.008,y+sd-0.012,z0+0.1,x0+b-0.008,y+sd-0.004,z1-0.1,false);}
      if(c.led){const gy=y-0.002;if(alongX){glowStrip(B.glow,[x1-0.1,z0+a],[x0+0.1,z0+a],[0,-1],0.35,gy);glowStrip(B.glow,[x0+0.1,z0+b],[x1-0.1,z0+b],[0,1],0.35,gy);}
        else{glowStrip(B.glow,[x0+a,z0+0.1],[x0+a,z1-0.1],[-1,0],0.35,gy);glowStrip(B.glow,[x0+b,z1-0.1],[x0+b,z0+0.1],[1,0],0.35,gy);}}});
    B.board.box(x0,y+0.0125,z0,x1,Y,z0+0.01,true);B.board.box(x0,y+0.0125,z1-0.01,x1,Y,z1,true);B.board.box(x0,y+0.0125,z0,x0+0.01,Y,z1,true);B.board.box(x1-0.01,y+0.0125,z0,x1,Y,z1,true);},
  integrada(B,R,Y,c){const [x0,z0,x1,z1]=R,band=c.p.band,yb=Y-c.p.depth,yc=Y-0.03;
    const [ix0,iz0,ix1,iz1]=cove(B,x0,z0,x1,z1,band,yb,Y,yc,c);
    const W=ix1-ix0,L=iz1-iz0,alongX=W>=L,m=0.35,py=yc-0.09,px0=ix0+m,px1=ix1-m,pz0=iz0+m,pz1=iz1-m;
    if(px1-px0>0.4&&pz1-pz0>0.4){B.board.box(px0,py,pz0,px1,yc,pz1,true);const n=c.p.lines;
      for(let k=1;k<=n;k++){if(alongX){const z=pz0+(pz1-pz0)*k/(n+1);B.perfil.box(px0+0.12,py-0.004,z-0.022,px1-0.12,py,z+0.022,true);B.led.box(px0+0.13,py-0.006,z-0.015,px1-0.13,py-0.004,z+0.015,true);}
        else{const x=px0+(px1-px0)*k/(n+1);B.perfil.box(x-0.022,py-0.004,pz0+0.12,x+0.022,py,pz1-0.12,true);B.led.box(x-0.015,py-0.006,pz0+0.13,x+0.015,py-0.004,pz1-0.13,true);}}}
    spotRow(B,spotsOnRing(x0+band/2,z0+band/2,x1-band/2,z1-band/2,c.p.spots),yb);}
};

/* ---------- API ---------- */
Te.init=function(THREE,opts){T=THREE;OPT=opts||{};};
Te.maxRect=function(rg,li){rg._tmr=rg._tmr||{};if(rg._tmr[li])return rg._tmr[li];
  const {w,h,lab,R,mx,mz}=rg,H=new Int32Array(w);let best={a:0};
  for(let y=0;y<h;y++){for(let x=0;x<w;x++)H[x]=lab[y*w+x]===li?H[x]+1:0;
    const st=[];for(let x=0;x<=w;x++){const hh=x<w?H[x]:0;let s=x;while(st.length&&st[st.length-1][1]>=hh){const [sx,sh]=st.pop();const a=sh*(x-sx);if(a>best.a)best={a,x0:sx,x1:x,y0:y-sh+1,y1:y+1};s=sx;}st.push([s,hh]);}}
  const r=best.a?[mx+best.x0/R,mz+best.y0/R,mx+best.x1/R,mz+best.y1/R]:null;rg._tmr[li]=r;return r;};
Te.area=(c)=>+(c.w*c.l).toFixed(2);
Te.build=function(list){
  const grp=new T.Group();grp.name='techos';
  const buckets=new Map(),acc=(key,mat)=>{let b=buckets.get(key);if(!b){b={acc:new Acc(),mat};buckets.set(key,b);}return b.acc;};
  const lens=[];
  list.forEach(it=>{try{
    const c=it.cfg,R0=it.rect;if(!R0)return;const W0=R0[2]-R0[0],L0=R0[3]-R0[1],w=Math.min(W0,c.w||W0),l=Math.min(L0,c.l||L0),cx=(R0[0]+R0[2])/2,cz=(R0[1]+R0[3])/2;
    const R=[cx-w/2,cz-l/2,cx+w/2,cz+l/2],v=Te.validate(c,w,l),cc={...c,p:v.p};
    const bm=boardMat(c.color,c.finish),on=!!c.led,lm=ledMat(c.k,c.i,on),gm=glowMat(c.k,c.i),sm=lensMat(c.k,c.i,true);
    const B={board:acc('b|'+c.color+c.finish,bm),gap:acc('gap',fixed('gap')),perfil:acc('perfil',fixed('perfil')),led:acc('l|'+c.k+c.i+on,lm),glow:acc('g|'+c.k+c.i,gm),trim:acc('trim',fixed('trim')),refl:acc('refl',fixed('reflector')),lensPts:[]};
    (BUILD[c.style]||BUILD.plano)(B,R,it.y,cc);
    B.lensPts.forEach(p=>lens.push({p,m:sm,c:{on:true,k:c.k,i:c.i}}));
  }catch(e){console.warn('techo',e);}});
  buckets.forEach((b,k)=>{const g=b.acc.geo();if(!g)return;const me=new T.Mesh(g,b.mat);const glow=b.mat.name==='techo_glow';me.castShadow=!glow&&b.mat.name!=='techo_led';me.receiveShadow=!glow;me.userData.techo=true;if(glow){me.renderOrder=3;me.userData.techGlow=true;}grp.add(me);});
  const byMat=new Map();lens.forEach(q=>{const k=q.m.uuid;if(!byMat.has(k))byMat.set(k,[]);byMat.get(k).push(q);});
  byMat.forEach(arr=>{const S=spotGeos(),im=new T.InstancedMesh(S.lens,arr[0].m,arr.length),M=new T.Matrix4();arr.forEach((q,k)=>{M.makeTranslation(q.p[0],q.p[1]-0.045,q.p[2]);im.setMatrixAt(k,M);});
    im.instanceMatrix.needsUpdate=true;im.userData.lampEmit=true;im.userData.lampCfg=arr[0].c;im.userData.techo=true;im.frustumCulled=false;grp.add(im);});
  return grp;};
Te.dispose=function(grp){if(!grp)return;grp.children.slice().forEach(c=>{grp.remove(c);if(c.geometry&&!Object.values(SPOT||{}).includes(c.geometry))c.geometry.dispose();if(c.isInstancedMesh)c.dispose&&c.dispose();});};
Te.setOpts=o=>Object.assign(OPT,o||{});
Te.clearMats=function(){MC.forEach((m,k)=>{if(k.startsWith('b|')){m.dispose();MC.delete(k);}});};

if(typeof module!=='undefined'&&module.exports)module.exports=Te;else root.Techos=Te;
})(typeof globalThis!=='undefined'?globalThis:this);

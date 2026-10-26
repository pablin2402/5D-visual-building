(function(root){
const C={};
let T=null,KIT=null,OPT={},ATLAS=null;
const H0=2.6,PER={onda:0.12,pliegue:0.15,ojales:0.16,visillo:0.10};

C.STYLES=[
  {id:'onda',name:'Onda perfecta',desc:'Ondas regulares y elegantes, corren suaves sobre riel.',kind:'drape',hw:'riel',def:'lino',tags:['Riel','Living']},
  {id:'pliegue',name:'Pliegue francés',desc:'Pliegues cosidos arriba, caída pesada y clásica.',kind:'drape',hw:'laton',def:'terciopelo',tags:['Barral con anillas','Dormitorio']},
  {id:'ojales',name:'Ojales blackout',desc:'Bloquea la luz por completo. Ojales metálicos sobre barral.',kind:'drape',hw:'negro',def:'blackout',tags:['Ojales','Dormitorio']},
  {id:'visillo',name:'Visillo de gasa',desc:'Tela translúcida que filtra la luz y da privacidad diurna.',kind:'drape',hw:'riel',def:'gasa',tags:['Riel','Living']},
  {id:'romano',name:'Estor romano',desc:'Pliegues horizontales que se recogen en paquete.',kind:'romano',def:'lino',tags:['Cordón','Cocina']},
  {id:'screen',name:'Enrollable screen',desc:'Tejido técnico que filtra sol y deja ver el exterior.',kind:'roller',def:'screen-5',tags:['Cassette','Oficina']},
  {id:'panel',name:'Panel japonés',desc:'Paneles planos que se deslizan por guías paralelas.',kind:'panel',def:'lino',tags:['Riel 4 vías','Ventanales']},
  {id:'veneciana',name:'Veneciana de madera',desc:'Lamas orientables para regular la luz al milímetro.',kind:'veneciana',def:'nogal',tags:['Lamas 50 mm','Estudio']},
  {id:'duo',name:'Estor dúo (noche/día)',desc:'Bandas opacas y translúcidas alternas, regulables.',kind:'duo',def:'duo-arena',tags:['Cassette','Dormitorio']}
];
C.FABRICS=[
  {id:'lino',name:'Lino natural',sub:'Rústico, transpirable',tile:0,size:0.07,color:'#d9ccb3',rough:0.95,relief:1.4},
  {id:'terciopelo',name:'Terciopelo',sub:'Brillo profundo',tile:1,size:0.22,color:'#1f5a40',rough:0.85,sheen:'#9fc9b0',relief:0.6},
  {id:'gasa',name:'Gasa',sub:'Translúcida',tile:2,size:0.03,color:'#f3f1ec',rough:0.9,alpha:0.42,relief:0.8},
  {id:'jacquard',name:'Jacquard',sub:'Brillo tejido',tile:3,size:0.26,color:'#cbb68c',rough:0.55,sheen:'#fff1cf',relief:1.0},
  {id:'blackout',name:'Blackout',sub:'Opacidad total',tile:4,size:0.05,color:'#55575a',rough:0.9,relief:0.7},
  {id:'algodon',name:'Algodón',sub:'Suave y mate',tile:5,size:0.05,color:'#c9744f',rough:0.97,relief:1.0},
  {id:'saten',name:'Satén',sub:'Caída fluida',tile:6,size:0.3,color:'#dccbaa',rough:0.38,sheen:'#fff6e6',relief:0.4},
  {id:'chenilla',name:'Chenilla',sub:'Hilo grueso',tile:7,size:0.08,color:'#8e9aa6',rough:0.95,sheen:'#d9e2ea',relief:2.0}
];
C.SCREENS=[
  {id:'screen-1',name:'Screen 1%',sub:'Más privacidad',tile:8,size:0.012,color:'#d9d6cf',alpha:0.9},
  {id:'screen-3',name:'Screen 3%',sub:'Equilibrado',tile:8,size:0.016,color:'#9b9890',alpha:0.8},
  {id:'screen-5',name:'Screen 5%',sub:'Más vista',tile:8,size:0.02,color:'#55534f',alpha:0.66}
];
C.WOODS=[
  {id:'nogal',name:'Nogal',sub:'Cálido y oscuro',tile:9,size:0.6,color:'#7a4c2c',rough:0.5},
  {id:'roble',name:'Roble',sub:'Natural claro',tile:9,size:0.6,color:'#b88c5c',rough:0.5},
  {id:'blanco-lac',name:'Blanco lacado',sub:'Liso',tile:9,size:0.6,color:'#efede8',rough:0.35,flat:true},
  {id:'negro-lac',name:'Negro mate',sub:'Liso',tile:9,size:0.6,color:'#2a2a2b',rough:0.55,flat:true}
];
C.DUOS=[
  {id:'duo-arena',name:'Arena',sub:'Bandas lino',color:'#d8ccb6'},
  {id:'duo-gris',name:'Gris perla',sub:'Bandas lino',color:'#b7b5b0'},
  {id:'duo-blanco',name:'Blanco',sub:'Bandas lino',color:'#efede7'},
  {id:'duo-grafito',name:'Grafito',sub:'Bandas lino',color:'#55575a'}
];
C.COLORS=[
  {id:'',name:'Color de la tela'},{id:'#efe9dd',name:'Marfil'},{id:'#d9ccb3',name:'Arena'},{id:'#b9a78a',name:'Taupe'},
  {id:'#9c9a94',name:'Gris'},{id:'#3e3f41',name:'Carbón'},{id:'#1f5a40',name:'Verde botella'},{id:'#25385a',name:'Azul noche'},
  {id:'#7d2430',name:'Burdeos'},{id:'#c9744f',name:'Terracota'},{id:'#c8a25a',name:'Mostaza'}
];
C.ROOMS=[
  {id:'living',name:'Living y comedor',re:/ESTAR|SAL[OÓ]N|SALA|LIVING|COMEDOR|COPROP/},
  {id:'dorm',name:'Dormitorios',re:/DORM|SUITE|HABIT|REC[AÁ]MARA|ALCOBA/},
  {id:'cocina',name:'Cocina y servicio',re:/COCIN|LAVANDER|SERVIC|SERV|DESPENSA|PLANCH|SECADO/},
  {id:'estudio',name:'Estudio',re:/ESTUDIO|OFICINA|ESCRITORIO|BIBLIOTECA/},
  {id:'bano',name:'Baños',re:/BAÑO|WC|TOILET/},
  {id:'otros',name:'Otros ambientes',re:null}
];
C.DEFAULT={
  living:{style:'onda',fabric:'lino',color:''},dorm:{style:'ojales',fabric:'blackout',color:''},cocina:{style:'romano',fabric:'lino',color:''},
  estudio:{style:'veneciana',fabric:'nogal',color:''},bano:{style:'screen',fabric:'screen-1',color:''},otros:{style:'onda',fabric:'lino',color:''},open:0.7
};
C.roomOf=s=>{s=(s||'').toUpperCase();for(const r of C.ROOMS)if(r.re&&r.re.test(s))return r.id;return 'otros';};
C.style=id=>C.STYLES.find(s=>s.id===id)||C.STYLES[0];
C.optionsFor=st=>{const k=C.style(st).kind;return k==='roller'?C.SCREENS:k==='veneciana'?C.WOODS:k==='duo'?C.DUOS:C.FABRICS;};
C.colorable=st=>{const k=C.style(st).kind;return k!=='roller'&&k!=='veneciana'&&k!=='duo';};
C.fix=function(sel){sel=sel||{};const st=C.style(sel.style).id,opts=C.optionsFor(st);
  const fab=opts.some(o=>o.id===sel.fabric)?sel.fabric:(opts.some(o=>o.id===C.style(st).def)?C.style(st).def:opts[0].id);
  const col=C.colorable(st)&&/^#[0-9a-f]{6}$/i.test(sel.color||'')?sel.color:'';return {style:st,fabric:fab,color:col};};
C.pick=function(v){v=v||{};const o={};C.ROOMS.forEach(r=>{o[r.id]=C.fix(v[r.id]||C.DEFAULT[r.id]);});o.open=Math.max(0,Math.min(1,v.open!=null&&isFinite(+v.open)?+v.open:C.DEFAULT.open));return o;};
C.state=C.pick(C.DEFAULT);

/* ---------- materiales ---------- */
const lin=h=>new T.Color(h).convertSRGBToLinear();
const MC=new Map();let HW=null;
function tileCanvas(i,kind){
  if(!ATLAS)return null;const key=i+'|'+kind;if(ATLAS.cache.has(key))return ATLAS.cache.get(key);
  const n=ATLAS.n,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');
  x.drawImage(ATLAS.img,(i%4)*n,((i/4)|0)*n,n,n,0,0,n,n);const im=x.getImageData(0,0,n,n),d=im.data;
  if(kind==='color'){for(let k=0;k<d.length;k+=4){const v=d[k]/255,o=Math.round(255*(0.74+0.26*v));d[k]=d[k+1]=d[k+2]=o;}}
  else if(kind==='alpha'){for(let k=0;k<d.length;k+=4){const v=d[k]/255,o=Math.round(255*Math.min(1,Math.max(0,(v-0.25)*1.8)));d[k]=d[k+1]=d[k+2]=o;}}
  else{const H=new Float32Array(n*n);for(let k=0;k<n*n;k++)H[k]=d[k*4]/255;const h=(a,b)=>H[((b+n)%n)*n+((a+n)%n)],s=kind==='normal2'?2.2:1.2;
    for(let b=0;b<n;b++)for(let a=0;a<n;a++){const dx=(h(a+1,b)-h(a-1,b))*s,dy=(h(a,b+1)-h(a,b-1))*s,l=Math.hypot(dx,dy,1),k=(b*n+a)*4;d[k]=(-dx/l*0.5+0.5)*255;d[k+1]=(dy/l*0.5+0.5)*255;d[k+2]=(1/l*0.5+0.5)*255;}}
  x.putImageData(im,0,0);ATLAS.cache.set(key,c);return c;
}
function tex(i,kind,size,srgb){const c=tileCanvas(i,kind);if(!c)return null;const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1/size,1/size);t.anisotropy=OPT.aniso||4;if(srgb)t.encoding=T.sRGBEncoding;return t;}
function decorate(m,f){
  if(!ATLAS||f.tile==null||f.flat)return;
  m.map=tex(f.tile,'color',f.size,true);m.normalMap=tex(f.tile,(f.relief||1)>1.5?'normal2':'normal',f.size,false);const r=Math.min(1.4,(f.relief||1));m.normalScale=new T.Vector2(r,-r);
  if(f.alpha!=null&&f.tile!==9){m.alphaMap=tex(f.tile,'alpha',f.size,false);}
  m.needsUpdate=true;
}
function fabricMat(f,color,side){
  const key=f.id+'|'+(color||'')+'|'+(side||'');if(MC.has(key))return MC.get(key);
  const P=f.sheen&&'sheen' in new T.MeshPhysicalMaterial();
  const m=P?new T.MeshPhysicalMaterial({roughness:f.rough!=null?f.rough:0.9}):new T.MeshStandardMaterial({roughness:f.rough!=null?f.rough:0.9});
  if(P)m.sheen=lin(color?new T.Color(color).lerp(new T.Color('#ffffff'),0.45).getStyle():f.sheen);
  m.color=lin(color||f.color);m.side=T.DoubleSide;m.metalness=0;m.envMapIntensity=0.5;
  if(f.alpha!=null){m.transparent=true;m.opacity=Math.min(1,f.alpha+0.25);m.depthWrite=false;m.alphaTest=0.02;}
  m.userData.fab=f;m.userData.envBase=0.5;decorate(m,f);MC.set(key,m);return m;
}
function duoMats(d){
  const key='duo|'+d.id;if(MC.has(key))return MC.get(key);
  const c=document.createElement('canvas');c.width=8;c.height=128;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,8,128);x.fillStyle='#4a4a4a';x.fillRect(0,76,8,52);
  const a=new T.CanvasTexture(c);a.wrapS=a.wrapT=T.RepeatWrapping;a.repeat.set(1,1/0.125);a.magFilter=T.LinearFilter;
  const f=C.FABRICS[0],mk=()=>{const m=new T.MeshStandardMaterial({color:lin(d.color),roughness:0.95,side:T.DoubleSide,transparent:true,alphaMap:a,alphaTest:0.05,depthWrite:true});
    if(ATLAS){m.map=tex(0,'color',0.05,true);m.normalMap=tex(0,'normal',0.05,false);}m.userData.envBase=0.5;m.envMapIntensity=0.5;return m;};
  const r=[mk(),mk()];MC.set(key,r);return r;
}
function hwMats(){if(HW)return HW;const M=(c,o)=>{const m=new T.MeshStandardMaterial({color:lin(c),...o});m.userData.envBase=o.envMapIntensity||1;return m;};
  HW={riel:M('#ecebe7',{roughness:0.35,metalness:0.2}),laton:M('#c9a465',{roughness:0.28,metalness:1,envMapIntensity:1.1}),negro:M('#202122',{roughness:0.45,metalness:0.6}),
    alu:M('#e9e8e4',{roughness:0.32,metalness:0.25}),cinta:M('#d7cfc0',{roughness:0.95,metalness:0,side:T.DoubleSide})};return HW;}
C.reapplyEnv=function(s){MC.forEach(m=>{[].concat(m).forEach(x=>{x.envMapIntensity=(x.userData.envBase||0.5)*s;});});if(HW)Object.values(HW).forEach(m=>{m.envMapIntensity=(m.userData.envBase||1)*s;});};

/* ---------- acumulador de geometría ---------- */
function Acc(){this.p=[];this.n=[];this.u=[];this.i=[];this.v=0;}
Acc.prototype.add=function(name,X){
  const g=KIT[name];if(!g)return;const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,I=g.index,b=this.v;
  const F=X.f,o=F.o,u=F.u,nn=F.n,sx=X.sx==null?1:X.sx,ox=X.ox||0,sz=X.sz==null?1:X.sz,oz=X.oz||0,ym=X.ym,sy=X.sy;
  const flip=(sx*(sy?1:1)*sz)<0;
  for(let k=0;k<P.count;k++){
    const lx=P.getX(k)*sx+ox,ly0=P.getY(k),ly=ym?ym(ly0):ly0*(X.syc||1)+(X.oy||0),lz=P.getZ(k)*sz+oz;
    this.p.push(o[0]+u[0]*lx+nn[0]*lz,o[1]+ly,o[2]+u[2]*lx+nn[2]*lz);
    const dsy=sy?sy(ly0):(X.syc||1);let a=N.getX(k)/sx,c=N.getY(k)/dsy,d=N.getZ(k)/sz;
    const wx=u[0]*a+nn[0]*d,wy=c,wz=u[2]*a+nn[2]*d,L=Math.hypot(wx,wy,wz)||1;this.n.push(wx/L,wy/L,wz/L);
    if(U){const uv=X.uv?X.uv(U.getX(k),U.getY(k),ly0):[U.getX(k),U.getY(k)];this.u.push(uv[0],uv[1]);}else this.u.push(0,0);
  }
  if(I){for(let k=0;k<I.count;k+=3){const A=b+I.getX(k),B=b+I.getX(k+1),Cc=b+I.getX(k+2);if(flip)this.i.push(A,Cc,B);else this.i.push(A,B,Cc);}}
  else for(let k=0;k<P.count;k+=3){if(flip)this.i.push(b+k,b+k+2,b+k+1);else this.i.push(b+k,b+k+1,b+k+2);}
  this.v+=P.count;
};
Acc.prototype.quad=function(F,x0,x1,y0,y1,z,uvS){
  const b=this.v,o=F.o,u=F.u,n=F.n,P=(x,y)=>[o[0]+u[0]*x+n[0]*z,o[1]+y,o[2]+u[2]*x+n[2]*z];
  [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].forEach(([x,y])=>{this.p.push(...P(x,y));this.n.push(n[0],0,n[2]);this.u.push(x*(uvS||1),y*(uvS||1));});
  this.i.push(b,b+1,b+2,b,b+2,b+3);this.v+=4;
};
Acc.prototype.geo=function(){if(!this.v)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));
  g.setIndex(this.v>65535?new T.Uint32BufferAttribute(this.i,1):new T.Uint16BufferAttribute(this.i,1));g.computeBoundingSphere();return g;};

/* nine-slice vertical: cabecera y ruedo conservan su alto, el cuerpo se estira */
function slice9(H,head,hem){const mid0=H0-head-hem,mid=Math.max(0.05,H-head-hem),k=mid/mid0;
  return {ym:y=>y<hem?y:y>H0-head?H-(H0-y):hem+(y-hem)*k,sy:y=>y<hem||y>H0-head?1:k};}

/* ---------- armado por tipo ---------- */
function drape(B,w,st,fab,col,open,acc){
  const P=PER[st.id],span=w.span,s9=slice9(w.h,0.36,0.2),F0=w.frame;
  const two=span>1.1,nPan=two?2:1,half=span/nPan;
  const nP=Math.max(2,Math.round(half*1.05/P)),closedW=half,stackW=Math.max(0.12,nP*P*0.32),pw=closedW+(stackW-closedW)*open,sx=pw/(nP*P),sz=Math.min(1.35,Math.pow(1/sx,0.6)),oz=0.03*(sz-1);
  const arcP=(()=>{const g=KIT['f_'+st.id].attributes.uv;let m=0;for(let k=0;k<g.count;k++)m=Math.max(m,g.getX(k));return m;})();
  const m=fabricMat(fab,col);const A=acc(m);
  for(let p=0;p<nPan;p++){
    const x0=nPan===1?(w.side<0?0:span-pw):(p===0?0:span-pw);
    for(let k=0;k<nP;k++){const ox=x0+k*P*sx;
      A.add('f_'+st.id,{f:F0,sx,ox,sz,oz,ym:s9.ym,sy:s9.sy,uv:(u,v,y)=>[(k*arcP+u),s9.ym(y)]});
      if(st.id==='ojales')acc(hwMats().negro).add('h_ojal',{f:F0,sx,ox,sz,oz,ym:s9.ym,sy:s9.sy});
      if(st.id==='pliegue')acc(hwMats().laton).add('h_anilla',{f:F0,ox,oy:w.h-0.05+0.075,oz:0});
      if(st.id==='onda'||st.id==='visillo'){acc(hwMats().riel).add('h_carro',{f:F0,ox:ox,oy:w.h+0.012});}
    }
    if(st.id==='pliegue')acc(hwMats().laton).add('h_anilla',{f:F0,ox:x0+pw,oy:w.h-0.05+0.075,oz:0});
  }
  const L=span+0.06;
  if(st.hw==='riel'){acc(hwMats().riel).add('h_riel',{f:F0,sx:L,ox:-0.03,oy:w.h+0.03});}
  else{const hm=hwMats()[st.hw],ry=w.h+(st.id==='pliegue'?0.025:-0.05);
    acc(hm).add('h_barra',{f:F0,sx:span+0.16,ox:-0.08,oy:ry});
    const fin=st.id==='pliegue'?'h_remate_bola':'h_remate_tapa';
    acc(hm).add(fin,{f:F0,sx:1,ox:span+0.08,oy:ry});acc(hm).add(fin,{f:F0,sx:-1,ox:-0.08,oy:ry});
    const br=[0.0,span];if(span>2.4)br.push(span/2);br.forEach(x=>acc(hm).add('h_soporte',{f:F0,ox:x,oy:ry}));}
}
function roller(B,w,st,opt,open,acc,duo){
  const F=w.frame,W=w.span,drop=Math.max(0.12,(1-open)*w.h+0.08),top=w.h;
  acc(hwMats().alu).add('h_cassette',{f:F,sx:W+0.03,ox:-0.015,oy:top+0.035,oz:0.0});
  if(duo){const [m1,m2]=duoMats(opt);const a1=acc(m1),a2=acc(m2);
    a1.quad(F,0,W,top-drop,top,0.012);a2.quad(F,0,W,top-drop,top,-0.006);}
  else{const m=fabricMat(opt,'');acc(m).quad(F,0,W,top-drop,top,0.012);}
  acc(hwMats().alu).add('h_barra_inf',{f:F,sx:W,ox:0,oy:top-drop,oz:0.012});
}
function romano(B,w,st,fab,col,open,acc){
  const F=w.frame,W=w.span,top=w.h,stack=0.395,drop=Math.max(stack,(1-open)*w.h+stack*open);
  const m=fabricMat(fab,col);const k=(drop-stack)/(1-stack);
  acc(m).add('f_romano',{f:F,sx:W,ox:0,sz:1,ym:y=>top-drop+(y<stack?y:stack+(y-stack)*k),sy:y=>y<stack?1:Math.max(0.05,k),uv:(u,v)=>[u*W,v]});
  acc(hwMats().alu).add('h_romano_cab',{f:F,sx:W+0.02,ox:-0.01,oy:top+0.02,oz:0.0});
}
function veneciana(B,w,st,wood,open,acc){
  const F=w.frame,W=w.span,top=w.h,pitch=0.042,n=Math.max(3,Math.floor((w.h-0.04)/pitch)),nDown=Math.max(1,Math.round(n*(1-open))),nUp=n-nDown;
  const m=fabricMat(wood,'');const A=acc(m);
  A.add('h_cabezal_ven',{f:F,sx:W+0.02,ox:-0.01,oy:top+0.0,oz:0,uv:(a,b)=>[a*W,b]});
  const tilt=0.38,ca=Math.cos(tilt),sa=Math.sin(tilt);
  let y=top-0.05;const luv=(a,b)=>[a*W,b];for(let k=0;k<nUp;k++){A.add('h_lama',{f:F,sx:W,ox:0,oy:y,uv:luv});y-=0.0075;}
  const yTop=y;for(let k=0;k<nDown;k++){y-=pitch;A.add('h_lama',{f:F,sx:W,ox:0,oy:y,tilt:[ca,sa],uv:luv});}
  A.add('h_inf_ven',{f:F,sx:W,ox:0,oy:y-0.03,uv:(a,b)=>[a*W,b]});
  const tapes=[0.1,W-0.1];const extra=Math.floor((W-0.2)/0.75);for(let k=1;k<=extra;k++)tapes.push(0.1+k*(W-0.2)/(extra+1));
  tapes.forEach(x=>acc(hwMats().cinta).add('h_cinta',{f:F,ox:x,oy:top-0.03,syc:(top-0.03)-(y-0.03)}));
}
function panel(B,w,st,fab,col,open,acc){
  const F=w.frame,W=w.span,np=Math.max(2,Math.min(5,Math.ceil(W/0.75))),pw=W/np+0.04,top=w.h;
  const m=fabricMat(fab,col),A=acc(m),H=hwMats().alu;
  acc(H).add('h_riel4',{f:F,sx:W+0.04,ox:-0.02,oy:top+0.02,oz:0});
  for(let k=0;k<np;k++){const xc=k*(W-pw)/(np-1),xo=k*0.025,x=xc+(xo-xc)*open,z2=Math.max(-0.045,Math.min(0.045,0.045-k*0.03));
    A.quad(F,x,x+pw,0.01,top,z2,1);
    acc(H).add('h_panel_bar',{f:F,sx:pw,ox:x,oy:0.016,oz:z2});acc(H).add('h_panel_bar',{f:F,sx:pw,ox:x,oy:top-0.006,oz:z2});}
}

/* ---------- API ---------- */
C.init=function(THREE,opts){T=THREE;OPT=opts||{};};
C.load=function(url,atlasUrl){
  const kitP=new Promise(res=>{if(!T.GLTFLoader)return res(false);new T.GLTFLoader().load(url,gl=>{const K={};gl.scene.traverse(o=>{if(o.isMesh){const g=o.geometry.clone();o.updateMatrixWorld();g.applyMatrix4(o.matrixWorld);if(!g.attributes.normal)g.computeVertexNormals();K[o.name]=g;}});KIT=K;res(true);},undefined,()=>res(false));});
  const atP=new Promise(res=>{const im=new Image();im.onload=()=>{ATLAS={img:im,n:im.width/4|0,cache:new Map()};MC.forEach(m=>{[].concat(m).forEach(x=>{if(x.userData.fab)decorate(x,x.userData.fab);});});if(OPT.onChange)OPT.onChange();res(true);};im.onerror=()=>res(false);im.src=atlasUrl;});
  atP.then(()=>{});return kitP;
};
C.ready=()=>!!KIT;
C.build=function(list,sel){
  const grp=new T.Group();if(!KIT||!list||!list.length)return grp;const ACC=new Map(),acc=m=>{if(!ACC.has(m))ACC.set(m,new Acc());return ACC.get(m);};
  const S=sel||C.state;
  list.forEach(w=>{try{
    const r=C.fix(S[w.room]||S.otros),st=C.style(r.style),opts=C.optionsFor(st.id),opt=opts.find(o=>o.id===r.fabric)||opts[0],open=S.open;
    if(w.bath&&st.kind==='drape')return;
    const W=geom(w,st);
    if(st.kind==='drape')drape(null,W,st,opt,r.color,open,acc);
    else if(st.kind==='roller')roller(null,W,st,opt,open,acc,false);
    else if(st.kind==='duo')roller(null,W,st,opt,open,acc,true);
    else if(st.kind==='romano')romano(null,W,st,opt,r.color,open,acc);
    else if(st.kind==='veneciana')veneciana(null,W,st,opt,open,acc);
    else if(st.kind==='panel')panel(null,W,st,opt,r.color,open,acc);
  }catch(e){console.warn('cortina',e);}});
  ACC.forEach((a,m)=>{const g=a.geo();if(!g)return;const me=new T.Mesh(g,m);me.castShadow=!m.transparent;me.receiveShadow=true;me.userData.cortina=true;if(m.transparent)me.renderOrder=2;grp.add(me);});
  grp.userData.cortList=list;return grp;
};
function geom(w,st){
  const drapeK=st.kind==='drape'||st.kind==='panel',ext=drapeK?Math.min(0.22,w.extL):0.05,extR=drapeK?Math.min(0.22,w.extR):0.05;
  const inside=w.face+(st.kind==='drape'?0.11:st.kind==='panel'?0.07:0.045);
  const x0=-ext,span=w.l+ext+extR;
  const o=[w.o[0]+w.u[0]*x0+w.n[0]*inside,0,w.o[1]+w.u[1]*x0+w.n[1]*inside];
  let y0,h;
  if(drapeK){const ceilMount=st.hw==='riel'||st.kind==='panel';const topY=ceilMount?w.top-0.045:Math.min(w.top-0.09,w.y1+0.16);y0=w.lv+0.012;h=topY-y0;}
  else{const topY=Math.min(w.top-0.06,w.y1+0.1);const bot=w.y0<=w.lv+0.05?w.lv+0.02:Math.max(w.lv+0.02,w.y0-0.06);y0=bot;h=topY-bot;}
  o[1]=y0;let u=[w.u[0],0,w.u[1]];
  if(w.u[0]*w.n[1]-w.u[1]*w.n[0]<0){o[0]+=u[0]*span;o[2]+=u[2]*span;u=[-u[0],0,-u[2]];}
  return {frame:{o,u,n:[w.n[0],0,w.n[1]]},span,h,side:w.side||1};
}
C.rebuild=function(grp,sel){if(!grp||!grp.userData.cortList)return;const n=C.build(grp.userData.cortList,sel);grp.children.slice().forEach(c=>{grp.remove(c);c.geometry.dispose();});n.children.slice().forEach(c=>grp.add(c));};

/* inclinación de lamas: se aplica dentro de add vía opción tilt */
const _add=Acc.prototype.add;
Acc.prototype.add=function(name,X){
  if(!X.tilt)return _add.call(this,name,X);
  const [ca,sa]=X.tilt,g=KIT[name];if(!g)return;
  const b=this.v;_add.call(this,name,{f:X.f,sx:X.sx,ox:X.ox,oy:0,uv:X.uv});
  const F=X.f,o=F.o,u=F.u,n=F.n;
  for(let k=b;k<this.v;k++){
    const px=this.p[k*3]-o[0],py=this.p[k*3+1]-o[1],pz=this.p[k*3+2]-o[2];
    const lx=px*u[0]+pz*u[2],lz=px*n[0]+pz*n[2],ly=py;
    const ry=ly*ca-lz*sa+X.oy,rz=ly*sa+lz*ca;
    this.p[k*3]=o[0]+u[0]*lx+n[0]*rz;this.p[k*3+1]=o[1]+ry;this.p[k*3+2]=o[2]+u[2]*lx+n[2]*rz;
    const nx=this.n[k*3],ny=this.n[k*3+1],nz=this.n[k*3+2],nlx=nx*u[0]+nz*u[2],nlz=nx*n[0]+nz*n[2];
    const nry=ny*ca-nlz*sa,nrz=ny*sa+nlz*ca;this.n[k*3]=u[0]*nlx+n[0]*nrz;this.n[k*3+1]=nry;this.n[k*3+2]=u[2]*nlx+n[2]*nrz;
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=C;else root.Cortinas=C;
})(typeof globalThis!=='undefined'?globalThis:this);

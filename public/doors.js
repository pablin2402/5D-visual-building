(function(root){
const Doors={};
let T=null,KIT=null,OPT={};

Doors.STYLES=[
  {id:'recto',name:'Recto',desc:'Líneas limpias y minimalistas.',tapa:'recto',ft:0.02,tope:true},
  {id:'clasico',name:'Clásico',desc:'Diseño atemporal con canto redondeado.',tapa:'clasico',ft:0.02,tope:true},
  {id:'moldurado',name:'Moldurado',desc:'Molduras escalonadas, acabado sofisticado.',tapa:'moldurado',ft:0.022,tope:true},
  {id:'oculto',name:'Oculto',desc:'Coplanar con la pared, solo una línea de sombra.',tapa:null,shadow:true,ft:0.018,tope:true},
  {id:'pivotante',name:'Pivotante',desc:'Marco grueso sin tapajuntas para puertas de gran formato.',tapa:null,ft:0.045,tope:false},
  {id:'metalico',name:'Metálico',desc:'Perfil de acero delgado, estilo industrial.',tapa:'metalico',ft:0.015,tope:true},
  {id:'minimalista',name:'Minimalista',desc:'Perfil delgado de 35 mm, discreto.',tapa:'minimalista',ft:0.018,tope:true},
  {id:'tradicional',name:'Tradicional',desc:'Tapajuntas ancho con contramarco.',tapa:'tradicional',ft:0.025,tope:true},
  {id:'curvo',name:'Curvo',desc:'Canto curvo, suave y moderno.',tapa:'curvo',ft:0.02,tope:true},
  {id:'doble',name:'Doble marco',desc:'Dos tapajuntas escalonados, más presencia.',tapa:'doble',ft:0.022,tope:true}
];
Doors.COLORS=[
  {id:'blanco',name:'Blanco mate',hex:'#ebe8e4'},{id:'negro',name:'Negro mate',hex:'#262626'},{id:'grafito',name:'Gris grafito',hex:'#4e4e4d'},
  {id:'gris-claro',name:'Gris claro',hex:'#bdbcbc'},{id:'beige',name:'Beige arena',hex:'#cdbfae'},
  {id:'roble',name:'Roble natural',hex:'#b88f62',wood:true},{id:'nogal',name:'Nogal',hex:'#6e4a30',wood:true},
  {id:'roble-ahumado',name:'Roble ahumado',hex:'#544a41',wood:true},{id:'wengue',name:'Wengué',hex:'#33281f',wood:true},
  {id:'ceniza',name:'Ceniza',hex:'#8b8178',wood:true},{id:'aluminio',name:'Aluminio cepillado',hex:'#c4c6c7',brushed:true}
];
Doors.MATERIALS=[
  {id:'madera',name:'Madera',rough:0.55,metal:0,note:'Madera maciza'},
  {id:'mdf',name:'MDF',rough:0.42,metal:0,note:'MDF laqueado o enchapado'},
  {id:'aluminio',name:'Aluminio',rough:0.36,metal:0.25,note:'Perfil de aluminio'},
  {id:'pvc',name:'PVC',rough:0.36,metal:0,note:'PVC resistente a la humedad'}
];
Doors.state={style:'recto',color:'roble',material:'madera'};

function canvasTex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn(x,w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.encoding=T.sRGBEncoding;return t;}
let seed=31;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
function woodTex(){
  return canvasTex(1024,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);
    for(let i=0;i<70;i++){const y=rnd()*h,a=0.05+rnd()*0.12,amp=1+rnd()*3,ph=rnd()*6;x.strokeStyle=`rgba(60,40,25,${a})`;x.lineWidth=0.6+rnd()*1.6;x.beginPath();
      for(let px=0;px<=w;px+=16){const yy=y+Math.sin(px/w*Math.PI*2*(1+rnd()*0.02)+ph)*amp;px?x.lineTo(px,yy):x.moveTo(px,yy);}x.stroke();}
    for(let i=0;i<500;i++){x.fillStyle=`rgba(40,25,15,${rnd()*0.06})`;x.fillRect(rnd()*w,rnd()*h,4+rnd()*20,1);}
  });
}
function brushedTex(){
  return canvasTex(512,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);for(let i=0;i<1400;i++){const v=rnd()<0.5?0:255;x.fillStyle=`rgba(${v},${v},${v},${rnd()*0.12})`;x.fillRect(rnd()*w,rnd()*h,20+rnd()*160,1);}});
}

Doors.init=function(THREE,opts){
  T=THREE;OPT=opts||{};
  Doors.tex={wood:woodTex(),brushed:brushedTex()};
  [Doors.tex.wood,Doors.tex.brushed].forEach(t=>t.repeat.set(1/1.2,1/0.12));
  Doors.mats={frame:new T.MeshStandardMaterial({color:0xb88f62,roughness:0.55}),shadow:new T.MeshStandardMaterial({color:0x080808,roughness:0.95})};
  Doors.apply();
};
const byId=(L,id)=>L.find(x=>x.id===id)||L[0];
Doors.apply=function(){
  if(!Doors.mats)return;const S=Doors.state,c=byId(Doors.COLORS,S.color),m=byId(Doors.MATERIALS,S.material),M=Doors.mats.frame;
  M.color.set(c.hex).convertSRGBToLinear();
  const map=c.wood?Doors.tex.wood:(c.brushed?Doors.tex.brushed:null);if(M.map!==map){M.map=map;M.needsUpdate=true;}
  M.metalness=c.brushed?0.85:(c.wood&&m.id==='aluminio'?0.1:m.metal);
  M.roughness=c.brushed?0.3:(c.wood?Math.max(0.4,m.rough):m.rough);
  M.userData.envBase=c.brushed?1.1:(m.id==='aluminio'?0.9:0.6);M.envMapIntensity=M.userData.envBase*(OPT.envScale?OPT.envScale():1);
  if(OPT.onChange)OPT.onChange();
};
Doors.set=function(o){const prev=Doors.state.style;Object.assign(Doors.state,o||{});Doors.apply();return prev!==Doors.state.style;};
Doors.summary=function(){const S=Doors.state;return {style:byId(Doors.STYLES,S.style),color:byId(Doors.COLORS,S.color),material:byId(Doors.MATERIALS,S.material)};};

function procKit(){const K={};
  const mk=(y0,y1,z0,z1)=>{const g=new T.BoxGeometry(1,y1-y0,z1-z0);g.translate(0.5,(y0+y1)/2,(z0+z1)/2);g.deleteAttribute('uv');return g;};
  K.forro=mk(0,1,-0.5,0.5);K.tope=mk(0,0.012,-0.02,0.02);K.sombra=mk(-0.009,0,-0.007,0.0006);
  Doors.STYLES.forEach(s=>{if(s.tapa)K['tapa_'+s.tapa]=mk(-0.07,0,0,0.014);});return K;}
Doors.load=function(url){
  return new Promise(res=>{
    if(!T.GLTFLoader){KIT=procKit();return res(false);}
    new T.GLTFLoader().load(url,gl=>{const K={};gl.scene.traverse(o=>{if(o.isMesh){const g=o.geometry.clone();o.updateMatrixWorld();g.applyMatrix4(o.matrixWorld);K[o.name]=g;}});
      const fb=procKit();Object.keys(fb).forEach(k=>{if(!K[k])K[k]=fb[k];});KIT=K;res(true);},undefined,()=>{KIT=procKit();res(false);});
  });
};

function Acc(){this.p=[];this.n=[];this.u=[];this.i=[];this.v=0;}
Acc.prototype.profile=function(g,O,U,A,Z,len,m0,m1,sy,sz){
  sy=sy||1;sz=sz||1;const P=g.attributes.position,N=g.attributes.normal,I=g.index,b=this.v;
  const cr=[U[1]*A[2]-U[2]*A[1],U[2]*A[0]-U[0]*A[2],U[0]*A[1]-U[1]*A[0]],flip=(cr[0]*Z[0]+cr[1]*Z[1]+cr[2]*Z[2])<0;
  for(let k=0;k<P.count;k++){const px=P.getX(k),py=P.getY(k)*sy,pz=P.getZ(k)*sz;
    const t=px<0.5?m0*py:len-m1*py;
    this.p.push(O[0]+U[0]*t+A[0]*py+Z[0]*pz,O[1]+U[1]*t+A[1]*py+Z[1]*pz,O[2]+U[2]*t+A[2]*py+Z[2]*pz);
    const a=N.getX(k),c=N.getY(k)/sy,d=N.getZ(k)/sz;let nx=U[0]*a+A[0]*c+Z[0]*d,ny=U[1]*a+A[1]*c+Z[1]*d,nz=U[2]*a+A[2]*c+Z[2]*d;const L=Math.hypot(nx,ny,nz)||1;this.n.push(nx/L,ny/L,nz/L);
    this.u.push(t,py+pz);}
  const idx=I?Array.from(I.array):[...Array(P.count).keys()];
  for(let k=0;k<idx.length;k+=3){if(flip)this.i.push(b+idx[k],b+idx[k+2],b+idx[k+1]);else this.i.push(b+idx[k],b+idx[k+1],b+idx[k+2]);}
  this.v+=P.count;
};
Acc.prototype.geo=function(){if(!this.v)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));
  g.setIndex(this.v>65535?new T.Uint32BufferAttribute(this.i,1):new T.Uint16BufferAttribute(this.i,1));g.computeBoundingSphere();return g;};

function frameOf(B,d,st){
  const W=(x,y,z)=>[d.o[0]+d.n[0]*x+d.e[0]*z,d.lv+y,d.o[1]+d.n[1]*x+d.e[1]*z];
  const V=(x,y,z)=>[d.n[0]*x+d.e[0]*z,y,d.n[1]*x+d.e[1]*z];
  const D=d.d,H=d.hd,L=d.L,ft=st.ft,up=V(0,1,0),X=V(1,0,0),nX=V(-1,0,0),nY=V(0,-1,0),Ze=V(0,0,1),nZe=V(0,0,-1);
  const run=(acc,g,off,z,Zd,sy,sz,bottom)=>{
    acc.profile(g,W(off,0,z),up,X,Zd,H-off,0,1,sy,sz);
    acc.profile(g,W(D-off,0,z),up,nX,Zd,H-off,0,1,sy,sz);
    if(!bottom)acc.profile(g,W(off,H-off,z),X,nY,Zd,D-2*off,1,1,sy,sz);
  };
  run(B.frame,KIT.forro,0,0,Ze,ft,L);
  if(st.tope)run(B.frame,KIT.tope,ft,0,Ze,1,1);
  const C=Doors.clipFor(d);
  if(C.tapa){const g=KIT['tapa_'+st.tapa];run(B.frame,g,C.rev,L/2,Ze,C.sy[1],1);run(B.frame,g,C.rev,-L/2,nZe,C.sy[-1],1);}
  if(st.shadow){const g=KIT.sombra;if(!g.boundingBox)g.computeBoundingBox();const b0=g.boundingBox.min.z,b1=g.boundingBox.max.z,sz=0.0015/(b1-b0),zo=L/2-b0*sz;const sy=sd=>{const a=d.av&&d.av[sd]?Math.min(d.av[sd][0],d.av[sd][1]):1;return Math.max(0.02,Math.min(1,(a-0.0005)/-g.boundingBox.min.y));};run(B.shadow,g,0,zo,Ze,sy(1),sz);run(B.shadow,g,0,-zo,nZe,sy(-1),sz);}
}
const ZD=0.023;
function tapaDims(st){const g=st.tapa&&KIT&&KIT['tapa_'+st.tapa];if(!g)return null;if(!g.boundingBox)g.computeBoundingBox();return {w:-g.boundingBox.min.y,t:g.boundingBox.max.z};}
Doors.clipFor=function(d){
  if(!KIT)KIT=procKit();const st=byId(Doors.STYLES,Doors.state.style),ft=st.ft,rev=ft-0.005,td=tapaDims(st),D=d.d;
  if(!td)return {tapa:false,rev:0,t:0,x:{1:[0,D],'-1':[0,D]},sy:{1:1,'-1':1}};
  const x={},sy={};[1,-1].forEach(s=>{const av=d.av&&d.av[s]?Math.min(d.av[s][0],d.av[s][1]):1,room=av<td.w?av-ZD:av;let w=av<=0?rev:Math.min(td.w,Math.max(rev+0.004,room+rev-0.001));sy[s]=w/td.w;x[s]=[rev-w,D-rev+w];});
  return {tapa:true,rev,t:td.t,x,sy};
};
Doors.build=function(list){
  const grp=new T.Group();if(!KIT)KIT=procKit();const st=byId(Doors.STYLES,Doors.state.style);
  const B={frame:new Acc(),shadow:new Acc()};
  list.forEach(d=>{try{frameOf(B,d,st);}catch(e){console.warn('puerta',e);}});
  const add=(acc,mat)=>{const g=acc.geo();if(!g)return;const me=new T.Mesh(g,mat);me.castShadow=true;me.receiveShadow=true;me.userData.doorFrame=true;grp.add(me);};
  add(B.frame,Doors.mats.frame);add(B.shadow,Doors.mats.shadow);
  grp.userData.doorList=list;return grp;
};
Doors.rebuild=function(grp){if(!grp||!grp.userData.doorList)return;const n=Doors.build(grp.userData.doorList);grp.children.slice().forEach(c=>{grp.remove(c);c.geometry.dispose();});n.children.slice().forEach(c=>grp.add(c));};

if(typeof module!=='undefined'&&module.exports)module.exports=Doors;else root.Doors=Doors;
})(typeof globalThis!=='undefined'?globalThis:this);

(function(root){
const Glazing={};
let T=null,KIT=null,OPT={};
const MODE_IDX={ext:0,int:1,walk:2};

Glazing.GLASS=[
  {id:'transparente',name:'Transparente',spec:'Float incoloro 6 mm',desc:'Máxima claridad y entrada de luz natural.',color:0xe4f0f0,op:[0.2,0.13,0.09],rough:0.02,metal:0.08,env:1.0,fres:0.9,spec2:0.9},
  {id:'ahumado',name:'Ahumado',spec:'Float gris 6 mm',desc:'Reduce el deslumbramiento y da privacidad sin perder visibilidad.',color:0x3f474c,op:[0.62,0.46,0.4],rough:0.03,metal:0.2,env:1.1,fres:0.9,spec2:1.0},
  {id:'esmerilado',name:'Esmerilado',spec:'Arenado 6 mm',desc:'Privacidad total con luz difusa. Ideal para baños.',color:0xf0f4f3,op:[0.88,0.86,0.84],rough:0.62,metal:0,env:0.45,fres:0.35,spec2:0.2,frost:true,glow:[0.1,0.16,0.18]},
  {id:'reflectivo',name:'Reflectivo',spec:'Reflectivo azul-gris 6 mm',desc:'Efecto espejo por fuera: controla el calor y la exposición solar.',color:0x5d7484,op:[0.84,0.5,0.42],rough:0.035,metal:0.85,env:1.9,fres:0.6,spec2:1.4},
  {id:'texturizado',name:'Texturizado',spec:'Acanalado (reeded) 6 mm',desc:'Estrías verticales que difuminan la vista con estilo.',color:0xe8f0ef,op:[0.6,0.56,0.54],rough:0.1,metal:0.05,env:1.2,fres:0.8,spec2:0.9,flutes:true,glow:[0.04,0.06,0.07]},
  {id:'termopanel',name:'Doble vidrio (termopanel)',spec:'DVH 6 + 12 + 6 mm',desc:'Dos vidrios con cámara de aire: aislamiento térmico y acústico.',color:0xd9ece6,op:[0.15,0.1,0.07],rough:0.02,metal:0.08,env:1.0,fres:0.85,spec2:0.8,double:true}
];
Glazing.FRAMES=[
  {id:'blanco',name:'Blanco',hex:'#eeeeec'},{id:'negro',name:'Negro',hex:'#25282a'},{id:'antracita',name:'Gris antracita',hex:'#4a4c4f'},
  {id:'gris-claro',name:'Gris claro',hex:'#b4b5b5'},{id:'beige',name:'Beige',hex:'#dcd1bf'},{id:'cafe',name:'Café',hex:'#5a4232'},
  {id:'bronce',name:'Bronce',hex:'#6f5a42'},{id:'verde-oliva',name:'Verde oliva',hex:'#56604a'},{id:'azul-marino',name:'Azul marino',hex:'#26344a'},
  {id:'terracota',name:'Rojo terracota',hex:'#a1472a'}
];
Glazing.state={glass:'transparente',frame:'negro',bathFrosted:true,mode:'ext'};

function fresnelPatch(mat){
  mat.userData.uFres={value:0.8};mat.userData.uSpec={value:0.9};
  mat.onBeforeCompile=sh=>{
    sh.uniforms.uFres=mat.userData.uFres;sh.uniforms.uSpec=mat.userData.uSpec;
    sh.fragmentShader='uniform float uFres;\nuniform float uSpec;\n'+sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
      'float gNV=abs(dot(normalize(normal),normalize(vViewPosition)));\nfloat gFr=pow(1.0-gNV,4.0)*uFres;\nfloat gSp=dot(reflectedLight.directSpecular+reflectedLight.indirectSpecular,vec3(0.2126,0.7152,0.0722))*uSpec;\nfloat gA=clamp(diffuseColor.a+(gFr+gSp)*(1.0-diffuseColor.a),0.0,1.0);\ngl_FragColor = vec4( outgoingLight, gA );');
  };
  mat.customProgramCacheKey=()=>'glazing-fresnel';
}
function glassMat(){const m=new T.MeshStandardMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,color:0xffffff});fresnelPatch(m);return m;}
function canvasTex(w,h,fn,lin){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn(x,w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(!lin)t.encoding=T.sRGBEncoding;return t;}
function fluteMaps(){
  const W=256,P=32;
  const nrm=canvasTex(W,4,(x,w,h)=>{const im=x.createImageData(w,h);for(let i=0;i<w;i++){const t=((i%P)+0.5)/P*2-1,s=t/Math.sqrt(Math.max(0.08,1-t*t)),n=[-s*0.55,0,1],L=Math.hypot(n[0],n[1],n[2]);
    for(let j=0;j<h;j++){const k=(j*w+i)*4;im.data[k]=(n[0]/L*0.5+0.5)*255;im.data[k+1]=(n[1]/L*0.5+0.5)*255;im.data[k+2]=(n[2]/L*0.5+0.5)*255;im.data[k+3]=255;}}x.putImageData(im,0,0);},true);
  const alpha=canvasTex(W,4,(x,w,h)=>{for(let i=0;i<w;i++){const t=((i%P)+0.5)/P*2-1,v=Math.round(255*(0.72+0.28*Math.pow(Math.abs(t),3)));x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(i,0,1,h);}},true);
  const per=8*0.022;[nrm,alpha].forEach(t=>t.repeat.set(1/per,1));return {nrm,alpha};
}
function frostMap(){
  let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  const t=canvasTex(128,128,(x,w,h)=>{const im=x.createImageData(w,h);for(let k=0;k<w*h;k++){const a=(r()-0.5)*0.35,b=(r()-0.5)*0.35;im.data[k*4]=(a*0.5+0.5)*255;im.data[k*4+1]=(b*0.5+0.5)*255;im.data[k*4+2]=255;im.data[k*4+3]=255;}x.putImageData(im,0,0);},true);
  t.repeat.set(6,6);return t;
}

Glazing.init=function(THREE,opts){
  T=THREE;OPT=opts||{};
  const M=Glazing.mats={
    frame:new T.MeshStandardMaterial({color:0x25282a,metalness:0.3,roughness:0.38}),
    handle:new T.MeshStandardMaterial({color:0x25282a,metalness:0.55,roughness:0.3}),
    rubber:new T.MeshStandardMaterial({color:0x0c0c0c,roughness:0.85,metalness:0}),
    spacer:new T.MeshStandardMaterial({color:0x8d9194,roughness:0.4,metalness:0.8}),
    main:glassMat(),bath:glassMat(),back:glassMat(),backBath:glassMat()
  };
  Glazing.tex={flutes:fluteMaps(),frost:frostMap()};
  Glazing.apply();
};

function glassById(id){return Glazing.GLASS.find(g=>g.id===id)||Glazing.GLASS[0];}
function setGlass(m,g,mode,back){
  const i=MODE_IDX[mode]||0;
  m.color.set(g.color).convertSRGBToLinear();
  m.opacity=back?g.op[i]*0.9:g.op[i];m.roughness=g.rough;m.metalness=g.metal;
  m.userData.envBase=g.env;m.envMapIntensity=g.env*(OPT.envScale?OPT.envScale():1);
  m.userData.uFres.value=g.fres;m.userData.uSpec.value=g.spec2;
  const wantN=g.flutes?Glazing.tex.flutes.nrm:(g.frost?Glazing.tex.frost:null),wantA=g.flutes?Glazing.tex.flutes.alpha:null;
  if(m.normalMap!==wantN||m.alphaMap!==wantA){m.normalMap=wantN;m.alphaMap=wantA;m.needsUpdate=true;}
  m.normalScale.set(g.flutes?1.6:(g.frost?0.35:1),g.flutes?1.6:(g.frost?0.35:1));
  const glow=g.glow?g.glow[i]:0;m.emissive.set(0xffffff).multiplyScalar(glow);
  m.visible=back?!!g.double:true;
}
Glazing.apply=function(){
  if(!Glazing.mats)return;const S=Glazing.state,M=Glazing.mats,g=glassById(S.glass),gb=S.bathFrosted?glassById('esmerilado'):g;
  setGlass(M.main,g,S.mode,false);setGlass(M.back,g,S.mode,true);setGlass(M.bath,gb,S.mode,false);setGlass(M.backBath,gb,S.mode,true);
  M.spacer.visible=!!g.double;
  const f=Glazing.FRAMES.find(x=>x.id===S.frame)||Glazing.FRAMES[1];
  M.frame.color.set(f.hex).convertSRGBToLinear();M.handle.color.set(f.hex).convertSRGBToLinear();
  const lum=M.frame.color.r*0.21+M.frame.color.g*0.72+M.frame.color.b*0.07;
  M.frame.roughness=lum>0.5?0.42:0.36;
  if(OPT.onChange)OPT.onChange();
};
Glazing.set=function(o){Object.assign(Glazing.state,o||{});Glazing.apply();};
Glazing.setMode=function(mode){if(Glazing.state.mode===mode)return;Glazing.state.mode=mode;Glazing.apply();};
Glazing.summary=function(){const S=Glazing.state,g=glassById(S.glass),f=Glazing.FRAMES.find(x=>x.id===S.frame)||Glazing.FRAMES[1];return {glass:g,frame:f};};

function procKit(){
  const prof=(name,pts)=>{const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const g=new T.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.rotateY(Math.PI/2);g.deleteAttribute('uv');return g;};
  const K={};
  K.marco=prof('marco',[[0,-0.035],[0.045,-0.035],[0.045,0.035],[0,0.035]].map(([y,z])=>[z,y]));
  K.riel=prof('riel',[[0,-0.04],[0.033,-0.04],[0.033,0.035],[0,0.035]].map(([y,z])=>[z,y]));
  K.hoja=prof('hoja',[[0,-0.013],[0.05,-0.013],[0.05,0.013],[0,0.013]].map(([y,z])=>[z,y]));
  K.parante=prof('parante',[[-0.0225,-0.035],[0.0225,-0.035],[0.0225,0.035],[-0.0225,0.035]].map(([y,z])=>[z,y]));
  K.goma=prof('goma',[[0,-0.0056],[0.0065,-0.0056],[0.0065,0.0056],[0,0.0056]].map(([y,z])=>[z,y]));
  K.espaciador=prof('esp',[[0,-0.008],[0.012,-0.008],[0.012,0.008],[0,0.008]].map(([y,z])=>[z,y]));
  const h=new T.BoxGeometry(0.02,0.12,0.03);h.translate(0,0,0.015);h.deleteAttribute('uv');K.manija=h;
  const d=new T.BoxGeometry(0.02,0.34,0.03);d.translate(0,0,0.015);d.deleteAttribute('uv');K.tirador=d;
  Object.values(K).forEach(g=>{if(!g.index){const n=g.attributes.position.count,ix=new Uint32Array(n);for(let i=0;i<n;i++)ix[i]=i;g.setIndex(new T.BufferAttribute(ix,1));}});
  return K;
}
Glazing.load=function(url){
  return new Promise(res=>{
    if(!T.GLTFLoader){KIT=procKit();return res(false);}
    new T.GLTFLoader().load(url,gl=>{const K={};gl.scene.traverse(o=>{if(o.isMesh){const g=o.geometry.clone();o.updateMatrixWorld();g.applyMatrix4(o.matrixWorld);if(g.attributes.uv)g.deleteAttribute('uv');K[o.name]=g;}});
      const need=['marco','riel','hoja','parante','goma','espaciador','manija','tirador'];const fb=need.some(k=>!K[k])?procKit():null;if(fb)need.forEach(k=>{if(!K[k])K[k]=fb[k];});
      KIT=K;res(true);},undefined,()=>{KIT=procKit();res(false);});
  });
};

function Acc(uv){this.p=[];this.n=[];this.i=[];this.u=uv?[]:null;this.v=0;}
const _m3=()=>new T.Matrix3();
Acc.prototype.addGeo=function(g,M){
  const P=g.attributes.position,N=g.attributes.normal,I=g.index,nm=_m3().getNormalMatrix(M),e=M.elements,f=nm.elements,b=this.v;
  for(let k=0;k<P.count;k++){const x=P.getX(k),y=P.getY(k),z=P.getZ(k);
    this.p.push(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]);
    const a=N.getX(k),c=N.getY(k),d=N.getZ(k);let nx=f[0]*a+f[3]*c+f[6]*d,ny=f[1]*a+f[4]*c+f[7]*d,nz=f[2]*a+f[5]*c+f[8]*d;const L=Math.hypot(nx,ny,nz)||1;this.n.push(nx/L,ny/L,nz/L);}
  if(I)for(let k=0;k<I.count;k++)this.i.push(b+I.getX(k));else for(let k=0;k<P.count;k++)this.i.push(b+k);
  this.v+=P.count;
};
Acc.prototype.quad=function(W,c,uvs){
  const b=this.v,e=W.elements,nx=e[8],ny=e[9],nz=e[10],L=Math.hypot(nx,ny,nz)||1;
  c.forEach(([x,y,z],k)=>{this.p.push(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]);this.n.push(nx/L,ny/L,nz/L);if(this.u)this.u.push(uvs[k][0],uvs[k][1]);});
  this.i.push(b,b+1,b+2,b,b+2,b+3);this.v+=4;
};
Acc.prototype.geo=function(){if(!this.v)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  if(this.u)g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));g.setIndex(this.v>65535?new T.Uint32BufferAttribute(this.i,1):new T.Uint16BufferAttribute(this.i,1));g.computeBoundingSphere();return g;};

const _M=()=>new T.Matrix4();
function memb(acc,W,name,x,y,len,dir,z,sy,sz){
  if(len<=0.002)return;const g=KIT[name];if(!g)return;
  const L=_M();L.makeTranslation(x,y,z);
  const R=_M();if(dir==='top')R.makeRotationZ(Math.PI);else if(dir==='left')R.makeRotationZ(-Math.PI/2);else if(dir==='right')R.makeRotationZ(Math.PI/2);
  const S=_M().makeScale(len,sy||1,sz||1);
  acc.addGeo(g,_M().multiplyMatrices(W,L.multiply(R).multiply(S)));
}
function rectFrame(acc,W,prof,x0,y0,x1,y1,z,bottom,sy){
  const F=prof==='hoja'?0.05:0.045;
  memb(acc,W,prof,x0,y1,y1-y0,'left',z,sy);memb(acc,W,prof,x1,y0,y1-y0,'right',z,sy);
  memb(acc,W,prof,x1-F,y1,(x1-F)-(x0+F),'top',z,sy);
  memb(acc,W,bottom||prof,x0+F,y0,(x1-F)-(x0+F),'bottom',z,sy);
}
function pane(B,W,x0,y0,x1,y1,z,uo,termo){
  const c=[[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],u=[[uo+x0,y0],[uo+x1,y0],[uo+x1,y1],[uo+x0,y1]];
  B.front.quad(W,c,u);
  const zb=z-0.012;B.back.quad(W,c.map(p=>[p[0],p[1],zb]),u);
  const zs=z-0.006;memb(B.spacer,W,'espaciador',x0,y1,y1-y0,'left',zs,1,0.5);memb(B.spacer,W,'espaciador',x1,y0,y1-y0,'right',zs,1,0.5);
  memb(B.spacer,W,'espaciador',x1,y1,x1-x0,'top',zs,1,0.5);memb(B.spacer,W,'espaciador',x0,y0,x1-x0,'bottom',zs,1,0.5);
}
function gasket(acc,W,x0,y0,x1,y1,z){
  memb(acc,W,'goma',x0,y1,y1-y0,'left',z,2.2,2);memb(acc,W,'goma',x1,y0,y1-y0,'right',z,2.2,2);memb(acc,W,'goma',x1,y1,x1-x0,'top',z,2.2,2);memb(acc,W,'goma',x0,y0,x1-x0,'bottom',z,2.2,2);
}
function sash(B,W,x0,y0,x1,y1,z,uo,hside,hy,door){
  rectFrame(B.frame,W,'hoja',x0,y0,x1,y1,z);
  const bite=0.038,px0=x0+bite,px1=x1-bite,py0=y0+bite,py1=y1-bite;
  pane(B,W,px0,py0,px1,py1,z+0.006,uo);
  gasket(B.rubber,W,px0,py0,px1,py1,z);
  if(hside){const hx=hside<0?x0+0.025:x1-0.025;const M=_M().makeTranslation(hx,hy,z+0.013);B.handle.addGeo(KIT[door?'tirador':'manija'],_M().multiplyMatrices(W,M));}
}
function fixedPane(B,W,x0,y0,x1,y1,uo){
  const b=0.034;pane(B,W,x0+b,y0+b,x1-b,y1-b,0.006,uo);gasket(B.rubber,W,x0+b,y0+b,x1-b,y1-b,0);
}
function windowAt(B,w){
  const ux=w.u[0],uz=w.u[1];let nx=w.n[0],nz=w.n[1],ox=w.o[0],oz=w.o[1],dx=ux,dz=uz;
  const cross=(-uz)*nx+ux*nz;
  if(cross<0){ox=ox+ux*w.l;oz=oz+uz*w.l;dx=-ux;dz=-uz;}
  const W=_M().makeBasis(new T.Vector3(dx,0,dz),new T.Vector3(0,1,0),new T.Vector3(nx,0,nz));W.setPosition(ox,w.y0,oz);
  const l=w.l,h=w.y1-w.y0,kind=w.kind,uo=(w.uo||0);
  const Bx=w.bath?B.bath:B.main;
  const P={frame:B.frame,rubber:B.rubber,handle:B.handle,spacer:B.spacer,front:Bx.front,back:Bx.back};
  if(kind==='store'){
    const m=Math.max(1,Math.ceil(l/1.6)),mw=l/m,tr=h>3.0?Math.min(h-0.6,2.5):0;
    for(let k=0;k<m;k++){const x0=k*mw,x1=x0+mw;rectFrame(B.frame,W,'marco',x0,0,x1,h,0);
      if(tr){const M=_M().makeTranslation(x0+0.045,tr,0).multiply(_M().makeScale(mw-0.09,1,1));B.frame.addGeo(KIT.parante,_M().multiplyMatrices(W,M));
        fixedPane(P,W,x0,0,x1,tr+0.0225-0.0,uo);fixedPane(P,W,x0,tr-0.0225,x1,h,uo);}
      else fixedPane(P,W,x0,0,x1,h,uo);}
    return;
  }
  if(kind==='curtain'){/* muro cortina: paño fijo de piso a techo con travesaño a la altura de baranda */
    rectFrame(B.frame,W,'marco',0,0,l,h,0);
    const tr=h>1.6?Math.min(1.0,h*0.4):0;
    if(tr){const M=_M().makeTranslation(0.045,tr,0).multiply(_M().makeScale(Math.max(0.01,l-0.09),1,1));B.frame.addGeo(KIT.parante,_M().multiplyMatrices(W,M));
      fixedPane(P,W,0,0,l,tr+0.0225,uo);fixedPane(P,W,0,tr-0.0225,l,h,uo);}
    else fixedPane(P,W,0,0,l,h,uo);
    return;
  }
  if(kind==='fixed'){rectFrame(B.frame,W,'marco',0,0,l,h,0);fixedPane(P,W,0,0,l,h,uo);return;}
  const door=kind==='door',m=Math.max(1,Math.ceil(l/(door?3.2:3.0))),mw=l/m,ov=0.05;
  const hy=door?Math.min(1.05,h*0.45):Math.min(Math.max(0.12,h*0.5),1.0);
  for(let k=0;k<m;k++){const x0=k*mw,x1=x0+mw;
    rectFrame(B.frame,W,'marco',x0,0,x1,h,0,'riel');
    const xi0=x0+0.031,xi1=x1-0.031,yi0=0.022,yi1=h-0.031,sw=(xi1-xi0+ov)/2;
    sash(P,W,xi0,yi0,xi0+sw,yi1,-0.0165,uo,-1,hy,door);
    sash(P,W,xi1-sw,yi0,xi1,yi1,0.0165,uo,1,hy,door);
  }
}
Glazing.build=function(list){
  const grp=new T.Group();if(!KIT)KIT=procKit();
  const B={frame:new Acc(),rubber:new Acc(),handle:new Acc(),spacer:new Acc(),main:{front:new Acc(true),back:new Acc(true)},bath:{front:new Acc(true),back:new Acc(true)}};
  list.forEach(w=>{try{windowAt(B,w);}catch(e){console.warn('ventana',e);}});
  const M=Glazing.mats,add=(acc,mat,o)=>{const g=acc.geo();if(!g)return null;const me=new T.Mesh(g,mat);Object.assign(me,o||{});me.userData.glazing=true;grp.add(me);return me;};
  add(B.frame,M.frame,{castShadow:true,receiveShadow:true});add(B.handle,M.handle,{castShadow:false,receiveShadow:true});add(B.rubber,M.rubber,{receiveShadow:true});
  add(B.spacer,M.spacer,{renderOrder:1});
  add(B.main.back,M.back,{renderOrder:2});add(B.bath.back,M.backBath,{renderOrder:2});
  add(B.main.front,M.main,{renderOrder:3});add(B.bath.front,M.bath,{renderOrder:3});
  grp.children.forEach(c=>{if(c.material.transparent)c.userData.glass=true;});
  return grp;
};
Glazing.railFrame=function(){return Glazing.mats.frame;};

if(typeof module!=='undefined'&&module.exports)module.exports=Glazing;else root.Glazing=Glazing;
})(typeof globalThis!=='undefined'?globalThis:this);

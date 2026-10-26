(function(root){
const Calles={};
let T=null,KIT=null,MAT=null;
const BASE='library/calle/';
Calles.SPEC={vereda:3.0,calzadaX:14,calzadaZ:10,radio:2.6,cuneta:0.35,cordon:0.165,alto:0.15,jardin:{w:1.1,d:1.9,paso:9,borde:0.32},rango:42};

let EMB=null;
function tex(name,k,srgb){const src=EMB&&EMB[name]&&EMB[name][k]||BASE+'tex/'+name+'/'+k+'.webp';const t=new T.TextureLoader().load(src,()=>{if(Calles.onLoad)Calles.onLoad();});t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(srgb)t.encoding=T.sRGBEncoding;return t;}
function pbr(name,o){const m=new T.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,map:tex(name,'color',true),roughnessMap:tex(name,'rough'),normalMap:tex(name,'normal')});
  m.normalScale=new T.Vector2(o&&o.n||1,o&&o.n||1);m.name='calle:'+name;return m;}

Calles.init=function(THREE,opts){
  T=THREE;opts=opts||{};Calles.onLoad=opts.onLoad;
  const mk=()=>{MAT={asfalto:pbr('asfalto',{n:1}),vereda:pbr('vereda',{n:1}),hormigon:pbr('hormigon',{n:0.8}),tierra:pbr('tierra',{n:1.2}),
    pintura:new T.MeshStandardMaterial({color:0xeeeeea,roughness:0.75}),hoja:new T.MeshStandardMaterial({color:0x1d3b15,roughness:0.9}),hoja2:new T.MeshStandardMaterial({color:0x2a4f1d,roughness:0.9})};
  Calles.mats=MAT;};
  return new Promise(res=>{if(!T.GLTFLoader){mk();res(false);return;}
    new T.GLTFLoader().load(BASE+'kit.gltf',g=>{const K={};g.scene.traverse(o=>{if(o.isMesh){const q=o.geometry.clone();o.updateMatrixWorld();q.applyMatrix4(o.matrixWorld);K[o.name]=q;}});KIT=K;
      const ex=g.parser&&g.parser.json&&g.parser.json.extras;EMB=ex&&ex.tex||null;mk();res(true);},undefined,()=>{mk();res(false);});});
};

function curbProfile(){
  const g=KIT&&KIT.bordillo;
  if(g){const P=g.attributes.position,pts=[];for(let i=0;i<P.count;i++)if(Math.abs(P.getX(i))<1e-4){const z=+P.getZ(i).toFixed(4),y=+P.getY(i).toFixed(4);if(!pts.some(p=>Math.abs(p[0]-z)<1e-4&&Math.abs(p[1]-y)<1e-4))pts.push([z,y]);}
    if(pts.length>=4){const c=pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length],[0,0]);pts.sort((a,b)=>Math.atan2(a[1]-c[1],a[0]-c[0])-Math.atan2(b[1]-c[1],b[0]-c[0]));return pts;}}
  return [[0,-0.25],[0.165,-0.25],[0.15,0.13],[0.144,0.144],[0.13,0.15],[0,0.15]];
}

function arcPts(cx,cz,r,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+r*Math.cos(a),cz+r*Math.sin(a)]);}return o;}

function sweep(prof,path,side,closedProf,uvScale,hint){
  const P=[],N=[],U=[],I=[];const n=path.length;if(n<2)return null;
  const tang=i=>{const a=path[Math.max(0,i-1)],b=path[Math.min(n-1,i+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[0]-a[0])/l,(b[1]-a[1])/l];};
  const dist=[0];for(let i=1;i<n;i++)dist.push(dist[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
  const ring=[];for(let i=0;i<n;i++){const t=tang(i),nr=[t[1]*side,-t[0]*side];let k=1;
    if(i>0&&i<n-1){const a=path[i-1],b=path[i],c=path[i+1],l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]);const n1=[(b[1]-a[1])/l1*side,-(b[0]-a[0])/l1*side];k=1/Math.max(0.3,n1[0]*nr[0]+n1[1]*nr[1]);}
    ring.push({p:path[i],n:[nr[0]*k,nr[1]*k]});}
  const m=prof.length,segs=closedProf?m:m-1;let pd=[0];for(let j=1;j<=m;j++){const a=prof[j-1],b=prof[j%m];pd.push(pd[j-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));}
  let v=0;
  for(let j=0;j<segs;j++){const a=prof[j],b=prof[(j+1)%m];
    for(let i=0;i<n-1;i++){const r0=ring[i],r1=ring[i+1];
      const q=[[r0,a,dist[i],pd[j]],[r1,a,dist[i+1],pd[j]],[r1,b,dist[i+1],pd[j+1]],[r0,b,dist[i],pd[j+1]]].map(([r,pp,d,s])=>({x:r.p[0]+r.n[0]*pp[0],y:pp[1],z:r.p[1]+r.n[1]*pp[0],u:d*uvScale,w:s*uvScale}));
      const e1=[q[1].x-q[0].x,q[1].y-q[0].y,q[1].z-q[0].z],e2=[q[3].x-q[0].x,q[3].y-q[0].y,q[3].z-q[0].z];
      let nx=e1[1]*e2[2]-e1[2]*e2[1],ny=e1[2]*e2[0]-e1[0]*e2[2],nz=e1[0]*e2[1]-e1[1]*e2[0];const L=Math.hypot(nx,ny,nz)||1;nx/=L;ny/=L;nz/=L;
      const pm=[(a[0]+b[0])/2,(a[1]+b[1])/2],cen=prof.reduce((s,p)=>[s[0]+p[0]/m,s[1]+p[1]/m],[0,0]),out=[ (pm[0]-cen[0]),(pm[1]-cen[1])];
      const rr=ring[i],wo=[rr.n[0]*out[0],out[1],rr.n[1]*out[0]];const flip=(nx*wo[0]+ny*wo[1]+nz*wo[2])<0&&closedProf;
      let fl=flip;if(!closedProf&&hint){const hv=hint==='up'?[0,1,0]:[rr.n[0],0,rr.n[1]];fl=(nx*hv[0]+ny*hv[1]+nz*hv[2])<0;}const ord=fl?[0,3,2,1]:[0,1,2,3];const NN=fl?[-nx,-ny,-nz]:[nx,ny,nz];
      ord.forEach(k=>{P.push(q[k].x,q[k].y,q[k].z);N.push(NN[0],NN[1],NN[2]);U.push(q[k].u,q[k].w);});
      I.push(v,v+1,v+2,v,v+2,v+3);v+=4;}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeBoundingSphere();return g;
}

function flat(poly,y,tile){
  const s=new T.Shape(poly.map(p=>new T.Vector2(p[0],-p[1])));const g=new T.ShapeGeometry(s,8);g.rotateX(-Math.PI/2);g.translate(0,y,0);
  const P=g.attributes.position,U=g.attributes.uv;for(let i=0;i<P.count;i++)U.setXY(i,P.getX(i)/tile,-P.getZ(i)/tile);
  return g;
}
function rect(x0,z0,x1,z1){return [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];}
function merge(list){list=list.filter(Boolean);if(!list.length)return null;if(list.length===1)return list[0];const m=T.BufferGeometryUtils.mergeBufferGeometries(list,false);list.forEach(g=>g.dispose());return m;}
function mesh(g,m,cast){if(!g)return null;const me=new T.Mesh(g,m);me.receiveShadow=true;me.castShadow=!!cast;me.userData.calle=true;return me;}
function box(x0,z0,x1,z1,y0,y1){const g=new T.BoxGeometry(Math.abs(x1-x0),y1-y0,Math.abs(z1-z0));g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;}

Calles.build=function(o){
  const S=Calles.spec=Object.assign({},Calles.SPEC,o.spec||{}),grp=new T.Group();grp.name='calles';
  const {x1,z0}=o,cx=o.cx,cz=o.cz,V=S.vereda,R=S.radio,H=S.alto,FAR=o.far||110;
  const eS=z0-V,eN=eS-S.calzadaX,eW=x1+V,eE=eW+S.calzadaZ;
  const blocks=[
    {sx:-1,sz:1,cxv:eW,czv:eS},{sx:1,sz:1,cxv:eE,czv:eS},{sx:-1,sz:-1,cxv:eW,czv:eN},{sx:1,sz:-1,cxv:eE,czv:eN}];
  const prof=curbProfile(),cw=S.cordon,vere=[],skirt=[],curbs=[],gut=[],asf=[],paint=[],spots=[];
  blocks.forEach(b=>{
    const ex=b.cxv,ez=b.czv,sx=b.sx,sz=b.sz,fx=ex+sx*FAR,fz=ez+sz*FAR;
    const cxr=ex+sx*R,czr=ez+sz*R,a0=Math.atan2(-sz,0),a1=Math.atan2(0,-sx);
    let da=a1-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
    const arc=r=>arcPts(cxr,czr,r,a0,a0+da,10);
    const edge=off=>[[fx,ez+sz*off],...arc(R-off).map(p=>p),[ex+sx*off,fz]];
    const inner=[[ex+sx*V,fz],[ex+sx*V,ez+sz*V],[fx,ez+sz*V]];
    const poly=edge(cw).concat(inner);
    vere.push(flat(poly,H,1.6));
    skirt.push(sweep([[0,-0.03],[0,H]],inner,-sideFor(inner,ex,ez,sx,sz),false,1,'n'));
    const cpath=edge(cw);
    curbs.push(sweep(prof,cpath,sideFor(cpath,ex,ez,sx,sz),true,1));
    gut.push(sweep([[0,0.004],[S.cuneta,0.004]],edge(0),sideFor(edge(0),ex,ez,sx,sz),false,1,'up'));
    const along=(f0,ax,from,to)=>{const lo=Math.min(from,to),hi=Math.max(from,to),c=[];for(let t=Math.ceil(lo/S.jardin.paso)*S.jardin.paso;t<=hi;t+=S.jardin.paso)c.push(t);return c;};
    const jd=cw+S.jardin.borde+S.jardin.w/2;
    const rng=S.rango;
    along(0,'x',ex+sx*(R+2.5),ex+sx*rng).forEach(x=>{if(o.skip&&o.skip(x,ez+sz*jd))return;spots.push({x,z:ez+sz*jd,rot:Math.PI/2});});
    along(0,'z',ez+sz*(R+2.5),ez+sz*rng).forEach(z=>{if(o.skip&&o.skip(ex+sx*jd,z))return;spots.push({x:ex+sx*jd,z,rot:0});});
  });
  function sideFor(path,ex,ez,sx,sz){const a=path[0],b=path[1],t=[b[0]-a[0],b[1]-a[1]],l=Math.hypot(t[0],t[1])||1,n=[t[1]/l,-t[0]/l];
    const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];const block=[ex+sx*5,ez+sz*5];const toBlock=(block[0]-m[0])*n[0]+(block[1]-m[1])*n[1];return toBlock>0?-1:1;}
  asf.push(flat(rect(cx-FAR,eN-R,cx+FAR,eS+R),0,4.0));
  asf.push(flat(rect(eW-R,eS+R,eE+R,cz+FAR),0,4.0));asf.push(flat(rect(eW-R,cz-FAR,eE+R,eN-R),0,4.0));
  const mx=(eN+eS)/2,mz=(eW+eE)/2,zebra=(axis,c0,c1,a0,a1)=>{for(let t=c0+0.6;t<c1-0.4;t+=1.0)paint.push(axis==='x'?box(a0,t,a1,t+0.5,0.003,0.006):box(t,a0,t+0.5,a1,0.003,0.006));};
  zebra('x',eN,eS,eW-R-3.6,eW-R-0.6);zebra('x',eN,eS,eE+R+0.6,eE+R+3.6);zebra('z',eW,eE,eS+R+0.6,eS+R+3.6);zebra('z',eW,eE,eN-R-3.6,eN-R-0.6);
  paint.push(box(eW-R-4.2,eN+0.4,eW-R-3.9,mx,0.003,0.006));paint.push(box(eE+R+3.9,mx,eE+R+4.2,eS-0.4,0.003,0.006));
  paint.push(box(mz,eS+R+4.0,eE-0.4,eS+R+4.3,0.003,0.006));paint.push(box(eW+0.4,eN-R-4.3,mz,eN-R-4.0,0.003,0.006));
  for(let x=cx-FAR;x<cx+FAR;x+=6){const a=x,b=x+3;if(b>eW-R-4.5&&a<eE+R+4.5)continue;paint.push(box(a,mx-0.06,b,mx+0.06,0.003,0.006));}
  for(let z=cz-FAR;z<cz+FAR;z+=6){const a=z,b=z+3;if(b>eN-R-4.5&&a<eS+R+4.5)continue;paint.push(box(mz-0.06,a,mz+0.06,b,0.003,0.006));}
  grp.add(mesh(merge(asf),MAT.asfalto));grp.add(mesh(merge(paint),MAT.pintura));
  grp.add(mesh(merge(gut),MAT.hormigon));grp.add(mesh(merge(curbs),MAT.hormigon,true));
  grp.add(mesh(merge(vere),MAT.vereda));grp.add(mesh(merge(skirt),MAT.hormigon));
  const jb=[],jt=[],mt=[[],[],[]];
  spots.forEach((s,k)=>{const M=new T.Matrix4().makeRotationY(s.rot).setPosition(s.x,H-0.03,s.z);
    if(KIT&&KIT.jardinera_borde){const g=KIT.jardinera_borde.clone().applyMatrix4(M);jb.push(g);const t=KIT.jardinera_tierra.clone().applyMatrix4(M);jt.push(t);
      [[-0.25,0.55],[0.22,-0.5],[0.2,0.45],[-0.22,-0.35]].forEach(([a,c],q)=>{const key='mata_'+((k+q)%3),src=KIT[key];if(!src)return;if(!src.userData.nrm){src.deleteAttribute('normal');src.computeVertexNormals();src.userData.nrm=1;}const m=new T.Matrix4().makeRotationY((k*1.7+q)%6.28).setPosition(a,0.09,c).premultiply(M);mt[(k+q)%3].push(src.clone().applyMatrix4(m));});}
    else{const w=S.jardin.w,d=S.jardin.d;const g=[box(-w/2,-d/2,w/2,-d/2+0.09,-0.2,0.12),box(-w/2,d/2-0.09,w/2,d/2,-0.2,0.12),box(-w/2,-d/2,-w/2+0.09,d/2,-0.2,0.12),box(w/2-0.09,-d/2,w/2,d/2,-0.2,0.12)].map(q=>q.applyMatrix4(M));jb.push(...g);jt.push(box(-w/2+0.09,-d/2+0.09,w/2-0.09,d/2-0.09,0.06,0.09).applyMatrix4(M));}
    s.tree=[s.x,s.z];s.y=H-0.03+0.1;});
  grp.add(mesh(merge(jb),MAT.hormigon,true));grp.add(mesh(merge(jt),MAT.tierra));
  mt.forEach((l,q)=>grp.add(mesh(merge(l),q===1?MAT.hoja2:MAT.hoja,true)));
  grp.children=grp.children.filter(Boolean);
  return {group:grp,trees:spots.map(s=>({x:s.x,z:s.z,y:s.y})),edges:{eS,eN,eW,eE}};
};

Calles.dispose=function(grp){if(!grp)return;grp.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose();});};

if(typeof module!=='undefined'&&module.exports)module.exports=Calles;else root.Calles=Calles;
})(typeof globalThis!=='undefined'?globalThis:this);

(function(root){
const Furn={};

Furn.materials=function(THREE,TX){
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.7},o||{}));
  const art=(seed,cols)=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=256;c.height=192;const x=c.getContext('2d');x.fillStyle=cols[0];x.fillRect(0,0,256,192);
    let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<7;i++){x.fillStyle=cols[1+i%(cols.length-1)];x.globalAlpha=0.55+r()*0.4;x.beginPath();x.ellipse(r()*256,r()*192,30+r()*70,20+r()*50,r()*3,0,7);x.fill();}
    x.globalAlpha=1;x.strokeStyle='rgba(40,30,20,.5)';x.lineWidth=2;x.beginPath();x.moveTo(0,120+r()*40);for(let i=0;i<8;i++)x.lineTo(i*36,100+r()*60);x.stroke();
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;};
  const rugTex=(kind)=>{if(typeof document==='undefined')return {};const n=512;let sd=kind==='jute'?7:kind==='terry'?13:3;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
    const cv=()=>{const c=document.createElement('canvas');c.width=c.height=n;return [c,c.getContext('2d')];};
    const [c,x]=cv(),[h,hx]=cv();x.fillStyle='#d6d6d6';x.fillRect(0,0,n,n);hx.fillStyle='#808080';hx.fillRect(0,0,n,n);
    const wrap=(f)=>{for(const ox of[-n,0,n])for(const oy of[-n,0,n])f(ox,oy);};
    if(kind==='jute'){const cs=16;for(let j=0;j<n/cs;j++)for(let i=0;i<n/cs;i++){const hor=(i+j)%2===0,v=0.78+r()*0.22;
        for(let k=0;k<4;k++){const g=Math.round(214*v*(0.9+r()*0.15)),y0=k*cs/4;
          const gr=hor?x.createLinearGradient(0,j*cs+y0,0,j*cs+y0+cs/4):x.createLinearGradient(i*cs+y0,0,i*cs+y0+cs/4,0);gr.addColorStop(0,`rgb(${g-34},${g-34},${g-34})`);gr.addColorStop(0.5,`rgb(${g},${g},${g})`);gr.addColorStop(1,`rgb(${g-34},${g-34},${g-34})`);
          x.fillStyle=gr;hor?x.fillRect(i*cs,j*cs+y0,cs,cs/4):x.fillRect(i*cs+y0,j*cs,cs/4,cs);
          const hg=hx[hor?'createLinearGradient':'createLinearGradient'](hor?0:i*cs+y0,hor?j*cs+y0:0,hor?0:i*cs+y0+cs/4,hor?j*cs+y0+cs/4:0);hg.addColorStop(0,'#303030');hg.addColorStop(0.5,'#f0f0f0');hg.addColorStop(1,'#303030');hx.fillStyle=hg;hor?hx.fillRect(i*cs,j*cs+y0,cs,cs/4):hx.fillRect(i*cs+y0,j*cs,cs/4,cs);}}
      for(let i=0;i<900;i++){const px=r()*n,py=r()*n,l=4+r()*10,a=r()*6.3;x.strokeStyle=`rgba(${r()<0.5?60:255},${r()<0.5?50:250},40,${0.08+r()*0.1})`;x.lineWidth=0.6;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke();}}
    else{const cnt=kind==='terry'?26000:20000,rr=kind==='terry'?1.6:2.1;
      for(let i=0;i<cnt;i++){const px=r()*n,py=r()*n,rd=rr*(0.6+r()*0.8),v=Math.round(214*(0.8+r()*0.3));wrap((ox,oy)=>{if(px+ox<-4||px+ox>n+4||py+oy<-4||py+oy>n+4)return;
        x.fillStyle=`rgb(${v},${v},${v})`;x.beginPath();x.arc(px+ox,py+oy,rd,0,7);x.fill();const hv=Math.round(110+r()*145);hx.fillStyle=`rgb(${hv},${hv},${hv})`;hx.beginPath();hx.arc(px+ox,py+oy,rd*0.9,0,7);hx.fill();});}
      if(kind==='loop'){x.globalAlpha=0.06;for(let i=0;i<40;i++){x.fillStyle=r()<0.5?'#000':'#fff';x.fillRect(0,r()*n,n,2+r()*6);}x.globalAlpha=1;}}
    const src=hx.getImageData(0,0,n,n).data,out=x.createImageData(n,n),d=out.data,H=(i,j)=>src[(((j+n)%n)*n+((i+n)%n))*4]/255,str=kind==='jute'?2.2:3;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const dx=(H(i+1,j)-H(i-1,j))*str,dy=(H(i,j+1)-H(i,j-1))*str,l=Math.hypot(dx,dy,1),k=(j*n+i)*4;d[k]=(-dx/l*0.5+0.5)*255;d[k+1]=(-dy/l*0.5+0.5)*255;d[k+2]=(1/l*0.5+0.5)*255;d[k+3]=255;}
    const [nc,nx]=cv();nx.putImageData(out,0,0);
    const T=(cc,srgb)=>{const t=new THREE.CanvasTexture(cc);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;};
    return {map:T(c,true),normalMap:T(nc,false)};};
  const RT={loop:rugTex('loop'),jute:rugTex('jute'),terry:rugTex('terry')};
  const RM=(col,t,ns)=>{const m=M(col,{map:t.map||null,normalMap:t.normalMap||null,roughness:1});if(t.normalMap)m.normalScale=new THREE.Vector2(ns,ns);m.userData.rug=true;return m;};
  return {
    rugB:RM(0x5a5249,RT.loop,0.9),rug2B:RM(0x8c7656,RT.jute,0.8),bathmatB:RM(0xbdb5a6,RT.terry,0.8),
    art1:M(0xffffff,{map:art(11,['#e9e1d3','#c4703f','#2f4f5f','#d9b26a','#8a9a7b']),roughness:0.8}),
    art2:M(0xffffff,{map:art(29,['#efe9df','#5d7a8c','#b9a27a','#2e3a40','#c9897a']),roughness:0.8}),
    frameB:M(0x1e1f21,{roughness:0.5}),
    tv:M(0x0b0d10,{roughness:0.12,metalness:0.4}),
    oak:M(0xb98d5f,{map:TX.wood,roughness:0.5}),
    walnut:M(0x6e4a31,{map:TX.wood,roughness:0.45}),
    lacquer:M(0xf2f0eb,{roughness:0.32}),
    cabinet:M(0xe9e4da,{roughness:0.38}),
    cabinetWood:M(0xa77b52,{map:TX.wood,roughness:0.45}),
    graphite:M(0x3b3f44,{roughness:0.45}),
    sofa:M(0x7a8592,{map:TX.fabric,roughness:0.95}),
    sofaSeat:M(0x86909c,{map:TX.fabric,roughness:0.95}),
    sofa2:M(0xb9773f,{map:TX.fabric,roughness:0.95}),
    cushion:M(0xddd5c7,{map:TX.fabric,roughness:0.95}),
    mattress:M(0xf6f4f0,{map:TX.fabric,roughness:0.95}),
    duvet:M(0xece6da,{map:TX.fabric,roughness:0.98}),
    throw:M(0x55705f,{map:TX.fabric,roughness:0.98}),
    pillow:M(0xffffff,{map:TX.fabric,roughness:0.95}),
    headboard:M(0x8a8f86,{map:TX.fabric,roughness:0.95}),
    fabricDark:M(0x2f3439,{map:TX.fabric,roughness:0.95}),
    leather:M(0x5b3a26,{roughness:0.55}),
    metal:M(0x23272b,{roughness:0.35,metalness:0.8}),
    brass:M(0xb08d57,{roughness:0.3,metalness:0.9}),
    chrome:M(0xdfe3e6,{roughness:0.1,metalness:1}),
    steel:M(0xc4c9cc,{roughness:0.22,metalness:0.85}),
    quartz:M(0xebe8e1,{roughness:0.18}),
    granite:M(0x24272a,{roughness:0.12,metalness:0.2}),
    porcelain:M(0xfcfcfa,{roughness:0.08}),
    porcelainIn:M(0xf2f3f2,{roughness:0.05}),
    water:M(0xbfd8e2,{roughness:0.02,metalness:0.1,transparent:true,opacity:0.55,depthWrite:false}),
    blackMatte:M(0x1b1c1e,{roughness:0.4,metalness:0.6}),
    stoneTop:M(0x2f3133,{roughness:0.2,metalness:0.05}),
    teak:M(0x7a5132,{map:TX.wood,roughness:0.45}),
    glass:M(0xd6e8ee,{roughness:0.04,metalness:0.1,transparent:true,opacity:0.25,depthWrite:false,side:THREE.DoubleSide}),
    rug:RM(0xa39a8d,RT.loop,0.9),
    rug2:RM(0xcdb894,RT.jute,0.8),
    plant:M(0x4e7a44,{roughness:0.9,flatShading:true}),
    plant2:M(0x6d9558,{roughness:0.9,flatShading:true}),
    pot:M(0xcfc6b8,{roughness:0.8}),
    terracotta:M(0xb06a48,{roughness:0.85}),
    shade:new THREE.MeshStandardMaterial({color:0xf3ead8,emissive:0x6b5d44,emissiveIntensity:0.6,roughness:0.9,side:THREE.DoubleSide}),
    screen:M(0x111418,{roughness:0.15,metalness:0.3}),
    book1:M(0x8c3b2f,{roughness:0.8}),book2:M(0x2f4f6b,{roughness:0.8}),book3:M(0xc9a64a,{roughness:0.8}),
    mirror:M(0xe8eef1,{roughness:0.02,metalness:1,envMapIntensity:1.6}),
    led:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff3dd,emissiveIntensity:1.2}),
    tileWall:M(0xffffff,{map:TX.tileWall,roughness:0.25}),
    nicheIn:M(0xd9d4cb,{map:TX.tileWall,roughness:0.3}),
    towel:M(0xf3efe7,{map:TX.fabric,roughness:1}),
    towel2:M(0x6f8a7c,{map:TX.fabric,roughness:1}),
    bathmat:RM(0xf2eee6,RT.terry,0.8),
    paper:M(0xffffff,{roughness:0.9}),
    car:[M(0x8a1f24,{roughness:0.3,metalness:0.6}),M(0x26303a,{roughness:0.3,metalness:0.6}),M(0xd9dbdc,{roughness:0.3,metalness:0.6}),M(0x3d5c78,{roughness:0.3,metalness:0.6})],
    tire:M(0x161718,{roughness:0.9}),
    window:M(0x1c252c,{roughness:0.1,metalness:0.6})
  };
};

function kit(THREE,parts){
  const RBG=THREE.RoundedBoxGeometry;
  const add=(m,g,x,y,z)=>{g.translate(x,y,z);parts.push([m,g]);return g;};
  const K={
    B:(m,w,h,d,x,y,z)=>add(m,new THREE.BoxGeometry(w,h,d),x,y,z),
    R:(m,w,h,d,x,y,z,r)=>{if(m==='rug'||m==='rug2'||m==='bathmat')return K.RUG(m,w,h,d,x,y,z);r=Math.min(r==null?0.03:r,w/2-0.001,h/2-0.001,d/2-0.001);return add(m,RBG&&r>0.004?new RBG(w,h,d,2,r):new THREE.BoxGeometry(w,h,d),x,y,z);},
    C:(m,r1,r2,h,x,y,z,seg,rx)=>{const g=new THREE.CylinderGeometry(r1,r2,h,seg||16);if(rx)g.rotateX(Math.PI/2);return add(m,g,x,y,z);},
    E:(m,rx,rz,h,x,y,z,seg)=>{const g=new THREE.CylinderGeometry(1,1,h,seg||24);g.scale(rx,1,rz);return add(m,g,x,y,z);},
    S:(m,r,x,y,z,sx,sy,sz)=>{const g=new THREE.SphereGeometry(r,14,10);g.scale(sx||1,sy||1,sz||1);return add(m,g,x,y,z);},
    T:(m,r,t,x,y,z,rx,ry,sx,sz)=>{const g=new THREE.TorusGeometry(r,t,8,28);if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);if(sx||sz)g.scale(sx||1,1,sz||1);return add(m,g,x,y,z);},
    L:(m,prof,x,y,z,sx,sz)=>{const g=new THREE.LatheGeometry(prof.map(p=>new THREE.Vector2(p[0],p[1])),28);if(sx||sz)g.scale(sx||1,1,sz||1);return add(m,g,x,y,z);},
    RUG:(m,w,h,d,x,y,z)=>{h=Math.max(h,0.012);const T=0.5,box=(ww,hh,dd,yy,mm)=>{const g=new THREE.BoxGeometry(ww,hh,dd);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const f=Math.floor(i/4),a=f<2?[dd,hh]:f<4?[ww,dd]:[ww,hh];uv.setXY(i,uv.getX(i)*a[0]/T,uv.getY(i)*a[1]/T);}return add(mm,g,x,yy,z);};
      const g=box(w,h,d,y-0.004+h/2,m);const bw=Math.min(0.045,Math.min(w,d)*0.06),ins=Math.min(0.09,Math.min(w,d)*0.1),yb=y-0.004+h+0.0006;
      if(Math.min(w,d)>0.7){const add2=(ww,dd,ox,oz)=>{const q=new THREE.BoxGeometry(ww,0.0012,dd);const uv=q.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*ww/T,uv.getY(i)*dd/T);q.translate(x+ox,yb,z+oz);parts.push([m+'B',q]);};
        const iw=w-2*ins,id=d-2*ins;add2(iw,bw,0,-id/2+bw/2);add2(iw,bw,0,id/2-bw/2);add2(bw,id-2*bw,-iw/2+bw/2,0);add2(bw,id-2*bw,iw/2-bw/2,0);}
      return g;},
    TB:(m,w,h,d,x,y,z,tw,th)=>{const g=new THREE.BoxGeometry(w,h,d);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w,uv.getY(i)*h);return add(m,g,x,y,z);}
  };
  K._T=THREE;K._P=parts;
  K.legs=(m,w,d,h,r,inset,taper)=>{[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>K.C(m,r,taper?r*0.6:r,h,a*(w/2-inset),h/2,b*(d/2-inset),10));};
  K.handle=(m,len,x,y,z,vert)=>{if(vert)K.R(m,0.012,len,0.02,x,y,z,0.005);else K.R(m,len,0.012,0.02,x,y,z,0.005);};
  K.chair=(x,z,rot,seatM)=>{const P=[];const k2=kit(THREE,P);
    k2.R(seatM||'cushion',0.45,0.06,0.44,0,0.46,0.01,0.025);
    k2.R('oak',0.43,0.4,0.035,0,0.74,-0.2,0.015);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>k2.C('oak',0.018,0.013,0.44,a*0.19,0.22,b*0.18,8));
    P.forEach(([mm,q])=>{q.rotateY(rot);q.translate(x,0,z);parts.push([mm,q]);});};
  const sh=K.sh={
    egg:(rx,rz,back)=>{const s=new THREE.Shape(),n=40;for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,c=Math.cos(a),sn=Math.sin(a),k=sn<0?(back||1):1;const x=rx*c*(sn<0?1-(1-(back||1))*0.5*Math.abs(sn):1),y=rz*sn*k;i?s.lineTo(x,y):s.moveTo(x,y);}return s;},
    rrect:(w,d,r)=>{const s=new THREE.Shape(),x=-w/2,y=-d/2;r=Math.min(r,w/2,d/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;},
    path:s=>{const p=new THREE.Path();s.getPoints(48).forEach((q,i)=>i?p.lineTo(q.x,q.y):p.moveTo(q.x,q.y));return p;}
  };
  K.X=(m,shape,h,bev,x,y,z,holes)=>{if(holes)shape.holes=holes;const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(0.001,h-2*bev),bevelEnabled:bev>0,bevelThickness:bev,bevelSize:bev,bevelSegments:4,curveSegments:32});g.rotateX(-Math.PI/2);g.translate(x,y+bev,z);parts.push([m,g]);return g;};
  K.tube=(m,pts,r,seg)=>{const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])));const g=new THREE.TubeGeometry(c,seg||24,r,10,false);parts.push([m,g]);return g;};
  K.faucet=(x,z,base,hgt,reach,mat)=>{mat=mat||'chrome';K.C(mat,0.026,0.03,0.03,x,base+0.015,z,20);K.tube(mat,[[x,base+0.02,z],[x,base+hgt*0.7,z],[x,base+hgt,z+reach*0.35],[x,base+hgt*0.92,z+reach*0.85],[x,base+hgt*0.78,z+reach]],0.013,32);
    K.C(mat,0.016,0.016,0.02,x,base+hgt*0.76,z+reach,16);K.C(mat,0.012,0.012,0.09,x+0.05,base+0.06,z+0.02,10,true);};
  K.lamp=(x,y,z,h)=>{K.C('brass',0.07,0.08,0.02,x,y+0.01,z,16);K.C('brass',0.008,0.008,h,x,y+h/2,z,8);K.C('shade',0.08,0.13,0.18,x,y+h+0.05,z,20);};
  K.plant=(x,y,z,s)=>{s=s||1;K.L('pot',[[0,0],[0.11*s,0],[0.14*s,0.28*s],[0.13*s,0.3*s],[0,0.3*s]],x,y,z);
    for(let i=0;i<7;i++){const a=i*0.9,r=0.07*s;K.S(i%2?'plant':'plant2',0.11*s,x+Math.cos(a)*r,y+0.42*s+i*0.05*s,z+Math.sin(a)*r,1,1.5,1);}};
  K.books=(x,y,z,w)=>{let o=-w/2;const m=['book1','book2','book3'];let i=0;while(o<w/2-0.03){const t=0.025+((i*7)%3)*0.008,h=0.18+((i*5)%4)*0.02;K.B(m[i%3],t,h,0.14,x+o+t/2,y+h/2,z);o+=t+0.003;i++;}};
  return K;
}

function kindOf(o,room,lo,hi,h,A){
  const s=room||'',t=o.t;
  const bath=/BAÑO|WC/.test(s),kitchen=/COCIN|PARRILL|KITCH/.test(s),laundry=/LAVANDER|SERVIC|SERV|PLANCH|SECADO/.test(s);
  if(t==='toilet')return 'toilet';
  if(t==='shower')return bath?'shower':'skip';
  if(t==='bsink')return bath?'basin':(kitchen||laundry?'ksink':'skip');
  if(t==='ksink')return bath?'basin':'ksink';
  if(t==='cooktop')return kitchen||laundry?'cooktop':'skip';
  if(t==='box')return kitchen?'fridge':(laundry?'washer':'skip');
  if(t==='chair')return 'chair';
  if(bath)return (lo>=0.65&&A>=0.6)?'shower':'skip';
  if(kitchen||laundry){if(A>0.8&&lo>0.7)return 'island';return 'skip';}
  if(/DORM|SUITE|HOME/.test(s)){
    if(lo>=1.15&&hi>=1.8)return 'bed';
    if(lo>=0.85&&hi>=1.8)return 'bedSingle';
    if(lo<0.75&&hi>=1.0)return h>=0.85?'wardrobe':'desk';
    if(A<0.4)return 'nightstand';
    return 'dresser';
  }
  if(/VEST|CLOSET/.test(s))return 'wardrobe';
  if(/ESTAR|SAL[OÓ]N|SALA|LIVING|COPROP/.test(s)){
    if(hi>=1.5&&lo<=1.15)return 'sofa';
    if(lo>=0.6&&hi<=1.15&&A<1.1)return 'armchair';
    if(hi>=0.8&&lo<0.9)return 'coffee';
    if(A>=1.2)return 'dining';
    return 'side';
  }
  if(/COMEDOR/.test(s))return A>0.7?'dining':'chair';
  if(/ESTUDIO|OFICINA|ESCRITORIO/.test(s))return A>0.5?'desk':'chair';
  if(/TERRAZA|BALC/.test(s))return A>0.7?'dining':'lounger';
  if(/RECEPCI/.test(s))return hi>1.2?'reception':'armchair';
  if(/LOCAL|TIENDA|DEP[OÓ]SITO/.test(s))return 'shelf';
  if(/PARQUEO|GARAJE|DESPENSA/.test(s))return 'skip';
  return A>0.8?'dining':'side';
}
Furn.kindOf=kindOf;

Furn.build=function(THREE,o,room,lv,backSide,rnd,freeRun,nearWin,opts){
  opts=opts||{};
  const xs=o.p.map(p=>p[0]),zs=o.p.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
  let cx=(x0+x1)/2,cz=(z0+z1)/2;const dx=x1-x0,dz=z1-z0,lo=Math.min(dx,dz),hi=Math.max(dx,dz),A=dx*dz;
  let kind=kindOf(o,room,lo,hi,o.h,A);
  if(opts.hasModel&&opts.hasModel(kind)&&!/^(bed|bedSingle|sofa|armchair|toilet|basin|dining|coffee|desk)$/.test(kind)){if(opts.inCounter)return {kind:'skip',parts:[]};const back=backSide(x0,x1,z0,z1,kind);const rot={n:0,s:Math.PI,w:Math.PI/2,e:-Math.PI/2}[back];return {kind,parts:[],place:{cx,cz,rot,W:(back==='n'||back==='s')?dx:dz,D:(back==='n'||back==='s')?dz:dx}};}
  if(opts.hasModel&&opts.hasModel(kind))opts.skipMain=true;
  if(opts.inCounter)kind='skip';
  if(kind==='skip')return {kind,parts:[]};
  const back=(o.b&&/^bed/.test(kind))?o.b:backSide(x0,x1,z0,z1,kind);
  const along=(back==='n'||back==='s')?dx:dz,deep=(back==='n'||back==='s')?dz:dx;
  const parts=[],K=kit(THREE,parts),decor=[];
  const rot={n:0,s:Math.PI,w:Math.PI/2,e:-Math.PI/2}[back],cr=Math.cos(rot),sr=Math.sin(rot);
  const toW=(lx,lz)=>[cx+lx*cr+lz*sr,cz-lx*sr+lz*cr],dirW=(lx,lz)=>[lx*cr+lz*sr,-lx*sr+lz*cr];
  const freeL=(lx,lz,ddx,ddz)=>{if(!freeRun)return 9;const p=toW(lx,lz),d=dirW(ddx,ddz);return freeRun(p[0],p[1],d[0],d[1]);};
  const winAt=(lx,lz)=>{if(!nearWin)return false;const p=toW(lx,lz);return nearWin(p[0],p[1]);};
  const {B,R,C,E,S,T,L,TB}=K,sh=K.sh;
  const wallSpan=(lx,lz,bx,bz,maxT)=>{if(!freeRun)return null;const d=freeL(lx,lz,bx,bz);if(d>=5.9)return null;const tx=-bz,tz=bx,st=0.05;
    const ok=t=>Math.abs(freeL(lx+tx*t,lz+tz*t,bx,bz)-d)<0.07;let a=0,b=0;while(a>-maxT&&ok(a-st))a-=st;while(b<maxT&&ok(b+st))b+=st;const xa=lx+tx*a,xb=lx+tx*b;return {d,a:Math.min(xa,xb),b:Math.max(xa,xb),len:b-a};};
  const fitOnWall=(sp,w,pref,m)=>{if(!sp||sp.len<w+2*m)return null;return Math.max(sp.a+w/2+m,Math.min(sp.b-w/2-m,pref));};
  const wallArt=(lz0,pref,sizes,y,frameM,artM)=>{const sp=wallSpan(pref,lz0,0,-1,3.5);if(!sp||sp.d>0.9)return;const wz=lz0-sp.d;
    for(const [aw,ah] of sizes){const x=fitOnWall(sp,aw+0.06,pref,0.12);if(x==null)continue;if(winAt(x,wz-0.1)||winAt(x-aw/2,wz-0.1)||winAt(x+aw/2,wz-0.1))continue;
      R(frameM,aw+0.06,ah+0.06,0.03,x,y,wz+0.016,0.004);B(artM,aw,ah,0.005,x,y,wz+0.033);return;}};
  const W=along,D=deep,hd=D/2,hw=W/2;
  const niche=(x,y,w,h,side)=>{const P=[];const k2=kit(THREE,P);
    k2.TB('nicheIn',w,h,0.01,0,y,0.006,0.15,0.15);k2.TB('tileWall',w+0.04,0.02,0.1,0,y+h/2+0.01,0.05,0.15,0.15);k2.TB('tileWall',w+0.04,0.02,0.1,0,y-h/2-0.01,0.05,0.15,0.15);
    [-1,1].forEach(k=>k2.TB('tileWall',0.02,h,0.1,k*(w/2+0.01),y,0.05,0.15,0.15));k2.R('quartz',w,0.015,0.09,0,y,0.05,0.004);
    k2.L('towel2',[[0,0],[0.03,0],[0.03,0.15],[0.012,0.17],[0,0.17]],-w*0.25,y-h/2,0.05);k2.L('lacquer',[[0,0],[0.027,0],[0.027,0.12],[0.01,0.135],[0,0.135]],-w*0.25+0.07,y-h/2,0.05);
    k2.L('throw',[[0,0],[0.025,0],[0.025,0.1],[0.008,0.115],[0,0.115]],w*0.2,y+0.008,0.05);
    const a=side==='l'?Math.PI/2:side==='r'?-Math.PI/2:0,tx=side==='l'?-hw:side==='r'?hw:x,tz=side?x:-hd;
    P.forEach(([m,g])=>{g.rotateY(a);g.translate(tx,0,tz);parts.push([m,g]);});};
  const placeNiche=(x,y,w,h)=>{
    if(!winAt(0,-hd-0.1))niche(x,y,w,h);
    else if(!winAt(-hw-0.1,0)&&freeL(-hw+0.1,0,-1,0)<0.3)niche(0,y,Math.min(w,D*0.35),h,'l');
    else if(!winAt(hw+0.1,0)&&freeL(hw-0.1,0,1,0)<0.3)niche(0,y,Math.min(w,D*0.35),h,'r');};
  switch(kind){
    case 'bed':case 'bedSingle':{
      const bw=kind==='bed'?Math.max(1.35,Math.min(1.8,W>2.25?W-0.9:W)):Math.min(W,1.0),bl=Math.min(D,2.05),by=-hd+bl/2+0.04;
      const s0=parts.length;
      R('walnut',bw+0.06,0.22,bl,0,0.17,by,0.02);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>C('walnut',0.025,0.02,0.06,a*(bw/2-0.04),0.03,by+b*(bl/2-0.05),8));
      R('mattress',bw,0.24,bl-0.06,0,0.39,by+0.01,0.06);
      R('duvet',bw+0.05,0.07,bl*0.66,0,0.52,by+bl*0.17,0.035);
      R('duvet',bw+0.05,0.32,0.05,0,0.38,by+bl/2-0.02,0.025);
      R('throw',bw+0.07,0.075,0.42,0,0.535,by+bl*0.33,0.035);
      const np=kind==='bed'?2:1;for(let i=0;i<np;i++){const px=np===1?0:(i?1:-1)*bw/4;R('pillow',bw/np-0.12,0.15,0.4,px,0.58,-hd+0.32,0.07);}
      if(kind==='bed'){R('throw',0.42,0.12,0.12,-0.12,0.62,-hd+0.5,0.05);R('cushion',0.4,0.12,0.12,0.14,0.62,-hd+0.5,0.05);}
      R('headboard',bw+0.24,1.1,0.1,0,0.65,-hd+0.06,0.04);
      for(let i=0;i<Math.round((bw+0.2)/0.3);i++)B('fabricDark',0.004,0.8,0.005,-(bw+0.2)/2+0.3*(i+0.5),0.72,-hd+0.112);
      if(opts.skipMain)parts.splice(s0);
      wallArt(-hd+0.3,0,[[Math.min(bw,1.4),0.54],[0.9,0.5]],1.68,'frameB','art2');
      if(W>=bw+0.89){[-1,1].forEach(sx=>{const nx=sx*(bw/2+0.32);R('oak',0.48,0.46,0.4,nx,0.26,-hd+0.22,0.015);R('walnut',0.44,0.005,0.006,nx,0.34,-hd+0.42,0.002);K.handle('brass',0.1,nx,0.4,-hd+0.425);
        C('walnut',0.012,0.012,0.04,nx,0.02,-hd+0.22,6);K.lamp(nx-0.08,0.49,-hd+0.2,0.28);if(sx<0)K.books(nx+0.12,0.49,-hd+0.22,0.12);});}
      R('rug2',Math.min(W,bw+0.7),0.008,Math.min(D,bl*0.55),0,0.004,by+0.35,0.003);
      break;}
    case 'sofa':{
      {const g=freeL(0,-hd+0.3,0,-1)-0.3;if(g>0.02&&g<0.7){const d=dirW(0,-1);cx+=d[0]*g;cz+=d[1]*g;}}
      const sw=Math.min(W,3.0),sd=Math.min(Math.max(D,0.8),1.0),bz=-hd+sd/2;
      const s0=parts.length;
      R('sofa',sw,0.2,sd,0,0.18,bz,0.03);
      R('sofa',sw,0.48,0.2,0,0.5,-hd+0.11,0.06);
      [-1,1].forEach(s=>R('sofa',0.18,0.42,sd,s*(sw/2-0.09),0.4,bz,0.06));
      const n=Math.max(2,Math.round((sw-0.36)/0.8));
      for(let i=0;i<n;i++){const cw=(sw-0.36)/n,x=-sw/2+0.18+cw*(i+0.5);
        R('sofaSeat',cw-0.02,0.16,sd-0.24,x,0.36,-hd+0.22+(sd-0.24)/2,0.06);
        R('sofaSeat',cw-0.04,0.42,0.16,x,0.66,-hd+0.27,0.07);
        R(i%2?'cushion':'throw',0.42,0.4,0.12,x+(i%2?0.1:-0.1),0.68,-hd+0.4,0.06);}
      [-1,1].forEach(s=>[-1,1].forEach(t=>C('metal',0.015,0.01,0.08,s*(sw/2-0.08),0.04,bz+t*(sd/2-0.08),8)));
      if(opts.skipMain)parts.splice(s0);
      if(freeL(hw+0.05,-hd+0.3,1,0)>0.6){if(opts.hasModel&&opts.hasModel('plant'))decor.push(['plant',hw+0.36,0,-hd+0.32]);else K.plant(hw+0.32,0,-hd+0.3,1.1);}
      if(opts.hasModel&&opts.hasModel('floorLamp')&&freeL(-hw-0.05,-hd+0.3,-1,0)>0.5)decor.push(['floorLamp',-hw-0.3,0,-hd+0.28,0]);
      wallArt(-hd+0.3,0,[[1.16,0.76],[0.9,0.6],[0.6,0.45]],1.55,'frameB','art1');
      {const sp=wallSpan(0,hd+0.05,0,1,4);if(sp&&sp.d>1.6&&sp.d<5.5){const fd=sp.d,tw=Math.min(1.9,sw*0.8,sp.len-0.3);
        if(tw>=1.25){const mid=(sp.a+sp.b)/2,tx=sp.len>4.5?Math.max(sp.a+tw/2+0.2,Math.min(sp.b-tw/2-0.2,0)):mid,tz=hd+0.05+fd-0.22;
        if(!winAt(tx,hd+0.05+fd+0.1)){
        R('walnut',tw,0.42,0.4,tx,0.26,tz,0.015);B('graphite',tw-0.04,0.004,0.006,tx,0.26,tz-0.201);[-1,0,1].forEach(i=>K.handle('brass',0.14,tx+i*tw/3,0.38,tz-0.21));
        C('metal',0.012,0.012,0.04,tx-tw/2+0.08,0.02,tz,6);C('metal',0.012,0.012,0.04,tx+tw/2-0.08,0.02,tz,6);
        const wz=hd+0.05+fd;R('tv',1.23,0.71,0.04,tx,1.3,wz-0.03,0.006);B('graphite',1.19,0.67,0.002,tx,1.3,wz-0.052);
        K.books(tx-tw/2+0.25,0.47,tz,0.2);K.plant(tx+tw/2-0.2,0.47,tz,0.45);}}}}
      break;}
    case 'armchair':{
      const s=Math.min(W,D,0.9);
      R('sofa2',s,0.24,s,0,0.22,0,0.04);R('sofa2',s,0.46,0.16,0,0.58,-s/2+0.08,0.06);
      [-1,1].forEach(k=>R('sofa2',0.14,0.3,s,k*(s/2-0.07),0.45,0,0.05));R('cushion',s-0.3,0.12,s-0.22,0,0.39,0.05,0.05);
      K.legs('walnut',s,s,0.1,0.015,0.06,true);
      if(opts.skipMain)parts.length=0;
      break;}
    case 'coffee':case 'side':{
      let h=kind==='coffee'?0.4:0.55;
      if(kind==='coffee'&&opts.hasModel&&opts.hasModel('coffee')){decor.push(['coffee',0,0,0,(W<D)?Math.PI/2:0,{W,D}]);h=0.4;}
      else{R('walnut',W*0.95,0.035,D*0.95,0,h,0,0.012);R('walnut',W*0.85,0.02,D*0.85,0,h*0.35,0,0.008);K.legs('metal',W*0.95,D*0.95,h,0.012,0.06);}
      if(kind==='coffee'){R('rug',W+0.9,0.008,D+0.7,0,0.004,0,0.003);K.books(-W*0.2,h+0.018,0,0.12);if(opts.hasModel&&opts.hasModel('pouf')&&freeL(hw+0.05,0,1,0)>0.8)decor.push(['pouf',hw+0.45,0,0]);}
      L('pot',[[0,0],[0.06,0],[0.08,0.1],[0.05,0.14],[0,0.14]],W*0.22,h+0.018,0);S('plant2',0.06,W*0.22,h+0.2,0,1,1.3,1);
      break;}
    case 'dining':{
      const long=W,short=D,tl=Math.max(0.9,long-0.15),td=short>1.5?Math.max(0.8,short-1.0):Math.min(short,0.9);
      const hasT=opts.hasModel&&opts.hasModel('diningTable'),hasC=opts.hasModel&&opts.hasModel('chair');
      if(hasT)decor.push(['diningTable',0,0,0,0,{W:tl,D:td}]);
      else{R('oak',tl,0.04,td,0,0.74,0,0.015);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>R('metal',0.05,0.72,0.05,a*(tl/2-0.08),0.36,b*(td/2-0.08),0.01));}
      const n=Math.max(1,Math.floor(tl/0.62));
      if(short>1.4)for(let i=0;i<n;i++){const x=-tl/2+tl/n*(i+0.5);
        if(hasC){decor.push(['chair',x,0,-td/2-0.3,0]);decor.push(['chair',x,0,td/2+0.3,Math.PI]);}
        else{K.chair(x,-td/2-0.28,0,'cushion');K.chair(x,td/2+0.28,Math.PI,'cushion');}}
      if(opts.hasModel&&opts.hasModel('pendant')&&opts.ceilH)decor.push(['pendant',0,opts.ceilH,0,0]);
      if(opts.hasModel&&opts.hasModel('vase'))decor.push(['vase',0,0.76,0]);
      else{L('porcelain',[[0,0],[0.06,0],[0.13,0.05],[0.15,0.07],[0.14,0.075],[0,0.03]],0,0.76,0);
      for(let i=0;i<3;i++)S(i%2?'plant':'book3',0.035,(i-1)*0.06,0.8,0,1,0.9,1);}
      R('rug2',tl+1.0,0.008,td+1.1,0,0.004,0,0.003);
      break;}
    case 'chair':if(opts.hasModel&&opts.hasModel('chair'))decor.push(['chair',0,0,0,0]);else K.chair(0,0,0,'cushion');break;
    case 'desk':{
      const dw=Math.min(W,1.6),dd=Math.min(D,0.7),dz0=-hd+dd/2;
      if(opts.hasModel&&opts.hasModel('desk')){if(opts.inCounter)break;decor.push(['desk',0,0,-hd,0,{wall:true,W:dw,D:dd}]);
        if(opts.hasModel('officeChair'))decor.push(['officeChair',0,0,-hd+dd+0.12,Math.PI]);else K.chair(0,-hd+dd+0.22,Math.PI,'fabricDark');break;}
      R('oak',dw,0.035,dd,0,0.74,dz0,0.01);
      R('lacquer',0.42,0.7,dd-0.04,dw/2-0.23,0.37,dz0,0.01);for(let i=0;i<3;i++){B('graphite',0.38,0.003,0.004,dw/2-0.23,0.25+i*0.2,dz0+dd/2-0.018);K.handle('chrome',0.12,dw/2-0.23,0.18+i*0.2,dz0+dd/2-0.01);}
      K.legs('metal',dw-0.06,dd-0.06,0.72,0.015,0.03);
      R('screen',0.62,0.36,0.02,0,1.02,-hd+0.14,0.008);R('graphite',0.06,0.16,0.04,0,0.84,-hd+0.14,0.01);R('graphite',0.2,0.01,0.14,0,0.765,-hd+0.14,0.005);
      R('lacquer',0.44,0.012,0.14,0,0.765,-hd+0.38,0.004);K.lamp(-dw/2+0.15,0.76,-hd+0.15,0.36);
      K.chair(0,-hd+dd+0.22,Math.PI,'fabricDark');
      break;}
    case 'nightstand':{R('oak',W*0.9,0.5,D*0.9,0,0.25,0,0.015);K.handle('brass',0.1,0,0.38,D*0.45+0.008);K.lamp(0,0.5,0,0.28);break;}
    case 'dresser':{const dd=Math.min(D,0.5);R('oak',W*0.95,0.8,dd,0,0.4,-hd+dd/2,0.015);for(let i=0;i<3;i++){B('walnut',W*0.9,0.005,0.006,0,0.27+i*0.22,-hd+dd+0.002);K.handle('brass',0.14,0,0.37+i*0.22,-hd+dd+0.01);}
      R('mirror',Math.min(W*0.7,0.9),0.7,0.015,0,1.35,-hd+0.02,0.006);K.plant(W*0.3,0.8,-hd+dd/2,0.6);break;}
    case 'wardrobe':{
      const wd=Math.min(D,0.62),h=2.3;R('cabinet',W,h,wd,0,h/2,-hd+wd/2,0.01);
      const n=Math.max(2,Math.round(W/0.5));
      for(let i=1;i<n;i++)B('graphite',0.006,h-0.08,0.006,-W/2+W/n*i,h/2,-hd+wd+0.002);
      B('graphite',W-0.02,0.006,0.006,0,0.45,-hd+wd+0.002);
      for(let i=0;i<n;i++)K.handle('brass',0.35,-W/2+W/n*(i+0.5)+(i%2?-0.07:0.07),1.15,-hd+wd+0.012,true);
      break;}
    case 'cooktop':case 'ksink':{
      const cw=Math.max(W,0.6),cd=0.6;
      Furn.cabinetRun(K,-cw/2,cw/2,cd,-hd,{cook:kind==='cooktop'?[0]:[],sink:kind==='ksink'?[0]:[],upper:!winAt(0,-hd-0.1)});
      break;}
    case 'island':{R('cabinet',W*0.95,0.86,D*0.95,0,0.43,0,0.01);R('quartz',W,0.04,D,0,0.88,0,0.008);break;}
    case 'fridge':{const fw=Math.min(W,0.8),fd=Math.min(D,0.72);R('steel',fw,1.9,fd,0,0.95,-hd+fd/2,0.02);B('graphite',fw-0.02,0.006,0.006,0,1.2,-hd+fd+0.002);
      K.handle('chrome',0.5,fw/2-0.07,1.5,-hd+fd+0.025,true);K.handle('chrome',0.4,fw/2-0.07,0.8,-hd+fd+0.025,true);break;}
    case 'washer':{const s=Math.min(W,D,0.62);R('lacquer',s,0.85,s,0,0.425,-hd+s/2,0.02);C('chrome',0.21,0.21,0.02,0,0.45,-hd+s+0.006,28,true);C('window',0.17,0.17,0.025,0,0.45,-hd+s+0.008,28,true);
      R('graphite',s-0.06,0.08,0.01,0,0.78,-hd+s+0.004,0.004);break;}
    case 'toilet':{
      const s0=parts.length;
      const st=(opts.style&&opts.style('toilet'))||'tank',zc=-hd+0.43;
      if(st==='wall'){
        K.X('porcelain',sh.egg(0.18,0.27,0.85),0.2,0.03,0,0.2,zc);
        K.X('porcelain',sh.rrect(0.36,0.18,0.06),0.2,0.02,0,0.2,-hd+0.09);
        K.X('porcelainIn',sh.egg(0.13,0.2,0.85),0.012,0,0,0.385,zc+0.01);E('water',0.11,0.16,0.004,0,0.37,zc+0.02);
        K.X('lacquer',sh.egg(0.185,0.275,0.85),0.025,0.008,0,0.405,zc,[sh.path(sh.egg(0.125,0.19,0.85))]);
        K.X('lacquer',sh.egg(0.185,0.275,0.85),0.018,0.006,0,0.432,zc);
        R('chrome',0.24,0.16,0.012,0,1.02,-hd+0.006,0.01);R('lacquer',0.09,0.11,0.006,-0.05,1.02,-hd+0.014,0.006);R('lacquer',0.09,0.11,0.006,0.05,1.02,-hd+0.014,0.006);
      }else{
        L('porcelain',[[0,0],[0.14,0],[0.12,0.06],[0.11,0.2],[0.15,0.3],[0,0.3]],0,0,zc+0.02,1,1.35);
        K.X('porcelain',sh.egg(0.19,0.27,0.8),0.1,0.025,0,0.29,zc);
        K.X('porcelainIn',sh.egg(0.14,0.2,0.8),0.012,0,0,0.375,zc+0.01);E('water',0.1,0.15,0.004,0,0.36,zc+0.02);
        K.X('lacquer',sh.egg(0.19,0.27,0.8),0.025,0.008,0,0.395,zc,[sh.path(sh.egg(0.13,0.19,0.8))]);
        K.X('lacquer',sh.egg(0.19,0.27,0.8),0.018,0.006,0,0.422,zc);
        K.X('porcelain',sh.rrect(0.38,0.17,0.05),0.36,0.025,0,0.44,-hd+0.1);
        K.X('porcelain',sh.rrect(0.4,0.19,0.05),0.03,0.012,0,0.8,-hd+0.1);
        C('chrome',0.03,0.03,0.012,-0.04,0.835,-hd+0.1,24);C('chrome',0.022,0.022,0.012,0.03,0.835,-hd+0.1,24);
        R('porcelain',0.2,0.07,0.1,0,0.42,-hd+0.17,0.03);
      }
      if(opts.hasModel&&opts.hasModel('toilet')){parts.splice(s0);decor.push(['toilet',0,0,-hd,0,{wall:true}]);}
      const dL=freeL(0,-hd+0.45,-1,0),dR=freeL(0,-hd+0.45,1,0),sg=dL<dR?-1:1,dw=Math.min(dL,dR);
      const hasPH=opts.hasModel&&opts.hasModel('paperHolder'),hasTB=opts.hasModel&&opts.hasModel('toiletBrush');
      if(dw<0.9){const x=sg*(dw-0.015);
        if(hasPH)decor.push(['paperHolder',sg*dw,0.72,-hd+0.62,-sg*Math.PI/2]);
        else{R('chrome',0.02,0.05,0.12,x,0.72,-hd+0.6,0.008);C('paper',0.055,0.055,0.11,x-sg*0.07,0.67,-hd+0.6,22);C('chrome',0.008,0.008,0.13,x-sg*0.07,0.67,-hd+0.6,8);}
        R('chrome',0.02,0.02,0.45,x,1.25,-hd+0.4,0.008);R('towel',0.025,0.45,0.3,x-sg*0.03,1.04,-hd+0.4,0.01);}
      else{const x=sg*0.42;if(hasPH)decor.push(['paperHolder',x-0.065,0.72,-hd,0]);else{R('chrome',0.14,0.03,0.03,x,0.72,-hd+0.02,0.01);C('paper',0.055,0.055,0.11,x,0.67,-hd+0.08,22,true);}}
      const bx=-sg*0.38;if(hasTB)decor.push(['toiletBrush',bx,0,-hd+0.18,0]);else{L('steel',[[0,0],[0.1,0],[0.11,0.28],[0,0.28]],bx,0,-hd+0.18);E('graphite',0.112,0.112,0.02,bx,0.29,-hd+0.18);}
      break;}
    case 'basin':{
      const s0=parts.length;
      const st=(opts.style&&opts.style('basin'))||'vessel';
      const vw=Math.min(W,1.2),vd=Math.min(Math.max(D,0.42),0.5),noMirror=winAt(0,-hd-0.1);
      if(st==='pedestal'){
        L('porcelain',[[0,0],[0.11,0],[0.09,0.05],[0.07,0.5],[0.09,0.68],[0,0.68]],0,0,-hd+0.17,1,0.8);
        K.X('porcelain',sh.rrect(0.56,0.44,0.16),0.14,0.03,0,0.68,-hd+0.23,[sh.path(sh.rrect(0.44,0.3,0.12))]);
        K.X('porcelainIn',sh.rrect(0.46,0.32,0.12),0.01,0,0,0.73,-hd+0.25);
        K.faucet(0,-hd+0.06,0.82,0.18,0.14);
        if(!noMirror){C('chrome',0.3,0.3,0.02,0,1.55,-hd+0.01,48,true);C('mirror',0.285,0.285,0.012,0,1.55,-hd+0.022,48,true);}
      }else if(st==='integrated'){
        const zc=-hd+vd/2;
        R('lacquer',vw,0.46,vd,0,0.62,zc,0.012);B('graphite',vw-0.03,0.004,0.006,0,0.62,-hd+vd+0.002);
        R('blackMatte',vw*0.5,0.012,0.012,0,0.78,-hd+vd+0.01,0.004);R('blackMatte',vw*0.5,0.012,0.012,0,0.5,-hd+vd+0.01,0.004);
        K.X('porcelain',sh.rrect(vw+0.01,vd+0.01,0.03),0.04,0.008,0,0.85,zc,[sh.path(sh.rrect(Math.min(vw-0.16,0.5),vd-0.16,0.08))]);
        K.X('porcelainIn',sh.rrect(Math.min(vw-0.16,0.5),vd-0.16,0.08),0.01,0,0,0.76,zc+0.01);
        B('porcelainIn',Math.min(vw-0.16,0.5),0.1,0.006,0,0.81,zc-(vd-0.16)/2+0.005);
        K.faucet(0,-hd+0.05,0.89,0.2,0.17,'blackMatte');
        if(!noMirror){R('mirror',Math.min(Math.max(vw,0.5),0.9),0.8,0.012,0,1.6,-hd+0.03,0.03);B('led',Math.min(Math.max(vw,0.5),0.9)-0.02,0.8-0.02,0.002,0,1.6,-hd+0.02);}
      }else{
        const zc=-hd+vd/2;
        R('teak',vw,0.36,vd,0,0.64,zc,0.015);
        for(let i=0;i<Math.max(1,Math.round(vw/0.45));i++){const n=Math.max(1,Math.round(vw/0.45)),c=-vw/2+vw/n*(i+0.5);if(i)B('walnut',0.004,0.32,0.006,-vw/2+vw/n*i,0.64,-hd+vd+0.002);R('brass',0.012,0.12,0.02,c+(vw/n)*0.35*(i%2?-1:1),0.66,-hd+vd+0.012,0.005);}
        K.X('stoneTop',sh.rrect(vw+0.02,vd+0.01,0.01),0.03,0.006,0,0.82,zc);
        L('porcelain',[[0,0],[0.1,0],[0.17,0.035],[0.2,0.1],[0.205,0.14],[0.195,0.142],[0.188,0.1],[0.16,0.045],[0.09,0.016],[0,0.016]],0,0.85,zc+0.03,1,0.82);
        C('chrome',0.02,0.02,0.01,0,0.86,zc+0.03,16);
        K.faucet(0,-hd+0.05,0.85,0.3,0.2,'brass');
        if(!noMirror){T('brass',0.32,0.012,0,1.6,-hd+0.02,0,0);C('mirror',0.31,0.31,0.012,0,1.6,-hd+0.02,48,true);}
      }
      if(opts.hasModel&&opts.hasModel('basin')){parts.splice(s0);decor.push(['basin',0,0,-hd,0,{wall:true,W:vw,D:vd}]);if(!noMirror){R('graphite',0.74,0.84,0.015,0,1.6,-hd+0.008,0.01);R('mirror',0.7,0.8,0.012,0,1.6,-hd+0.02,0.008);}}
      L('graphite',[[0,0],[0.028,0],[0.028,0.13],[0.008,0.15],[0,0.15]],Math.max(0.18,vw/2-0.1),0.86,-hd+0.1);
      if(st!=='pedestal')K.plant(-vw/2+0.12,0.86,-hd+0.12,0.35);
      const rx=hw+0.25;if(freeL(hw,-hd+0.1,1,0)>0.35){T('chrome',0.09,0.007,rx,1.3,-hd+0.06);R('towel',0.26,0.4,0.03,rx,1.1,-hd+0.06,0.012);}
      R('bathmat',Math.min(Math.max(vw,0.5),0.7),0.008,0.45,0,0.004,-hd+vd+0.3,0.003);
      break;}
    case 'shower':{
      R('porcelain',W*0.98,0.04,D*0.98,0,0.02,0,0.012);B('steel',Math.min(W*0.7,0.6),0.004,0.06,0,0.043,-hd+0.18);
      const sides=[[0,hd,W,0],[-hw,0,D,Math.PI/2],[hw,0,D,Math.PI/2]];
      sides.forEach(([sx,sz,len,ang],i)=>{const d=i===0?freeL(0,hd-0.05,0,1):i===1?freeL(-hw+0.05,0,-1,0):freeL(hw-0.05,0,1,0);if(d<0.12)return;
        const P=[];const k2=kit(THREE,P);k2.B('glass',len*0.98,1.95,0.01,0,1.0,0);k2.B('chrome',0.02,1.95,0.025,-len*0.49,1.0,0);k2.B('chrome',0.02,1.95,0.025,len*0.49,1.0,0);k2.B('chrome',len*0.98,0.02,0.025,0,1.97,0);k2.R('chrome',0.02,0.3,0.03,len*0.2,1.05,0.03,0.008);
        P.forEach(([m,g])=>{g.rotateY(ang);g.translate(sx,0,sz);parts.push([m,g]);});});
      C('chrome',0.012,0.012,0.36,0,2.1,-hd+0.18,8,true);C('chrome',0.14,0.14,0.012,0,2.09,-hd+0.36,28);
      C('chrome',0.035,0.035,0.03,0,1.1,-hd+0.02,20,true);R('chrome',0.09,0.014,0.014,0.05,1.1,-hd+0.05,0.005);
      C('chrome',0.01,0.01,0.9,-W*0.3,1.35,-hd+0.035,8);R('chrome',0.05,0.12,0.03,-W*0.3,1.6,-hd+0.05,0.01);
      placeNiche(W*0.22,1.25,Math.min(0.36,W*0.35),0.55);
      if(freeL(0,hd+0.05,0,1)>0.5)R('bathmat',0.6,0.008,0.4,0,0.004,hd+0.25,0.003);
      break;}
    case 'reception':{R('walnut',W*0.95,1.05,Math.min(D,0.6),0,0.525,-hd+0.3,0.02);R('quartz',W,0.04,Math.min(D,0.65),0,1.07,-hd+0.32,0.01);K.plant(W*0.35,1.09,-hd+0.3,0.5);break;}
    case 'shelf':{const sd=Math.min(D,0.45);for(let i=0;i<4;i++){R('oak',W,0.03,sd,0,0.1+i*0.5,-hd+sd/2,0.005);if(i)K.books(-W*0.2,0.115+i*0.5,-hd+sd/2,Math.min(0.5,W*0.4));}[-1,1].forEach(s=>B('metal',0.03,1.8,sd,s*(W/2-0.015),0.9,-hd+sd/2));break;}
    case 'lounger':{R('oak',Math.min(W,0.7),0.3,Math.min(D,1.8),0,0.15,0,0.02);R('cushion',Math.min(W,0.7)-0.06,0.08,Math.min(D,1.8)-0.06,0,0.34,0,0.03);break;}
  }
  parts.forEach(([m,g])=>{g.rotateY(rot);g.translate(cx,lv,cz);});
  return {kind,parts,decor:decor.map(([k,lx,ly,lz,er,ex])=>({k,x:cx+lx*cr+lz*sr,y:ly,z:cz-lx*sr+lz*cr,rot:rot+(er||0),ex:ex||null})),place:opts.skipMain?{cx,cz,rot,W,D,bed:/^bed/.test(kind)?{bw:kind==='bed'?Math.max(1.35,Math.min(1.8,W>2.25?W-0.9:W)):Math.min(W,1.0),bl:Math.min(D,2.05)}:null}:null};
};

Furn.cabinetRun=function(K,s0,s1,cd,zw,o){
  const {B,R,C,L,TB}=K,len=s1-s0,mid=(s0+s1)/2,zf=zw+cd;
  R('graphite',len,0.1,cd-0.06,mid,0.05,zw+(cd-0.06)/2,0.005);
  R('cabinet',len,0.76,cd-0.03,mid,0.48,zw+(cd-0.03)/2,0.006);
  R('quartz',len+0.02,0.04,cd+0.02,mid,0.88,zw+cd/2,0.008);
  const n=Math.max(1,Math.round(len/0.6));
  for(let i=0;i<n;i++){const a=s0+len/n*i,b=a+len/n,c=(a+b)/2;if(i)B('graphite',0.004,0.72,0.006,a,0.48,zf-0.028);
    const drawer=(o.cook||[]).some(x=>Math.abs(x-c)<0.35);
    if(drawer){for(let k=0;k<3;k++){B('graphite',len/n-0.02,0.004,0.006,c,0.25+k*0.22,zf-0.028);K.handle('steel',0.3,c,0.33+k*0.22,zf-0.02);}}
    else K.handle('steel',0.3,c,0.78,zf-0.02);}
  TB('tileWall',len,0.62,0.01,mid,1.21,zw+0.005,0.15,0.3);
  (o.cook||[]).forEach(x=>{R('granite',0.6,0.012,0.52,x,0.906,zw+0.3,0.006);
    [[-0.14,-0.11,0.08],[0.14,-0.11,0.06],[-0.14,0.11,0.06],[0.14,0.11,0.08]].forEach(([a,b,r])=>{C('metal',r,r,0.008,x+a,0.915,zw+0.3+b,24);C('graphite',r*0.55,r*0.55,0.012,x+a,0.92,zw+0.3+b,16);});
    if(o.upper!==false){L('steel',[[0,0],[0.3,0],[0.3,0.06],[0.12,0.45],[0,0.45]],x,1.55,zw+0.25,1,0.85);R('steel',0.2,0.6,0.2,x,2.25,zw+0.12,0.01);}});
  (o.sink||[]).forEach(x=>{const zc=zw+0.31;
    B('steel',0.62,0.012,0.05,x,0.906,zc-0.205);B('steel',0.62,0.012,0.05,x,0.906,zc+0.205);B('steel',0.05,0.012,0.36,x-0.285,0.906,zc);B('steel',0.05,0.012,0.36,x+0.285,0.906,zc);
    B('steel',0.52,0.012,0.36,x,0.72,zc);B('steel',0.52,0.19,0.006,x,0.815,zc-0.18);B('steel',0.52,0.19,0.006,x,0.815,zc+0.18);B('steel',0.006,0.19,0.36,x-0.26,0.815,zc);B('steel',0.006,0.19,0.36,x+0.26,0.815,zc);
    C('graphite',0.035,0.035,0.004,x,0.728,zc,16);
    C('chrome',0.025,0.03,0.04,x,0.93,zw+0.07,16);C('chrome',0.014,0.014,0.34,x,1.08,zw+0.07,12);
    const sp=new K._T.CylinderGeometry(0.012,0.012,0.22,10);sp.rotateX(Math.PI/2);sp.translate(x,1.25,zw+0.18);K._P.push(['chrome',sp]);
    C('chrome',0.012,0.01,0.06,x,1.22,zw+0.29,10);R('chrome',0.02,0.06,0.02,x+0.04,1.0,zw+0.07,0.006);});
  if(o.upper!==false){const segs=[];let a=s0;(o.cook||[]).forEach(x=>{if(x-0.35>a)segs.push([a,x-0.35]);a=x+0.35;});if(s1>a)segs.push([a,s1]);
    segs.forEach(([a,b])=>{if(b-a<0.3)return;const m=(a+b)/2,l=b-a;R('cabinet',l,0.72,0.35,m,1.88,zw+0.175,0.006);const k=Math.max(1,Math.round(l/0.5));
      for(let i=0;i<k;i++){const c=a+l/k*(i+0.5);if(i)B('graphite',0.004,0.68,0.006,a+l/k*i,1.88,zw+0.352);K.handle('steel',0.22,c+(i%2?-0.15:0.15)*Math.min(1,l/k/0.5),1.62,zw+0.36,true);}
      B('led',l-0.04,0.01,0.03,m,1.515,zw+0.3);});}
};

Furn.counter=function(THREE,a,b,n,lv,depth,cook,sink,upperOk){
  let ux=b[0]-a[0],uz=b[1]-a[1];const L=Math.hypot(ux,uz);
  if((ux*n[1]-uz*n[0])<0){const t=a;a=b;b=t;ux=-ux;uz=-uz;cook=cook.map(x=>L-x);sink=sink.map(x=>L-x);}
  const parts=[],K=kit(THREE,parts);
  Furn.cabinetRun(K,0,L,depth,0,{cook,sink,upper:upperOk});
  const ang=Math.atan2(uz,ux);
  parts.forEach(([m,g])=>{g.rotateY(-ang);g.translate(a[0],lv,a[1]);});
  return parts;
};

Furn.countertop=function(THREE,L,depth,holes,x0){
  x0=x0||0;const b=0.003,s=new THREE.Shape();
  s.moveTo(x0+b,b);s.lineTo(L-b,b);s.lineTo(L-b,depth-b);s.lineTo(x0+b,depth-b);s.closePath();
  (holes||[]).forEach(h=>{const w=h.w,d=h.d||0.4,cx=h.x,cz=h.z||0.31,r=0.02,p=new THREE.Path(),xa=cx-w/2,xb=cx+w/2,za=cz-d/2,zb=cz+d/2;
    p.moveTo(xa+r,za);p.lineTo(xb-r,za);p.quadraticCurveTo(xb,za,xb,za+r);p.lineTo(xb,zb-r);p.quadraticCurveTo(xb,zb,xb-r,zb);p.lineTo(xa+r,zb);p.quadraticCurveTo(xa,zb,xa,zb-r);p.lineTo(xa,za+r);p.quadraticCurveTo(xa,za,xa+r,za);s.holes.push(p);});
  const g=new THREE.ExtrudeGeometry(s,{depth:0.04-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:6});
  g.rotateX(Math.PI/2);g.translate(0,0.9-b,0);return g;
};
Furn.kitchenPlan=function(L,cook,sink,upper,blind0,blind1){
  const s0=blind0?0.6:0,s1=L-(blind1?0.6:0),mods=[],holes=[],deco=[];
  const fixed=[];cook.forEach(c=>fixed.push({t:'cook',c,w:0.6}));sink.forEach(c=>fixed.push({t:'sink',c,w:0.8}));
  fixed.sort((a,b)=>a.c-b.c);
  const fit=()=>{fixed.forEach(f=>{f.c=Math.max(s0+f.w/2,Math.min(s1-f.w/2,f.c));});
    for(let i=1;i<fixed.length;i++){const a=fixed[i-1],b=fixed[i];const ov=(a.c+a.w/2)-(b.c-b.w/2);if(ov>0.001){const sh=ov/2;a.c-=sh;b.c+=sh;}}};
  fit();for(let i=1;i<fixed.length;i++){const a=fixed[i-1],b=fixed[i];if((a.c+a.w/2)-(b.c-b.w/2)>0.001){[a,b].forEach(f=>{if(f.t==='sink')f.w=0.6;});}}
  if(fixed.reduce((s,f)=>s+f.w,0)>s1-s0+0.001){fixed.forEach(f=>{if(f.t==='sink')f.w=0.6;});}
  fit();fit();
  const kept=[];fixed.forEach(f=>{if(f.c-f.w/2>=s0-0.01&&f.c+f.w/2<=s1+0.01&&!kept.some(k=>Math.abs(k.c-f.c)<(k.w+f.w)/2-0.01))kept.push(f);});
  const fill=(a,b,base,nextTo)=>{const g=b-a;if(g<0.015)return;
    if(g<0.25){mods.push({k:base?'F_base_10':'F_wall_10',x:(a+b)/2,sx:g/0.1});return;}
    let n=Math.max(1,Math.round(g/0.6));if(g/n>0.78)n++;const w=g/n;
    for(let i=0;i<n;i++){const x=a+w*(i+0.5);let k;
      if(base){const drawer=(nextTo==='left'&&i===n-1)||(nextTo==='right'&&i===0)||(nextTo==='both'&&(i===0||i===n-1));
        if(drawer&&w>=0.35)k=w>=0.5?['B_drw3_60',0.6]:['B_drw3_40',0.4];else k=w>=0.5?['B_door2_60',0.6]:['B_door1_45',0.45];}
      else k=w>=0.5?['W_door2_60',0.6]:['W_door1_40',0.4];
      mods.push({k:k[0],x,sx:w/k[1]});}};
  let a=s0;kept.forEach((f,i)=>{const nxt='';const ca=f.c-f.w/2;
    const lc=kept[i-1]&&kept[i-1].t==='cook',rc=f.t==='cook';fill(a,ca,true,lc&&rc?'both':rc?'left':lc?'right':'');
    if(f.t==='cook')mods.push({k:'B_oven_60',x:f.c,sx:f.w/0.6});
    else{mods.push({k:f.w>0.7?'B_sink_80':'B_sink_60',x:f.c,sx:1});holes.push({x:f.c,w:f.w>0.7?0.54:0.44,d:0.4,z:0.31});}
    a=f.c+f.w/2;});
  fill(a,s1,true,kept.length&&kept[kept.length-1].t==='cook'?'right':'');
  if(upper){const u0=blind0?0.35:0,u1=L-(blind1?0.35:0);let ua=u0;const hoods=kept.filter(f=>f.t==='cook');
    const segs=[];hoods.forEach(h=>{const ha=h.c-0.3;if(ha>ua)segs.push([ua,ha]);mods.push({k:'H_hood_60',x:h.c,sx:1});mods.push({k:'H_chimney',x:h.c,sx:1,chim:true});ua=h.c+0.3;});
    if(u1>ua)segs.push([ua,u1]);const n0=mods.length;segs.forEach(([p,q])=>fill(p,q,false));
    const ups=mods.slice(n0).filter(m=>m.k==='W_door2_60');if(ups.length>=3){const g=ups[Math.floor(ups.length/2)];g.k='W_glass2_60';}}
  const busy=kept.map(f=>[f.c-f.w/2,f.c+f.w/2,f.t]);
  const freeAt=(x,hw)=>x-hw>=s0+0.02&&x+hw<=s1-0.02&&!busy.some(([p,q,t])=>x+hw>p+(t==='cook'?-0.02:0.1)&&x-hw<q-(t==='cook'?-0.02:0.1));
  const ck=kept.find(f=>f.t==='cook');let used=[];
  if(ck){for(const d of [1,-1]){const x=ck.c+d*(0.3+0.3);if(freeAt(x,0.27)){deco.push({k:'D_set1',x});used.push(x);break;}}}
  if(L>=2.2){const cands=[];for(let x=s0+0.3;x<=s1-0.3;x+=0.05)if(freeAt(x,0.22)&&!used.some(u=>Math.abs(u-x)<0.6))cands.push(x);
    if(cands.length){const far=ck?cands.reduce((b,x)=>Math.abs(x-ck.c)>Math.abs(b-ck.c)?x:b,cands[0]):cands[0];deco.push({k:'D_set2',x:far});}}
  return {mods,holes,deco,c0:blind0?0.62:0,c1:L-(blind1?0.62:0)};
};
Furn.counterKit=function(THREE,a,b,n,lv,depth,cook,sink,upperOk,blind,ceilH){
  let ux=b[0]-a[0],uz=b[1]-a[1];const L=Math.hypot(ux,uz);blind=blind||[false,false];
  if((ux*n[1]-uz*n[0])<0){const t=a;a=b;b=t;ux=-ux;uz=-uz;cook=cook.map(x=>L-x);sink=sink.map(x=>L-x);blind=[blind[1],blind[0]];}
  const P=Furn.kitchenPlan(L,cook,sink,upperOk,blind[0],blind[1]);
  const parts=[],K=kit(THREE,parts);
  if(P.c1-P.c0>0.05){const g=Furn.countertop(THREE,P.c1,0.62,P.holes,P.c0);parts.push(['quartzKit',g]);}
  K.TB('tileWall',L,0.6,0.01,L/2,1.2,0.005,0.15,0.3);
  const ang=Math.atan2(uz,ux),ca=Math.cos(ang),sa=Math.sin(ang);
  parts.forEach(([m,g])=>{g.rotateY(-ang);g.translate(a[0],lv,a[1]);});
  const W=(x,z)=>[a[0]+x*ca-z*sa,a[1]+x*sa+z*ca];
  const mods=P.mods.concat(P.deco).map(m=>{const p=W(m.x,0);let y=lv,sy=1;if(m.chim){y=lv+1.92;sy=Math.max(0.05,(ceilH||2.7)-1.92);}return {k:m.k,pos:[p[0],y,p[1]],rot:-ang,sv:[m.sx||1,sy,1]};});
  return {parts,mods};
};

Furn.car=function(THREE,x,z,lv,rotY,colorIdx){
  const parts=[],K=kit(THREE,parts);const cm='car'+colorIdx;
  K.R(cm,1.78,0.6,4.3,0,0.56,0,0.18);K.R(cm,1.56,0.5,2.2,0,1.08,-0.2,0.2);K.R('window',1.58,0.38,2.02,0,1.1,-0.2,0.15);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const g=new THREE.CylinderGeometry(0.32,0.32,0.22,22);g.rotateZ(Math.PI/2);g.translate(a*0.8,0.32,b*1.35);parts.push(['tire',g]);});
  K.R('chrome',1.6,0.08,0.04,0,0.6,2.15,0.02);
  parts.forEach(([m,g])=>{g.rotateY(rotY);g.translate(x,lv,z);});
  return parts;
};

if(typeof module!=='undefined'&&module.exports)module.exports=Furn;else root.Furn=Furn;
})(typeof globalThis!=='undefined'?globalThis:this);

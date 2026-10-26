(function(root){
const P2G=root.Plan2Geo||(typeof require!=='undefined'?require('./plan2geo.js'):null);
const Rooms={};
const SQ2=Math.SQRT2;

Rooms.kind=function(s){
  s=(s||'').toUpperCase();
  if(/BAÑO|WC|COCIN|LAVANDER|SERVICI|SERV|DESPENSA|PLANCHADO|SECADO|PARRILLERO/.test(s))return 'tile';
  if(/PARQUEO|GARAJE|GARAGE|BAULERA|MAQUINAS|MÁQUINAS|ESTACIONAMIENTO/.test(s))return 'conc';
  if(/TERRAZA|BALC|PATIO|JARD/.test(s))return 'deck';
  if(/LOCAL|TIENDA|RECEPCI|DEP[OÓ]SITO|LOBBY|COMERCIAL/.test(s))return 'porc';
  return 'wood';
};
Rooms.blockedAt=function(rg,x,z){const X=Math.floor((x-rg.mx)*rg.R),Y=Math.floor((z-rg.mz)*rg.R);if(X<0||Y<0||X>=rg.w||Y>=rg.h)return true;const i=Y*rg.w+X;return !!rg.block.d[i]||!rg.ins.d[i];};

Rooms.doorLines=function(G,prg){
  const out=[];
  G.walls.concat(G.cols).forEach(w=>{for(let i=0;i<w.length;i++){
    const a=w[i],b=w[(i+1)%w.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<0.07||L>0.32)continue;
    const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    for(const sg of [1,-1]){const nx=dz/L*sg,nz=-dx/L*sg;if(Rooms.blockedAt(prg,m[0]+nx*0.06,m[1]+nz*0.06))continue;
      let d=0;for(let t=0.03;t<=1.4;t+=0.02){if(Rooms.blockedAt(prg,m[0]+nx*t,m[1]+nz*t)){d=t;break;}}
      if(d<0.55||d>1.3)continue;out.push([[m[0]-nx*0.04,m[1]-nz*0.04],[m[0]+nx*(d+0.04),m[1]+nz*(d+0.04)]]);}}});
  return out;
};

function line(g,A,B){const n=Math.ceil(Math.hypot(B[0]-A[0],B[1]-A[1])*4)+1;
  for(let k=0;k<=n;k++){const fx=A[0]+(B[0]-A[0])*k/n,fy=A[1]+(B[1]-A[1])*k/n,X=Math.floor(fx),Y=Math.floor(fy);if(X>=0&&Y>=0&&X<g.w&&Y<g.h)g.d[Y*g.w+X]=1;}}

function Heap(){this.c=[];this.k=[];}
Heap.prototype.push=function(c,k){const C=this.c,K=this.k;let i=C.length;C.push(c);K.push(k);while(i>0){const p=(i-1)>>1;if(K[p]<=k)break;C[i]=C[p];K[i]=K[p];i=p;}C[i]=c;K[i]=k;};
Heap.prototype.pop=function(){const C=this.c,K=this.k,top=C[0],tk=K[0],lc=C.pop(),lk=K.pop();if(C.length){let i=0;const n=C.length;while(true){let l=2*i+1;if(l>=n)break;if(l+1<n&&K[l+1]<K[l])l++;if(K[l]>=lk)break;C[i]=C[l];K[i]=K[l];i=l;}C[i]=lc;K[i]=lk;}this.lastK=tk;return top;};
Heap.prototype.size=function(){return this.c.length;};

function dijkstra(w,h,sources,allowed,maxD){
  const N=w*h,dist=new Float64Array(N).fill(Infinity),own=new Int16Array(N).fill(-1),H=new Heap();
  sources.forEach(([j,v])=>{if(dist[j]>0){dist[j]=0;own[j]=v;H.push(j,0);}});
  while(H.size()){const j=H.pop(),d=H.lastK;if(d>dist[j])continue;if(maxD!=null&&d>maxD)continue;
    const x=j%w,y=(j/w)|0,v=own[j];
    const L=x>0&&allowed(j-1),Rt=x<w-1&&allowed(j+1),U=y>0&&allowed(j-w),D=y<h-1&&allowed(j+w);
    const nb=[[L,j-1,1],[Rt,j+1,1],[U,j-w,1],[D,j+w,1],[L&&U&&allowed(j-w-1),j-w-1,SQ2],[Rt&&U&&allowed(j-w+1),j-w+1,SQ2],[L&&D&&allowed(j+w-1),j+w-1,SQ2],[Rt&&D&&allowed(j+w+1),j+w+1,SQ2]];
    for(const[ok,n,c]of nb){if(!ok)continue;const nd=d+c;if(nd<dist[n]){dist[n]=nd;own[n]=v;H.push(n,nd);}}}
  return {dist,own};
}

Rooms.roomGrid=function(G,opts){
  opts=opts||{};
  const R=20,[mx,mz,Mx,Mz]=G.tex,w=Math.ceil((Mx-mx)*R),h=Math.ceil((Mz-mz)*R),N=w*h;
  const toP=p=>[(p[0]-mx)*R,(p[1]-mz)*R],toW=(X,Y)=>[mx+(X+0.5)/R,mz+(Y+0.5)/R];
  const block=new P2G.Grid(w,h);G.walls.concat(G.cols).forEach(p=>P2G.fillPoly(block,p,toP,1));
  const ins=new P2G.Grid(w,h);P2G.fillPoly(ins,G.slab,toP,1);
  const seal=P2G.morph(P2G.morph(block,1,true),1,false);
  const barrier=new P2G.Grid(w,h);for(let j=0;j<N;j++)barrier.d[j]=block.d[j]|seal.d[j];
  const doors=Rooms.doorLines(G,{R,w,h,mx,mz,block,ins});
  doors.forEach(([a,b])=>line(barrier,toP(a),toP(b)));
  const manual=opts.manual||{};
  const free=j=>ins.d[j]===1&&!barrier.d[j];
  const zone=new Int32Array(N).fill(-1),zcells=[];let nz=0;
  for(let s=0;s<N;s++){if(zone[s]>=0||!free(s))continue;const st=[s];zone[s]=nz;const cells=[];
    while(st.length){const j=st.pop();cells.push(j);const x=j%w;for(const n of[x>0?j-1:-1,x<w-1?j+1:-1,j-w,j+w])if(n>=0&&n<N&&zone[n]<0&&free(n)){zone[n]=nz;st.push(n);}}
    zcells.push(cells);nz++;}
  const away=P2G.morph(block,4,true);
  const labels=(G.labels||[]).map(l=>({s:l[0],k:Rooms.kind(l[0]),x:l[1],z:l[2],wet:Rooms.kind(l[0])==='tile',bath:/BAÑO|WC/.test(l[0]),seed:-1,zone:-1,bnd:'fisica'}));
  labels.forEach(l=>{const x=Math.round((l.x-mx)*R),y=Math.round((l.z-mz)*R);let best=-1,bd=1e9;
    for(let pass=0;pass<2&&best<0;pass++)for(let oy=-24;oy<=24;oy++)for(let ox=-24;ox<=24;ox++){const X=x+ox,Y=y+oy;if(X<0||Y<0||X>=w||Y>=h)continue;const j=Y*w+X;if(!free(j)||(pass===0&&away.d[j]))continue;const d=ox*ox+oy*oy;if(d<bd){bd=d;best=j;}}
    l.seed=best;l.zone=best>=0?zone[best]:-1;});
  const zl=Array.from({length:nz},()=>[]);labels.forEach((l,i)=>{if(l.zone>=0)zl[l.zone].push(i);});
  const D=dijkstra(w,h,labels.map((l,i)=>[l.seed,i]).filter(s=>s[0]>=0),free);
  const lab=D.own,amb=new Uint8Array(N),prev=new Int16Array(N).fill(-1);
  const zoneBox=zcells.map(cs=>{let a=[1e9,1e9,-1e9,-1e9];cs.forEach(j=>{const x=j%w,y=(j/w)|0;a=[Math.min(a[0],x),Math.min(a[1],y),Math.max(a[2],x),Math.max(a[3],y)];});return a;});
  const wallX=[],wallZ=[];G.walls.concat(G.cols).forEach(p=>p.forEach(q=>{wallX.push(q[0]);wallZ.push(q[1]);}));
  const WV=[];G.walls.concat(G.cols).forEach(p=>p.forEach(q=>WV.push(q)));
  const jamb=(v,ax,o0,o1,lo,hi,sg)=>{let best=Math.max(lo,Math.min(hi,v)),bd=0.9;WV.forEach(q=>{const c=q[ax],o=q[1-ax];if(o<o0-0.3||o>o1+0.3||c<lo||c>hi)return;const d=Math.abs(c-v);if((c-v)*sg>0.3)return;if(d<bd){bd=d;best=c;}});return best;};
  const snap=(v,list,lo,hi)=>{let best=v,bd=0.45;list.forEach(c=>{if(c<lo-0.6||c>hi+0.6)return;const d=Math.abs(c-v);if(d<bd){bd=d;best=c;}});return best;};
  labels.forEach((l,i)=>{
    if(l.zone<0)return;const zs=zl[l.zone],open=zs.length>1;
    if(manual[i]){const[a0,b0,a1,b1]=manual[i],x0=Math.min(a0,a1),x1=Math.max(a0,a1),z0=Math.min(b0,b1),z1=Math.max(b0,b1);
      zcells[l.zone].forEach(j=>{const[px,pz]=toW(j%w,(j/w)|0);const inside=px>=x0&&px<=x1&&pz>=z0&&pz<=z1;if(inside)lab[j]=i;else if(lab[j]===i)lab[j]=-2;});l.bnd='manual';l.rect=[x0,z0,x1,z1];return;}
    if(!l.wet){l.bnd=open?'abierta':'fisica';return;}
    let keep=null;const terr=zcells[l.zone].filter(j=>lab[j]===i);
    const rayBox=()=>{const sx=l.seed%w,sy=(l.seed/w)|0;
      const ray=(x0,y0,dx,dy)=>{if(x0<0||y0<0||x0>=w||y0>=h||!free(y0*w+x0))return null;let t=0;for(;t<120;t++){const a=x0+dx*(t+1),b=y0+dy*(t+1);if(a<0||b<0||a>=w||b>=h||!free(b*w+a))break;}return t;};
      const med=(dx,dy)=>{const v=[-8,-4,0,4,8].map(o=>dx?ray(sx,sy+o,dx,dy):ray(sx+o,sy,dx,dy)).filter(t=>t!=null).sort((p,q)=>p-q);return v.length?v[v.length>>1]:0;};
      return [sx-med(-1,0),sx+med(1,0),sy-med(0,-1),sy+med(0,1)];};
    const inB=bx=>j=>{const x=j%w,y=(j/w)|0;return x>=bx[0]&&x<=bx[1]&&y>=bx[2]&&y<=bx[3];};
    const others=labels.filter((o,k)=>k!==i&&o.zone===l.zone&&o.seed>=0);
    if(l.bath){keep=inB(rayBox());l.bnd='inferida';}
    else{
      const ap=(G.appl||[]).map(a=>{const X=Math.floor((a.x-mx)*R),Y=Math.floor((a.z-mz)*R);let best=-1,bd=1e9;for(let oy=-14;oy<=14;oy++)for(let ox=-14;ox<=14;ox++){const xx=X+ox,yy=Y+oy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const j=yy*w+xx;if(zone[j]!==l.zone)continue;const d=ox*ox+oy*oy;if(d<bd){bd=d;best=j;}}return best;}).filter(j=>j>=0&&lab[j]===i);
      if(!ap.length){if(!open){l.bnd='fisica';return;}const bx=rayBox(),ar=(bx[1]-bx[0]+1)*(bx[3]-bx[2]+1)/400,kb=inB(bx);
        if(ar>25||others.some(o=>!o.wet&&kb(o.seed))){terr.forEach(j=>{amb[j]=1;prev[j]=i;lab[j]=-2;});l.bnd='ambigua';return;}
        keep=kb;l.bnd='inferida';}
      else{
      const W=dijkstra(w,h,ap.map(j=>[j,0]),j=>free(j)&&zone[j]===l.zone,30);
      let bb=[1e9,1e9,-1e9,-1e9];zcells[l.zone].forEach(j=>{if(lab[j]===i&&W.dist[j]<=30){const x=j%w,y=(j/w)|0;bb=[Math.min(bb[0],x),Math.min(bb[1],y),Math.max(bb[2],x+1),Math.max(bb[3],y+1)];}});
      const [wx0,wz0]=[mx+bb[0]/R,mz+bb[1]/R],[wx1,wz1]=[mx+bb[2]/R,mz+bb[3]/R];
      let ax0=1e9,ax1=-1e9,az0=1e9,az1=-1e9;ap.forEach(j=>{const[px,pz]=toW(j%w,(j/w)|0);ax0=Math.min(ax0,px);ax1=Math.max(ax1,px);az0=Math.min(az0,pz);az1=Math.max(az1,pz);});
      let sx0=jamb(wx0,0,wz0,wz1,-1e9,ax0-0.35,-1),sx1=jamb(wx1,0,wz0,wz1,ax1+0.35,1e9,1),sz0=jamb(wz0,1,wx0,wx1,-1e9,az0-0.35,-1),sz1=jamb(wz1,1,wx0,wx1,az1+0.35,1e9,1);
      {const grow=[false,false,false,false],absorb=l.absorb=[];(G.kx||[]).map(q=>{const e=[q.b[0]+q.n[0]*0.6,q.b[1]+q.n[1]*0.6];return [Math.min(q.a[0],e[0]),Math.min(q.a[1],e[1]),Math.max(q.a[0],e[0]),Math.max(q.a[1],e[1])];}).concat(G.kbar||[]).forEach(([k0,q0,k1,q1])=>{
          if(k0>sx1+1||k1<sx0-1||q0>sz1+1||q1<sz0-1)return;if(k0<sx0-0.02){sx0=k0;grow[0]=true;}if(k1>sx1+0.02){sx1=k1;grow[1]=true;}if(q0<sz0-0.02){sz0=q0;grow[2]=true;}if(q1>sz1+0.02){sz1=q1;grow[3]=true;}});
        const hitWall=(px,pz,dx,dz)=>{for(let t=0;t<=2.4;t+=0.025){const X=Math.floor((px+dx*t-mx)*R),Y=Math.floor((pz+dz*t-mz)*R);if(X<0||Y<0||X>=w||Y>=h)return t;const j=Y*w+X;if(block.d[j]||!ins.d[j])return t;}return null;};
        const reach=(edge,ax,sg,o0,o1,maxd)=>{const ts=[];for(let k=0;k<7;k++){const o=o0+0.1+(o1-o0-0.2)*k/6,px=ax?o:edge+sg*0.03,pz=ax?edge+sg*0.03:o;const t=hitWall(px,pz,ax?0:sg,ax?sg:0);if(t!=null&&t>0.02&&t<=maxd)ts.push(t);}
          ts.sort((u,v)=>u-v);let best=null;for(let a0=0;a0<ts.length;a0++){let b0=a0;while(b0+1<ts.length&&ts[b0+1]-ts[a0]<=0.3)b0++;if(b0-a0+1>=4&&(!best||b0-a0>best[1]-best[0]))best=[a0,b0];}if(!best)return null;
          let c=edge+sg*(ts[(best[0]+best[1])>>1]+0.03);let bd=0.12;WV.forEach(q=>{const v=q[ax];if(Math.abs(v-c)<bd){bd=Math.abs(v-c);c=v;}});
          const lo=Math.min(edge,c),hi=Math.max(edge,c),bl=others.filter(o=>{const[px,pz]=toW(o.seed%w,(o.seed/w)|0),v=ax?pz:px,u=ax?px:pz;return v>lo&&v<hi&&u>o0&&u<o1;});
          if(bl.some(o=>o.wet||/PASILLO|CIRCUL|HALL|ESTAR|LIVING|SALA|DORM|SUITE|BAÑO|ESTUDIO|VEST|DEP[OÓ]SITO/.test(o.s)||lab.reduce((t,v)=>t+(v===labels.indexOf(o)?1:0),0)>6000))return null;bl.forEach(o=>{if(!absorb.includes(o))absorb.push(o);});return c;};
        if(grow.some(Boolean)){l.grown=true;const d=g=>g?2.4:0.6;{const c=reach(sx0,0,-1,sz0,sz1,d(grow[0]));if(c!=null)sx0=c;}{const c=reach(sx1,0,1,sz0,sz1,d(grow[1]));if(c!=null)sx1=c;}
          {const c=reach(sz0,1,-1,sx0,sx1,d(grow[2]));if(c!=null)sz0=c;}{const c=reach(sz1,1,1,sx0,sx1,d(grow[3]));if(c!=null)sz1=c;}}}
      const inR=j=>{const[px,pz]=toW(j%w,(j/w)|0);return px>=sx0&&px<=sx1&&pz>=sz0&&pz<=sz1;};
      const con=new Uint8Array(N),st=ap.filter(inR);st.forEach(j=>con[j]=1);
      while(st.length){const j=st.pop(),x=j%w;for(const n of[x>0?j-1:-1,x<w-1?j+1:-1,j-w,j+w])if(n>=0&&n<N&&!con[n]&&free(n)&&inR(n)){con[n]=1;st.push(n);}}
      l.rect=[sx0,sz0,sx1,sz1];keep=j=>con[j]===1;l.bnd='inferida';}}
    const kept=terr.filter(keep).length;
    if(!open&&kept*1.35>=terr.length){l.bnd='fisica';delete l.rect;return;}
    terr.forEach(j=>{if(!keep(j)){prev[j]=i;lab[j]=-2;}});
    if(!others.some(o=>!(l.absorb||[]).includes(o)&&keep(o.seed)))zcells[l.zone].forEach(j=>{if(keep(j)&&lab[j]!==i&&(lab[j]<0||!labels[lab[j]].wet)){lab[j]=i;amb[j]=0;}});
  });
  for(let z=0;z<nz;z++){const cs=zcells[z];if(!cs.some(j=>lab[j]===-2))continue;
    const dry=zl[z].filter(i=>!labels[i].wet||labels[i].bnd==='abierta');
    const srcs=[];cs.forEach(j=>{const v=lab[j];if(v>=0&&dry.includes(v))srcs.push([j,v]);});
    if(srcs.length){const F=dijkstra(w,h,srcs,j=>zone[j]===z&&free(j)&&(lab[j]===-2||dry.includes(lab[j])));cs.forEach(j=>{if(lab[j]===-2&&F.own[j]>=0)lab[j]=F.own[j];});}
    const left=cs.filter(j=>lab[j]===-2);
    if(left.length>=200){let sx=0,sy=0;left.forEach(j=>{sx+=j%w;sy+=(j/w)|0;});const[cx,cz]=toW(sx/left.length,sy/left.length);
      labels.push({s:'CIRCULACIÓN',k:opts.ground?'porc':'wood',x:cx,z:cz,wet:false,bath:false,seed:left[0],zone:z,bnd:'inferida',synthetic:true});const id=labels.length-1;left.forEach(j=>{lab[j]=id;});}
    else left.forEach(j=>{lab[j]=amb[j]?-1:prev[j];});}
  const synth=opts.ground?'porc':'wood';
  for(let z=0;z<nz;z++){const cs=zcells[z];if(zl[z].length)continue;const un=cs.filter(j=>lab[j]<0);if(!un.length)continue;
    if(un.length>=200){let sx=0,sy=0;un.forEach(j=>{sx+=j%w;sy+=(j/w)|0;});const[cx,cz]=toW(sx/un.length,sy/un.length);
      labels.push({s:'CIRCULACIÓN',k:synth,x:cx,z:cz,wet:false,bath:false,seed:un[0],zone:z,bnd:'fisica',synthetic:true});const id=labels.length-1;un.forEach(j=>{lab[j]=id;});}
    else{const cnt=new Map();un.forEach(j=>{const x=j%w,y=(j/w)|0;for(let oy=-4;oy<=4;oy++)for(let ox=-4;ox<=4;ox++){const X=x+ox,Y=y+oy;if(X<0||Y<0||X>=w||Y>=h)continue;const v=lab[Y*w+X];if(v>=0&&zone[Y*w+X]!==z)cnt.set(v,(cnt.get(v)||0)+(labels[v].wet?1:4));}});
      let best=-1,bc=0;cnt.forEach((c,v)=>{if(c>bc){bc=c;best=v;}});un.forEach(j=>{lab[j]=best;});}}
  for(let z=0;z<nz;z++){if(zl[z].length<2)continue;const cs=zcells[z];if(new Set(cs.map(j=>lab[j]).filter(v=>v>=0)).size<2)continue;
    const zb=zoneBox[z],gx=x=>Math.round((x-mx)*R),gy=v=>Math.round((v-mz)*R);
    const xs=new Set([zb[0],zb[2]+1]),ys=new Set([zb[1],zb[3]+1]);
    WV.forEach(q=>{const X=gx(q[0]),Y=gy(q[1]);if(X<zb[0]-6||X>zb[2]+7||Y<zb[1]-6||Y>zb[3]+7)return;if(X>zb[0]&&X<=zb[2])xs.add(X);if(Y>zb[1]&&Y<=zb[3])ys.add(Y);});
    labels.forEach(l=>{if(l.zone!==z||!l.rect)return;[l.rect[0],l.rect[2]].forEach(v=>{const X=gx(v);if(X>zb[0]&&X<=zb[2])xs.add(X);});[l.rect[1],l.rect[3]].forEach(v=>{const Y=gy(v);if(Y>zb[1]&&Y<=zb[3])ys.add(Y);});});
    const XS=[...xs].sort((a,b)=>a-b),YS=[...ys].sort((a,b)=>a-b),seen=new Uint8Array(N);
    for(let b=0;b+1<YS.length;b++)for(let a=0;a+1<XS.length;a++){const x0=XS[a],x1=XS[a+1],y0=YS[b],y1=YS[b+1];
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const s=y*w+x;if(seen[s]||zone[s]!==z||lab[s]<0)continue;
        const comp=[s],st=[s];seen[s]=1;while(st.length){const j=st.pop(),jx=j%w,jy=(j/w)|0;for(const[nx,ny]of[[jx-1,jy],[jx+1,jy],[jx,jy-1],[jx,jy+1]]){if(nx<x0||nx>=x1||ny<y0||ny>=y1)continue;const n=ny*w+nx;if(seen[n]||zone[n]!==z||lab[n]<0)continue;seen[n]=1;comp.push(n);st.push(n);}}
        const cnt=new Map();comp.forEach(j=>cnt.set(lab[j],(cnt.get(lab[j])||0)+1));let best=-1,bc=-1;cnt.forEach((c,v)=>{if(c>bc){bc=c;best=v;}});
        if(cnt.size>1)comp.forEach(j=>{lab[j]=best;});}}
    for(let pass=0;pass<2;pass++)for(let b=0;b+1<YS.length;b++)for(let a=0;a+1<XS.length;a++){const x0=XS[a],x1=XS[a+1],y0=YS[b],y1=YS[b+1],tx=x1-x0<7,ty=y1-y0<7;if(!tx&&!ty)continue;
      const inZ=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&zone[y*w+x]===z&&lab[y*w+x]>=0,inA=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&zone[y*w+x]===z;const out=new Map(),own=new Set();
      let un=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(inZ(x,y))own.add(lab[y*w+x]);else if(inA(x,y))un++;}if(!own.size&&!un)continue;
      const put=(x,y)=>{if(inZ(x,y)){const v=lab[y*w+x];out.set(v,(out.get(v)||0)+1);}};
      if(tx)for(let y=y0;y<y1;y++){put(x0-1,y);put(x1,y);}
      if(ty)for(let x=x0;x<x1;x++){put(x,y0-1);put(x,y1);}
      if(!out.size)continue;const ks=[...out.keys()];let L=-1,bc=-1;out.forEach((c,v)=>{if(c>bc){bc=c;L=v;}});
      if(new Set(ks.map(v=>labels[v].wet)).size>1){if(own.size!==1)continue;const o=[...own][0],r=labels[o].rect;if(!r)continue;const[cx,cz]=toW((x0+x1)/2,(y0+y1)/2);
        if(cx>=r[0]&&cx<=r[2]&&cz>=r[1]&&cz<=r[3])continue;L=ks.find(v=>v!==o&&labels[v].wet!==labels[o].wet);if(L==null)continue;}
      if(!un&&own.size===1&&own.has(L))continue;
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(inA(x,y))lab[y*w+x]=L;}}
  for(let it=0;it<4;it++){let changed=0;
    for(let j=0;j<N;j++){if(lab[j]>=0||!ins.d[j]||block.d[j])continue;const x=j%w;let pick=-1;
      for(const n of[x>0?j-1:-1,x<w-1?j+1:-1,j-w,j+w]){if(n<0||n>=N)continue;const v=lab[n];if(v<0)continue;if(pick<0||(labels[pick].wet&&!labels[v].wet))pick=v;}
      if(pick>=0){lab[j]=pick;changed++;}}
    if(!changed)break;}
  {const seen=new Uint8Array(N),seeds=new Set(labels.filter(l=>!l.synthetic).map(l=>l.seed).filter(j=>j>=0));
    for(let s0=0;s0<N;s0++){const L0=lab[s0];if(seen[s0]||L0<0||labels[L0].k==='tile'||block.d[s0]||!ins.d[s0])continue;
      const comp=[s0],st=[s0];seen[s0]=1;while(st.length&&comp.length<=900){const j=st.pop(),x=j%w;for(const n of[x>0?j-1:-1,x<w-1?j+1:-1,j-w,j+w]){if(n<0||n>=N||seen[n]||lab[n]!==L0||block.d[n])continue;seen[n]=1;comp.push(n);st.push(n);}}
      if(comp.length>900||comp.some(j=>seeds.has(j)))continue;{let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;comp.forEach(j=>{const x=j%w,y=(j/w)|0;a0=Math.min(a0,x);a1=Math.max(a1,x);b0=Math.min(b0,y);b1=Math.max(b1,y);});if(comp.length>250&&Math.min(a1-a0,b1-b0)+1>16)continue;}const cnt=new Map();let tot=0;
      comp.forEach(j=>{const x=j%w;for(const n of[x>0?j-1:-1,x<w-1?j+1:-1,j-w,j+w]){if(n<0||n>=N||block.d[n]||!ins.d[n]||lab[n]===L0)continue;tot++;const v=lab[n];if(v>=0&&labels[v].k==='tile')cnt.set(v,(cnt.get(v)||0)+1);}});
      let best=-1,bc=0,tt=0;cnt.forEach((c,v)=>{tt+=c;if(labels[v].grown&&c>bc){bc=c;best=v;}});if(best<0||tt<tot*0.55)continue;{const r=labels[best].rect;if(!r)continue;if(!comp.every(j=>{const[px,pz]=toW(j%w,(j/w)|0);return px>=r[0]-0.6&&px<=r[2]+0.6&&pz>=r[1]-0.6&&pz<=r[3]+0.6;}))continue;}comp.forEach(j=>{lab[j]=best;});}}
  return {R,w,h,mx,mz,lab,labels,ins,block,barrier,zone,amb,doors,nzones:nz,zsize:zcells.map(c=>c.length)};
};

Rooms.rects=function(rg){
  const {w,h,lab,ins,R,mx,mz}=rg,by=new Map(),open=new Map();
  const add=(k,r)=>{if(!by.has(k))by.set(k,[]);by.get(k).push(r);};
  for(let y=0;y<=h;y++){const runs=new Map();
    if(y<h){let x=0;while(x<w){const j=y*w+x;if(!ins.d[j]){x++;continue;}const k=lab[j];let x1=x+1;while(x1<w&&ins.d[y*w+x1]&&lab[y*w+x1]===k)x1++;runs.set(x+','+x1+','+k,[x,x1,k]);x=x1;}}
    for(const[key,o]of open){if(runs.has(key)){runs.delete(key);}else{add(o.k,[mx+o.x0/R,mz+o.y0/R,mx+o.x1/R,mz+y/R,o.x0,o.y0,o.x1,y]);open.delete(key);}}
    for(const[key,[x0,x1,k]]of runs)open.set(key,{x0,x1,k,y0:y});}
  const bb=new Map();for(const[k,rs]of by){let a=[1e9,1e9,-1e9,-1e9];rs.forEach(r=>{a=[Math.min(a[0],r[0]),Math.min(a[1],r[1]),Math.max(a[2],r[2]),Math.max(a[3],r[3])];});bb.set(k,a);}
  return {by,bb};
};

Rooms.validate=function(rg,rects){
  const errs=[],{w,h,lab,ins}=rg,cover=new Int16Array(w*h).fill(-9);
  for(const[k,rs]of rects.by)rs.forEach(r=>{for(let y=r[5];y<r[7];y++)for(let x=r[4];x<r[6];x++){const j=y*w+x;if(cover[j]!==-9)errs.push('overlap '+x+','+y);cover[j]=k;if(lab[j]!==k)errs.push('mismatch '+x+','+y);if(!ins.d[j])errs.push('outside '+x+','+y);}});
  for(let j=0;j<w*h;j++)if(ins.d[j]&&cover[j]===-9)errs.push('uncovered '+j);
  rg.labels.forEach((l,i)=>{if(!l.wet||l.zone<0)return;for(let j=0;j<w*h;j++)if(lab[j]===i&&rg.zone[j]>=0&&rg.zone[j]!==l.zone&&rg.zsize[rg.zone[j]]>=200){errs.push('wet leak '+l.s+' zone '+rg.zone[j]);break;}});
  return {ok:!errs.length,errors:errs.slice(0,20),count:errs.length};
};

if(typeof module!=='undefined'&&module.exports)module.exports=Rooms;else root.Rooms=Rooms;
})(typeof globalThis!=='undefined'?globalThis:this);

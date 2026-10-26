(function(root){
const P2G={};

P2G.extractPage=async function(pdfjsLib,page){
  const vp=page.getViewport({scale:1});
  const T=pdfjsLib.Util.transform;
  const ol=await page.getOperatorList();
  const O=pdfjsLib.OPS;
  let ctm=vp.transform.slice(),stack=[],fill=[0,0,0],stroke=[0,0,0],lw=1,pending=null;
  let ocg=null;try{if(page._transport&&page._transport.getOptionalContentConfig)ocg=await page._transport.getOptionalContentConfig();}catch(e){}
  const mc=[],ly=()=>{for(let k=mc.length-1;k>=0;k--)if(mc[k])return mc[k];return null;};
  const paths=[];
  const col=a=>{if(!a)return[0,0,0];if(typeof a==='string'){const h=a.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}return[a[0],a[1],a[2]];};
  const ap=(x,y)=>[ctm[0]*x+ctm[2]*y+ctm[4],ctm[1]*x+ctm[3]*y+ctm[5]];
  const sc=()=>Math.sqrt(Math.abs(ctm[0]*ctm[3]-ctm[1]*ctm[2]));
  function build(ops,c){
    const sub=[];let cur=null,i=0,lx=0,ly=0;
    const push=(x,y)=>{const q=ap(x,y);cur.push(q[0],q[1]);lx=x;ly=y;};
    for(const op of ops){
      if(op===O.moveTo){cur=[];sub.push(cur);push(c[i],c[i+1]);i+=2;}
      else if(op===O.lineTo){if(!cur){cur=[];sub.push(cur);}push(c[i],c[i+1]);i+=2;}
      else if(op===O.curveTo||op===O.curveTo2||op===O.curveTo3){
        let x1,y1,x2,y2,x3,y3;
        if(op===O.curveTo){[x1,y1,x2,y2,x3,y3]=c.slice(i,i+6);i+=6;}
        else if(op===O.curveTo2){x1=lx;y1=ly;[x2,y2,x3,y3]=c.slice(i,i+4);i+=4;}
        else{[x1,y1,x3,y3]=c.slice(i,i+4);x2=x3;y2=y3;i+=4;}
        if(!cur){cur=[];sub.push(cur);}
        cur.curve=true;
        const x0=lx,y0=ly;
        for(let k=1;k<=8;k++){const t=k/8,u=1-t;push(u*u*u*x0+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3);}
      }
      else if(op===O.closePath){if(cur&&cur.length>=4){cur.push(cur[0],cur[1]);}}
      else if(op===O.rectangle){const[x,y,w,h]=c.slice(i,i+4);i+=4;cur=[];sub.push(cur);push(x,y);push(x+w,y);push(x+w,y+h);push(x,y+h);push(x,y);}
    }
    return sub.filter(s=>s.length>=4);
  }
  const F=new Set([O.fill,O.eoFill]),S=new Set([O.stroke,O.closeStroke]),FS=new Set([O.fillStroke,O.eoFillStroke,O.closeFillStroke,O.closeEOFillStroke]);
  for(let i=0;i<ol.fnArray.length;i++){
    const fn=ol.fnArray[i],a=ol.argsArray[i];
    if(fn===O.save)stack.push([ctm,fill,stroke,lw]);
    else if(fn===O.restore){const s=stack.pop();if(s)[ctm,fill,stroke,lw]=s;}
    else if(fn===O.transform)ctm=T(ctm,a);
    else if(fn===O.setFillRGBColor)fill=col(a);
    else if(fn===O.setStrokeRGBColor)stroke=col(a);
    else if(fn===O.setFillGray){const v=Math.round((a[0]<=1?a[0]*255:a[0]));fill=[v,v,v];}
    else if(fn===O.setStrokeGray){const v=Math.round((a[0]<=1?a[0]*255:a[0]));stroke=[v,v,v];}
    else if(fn===O.setLineWidth)lw=a[0];
    else if(fn===O.beginMarkedContentProps){let nm=null;try{if(a[0]==='OC'&&a[1]&&a[1].id&&ocg){const g=ocg.getGroup(a[1].id);nm=g&&g.name||null;}}catch(e){}mc.push(nm);}
    else if(fn===O.beginMarkedContent)mc.push(null);
    else if(fn===O.endMarkedContent)mc.pop();
    else if(fn===O.constructPath)pending=build(a[0],a[1]);
    else if(F.has(fn)){if(pending&&pending.length)paths.push({t:'f',c:fill,sp:pending,ly:ly()});pending=null;}
    else if(S.has(fn)){if(pending&&pending.length)paths.push({t:'s',c:stroke,w:Math.max(lw,0.05)*sc(),sp:pending,ly:ly()});pending=null;}
    else if(FS.has(fn)){if(pending&&pending.length){paths.push({t:'f',c:fill,sp:pending,ly:ly()});paths.push({t:'s',c:stroke,w:Math.max(lw,0.05)*sc(),sp:pending,ly:ly()});}pending=null;}
    else if(fn===O.endPath)pending=null;
  }
  const tc=await page.getTextContent();
  const words=[];
  for(const it of tc.items){
    if(!it.str||!it.str.trim())continue;
    const m=T(vp.transform,it.transform);
    const h=Math.hypot(m[2],m[3])||Math.hypot(it.transform[2],it.transform[3]);
    const ang=Math.atan2(m[1],m[0]);
    if(Math.abs(ang)>0.3)continue;
    const n=it.str.length,cw=(it.width||n*h*0.55)/n;
    const re=/\S+/g;let mm;
    while((mm=re.exec(it.str))){
      const x0=m[4]+cw*mm.index,x1=x0+cw*mm[0].length;
      words.push({s:mm[0],x:(x0+x1)/2,y:m[5]-h*0.35,x0,x1,h});
    }
  }
  return {W:vp.width,H:vp.height,paths,words};
};

/* ---------- raster helpers ---------- */
function Grid(w,h){this.w=w;this.h=h;this.d=new Uint8Array(w*h);}
function fillPoly(g,pts,toPx,val){
  const P=pts.map(toPx);let y0=Infinity,y1=-Infinity;
  P.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
  y0=Math.max(0,Math.floor(y0));y1=Math.min(g.h-1,Math.ceil(y1));
  const xs=[];
  for(let y=y0;y<=y1;y++){
    const yc=y+0.5;xs.length=0;
    for(let i=0,j=P.length-1;i<P.length;j=i++){
      const a=P[i],b=P[j];
      if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]));
    }
    xs.sort((p,q)=>p-q);
    for(let k=0;k+1<xs.length;k+=2){
      const xa=Math.max(0,Math.round(xs[k])),xb=Math.min(g.w-1,Math.round(xs[k+1])-1);
      for(let x=xa;x<=xb;x++)g.d[y*g.w+x]=val;
    }
  }
}
function drawLine(g,a,b,r){
  const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));
  for(let i=0;i<=n;i++){
    const x=Math.round(a[0]+dx*i/n),y=Math.round(a[1]+dy*i/n);
    for(let oy=-r;oy<=r;oy++)for(let ox=-r;ox<=r;ox++){const X=x+ox,Y=y+oy;if(X>=0&&Y>=0&&X<g.w&&Y<g.h)g.d[Y*g.w+X]=1;}
  }
}
function morph(g,r,dil){
  const w=g.w,h=g.h,src=g.d,tmp=new Uint8Array(w*h),out=new Uint8Array(w*h);
  for(let y=0;y<h;y++){
    let cnt=0;const row=y*w;
    for(let x=-r;x<w+r;x++){
      const add=x+r,rem=x-r-1;
      if(add<w&&add>=0)cnt+=src[row+add];else if(!dil&&(add>=w||add<0))cnt+=0;
      if(rem>=0&&rem<w)cnt-=src[row+rem];
      if(x>=0&&x<w){const span=Math.min(w-1,x+r)-Math.max(0,x-r)+1;tmp[row+x]=dil?(cnt>0?1:0):(cnt===span?1:0);}
    }
  }
  for(let x=0;x<w;x++){
    let cnt=0;
    for(let y=-r;y<h+r;y++){
      const add=y+r,rem=y-r-1;
      if(add<h&&add>=0)cnt+=tmp[add*w+x];
      if(rem>=0&&rem<h)cnt-=tmp[rem*w+x];
      if(y>=0&&y<h){const span=Math.min(h-1,y+r)-Math.max(0,y-r)+1;out[y*w+x]=dil?(cnt>0?1:0):(cnt===span?1:0);}
    }
  }
  const g2=new Grid(w,h);g2.d=out;return g2;
}
function fillHoles(g){
  const w=g.w,h=g.h,seen=new Uint8Array(w*h),q=new Int32Array(w*h);let qh=0,qt=0;
  const tryp=i=>{if(!seen[i]&&!g.d[i]){seen[i]=1;q[qt++]=i;}};
  for(let x=0;x<w;x++){tryp(x);tryp((h-1)*w+x);}
  for(let y=0;y<h;y++){tryp(y*w);tryp(y*w+w-1);}
  while(qh<qt){const i=q[qh++],x=i%w,y=(i/w)|0;
    if(x>0)tryp(i-1);if(x<w-1)tryp(i+1);if(y>0)tryp(i-w);if(y<h-1)tryp(i+w);}
  const o=new Grid(w,h);for(let i=0;i<w*h;i++)o.d[i]=seen[i]?0:1;return o;
}
function components(g){
  const w=g.w,h=g.h,lab=new Int32Array(w*h),q=new Int32Array(w*h),out=[];let n=0;
  for(let s=0;s<w*h;s++){
    if(!g.d[s]||lab[s])continue;n++;let qh=0,qt=0;q[qt++]=s;lab[s]=n;
    let x0=w,x1=0,y0=h,y1=0,a=0;
    while(qh<qt){const i=q[qh++],x=i%w,y=(i/w)|0;a++;
      if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
      const nb=[x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1];
      for(const j of nb)if(j>=0&&g.d[j]&&!lab[j]){lab[j]=n;q[qt++]=j;}}
    out.push({id:n,x0,x1,y0,y1,a});
  }
  return {lab,list:out};
}
function traceLargest(g){
  const {lab,list}=components(g);if(!list.length)return null;
  const big=list.reduce((a,b)=>b.a>a.a?b:a);
  const w=g.w,in_=(x,y)=>x>=0&&y>=0&&x<w&&y<g.h&&lab[y*w+x]===big.id;
  let sx=-1,sy=big.y0;for(let x=big.x0;x<=big.x1;x++)if(in_(x,sy)){sx=x;break;}
  const dirs=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  const pts=[[sx,sy]];let cx=sx,cy=sy,d=7,guard=0;
  do{
    let found=false;
    for(let k=0;k<8;k++){const nd=(d+6+k)%8,nx=cx+dirs[nd][0],ny=cy+dirs[nd][1];
      if(in_(nx,ny)){cx=nx;cy=ny;d=nd;found=true;break;}}
    if(!found)break;pts.push([cx,cy]);
  }while((cx!==sx||cy!==sy)&&++guard<200000);
  return pts;
}
function traceComp(lab,w,h,id,b){
  const in_=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&lab[y*w+x]===id;
  let sx=-1,sy=b.y0;for(let x=b.x0;x<=b.x1;x++)if(in_(x,sy)){sx=x;break;}
  const dirs=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  const pts=[[sx,sy]];let cx=sx,cy=sy,d=7,guard=0;
  do{let found=false;
    for(let k=0;k<8;k++){const nd=(d+6+k)%8,nx=cx+dirs[nd][0],ny=cy+dirs[nd][1];if(in_(nx,ny)){cx=nx;cy=ny;d=nd;found=true;break;}}
    if(!found)break;pts.push([cx,cy]);}while((cx!==sx||cy!==sy)&&++guard<200000);
  return pts;
}
function rdp(pts,eps){
  if(pts.length<3)return pts;
  const a=pts[0],b=pts[pts.length-1];let md=0,mi=0;
  const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1e-9;
  for(let i=1;i<pts.length-1;i++){const p=pts[i];const d=Math.abs((b[0]-a[0])*(a[1]-p[1])-(a[0]-p[0])*(b[1]-a[1]))/L;if(d>md){md=d;mi=i;}}
  if(md>eps){const l=rdp(pts.slice(0,mi+1),eps),r=rdp(pts.slice(mi),eps);return l.slice(0,-1).concat(r);}
  return [a,b];
}
function rdpClosed(pts,eps){let fi=0,fd=0;pts.forEach((p,i)=>{const d=Math.hypot(p[0]-pts[0][0],p[1]-pts[0][1]);if(d>fd){fd=d;fi=i;}});
  if(fi<2)return pts;const a=rdp(pts.slice(0,fi+1),eps),b=rdp(pts.slice(fi).concat([pts[0]]),eps);return a.slice(0,-1).concat(b.slice(0,-1));}
const area=pts=>{let s=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++)s+=(pts[j][0]+pts[i][0])*(pts[j][1]-pts[i][1]);return Math.abs(s/2);};
P2G.area=area;
P2G._trace=traceLargest;P2G._rdp=rdp;P2G.fillHoles=fillHoles;P2G.fillPoly=fillPoly;P2G.Grid=Grid;P2G.morph=morph;

const ROOMS=/^(ESTAR|COMEDOR|COCINA|COCINETA|BAÑO|BAÑOS|DORMITORIO|DORM\.?|SUITE|VEST\.?|VESTIDOR|ESTUDIO|SERVICIOS?|SERV\.?|DESPENSA|PASILLO|HALL|LIVING|SALA|SALÓN|SALON|LAVANDERÍA|LAVANDERIA|TERRAZA|BALCÓN|BALCON|PARRILLERO|RECEPCIÓN|RECEPCION|TIENDA|LOCAL|COMERCIAL|DEPÓSITO|DEPOSITO|PARQUEO|GARAJE|GARAGE|BAULERAS?|BAULERA\d*|PATIO|JARDÍN|JARDIN|OFICINA|ÁREA|AREA|PLANCHADO|SECADO|COPROPIETARIOS|COOPROPIETARIOS|MÁQUINAS|MAQUINAS|HOME|ESCRITORIO|CLOSET|WC|CUARTO|LOBBY|GIMNASIO|PISCINA|DEPARTAMENTO|DEPTO\.?|ESTACIONAMIENTO|DE)$/;
const TITLE=/^(PLANTA|PISO|SEMISOTANO|SEMISÓTANO|SOTANO|SÓTANO|NIVEL|CIMIENTOS|CUBIERTAS?|TECHOS?|AZOTEA|EMPLAZAMIENTO)$/i;

function layerWins(paths,T){
  const segOf=k=>{const S=[];paths.forEach(p=>{const kind=/CWMG/i.test(p.ly)?'m':/CURT/i.test(p.ly)?'c':'w';if(kind!==k)return;p.sp.forEach(s=>{const c=!!s.curve;for(let i=0;i+3<s.length;i+=2){const a=T(s[i],s[i+1]),b=T(s[i+2],s[i+3]);if(Math.hypot(b[0]-a[0],b[1]-a[1])>1e-4)S.push([a,b,c]);}});});return S;};
  const comps=S=>{const par=S.map((_,i)=>i),f=i=>par[i]===i?i:(par[i]=f(par[i]));const key=p=>Math.round(p[0]/0.03)+','+Math.round(p[1]/0.03);const m=new Map();
    S.forEach((s,i)=>[s[0],s[1]].forEach(p=>{const k=key(p),[x,y]=k.split(',').map(Number);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const j=m.get((x+dx)+','+(y+dy));if(j!=null)par[f(i)]=f(j);}m.set(k,i);}));
    const C={};S.forEach((s,i)=>(C[f(i)]=C[f(i)]||[]).push(s));return Object.values(C);};
  const span=c=>{const L=c.reduce((b,s)=>Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1])>Math.hypot(b[1][0]-b[0][0],b[1][1]-b[0][1])?s:b,c[0]);const l=Math.hypot(L[1][0]-L[0][0],L[1][1]-L[0][1]),u=[(L[1][0]-L[0][0])/l,(L[1][1]-L[0][1])/l],n=[-u[1],u[0]],o=L[0];
    let t0=Infinity,t1=-Infinity,w0=Infinity,w1=-Infinity;c.forEach(s=>[s[0],s[1]].forEach(p=>{const t=(p[0]-o[0])*u[0]+(p[1]-o[1])*u[1],w=(p[0]-o[0])*n[0]+(p[1]-o[1])*n[1];t0=Math.min(t0,t);t1=Math.max(t1,t);w0=Math.min(w0,w);w1=Math.max(w1,w);}));
    const wm=(w0+w1)/2,r=v=>+v.toFixed(3);return [r(o[0]+u[0]*t0+n[0]*wm),r(o[1]+u[1]*t0+n[1]*wm),r(o[0]+u[0]*t1+n[0]*wm),r(o[1]+u[1]*t1+n[1]*wm)];};
  const out=[];
  comps(segOf('w')).forEach(c=>{const w=span(c);if(Math.hypot(w[2]-w[0],w[3]-w[1])>=0.25)out.push([...w,'w']);});
  const bent=c=>{const w=span(c),dx=w[2]-w[0],dz=w[3]-w[1],l=Math.hypot(dx,dz)||1;return c.some(s=>[s[0],s[1]].some(p=>Math.abs((p[0]-w[0])*dz-(p[1]-w[1])*dx)/l>0.12));};
  comps(segOf('c')).forEach(c=>{if(c.length>8&&(c.some(s=>s[2])||bent(c))){c.forEach(s=>{if(Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1])>0.05)out.push([+s[0][0].toFixed(3),+s[0][1].toFixed(3),+s[1][0].toFixed(3),+s[1][1].toFixed(3),'a']);});return;}
    const w=span(c);if(Math.hypot(w[2]-w[0],w[3]-w[1])>=0.25)out.push([...w,'c']);});
  return out;
}
P2G.layerWins=layerWins;
function layerDoors(paths,T){
  const out=[];
  paths.forEach(p=>p.sp.forEach(s=>{if(s.length<12)return;const P=[];for(let i=0;i<s.length;i+=2)P.push(T(s[i],s[i+1]));
    const a=P[0],b=P[P.length-1],ch=Math.hypot(b[0]-a[0],b[1]-a[1]);if(ch<0.55||ch>1.95)return;
    let dev=0;P.forEach(q=>{dev=Math.max(dev,Math.abs((q[0]-a[0])*(b[1]-a[1])-(q[1]-a[1])*(b[0]-a[0]))/ch);});if(dev<0.08*ch||dev>0.4*ch)return;
    let x0=Infinity,z0=Infinity,x1=-Infinity,z1=-Infinity;P.forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);});
    const r=v=>+v.toFixed(3),M=P[Math.floor(P.length/2)];out.push([r(x0),r(z0),r(x1),r(z1),r(a[0]),r(a[1]),r(b[0]),r(b[1]),r(M[0]),r(M[1])]);}));
  return out.filter((d,i)=>!out.some((e,j)=>j<i&&Math.abs(e[0]-d[0])<0.03&&Math.abs(e[1]-d[1])<0.03&&Math.abs(e[2]-d[2])<0.03&&Math.abs(e[3]-d[3])<0.03));
}
P2G.layerDoors=layerDoors;
P2G.analyze=function(ex,opt){
  opt=opt||{};
  const M=opt.mPerPt||0.0352778;
  const isGray=c=>Math.abs(c[0]-c[1])<10&&Math.abs(c[1]-c[2])<10&&c[0]>=80&&c[0]<=235;
  const isRed=c=>c[0]>190&&c[1]<90&&c[2]<90;
  const bbox=sp=>{let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;sp.forEach(s=>{for(let i=0;i<s.length;i+=2){x0=Math.min(x0,s[i]);x1=Math.max(x1,s[i]);y0=Math.min(y0,s[i+1]);y1=Math.max(y1,s[i+1]);}});return[x0,y0,x1,y1];};
  const fills=ex.paths.filter(p=>p.t==='f');
  const hist={};
  fills.forEach(p=>{if(isGray(p.c)){const k=Math.round(p.c[0]/4)*4;hist[k]=(hist[k]||0)+1;}});
  const wallK=+Object.keys(hist).sort((a,b)=>hist[b]-hist[a])[0];
  const walls=[],cols=[];
  fills.forEach(p=>{
    const bb=bbox(p.sp);if((bb[2]-bb[0])*M>40||(bb[3]-bb[1])*M>40)return;
    if(isGray(p.c)&&Math.abs(p.c[0]-wallK)<=4)p.sp.forEach(s=>walls.push({s,bb:bbox([s])}));
    else if(isRed(p.c))p.sp.forEach(s=>cols.push({s,bb:bbox([s])}));
  });
  const gap=1.8/M,par=walls.map((_,i)=>i),f=i=>par[i]===i?i:(par[i]=f(par[i]));
  const order=walls.map((w,i)=>i).sort((a,b)=>walls[a].bb[0]-walls[b].bb[0]);
  for(let a=0;a<order.length;a++){const A=walls[order[a]].bb;
    for(let b=a+1;b<order.length;b++){const B=walls[order[b]].bb;if(B[0]>A[2]+gap)break;
      if(B[1]<=A[3]+gap&&A[1]<=B[3]+gap){par[f(order[a])]=f(order[b]);}}}
  const cl={};walls.forEach((w,i)=>{(cl[f(i)]=cl[f(i)]||[]).push(w);});
  let clusters=Object.values(cl).filter(c=>c.length>=10).map(c=>{const bb=[Infinity,Infinity,-Infinity,-Infinity];c.forEach(w=>{bb[0]=Math.min(bb[0],w.bb[0]);bb[1]=Math.min(bb[1],w.bb[1]);bb[2]=Math.max(bb[2],w.bb[2]);bb[3]=Math.max(bb[3],w.bb[3]);});return{walls:c,bb};});
  clusters.sort((a,b)=>Math.abs(a.bb[1]-b.bb[1])>(a.bb[3]-a.bb[1])*0.6?a.bb[1]-b.bb[1]:a.bb[0]-b.bb[0]);
  const strokes=ex.paths.filter(p=>p.t==='s');
  const dark=strokes.filter(p=>p.c[0]<70&&p.c[1]<70&&p.c[2]<70);
  const wh={};dark.forEach(p=>{const k=Math.round(p.w*100);wh[k]=(wh[k]||0)+p.sp.length;});
  const thinW=+Object.keys(wh).sort((a,b)=>wh[b]-wh[a])[0]/100;
  const plans=clusters.map((c,idx)=>analyzePlan(c,idx));
  return {plans:plans.filter(Boolean),thinW,wallK};

  function inBB(bb,x,y,m){return x>=bb[0]-m&&x<=bb[2]+m&&y>=bb[1]-m&&y<=bb[3]+m;}
  function analyzePlan(c,idx){
    const bb=c.bb,pad=0.6/M;
    const myCols=cols.filter(k=>inBB(bb,(k.bb[0]+k.bb[2])/2,(k.bb[1]+k.bb[3])/2,pad));
    const cs=myCols.map(k=>[(k.bb[0]+k.bb[2])/2,(k.bb[1]+k.bb[3])/2]);
    let core=null;
    if(cs.length<=60){
      const tol=3;
      for(let a=0;a<cs.length&&!core;a++)for(let b=0;b<cs.length&&!core;b++){
        const A=cs[a],B=cs[b];const w=(B[0]-A[0])*M;if(w<1.2||w>2.6||Math.abs(B[1]-A[1])>tol)continue;
        for(let d=0;d<cs.length&&!core;d++){const D=cs[d];const h=(D[1]-A[1])*M;if(h<1.2||h>2.6||Math.abs(D[0]-A[0])>tol)continue;
          if(cs.some(E=>Math.abs(E[0]-B[0])<tol&&Math.abs(E[1]-D[1])<tol))core=[A[0],A[1]];}}
    }
    const ox=core?core[0]:bb[2],oy=core?core[1]:bb[1];
    const T=(x,y)=>[+((x-ox)*M).toFixed(3),+((y-oy)*M).toFixed(3)];
    const flat2=s=>{const o=[];for(let i=0;i<s.length;i+=2){const p=T(s[i],s[i+1]);if(!o.length||Math.hypot(o[o.length-1][0]-p[0],o[o.length-1][1]-p[1])>0.004)o.push(p);}if(o.length>2&&Math.hypot(o[0][0]-o[o.length-1][0],o[0][1]-o[o.length-1][1])<0.004)o.pop();return o;};
    const W=c.walls.map(w=>flat2(w.s)).filter(p=>p.length>=3&&area(p)>0.0015);
    const C=myCols.map(k=>flat2(k.s)).filter(p=>p.length>=3);
    const allp=W.flat();
    let mx=Math.min(...allp.map(p=>p[0]))-0.4,Mx=Math.max(...allp.map(p=>p[0]))+0.4,mz=Math.min(...allp.map(p=>p[1]))-0.4,Mz=Math.max(...allp.map(p=>p[1]))+0.4;
    const thickW=Math.max(...dark.filter(p=>{const b=bbox(p.sp);return inBB(bb,b[0],b[1],pad)&&inBB(bb,b[2],b[3],pad);}).map(p=>p.w).concat([0]));
    const outl=[];
    if(thickW>thinW*3){
      dark.forEach(p=>{if(Math.abs(p.w-thickW)>0.05)return;const b=bbox(p.sp);if(!(inBB(bb,b[0],b[1],pad)&&inBB(bb,b[2],b[3],pad)))return;
        p.sp.forEach(s=>{const o=flat2(s);if(o.length>=2)outl.push(o);});});
    }
    let slab=null;
    const big=outl.filter(o=>o.length>=4).sort((a,b)=>area(b)-area(a))[0];
    const pip=(pt,pl)=>{let c=false;for(let i=0,j=pl.length-1;i<pl.length;j=i++){const a=pl[i],b=pl[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
    if(big&&area(big)>0.35*(Mx-mx)*(Mz-mz)){
      const cen=W.map(w=>[w.reduce((s,p)=>s+p[0],0)/w.length,w.reduce((s,p)=>s+p[1],0)/w.length]);
      const inn=cen.filter(c=>pip(c,big)||outl.some(()=>false)).length/cen.length;
      if(inn>0.8)slab=big;
    }
    const R=20,gw=Math.ceil((Mx-mx)*R),gh=Math.ceil((Mz-mz)*R);
    const toR=p=>[(p[0]-mx)*R,(p[1]-mz)*R];
    if(!slab){
      const g=new Grid(gw+80,gh+80);const toR2=p=>[(p[0]-mx)*R+40,(p[1]-mz)*R+40];
      W.concat(C).forEach(w=>fillPoly(g,w,toR2,1));
      outl.forEach(o=>{for(let i=0;i<o.length-1;i++)drawLine(g,toR2(o[i]),toR2(o[i+1]),1);});
      let k=morph(g,22,true);k=fillHoles(k);k=morph(k,22,false);
      const tr=traceLargest(k);
      if(tr)slab=rdpClosed(tr,1.6).map(p=>[+((p[0]-40)/R+mx).toFixed(3),+((p[1]-40)/R+mz).toFixed(3)]);
      if(slab&&slab.length>3&&Math.hypot(slab[0][0]-slab[slab.length-1][0],slab[0][1]-slab[slab.length-1][1])<0.05)slab.pop();
    }
    if(!slab||slab.length<3)slab=[[mx,mz],[Mx,mz],[Mx,Mz],[mx,Mz]];
    const sm=slab.flat();
    mx=Math.min(mx,...slab.map(p=>p[0]));Mx=Math.max(Mx,...slab.map(p=>p[0]));mz=Math.min(mz,...slab.map(p=>p[1]));Mz=Math.max(Mz,...slab.map(p=>p[1]));
    const words=ex.words.filter(w=>inBB(bb,w.x,w.y,0.3/M));
    const labs=[];
    words.forEach(w=>{const s=w.s.toUpperCase();if(ROOMS.test(s)||(/^[A-E]$/.test(s)))labs.push({s,x:w.x,y:w.y,x0:w.x0,x1:w.x1,h:w.h});});
    labs.sort((a,b)=>a.y-b.y||a.x-b.x);
    const lines=[];
    labs.forEach(l=>{const L=lines.find(q=>Math.abs(q.y-l.y)<l.h*0.6&&l.x0-q.x1<l.h*1.2&&l.x0>q.x0);if(L){L.s+=' '+l.s;L.x1=l.x1;}else lines.push({...l});});
    const merged=[];const used=new Set();
    lines.sort((a,b)=>a.y-b.y);
    lines.forEach((l,i)=>{if(used.has(i))return;let s=l.s,x0=l.x0,x1=l.x1,y=l.y;
      lines.forEach((m,j)=>{if(j<=i||used.has(j))return;const cx=(l.x0+l.x1)/2,mcx=(m.x0+m.x1)/2;
        if(m.y-y>0&&m.y-y<l.h*2.2&&Math.abs(mcx-cx)<Math.max(l.x1-l.x0,m.x1-m.x0)*0.7&&(/^[A-E]$/.test(m.s)||/^(AREA|ÁREA|SALA|SALON|SALÓN|ESTAR|HOME|LOCAL|CUARTO|DEPARTAMENTO|DEPTO\.?)/.test(s))){s+=' '+m.s;y=(y+m.y)/2;used.add(j);}});
      merged.push({s,x:(x0+x1)/2,y});});
    const labels=[],units=[];
    merged.forEach(m=>{let s=m.s.replace(/\bVEST\.?$/,'VESTIDOR').replace(/^SERV\.?$/,'SERVICIO').replace(/^DORM\.?$/,'DORMITORIO').replace(/^AREA (DE )?/,'ÁREA DE ').replace(/SALON/,'SALÓN').replace(/LAVANDERIA/,'LAVANDERÍA').replace(/DEPOSITO/,'DEPÓSITO').replace(/BALCON/,'BALCÓN').replace(/RECEPCION\b/,'RECEPCIÓN').replace(/COOPROPIETARIOS/,'COPROPIETARIOS');
      const p=T(m.x,m.y);
      if(/^(DEPARTAMENTO|DEPTO\.?)\s+[A-Z]/.test(s)){units.push(['Depto. '+s.split(/\s+/).pop(),p[0],p[1]]);return;}
      if(/^(DEPARTAMENTO|DEPTO\.?|DE)$/.test(s)||/^[A-E]$/.test(s))return;
      s=s.replace(/^DE\s+|\s+DE$/g,'');
      labels.push([s,p[0],p[1]]);});
    const below=ex.words.filter(w=>w.x>bb[0]-1/M&&w.x<bb[2]+1/M&&w.y>bb[3]&&w.y<bb[3]+5/M);
    let title='';
    const tw=below.find(w=>TITLE.test(w.s))||ex.words.filter(w=>inBB(bb,w.x,w.y,2.5/M)).find(w=>TITLE.test(w.s));
    if(tw){title=ex.words.filter(w=>Math.abs(w.y-tw.y)<tw.h*0.6&&w.x>=tw.x0-1&&w.x<tw.x1+tw.h*25).sort((a,b)=>a.x-b.x).map(w=>w.s).join(' ');}
    const PX=100,tw2=Math.ceil((Mx-mx)*PX),th2=Math.ceil((Mz-mz)*PX);
    const toP=p=>[(p[0]-mx)*PX,(p[1]-mz)*PX];
    const lg=new Grid(tw2,th2),lgS=new Grid(tw2,th2);
    const wm=new Grid(tw2,th2);W.concat(C).forEach(w=>fillPoly(wm,w,toP,1));
    const wme=morph(wm,1,false);
    const crossesWall=(a,b,L)=>{const n=Math.floor(L/0.02);for(let k=0;k<=n;k++){const t=k/n,d=t*L;if(d<0.12||L-d<0.12)continue;const P=toP([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);const X=Math.round(P[0]),Y=Math.round(P[1]);if(X>=0&&Y>=0&&X<tw2&&Y<th2&&wme.d[Y*tw2+X])return true;}return false;};
    const ticks=[];
    strokes.forEach(p=>{p.sp.forEach(s=>{if(s.length!==4)return;const a=T(s[0],s[1]),b=T(s[2],s[3]),dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
      if(L<0.4&&L>0.03&&Math.abs(Math.abs(dx)-Math.abs(dz))<L*0.3)ticks.push([(a[0]+b[0])/2,(a[1]+b[1])/2]);});});
    const nearTick=q=>ticks.some(t=>Math.abs(t[0]-q[0])<0.25&&Math.abs(t[1]-q[1])<0.25);
    const rawSeg=[];
    dark.forEach(p=>{p.sp.forEach(s=>{for(let i=0;i+3<s.length;i+=2){const a=T(s[i],s[i+1]),b=T(s[i+2],s[i+3]);if(a[0]<mx||a[0]>Mx||a[1]<mz||a[1]>Mz)continue;const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L>0.5&&L<2.0)rawSeg.push([a[0],a[1],b[0],b[1],L]);}});});
    dark.forEach(p=>{
      if(p.w>thinW*1.15)return;
      p.sp.forEach(s=>{
        for(let i=0;i+3<s.length;i+=2){
          const a=T(s[i],s[i+1]),b=T(s[i+2],s[i+3]);
          if(a[0]<mx||a[0]>Mx||a[1]<mz||a[1]>Mz)continue;
          const L=Math.hypot(b[0]-a[0],b[1]-a[1]);
          if(L>6)continue;
          if(L>1.0&&s.length===4&&(nearTick(a)||nearTick(b)))continue;
          if(L>0.5&&crossesWall(a,b,L))continue;
          drawLine(lg,toP(a),toP(b),1);
          if(s.length<=10&&!s.curve&&L>0.25)drawLine(lgS,toP(a),toP(b),1);
        }
      });
    });
    const inside=new Grid(tw2,th2);fillPoly(inside,slab,toP,1);
    const ins=morph(inside,12,true);
    for(let i=0;i<lg.d.length;i++)if(!ins.d[i])lg.d[i]=0;
    const wmd=morph(wm,4,true);
    const strips=[];
    {const cm=new Grid(tw2,th2);for(let i=0;i<cm.d.length;i++)cm.d[i]=(lgS.d[i]||wm.d[i])?1:0;
      for(let i=0;i<lgS.d.length;i++)if(!ins.d[i])cm.d[i]=1;
      const fh=fillHoles(cm);const sg=new Grid(tw2,th2);for(let i=0;i<sg.d.length;i++)sg.d[i]=fh.d[i]&&!cm.d[i]&&ins.d[i]?1:0;
      const sg2=morph(morph(sg,3,false),3,true);
      const er=morph(sg2,34,false);
      const cc=components(sg2);
      cc.list.forEach(k=>{const A=k.a/PX/PX;if(A<0.35||A>6)return;
        for(let y=k.y0;y<=k.y1;y++)for(let x=k.x0;x<=k.x1;x++){const i=y*tw2+x;if(cc.lab[i]===k.id&&er.d[i])return;}
        let touchL=0,touchW=0;for(let y=Math.max(1,k.y0-1);y<=Math.min(th2-2,k.y1+1);y++)for(let x=Math.max(1,k.x0-1);x<=Math.min(tw2-2,k.x1+1);x++){const i=y*tw2+x;if(cc.lab[i]!==k.id)continue;
          const nb=[i-1,i+1,i-tw2,i+tw2];if(nb.some(n=>wm.d[n]))touchW++;if(nb.some(n=>lgS.d[n]&&!wm.d[n]))touchL++;}
        if(touchW<40||touchL<60)return;
        const tr=traceComp(cc.lab,tw2,th2,k.id,k);let poly=rdpClosed(tr,2.5).map(q=>[+(q[0]/PX+mx).toFixed(3),+(q[1]/PX+mz).toFixed(3)]);
        if(poly.length>3&&Math.hypot(poly[0][0]-poly[poly.length-1][0],poly[0][1]-poly[poly.length-1][1])<0.03)poly.pop();
        if(poly.length>=3)strips.push({p:poly,A:+A.toFixed(2),bb:[+(k.x0/PX+mx).toFixed(2),+(k.y0/PX+mz).toFixed(2),+((k.x1+1)/PX+mx).toFixed(2),+((k.y1+1)/PX+mz).toFixed(2)]});});}
    const filled=fillHoles(lg);
    const holeG=new Grid(tw2,th2);for(let i=0;i<filled.d.length;i++)holeG.d[i]=filled.d[i]&&!lg.d[i]?1:0;
    for(let i=0;i<filled.d.length;i++)if(wm.d[i])filled.d[i]=0;
    let solid=morph(morph(filled,4,false),4,true);
    const comp=components(solid);
    const hc=components(holeG),holes={};
    hc.list.forEach(hk=>{const A=hk.a/PX/PX;if(A<0.006)return;const i=Math.floor((hk.y0+hk.y1)/2)*tw2+Math.floor((hk.x0+hk.x1)/2);
      let owner=comp.lab[i];if(!owner){for(let y=hk.y0;y<=hk.y1&&!owner;y++)for(let x=hk.x0;x<=hk.x1&&!owner;x++){const j=y*tw2+x;if(hc.lab[j]===hk.id&&comp.lab[j])owner=comp.lab[j];}}
      if(!owner)return;(holes[owner]=holes[owner]||[]).push({A,w:(hk.x1-hk.x0+1)/PX,h:(hk.y1-hk.y0+1)/PX,cx:(hk.x0+hk.x1+1)/2,cy:(hk.y0+hk.y1+1)/2});});
    const sym=[];
    dark.forEach(q=>{if(q.w>thinW*2.2)return;q.sp.forEach(s=>{
      let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;const pts=[];for(let i=0;i<s.length;i+=2){const t=T(s[i],s[i+1]);pts.push(t);x0=Math.min(x0,t[0]);x1=Math.max(x1,t[0]);z0=Math.min(z0,t[1]);z1=Math.max(z1,t[1]);}
      if(x1<mx||x0>Mx||z1<mz||z0>Mz)return;const w=x1-x0,h=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
      const closedPoly=pts.length>=10&&Math.hypot(pts[0][0]-pts[pts.length-1][0],pts[0][1]-pts[pts.length-1][1])<0.01;
      if(!s.curve&&!closedPoly&&pts.length>=8&&Math.max(w,h)<0.25&&Math.max(w,h)>0.015){sym.push({t:'a',cx,cz,w,h});return;}
      if(s.curve||closedPoly){if(Math.max(w,h)<0.8&&Math.max(w,h)>0.04)sym.push({t:'c',cx,cz,w,h});return;}
      if(pts.length===2){const L=Math.hypot(w,h);if(L>0.15&&L<1.6&&w>0.08&&h>0.08&&w/h>0.3&&w/h<3.3)sym.push({t:'d',cx,cz,w,h,L});return;}
      if(pts.length>=4&&pts.length<=6&&w<0.2&&h<0.2&&w>0.03&&h>0.03)sym.push({t:'s',cx,cz,w,h});
    });});
    const cluster=(list,rad,minN)=>{const used=new Array(list.length).fill(false),out=[];
      list.forEach((q,i)=>{if(used[i])return;const mem=[i];used[i]=true;for(let k=0;k<mem.length;k++){const a=list[mem[k]];list.forEach((b,j)=>{if(!used[j]&&Math.hypot(a.cx-b.cx,a.cz-b.cz)<rad){used[j]=true;mem.push(j);}});}
        if(mem.length>=minN){const xs=mem.map(j=>list[j].cx),zs=mem.map(j=>list[j].cz);out.push({x:(Math.min(...xs)+Math.max(...xs))/2,z:(Math.min(...zs)+Math.max(...zs))/2,w:Math.max(...xs)-Math.min(...xs),h:Math.max(...zs)-Math.min(...zs),n:mem.length});}});return out;};
    const ovals=sym.filter(q=>q.t==='c'&&Math.max(q.w,q.h)>=0.25&&Math.min(q.w,q.h)/Math.max(q.w,q.h)<0.85);
    const appl=[];
    cluster(sym.filter(q=>q.t==='a'),0.22,8).forEach(c=>{if(c.w<0.7&&c.h<0.7)appl.push({t:'cook',x:+c.x.toFixed(3),z:+c.z.toFixed(3)});});
    cluster(sym.filter(q=>q.t==='c'&&Math.max(q.w,q.h)<0.08),0.2,6).forEach(c=>{if(c.w>0.7||c.h>0.7)return;if(ovals.some(o=>Math.hypot(o.cx-c.x,o.cz-c.z)<0.45))return;if(appl.some(a=>Math.hypot(a.x-c.x,a.z-c.z)<0.3))return;appl.push({t:'sink',x:+c.x.toFixed(3),z:+c.z.toFixed(3)});});
    const featIn=(b0,b1,c0,c1)=>{const f={circ:0,smallCirc:0,oval:0,ovalBig:0,diag:0,sq:0,curves:0};
      sym.forEach(q=>{if(q.cx<b0||q.cx>b1||q.cz<c0||q.cz>c1)return;
        if(q.t==='c'){f.curves++;const mn=Math.min(q.w,q.h),mxx=Math.max(q.w,q.h);
          if(mxx<0.3&&mn/mxx>0.8&&mxx>=0.08)f.circ++;else if(mxx<0.08)f.smallCirc++;
          else if(mn/mxx<0.85&&mxx>=0.25&&mxx<=0.6)f.oval++;else if(mxx>0.6)f.ovalBig++;}
        else if(q.t==='d')f.diag++;else if(q.t==='s')f.sq++;else if(q.t==='a')f.arcs=(f.arcs||0)+1;});return f;};
    const furn=[];
    comp.list.forEach(k=>{
      const w=(k.x1-k.x0+1)/PX,h=(k.y1-k.y0+1)/PX,A=k.a/PX/PX;
      if(A<0.06||A>4.5||k.a/((k.x1-k.x0+1)*(k.y1-k.y0+1))<0.45)return;
      let ov=0;for(let y=k.y0;y<=k.y1;y++)for(let x=k.x0;x<=k.x1;x++){const i=y*tw2+x;if(comp.lab[i]===k.id&&wmd.d[i])ov++;}
      if(ov/k.a>0.15)return;
      const lo=Math.min(w,h),hi=Math.max(w,h),hs=holes[k.id]||[];
      if(lo<0.25)return;
      const tr=hs.filter(q=>{const mn=Math.min(q.w,q.h),mxx=Math.max(q.w,q.h);return mxx/mn>2.5&&mn>=0.18&&mn<=0.45&&mxx>=0.7;});const treads=tr.length?Math.max(...tr.map(a=>tr.filter(b=>Math.abs(Math.max(b.w,b.h)-Math.max(a.w,a.h))<0.12).length)):0;
      if((treads>=4&&hs.length>=5)||(tr.length>=2&&A<1.2))return;
      {const bx0=k.x0/PX+mx,bx1=(k.x1+1)/PX+mx,bz0=k.y0/PX+mz,bz1=(k.y1+1)/PX+mz;const H=[],V=[];
        rawSeg.forEach(q=>{const cx=(q[0]+q[2])/2,cz=(q[1]+q[3])/2;if(cx<bx0-0.05||cx>bx1+0.05||cz<bz0-0.05||cz>bz1+0.05)return;const dx=Math.abs(q[2]-q[0]),dz=Math.abs(q[3]-q[1]);if(dz<0.03)H.push([q[4],cz]);else if(dx<0.03)V.push([q[4],cx]);});
        const st=arr=>arr.some(a=>{if(a[0]<0.75)return false;const g=[...new Set(arr.filter(b=>Math.abs(b[0]-a[0])<0.08).map(b=>Math.round(b[1]*50)/50))].sort((x,y)=>x-y);let run=1,best=1;for(let i=1;i<g.length;i++){const d=g[i]-g[i-1];if(d>0.24&&d<0.34){run++;best=Math.max(best,run);}else if(d>=0.34)run=1;}return best>=3;});
        if(st(H)||st(V))return;}
      let hint=null;const sm=hs.filter(q=>q.A>=0.03&&q.A<=0.5);
      if(sm.length&&lo>=0.8&&hi>=1.7){const cx=(k.x0+k.x1+1)/2,cy=(k.y0+k.y1+1)/2,gx=sm.reduce((s,q)=>s+q.cx*q.A,0)/sm.reduce((s,q)=>s+q.A,0),gy=sm.reduce((s,q)=>s+q.cy*q.A,0)/sm.reduce((s,q)=>s+q.A,0);
        const ox=(gx-cx)/(k.x1-k.x0+1),oy=(gy-cy)/(k.y1-k.y0+1);
        if(Math.max(Math.abs(ox),Math.abs(oy))>0.15)hint=Math.abs(ox)>Math.abs(oy)?(ox<0?'w':'e'):(oy<0?'n':'s');}
      let ht=lo>1.2&&A>1.8?0.5:(lo<0.75&&hi>1.3?0.9:(A>0.9?0.74:(A<0.35?0.45:0.6)));
      const x0=+(k.x0/PX+mx).toFixed(3),x1=+((k.x1+1)/PX+mx).toFixed(3),z0=+(k.y0/PX+mz).toFixed(3),z1=+((k.y1+1)/PX+mz).toFixed(3);
      const fo={p:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],h:ht};
      {const F=featIn(x0-0.02,x1+0.02,z0-0.02,z1+0.02);F.holes=hs.filter(q=>q.A>=0.008).map(q=>+q.A.toFixed(3));fo.f=F;
        const H=F.holes,big=H.filter(a=>a>=0.03);
        if(F.oval>=3&&F.smallCirc<=2&&A<0.6)fo.t='toilet';
        else if((F.diag>=2&&F.smallCirc<=1&&F.oval===0&&A>=0.35)||(F.diag>=1&&lo>=0.65&&A>=0.8&&F.curves===0))fo.t='shower';
        else if(F.smallCirc>=8&&A<0.4&&hi<0.7)fo.t='ksink';
        else if(F.smallCirc>=3&&F.smallCirc<=7&&A<0.6)fo.t='bsink';
        else if(((F.arcs||0)>=8&&F.oval<2&&hi<=0.75)||(F.curves===0&&lo>=0.38&&hi<=0.7&&big.length===1&&big[0]>=0.04&&big[0]<=0.12))fo.t='cooktop';
        else if(F.curves===0&&lo>=0.55&&hi<=0.9&&big.some(a=>a>=0.28&&a<=0.55))fo.t='box';
        else if(F.curves===4&&lo>=0.33&&hi<=0.52)fo.t='chair';}if(hint)fo.b=hint;fo.nh=hs.filter(q=>q.A>=0.015).length;if(opt.debug)fo.dbg={hs:hs.map(q=>[+q.A.toFixed(2),+q.w.toFixed(2),+q.h.toFixed(2),Math.round((q.cx-(k.x0+k.x1+1)/2)),Math.round((q.cy-(k.y0+k.y1+1)/2))]),w:+w.toFixed(2),h:+h.toFixed(2)};furn.push(fo);
    });
    const wins=[];
    {const thick=new Grid(tw2,th2);
      if(thickW>thinW*3)dark.forEach(q=>{if(Math.abs(q.w-thickW)>0.05)return;q.sp.forEach(s=>{for(let i=0;i+3<s.length;i+=2){const a=T(s[i],s[i+1]),b=T(s[i+2],s[i+3]);drawLine(thick,toP(a),toP(b),2);}});});
      const at=(G,x,z)=>{const X=Math.round((x-mx)*PX),Y=Math.round((z-mz)*PX);return X>=0&&Y>=0&&X<tw2&&Y<th2&&G.d[Y*tw2+X];};
      const pipS=(pt)=>{let c=false;for(let i=0,j=slab.length-1;i<slab.length;j=i++){const a=slab[i],b=slab[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
      const hasThick=thickW>thinW*3;
      const smp=[];
      for(let i=0;i<slab.length;i++){const a=slab[i],b=slab[(i+1)%slab.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<1e-4)continue;
        const ux=dx/L,uz=dz/L;let nx=-uz,nz=ux;const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(!pipS([mid[0]+nx*0.05,mid[1]+nz*0.05])){nx=-nx;nz=-nz;}
        for(let d=0;d<L;d+=0.04){const px=a[0]+ux*d,pz=a[1]+uz*d,P=o=>[px+nx*o,pz+nz*o];
          const wall=[0.04,0.08].every(o=>at(wm,...P(o)));
          let th=false;if(hasThick)for(let o=-0.03;o<=0.06;o+=0.015)if(at(thick,...P(o))){th=true;break;}
          let win=false;
          if(!wall){let n=0;for(let o=0.0;o<=0.16;o+=0.01)if(at(lg,...P(o)))n++;win=n>=1;}
          smp.push({x:px,z:pz,win});}}
      const N=smp.length;
      for(let k=0;k<N;k++){if(!smp[k].win&&smp[(k-1+N)%N].win&&smp[(k+1)%N].win)smp[k].f=1;}
      smp.forEach(s=>{if(s.f)s.win=true;});
      for(let k=0;k<N;k++){if(smp[k].win&&!smp[(k-1+N)%N].win&&!smp[(k+1)%N].win)smp[k].win=false;}
      let st=smp.findIndex(s=>!s.win);if(st<0)st=0;
      let run=[];
      const flush=()=>{if(run.length<2){run=[];return;}let len=0;for(let i=1;i<run.length;i++)len+=Math.hypot(run[i].x-run[i-1].x,run[i].z-run[i-1].z);
        if(len>=0.4){let a=run[0];for(let i=1;i<run.length;i++){const b=run[i];const sa=Math.hypot(b.x-a.x,b.z-a.z);
          const last=i===run.length-1;let straight=true;if(!last){const c=run[i+1];const cr=Math.abs((b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x));straight=cr<0.003;}
          if(sa>=0.6||(!straight&&sa>=0.15)||last){wins.push([+a.x.toFixed(3),+a.z.toFixed(3),+b.x.toFixed(3),+b.z.toFixed(3)]);a=b;}}}
        run=[];};
      for(let i=0;i<=N;i++){const s=smp[(st+i)%N];if(i<N&&s.win)run.push(s);else flush();}
    }
    {const gl=strokes.filter(p=>p.ly&&/GLAZ/i.test(p.ly)&&(()=>{const b=bbox(p.sp);return inBB(bb,b[0],b[1],pad)&&inBB(bb,b[2],b[3],pad);})());
      const typed=layerWins(gl,T);if(typed.length){wins.length=0;typed.forEach(w=>wins.push(w));}}
    const doorSym=layerDoors(strokes.filter(p=>p.ly&&/DOOR/i.test(p.ly)&&(()=>{const b=bbox(p.sp);return inBB(bb,b[0],b[1],pad)&&inBB(bb,b[2],b[3],pad);})()),T);
    return {idx,title,core:!!core,walls:W,cols:C,outline:outl.filter(o=>o.length>=2),slab,labels,units,furn,wins,appl,doorSym,
      tex:[+mx.toFixed(3),+mz.toFixed(3),+Mx.toFixed(3),+Mz.toFixed(3)],
      lineMask:{w:tw2,h:th2,d:lg.d},
      region:[bb[0]-1.2/M,bb[1]-1.2/M,bb[2]+1.2/M,bb[3]+4.5/M],
      area:+area(slab).toFixed(2)};
  }
};

P2G.guessFloors=function(plans){
  const rows=[];
  plans.forEach(p=>{
    const t=(p.title||'').toUpperCase();
    if(/CIMIENTO|CUBIERTA|TECHO|FUNDACI/.test(t))return;
    let kind='n',nums=[];
    if(/SEMI ?S[OÓ]TANO/.test(t))kind='semi';else if(/S[OÓ]TANO/.test(t))kind='sot';else if(/BAJA|EMPLAZAMIENTO/.test(t))kind='pb';
    else{const m=t.match(/(\d+)\s*[°º]?/g);if(m)nums=m.map(x=>parseInt(x));}
    if(kind!=='n')rows.push({p:p.idx,ord:kind==='sot'?-2:kind==='semi'?-1:0,n:kind==='pb'?'Planta baja':kind==='semi'?'Semisótano':'Sótano'});
    else if(nums.length)nums.forEach(n=>rows.push({p:p.idx,ord:n,n:n+'.º piso'}));
    else rows.push({p:p.idx,ord:999+p.idx,n:p.title||('Planta '+(p.idx+1))});
  });
  rows.sort((a,b)=>a.ord-b.ord);
  const below=rows.filter(r=>r.ord<0).length;
  let lv=-3.0*below;
  rows.forEach(r=>{r.lv=+lv.toFixed(2);r.h=3.0;lv+=3.0;});
  return rows;
};

if(typeof module!=='undefined'&&module.exports)module.exports=P2G;else root.Plan2Geo=P2G;
})(typeof globalThis!=='undefined'?globalThis:this);

(function(root){
const Fisica={};

Fisica.SOFT=/^(curtain|cortina|throw|towel|towel2|cushion|pillow|duvet|rug|rug2|rugB|rug2B|bathmat|bathmatB|plant|plant2|water|shade)$/;
Fisica.FLOORLAYER=/^(rug|rug2|rugB|rug2B|bathmat|bathmatB)$/;

Fisica.world=function(rg,opts){
  opts=opts||{};const {w,h,R,mx,mz,block,ins}=rg,N=w*h,band=Math.max(0,Math.round((opts.band==null?0.15:opts.band)*R));
  const g=new Uint8Array(N);
  for(let j=0;j<N;j++)g[j]=(block.d[j]||!ins.d[j])?1:0;
  if(band){const near=new Uint8Array(N);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=y*w+x;if(!ins.d[j])continue;
      let edge=false;for(let k=1;k<=band&&!edge;k++)if(x-k<0||x+k>=w||y-k<0||y+k>=h||!ins.d[j-k]||!ins.d[j+k]||!ins.d[j-k*w]||!ins.d[j+k*w])edge=true;
      if(edge)near[j]=1;}
    for(let j=0;j<N;j++)if(near[j])g[j]=1;}
  return {w,h,R,mx,mz,grid:g,bodies:[],clear:[],lv:opts.lv||0};
};

Fisica.box=(x0,z0,x1,z1,y0,y1,tag)=>({x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1),y0,y1,tag});
Fisica.addStatic=function(W,b){W.bodies.push({...b,stat:true});};
Fisica.addClearance=function(W,b){W.clear.push(b);};

Fisica.boxesOf=function(parts,opts){
  opts=opts||{};const out=[],min=opts.min==null?0.05:opts.min;
  parts.forEach(([m,g])=>{if(Fisica.SOFT.test(m))return;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;
    if(Math.max(b.max.x-b.min.x,b.max.z-b.min.z)<min)return;
    out.push(Fisica.box(b.min.x,b.min.z,b.max.x,b.max.z,b.min.y,b.max.y,m));});
  return out;
};

const INSET=0.02;
function gridHit(W,b,dx,dz){
  const x0=b.x0+dx+INSET,x1=b.x1+dx-INSET,z0=b.z0+dz+INSET,z1=b.z1+dz-INSET;if(x1<=x0||z1<=z0)return false;
  const X0=Math.floor((x0-W.mx)*W.R),X1=Math.floor((x1-W.mx)*W.R),Y0=Math.floor((z0-W.mz)*W.R),Y1=Math.floor((z1-W.mz)*W.R);
  for(let Y=Y0;Y<=Y1;Y++)for(let X=X0;X<=X1;X++){if(X<0||Y<0||X>=W.w||Y>=W.h)return true;if(W.grid[Y*W.w+X])return true;}
  return false;
}
const ov=(a,b,dx,dz,e)=>a.x0+dx<b.x1-e&&a.x1+dx>b.x0+e&&a.z0+dz<b.z1-e&&a.z1+dz>b.z0+e;
const ovY=(a,b)=>a.y0<b.y1-0.005&&a.y1>b.y0+0.005;

Fisica.hits=function(W,boxes,dx,dz,opts){
  opts=opts||{};const extra=opts.extra||[];
  for(const b of boxes){
    if(gridHit(W,b,dx,dz))return 'pared';
    for(const o of W.bodies){if(o.grp===opts.self)continue;if(ovY(b,o)&&ov(b,o,dx,dz,0.005))return o.stat?'fijo':'mueble';}
    for(const o of extra){if(ovY(b,o)&&ov(b,o,dx,dz,0.005))return 'mueble';}
    if(!opts.fixed&&b.y0<W.lv+1.0)for(const c of W.clear){if(ov(b,c,dx,dz,0.005))return 'paso';}
  }
  return null;
};

const CAND=(()=>{const out=[[0,0]],st=0.025,max=0.9;
  for(let r=st;r<=max+1e-9;r+=st){[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b])=>{const k=(a&&b)?Math.SQRT1_2:1;out.push([a*r*k,b*r*k]);});}
  return out;})();

Fisica.find=function(W,boxes,opts){
  opts=opts||{};const max=opts.max==null?0.6:opts.max;
  if(!boxes.length)return {dx:0,dz:0};
  for(const [dx,dz] of CAND){if(Math.hypot(dx,dz)>max+1e-9)break;if(!Fisica.hits(W,boxes,dx,dz,opts))return {dx,dz};}
  return null;
};
Fisica.commit=function(W,boxes,dx,dz,grp){boxes.forEach(b=>W.bodies.push({...b,x0:b.x0+dx,x1:b.x1+dx,z0:b.z0+dz,z1:b.z1+dz,grp}));};
Fisica.settle=function(W,boxes,opts){const r=Fisica.find(W,boxes,opts);if(r)Fisica.commit(W,boxes,r.dx,r.dz,opts&&opts.grp);return r;};
Fisica.layerFits=function(W,parts){
  let ok=true;parts.forEach(([m,g])=>{if(!Fisica.FLOORLAYER.test(m))return;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;
    if(gridHit(W,Fisica.box(b.min.x,b.min.z,b.max.x,b.max.z,b.min.y,b.max.y),0,0))ok=false;});
  return ok;
};

if(typeof module!=='undefined'&&module.exports)module.exports=Fisica;else root.Fisica=Fisica;
})(typeof globalThis!=='undefined'?globalThis:this);

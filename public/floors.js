(function(root){
const Revest={};

Revest.plan=function(rg,matOf,opts){
  opts=opts||{};
  const {w,h,R,mx,mz,lab,ins,block,labels}=rg,N=w*h;
  const fl=new Int32Array(N).fill(-9);
  for(let j=0;j<N;j++)if(ins.d[j])fl[j]=block.d[j]?-1:lab[j];
  for(let it=0;it<12;it++){let ch=0;const nx=fl.slice();
    for(let j=0;j<N;j++){if(fl[j]!==-1)continue;const x=j%w;let pick=-1;
      for(const n of[x>0?j-1:-1,x<w-1?j+1:-1,j-w,j+w]){if(n<0||n>=N)continue;const v=fl[n];if(v>=0){pick=v;break;}}
      if(pick>=0){nx[j]=pick;ch++;}}
    fl.set(nx);if(!ch)break;}
  const ids=[],idx=new Map(),mi=new Int32Array(N).fill(-1),labMat=new Map();
  const matFor=li=>{if(!labMat.has(li))labMat.set(li,matOf(li));return labMat.get(li);};
  for(let j=0;j<N;j++){if(fl[j]===-9)continue;const id=matFor(fl[j]);if(!idx.has(id)){idx.set(id,ids.length);ids.push(id);}mi[j]=idx.get(id);}
  const comp=new Int32Array(N).fill(-1),comps=[];
  for(let s=0;s<N;s++){if(mi[s]<0||comp[s]>=0||block.d[s])continue;const c=comps.length,m=mi[s],st=[s],cnt=new Map();comp[s]=c;let n=0;
    while(st.length){const j=st.pop();n++;const L=lab[j];if(L>=0)cnt.set(L,(cnt.get(L)||0)+1);const x=j%w;
      for(const k of[x>0?j-1:-1,x<w-1?j+1:-1,j-w,j+w]){if(k<0||k>=N||comp[k]>=0||block.d[k]||mi[k]!==m)continue;comp[k]=c;st.push(k);}}
    let main=-1,bc=0;cnt.forEach((v,L)=>{if(v>bc){bc=v;main=L;}});comps.push({mat:ids[m],cells:n,main});}
  for(let it=0;it<14;it++){let ch=0;const nx=comp.slice();
    for(let j=0;j<N;j++){if(comp[j]>=0||mi[j]<0)continue;const x=j%w;
      for(const k of[x>0?j-1:-1,x<w-1?j+1:-1,j-w,j+w]){if(k<0||k>=N)continue;if(comp[k]>=0&&mi[k]===mi[j]){nx[j]=comp[k];ch++;break;}}}
    comp.set(nx);if(!ch)break;}
  for(let j=0;j<N;j++)if(comp[j]<0&&mi[j]>=0){const c=comps.length;comps.push({mat:ids[mi[j]],cells:0,main:-1});const st=[j];comp[j]=c;
    while(st.length){const q=st.pop();comps[c].cells++;const x=q%w;for(const k of[x>0?q-1:-1,x<w-1?q+1:-1,q-w,q+w]){if(k<0||k>=N||comp[k]>=0||mi[k]!==mi[j])continue;comp[k]=c;st.push(k);}}}
  {const sz=new Array(comps.length).fill(0);for(let j=0;j<N;j++)if(comp[j]>=0)sz[comp[j]]++;
    const remap=comps.map((c,i)=>i);
    comps.forEach((c,ci)=>{if(sz[ci]>=80)return;const cand=new Map();
      for(let j=0;j<N;j++){if(comp[j]!==ci)continue;const x=j%w,y=(j/w)|0;
        for(let oy=-4;oy<=4;oy++)for(let ox=-4;ox<=4;ox++){const X=x+ox,Y=y+oy;if(X<0||Y<0||X>=w||Y>=h)continue;const d=comp[Y*w+X];if(d<0||d===ci||comps[d].mat!==c.mat||sz[d]<80)continue;cand.set(d,(cand.get(d)||0)+1);}}
      let best=-1,bv=0;cand.forEach((v,d)=>{if(sz[d]>bv){bv=sz[d];best=d;}});if(best>=0)remap[ci]=best;});
    for(let j=0;j<N;j++)if(comp[j]>=0)comp[j]=remap[comp[j]];
    comps.forEach((c,ci)=>{if(remap[ci]!==ci)c.merged=true;});}
  const lbb=new Map();for(let j=0;j<N;j++){const L=lab[j];if(L<0||!ins.d[j]||block.d[j])continue;const x=j%w,y=(j/w)|0;const b=lbb.get(L)||[1e9,1e9,-1e9,-1e9];b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x+1);b[3]=Math.max(b[3],y+1);lbb.set(L,b);}
  comps.forEach(c=>{const b=lbb.get(c.main);c.swap=b?(b[3]-b[1])>(b[2]-b[0])*1.15:false;if(opts.orient&&opts.orient(c)!=null)c.swap=!!opts.orient(c);c.rects=[];});
  const open=new Map();
  for(let y=0;y<=h;y++){const runs=new Map();
    if(y<h){let x=0;while(x<w){const j=y*w+x,c=comp[j];if(c<0){x++;continue;}let x1=x+1;while(x1<w&&comp[y*w+x1]===c)x1++;runs.set(x+','+x1+','+c,[x,x1,c]);x=x1;}}
    for(const[key,o]of open){if(runs.has(key))runs.delete(key);else{comps[o.c].rects.push([mx+o.x0/R,mz+o.y0/R,mx+o.x1/R,mz+y/R]);open.delete(key);}}
    for(const[key,[x0,x1,c]]of runs)open.set(key,{x0,x1,c,y0:y});}
  const edges=[];
  const solid=j=>block.d[j]||mi[j]<0;
  for(let y=1;y<h;y++){let run=null;for(let x=0;x<w;x++){const j=y*w+x,k=j-w;const t=!solid(j)&&!solid(k)&&mi[j]!==mi[k];
      if(t){if(run&&run.b===x)run.b=x+1;else{run={a:x,b:x+1};edges.push({ax:'x',line:mz+y/R,a0:run});}}else run=null;}}
  for(let x=1;x<w;x++){let run=null;for(let y=0;y<h;y++){const j=y*w+x,k=j-1;const t=!solid(j)&&!solid(k)&&mi[j]!==mi[k];
      if(t){if(run&&run.b===y)run.b=y+1;else{run={a:y,b:y+1};edges.push({ax:'z',line:mx+x/R,a0:run});}}else run=null;}}
  const trans=edges.map(e=>e.ax==='x'?{ax:'x',z:e.line,x0:mx+e.a0.a/R,x1:mx+e.a0.b/R}:{ax:'z',x:e.line,z0:mz+e.a0.a/R,z1:mz+e.a0.b/R}).filter(e=>(e.ax==='x'?e.x1-e.x0:e.z1-e.z0)>=0.1);
  return {comps,trans,origin:[mx,mz],mats:ids,stats:{cells:comp.reduce((s,v)=>s+(v>=0?1:0),0),ins:ins.d.reduce((s,v)=>s+v,0)}};
};

Revest.check=function(rg,plan){
  const {w,h,R,mx,mz,ins}=rg,cov=new Uint8Array(w*h),errs=[];
  plan.comps.forEach((c,ci)=>c.rects.forEach(r=>{const X0=Math.round((r[0]-mx)*R),Y0=Math.round((r[1]-mz)*R),X1=Math.round((r[2]-mx)*R),Y1=Math.round((r[3]-mz)*R);
    for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){const j=y*w+x;if(cov[j])errs.push('solape');cov[j]=1;if(!ins.d[j])errs.push('fuera');}}));
  let holes=0;for(let j=0;j<w*h;j++)if(ins.d[j]&&!cov[j])holes++;
  return {solapes:errs.filter(e=>e==='solape').length,fuera:errs.filter(e=>e==='fuera').length,huecos:holes};
};

if(typeof module!=='undefined'&&module.exports)module.exports=Revest;else root.Revest=Revest;
})(typeof globalThis!=='undefined'?globalThis:this);

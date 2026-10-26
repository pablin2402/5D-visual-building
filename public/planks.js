(function(root){
const Planks={};
const h32=(a,b,c)=>{let x=(a*374761393+b*668265263+c*2246822519)|0;x=Math.imul(x^(x>>>13),1274126177);x^=x>>>16;return (x>>>0)/4294967296;};

Planks.build=function(THREE,rects,o){
  const L=o.L||1.38,W=o.W||0.193,BW=o.bevel||0.0015,BH=o.bevelH||0.001,NV=o.variants||7,Y=o.y,swap=!!o.swap,seed=o.seed|0,tv=o.tone==null?0.07:o.tone,g=o.gutter||(2/2048);
  const ab=swap?o.bb[1]:o.bb[0],cb=swap?o.bb[0]:o.bb[1];
  const P=[],N=[],U=[],C=[],I=[];let v=0;const E=1e-5;
  const W3=(a,c,y)=>swap?[c,y,a]:[a,y,c];
  const dirA=swap?[0,0,1]:[1,0,0],dirC=swap?[1,0,0]:[0,0,1];
  const rowOff=r=>(((r*0.37+h32(seed,r,7)*0.26)%1)+1)%1*L;
  function quad(pts,uvs,nrm,cols){
    const p=pts.map(q=>W3(q[0],q[1],q[2]));
    const e1=[p[1][0]-p[0][0],p[1][1]-p[0][1],p[1][2]-p[0][2]],e2=[p[2][0]-p[0][0],p[2][1]-p[0][1],p[2][2]-p[0][2]];
    const cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
    const ok=cr[0]*nrm[0]+cr[1]*nrm[1]+cr[2]*nrm[2]>=0;
    p.forEach((q,k)=>{P.push(q[0],q[1],q[2]);N.push(nrm[0],nrm[1],nrm[2]);U.push(uvs[k][0],uvs[k][1]);C.push(cols[k],cols[k],cols[k]);});
    if(ok)I.push(v,v+1,v+2,v,v+2,v+3);else I.push(v,v+2,v+1,v,v+3,v+2);v+=4;
  }
  rects.forEach(rc=>{
    const a0=swap?rc[1]:rc[0],a1=swap?rc[3]:rc[2],c0=swap?rc[0]:rc[1],c1=swap?rc[2]:rc[3];
    if(a1-a0<0.004||c1-c0<0.004)return;
    const r0=Math.floor((c0-cb)/W+E),r1=Math.ceil((c1-cb)/W-E);
    for(let r=r0;r<r1;r++){
      const rs=cb+r*W,re=rs+W,pc0=Math.max(c0,rs),pc1=Math.min(c1,re);if(pc1-pc0<0.002)continue;
      const off=rowOff(r),k0=Math.floor((a0-ab+off)/L+E),k1=Math.ceil((a1-ab+off)/L-E);
      for(let k=k0;k<k1;k++){
        const ps=ab-off+k*L,pe=ps+L,pa0=Math.max(a0,ps),pa1=Math.min(a1,pe);if(pa1-pa0<0.002)continue;
        const hv=h32(seed,r,k),va=Math.floor(hv*NV)%NV,flip=h32(seed+1,r,k)<0.5,tone=1+(h32(seed+2,r,k)-0.5)*2*tv;
        const v0=va/NV+g,v1=(va+1)/NV-g;
        const uv=(a,c)=>{let u=(a-ps)/L;if(flip)u=1-u;return [u,v0+((c-rs)/W)*(v1-v0)];};
        const bA0=Math.abs(pa0-ps)<E,bA1=Math.abs(pa1-pe)<E,bC0=Math.abs(pc0-rs)<E,bC1=Math.abs(pc1-re)<E;
        const ia0=pa0+(bA0?BW:0),ia1=pa1-(bA1?BW:0),ic0=pc0+(bC0?BW:0),ic1=pc1-(bC1?BW:0);
        const T=[[ia0,ic0],[ia1,ic0],[ia1,ic1],[ia0,ic1]];
        quad(T.map(q=>[q[0],q[1],Y]),T.map(q=>uv(q[0],q[1])),[0,1,0],[tone,tone,tone,tone]);
        const lo=Y-BH,dk=tone*0.5,sn=(d)=>{const l=Math.hypot(BH,BW);return [d[0]*BH/l,BW/l,d[2]*BH/l];};
        const strip=(o0,o1,i0,i1,d)=>quad([[o0[0],o0[1],lo],[o1[0],o1[1],lo],[i1[0],i1[1],Y],[i0[0],i0[1],Y]],[uv(o0[0],o0[1]),uv(o1[0],o1[1]),uv(i1[0],i1[1]),uv(i0[0],i0[1])],sn(d),[dk,dk,tone,tone]);
        const nA=[-dirA[0],0,-dirA[2]],pA=dirA,nC=[-dirC[0],0,-dirC[2]],pC=dirC;
        if(bA0)strip([pa0,pc0],[pa0,pc1],[ia0,ic0],[ia0,ic1],nA);
        if(bA1)strip([pa1,pc0],[pa1,pc1],[ia1,ic0],[ia1,ic1],pA);
        if(bC0)strip([pa0,pc0],[pa1,pc0],[ia0,ic0],[ia1,ic0],nC);
        if(bC1)strip([pa0,pc1],[pa1,pc1],[ia0,ic1],[ia1,ic1],pC);
      }
    }
  });
  if(!v)return null;
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  geo.setIndex(v>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));geo.computeBoundingSphere();
  return geo;
};

if(typeof module!=='undefined'&&module.exports)module.exports=Planks;else root.Planks=Planks;
})(typeof globalThis!=='undefined'?globalThis:this);

(function(root){
const Assets={};
let T=null,loader=null,renderer=null,maxAniso=4;

Assets.CATEGORIES={
  sofas:'Sofás y sillones','sillas-mesas':'Sillas y mesas',camas:'Camas y cabeceros',oficina:'Escritorios y oficina',
  armarios:'Armarios y vestidores',cocina:'Muebles de cocina',banos:'Baños y accesorios',iluminacion:'Lámparas',deco:'Decoración'
};
Assets.TYPES={
  sofa:['sofas','Sofá'],armchair:['sofas','Sillón'],pouf:['sofas','Puff'],
  chair:['sillas-mesas','Silla'],diningTable:['sillas-mesas','Mesa de comedor'],coffee:['sillas-mesas','Mesa de centro'],side:['sillas-mesas','Mesa auxiliar'],
  bed:['camas','Cama doble'],bedSingle:['camas','Cama de 1 plaza'],nightstand:['camas','Velador'],dresser:['camas','Cómoda'],
  desk:['oficina','Escritorio'],officeChair:['oficina','Silla de oficina'],shelf:['oficina','Estante'],
  wardrobe:['armarios','Ropero'],
  fridge:['cocina','Refrigerador'],washer:['cocina','Lavadora'],island:['cocina','Isla de cocina'],kitchenKit:['cocina','Cocina modular (kit de piezas)'],stool:['cocina','Taburete'],
  toilet:['banos','Inodoro'],paperHolder:['banos','Portarrollo'],toiletBrush:['banos','Escobilla'],basin:['banos','Lavamanos'],shower:['banos','Ducha'],bathAcc:['banos','Accesorio de baño'],
  floorLamp:['iluminacion','Lámpara de pie'],pendant:['iluminacion','Lámpara colgante'],tableLamp:['iluminacion','Lámpara de mesa'],
  plant:['deco','Planta'],vase:['deco','Florero'],rug:['deco','Alfombra'],art:['deco','Cuadro'],lounger:['deco','Reposera'],other:['deco','Otro']
};
Assets.ANCHORS={floor:'Apoyado en el piso',wall:'Contra la pared',ceiling:'Colgado del techo'};

Assets.init=function(THREE,rend){T=THREE;renderer=rend;loader=new THREE.GLTFLoader();maxAniso=rend.capabilities.getMaxAnisotropy?rend.capabilities.getMaxAnisotropy():8;PBR.build();};

/* ---------------- PBR presets ---------------- */
const PBR={presets:{},build(){
  const P=this.presets;
  const tex=(c,rep,srgb)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=maxAniso;if(srgb)t.encoding=T.sRGBEncoding;t.repeat.set(rep,rep);return t;};
  const cv=(n)=>{const c=document.createElement('canvas');c.width=c.height=n;return [c,c.getContext('2d')];};
  let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const heightToNormal=(hc,str)=>{const n=hc.width,ctx=hc.getContext('2d'),src=ctx.getImageData(0,0,n,n).data,[c,x]=cv(n),out=x.createImageData(n,n),d=out.data;
    const H=(i,j)=>src[(((j+n)%n)*n+((i+n)%n))*4]/255;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const dx=(H(i+1,j)-H(i-1,j))*str,dy=(H(i,j+1)-H(i,j-1))*str,l=Math.hypot(dx,dy,1),k=(j*n+i)*4;
      d[k]=(-dx/l*0.5+0.5)*255;d[k+1]=(-dy/l*0.5+0.5)*255;d[k+2]=(1/l*0.5+0.5)*255;d[k+3]=255;}x.putImageData(out,0,0);return c;};
  const noise=(x,n,base,amp,count,size)=>{x.fillStyle=base;x.fillRect(0,0,n,n);for(let i=0;i<count;i++){const v=(rnd()-0.5)*amp;x.fillStyle=v>0?`rgba(255,255,255,${v})`:`rgba(0,0,0,${-v})`;const s=size*(0.5+rnd());x.fillRect(rnd()*n,rnd()*n,s,s);}};
  const mk=(id,label,opt)=>{P[id]={id,label,...opt};};
  {const[c,x]=cv(512);x.fillStyle='#e6e6e6';x.fillRect(0,0,512,512);for(let i=0;i<260;i++){const y=rnd()*512;x.strokeStyle=`rgba(${rnd()<0.5?0:255},${rnd()<0.5?0:255},0,0)`;x.strokeStyle=`rgba(60,40,20,${0.04+rnd()*0.1})`;x.lineWidth=0.6+rnd()*2.2;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(170,y+rnd()*14-7,340,y+rnd()*14-7,512,y+rnd()*6-3);x.stroke();}
    const[h,hx]=cv(512);hx.drawImage(c,0,0);mk('madera','Madera',{map:tex(c,1.5,true),normal:tex(heightToNormal(h,2.2),1.5),rough:0.48,metal:0});}
  {const[c,x]=cv(512);x.fillStyle='#f4f4f4';x.fillRect(0,0,512,512);for(let k=0;k<18;k++){let px=rnd()*512,py=rnd()*512,a=rnd()*6;x.strokeStyle=`rgba(90,90,100,${0.08+rnd()*0.18})`;x.lineWidth=0.5+rnd()*2;x.beginPath();x.moveTo(px,py);for(let s=0;s<40;s++){a+=(rnd()-0.5)*0.7;px+=Math.cos(a)*14;py+=Math.sin(a)*14;x.lineTo(px,py);}x.stroke();}
    mk('marmol','Mármol',{map:tex(c,0.8,true),rough:0.12,metal:0,clearcoat:0.6});}
  {const[c,x]=cv(256);x.fillStyle='#bdbdbd';x.fillRect(0,0,256,256);x.fillStyle='#f6f6f6';x.fillRect(2,2,252,252);const[h,hx]=cv(256);hx.fillStyle='#000';hx.fillRect(0,0,256,256);hx.fillStyle='#fff';hx.fillRect(3,3,250,250);
    mk('ceramica','Cerámica',{map:tex(c,3.3,true),normal:tex(heightToNormal(h,3),3.3),rough:0.1,metal:0,clearcoat:0.8});}
  {const[c,x]=cv(256);noise(x,256,'#d8d8d8',0.18,5000,1.2);for(let i=0;i<256;i+=2){x.fillStyle=`rgba(255,255,255,${rnd()*0.06})`;x.fillRect(0,i,256,1);}
    mk('metal','Metal cepillado',{map:tex(c,2,true),rough:0.28,metal:1});}
  mk('porcelana','Porcelana esmaltada',{rough:0.05,metal:0,clearcoat:0.7});
  mk('cristal','Cristal',{rough:0.02,metal:0,transmission:1,opacity:0.3});
  {const[c,x]=cv(256);x.fillStyle='#e9e9e9';x.fillRect(0,0,256,256);for(let i=0;i<256;i+=3){x.fillStyle=`rgba(0,0,0,${0.04+rnd()*0.05})`;x.fillRect(0,i,256,1);x.fillRect(i,0,1,256);}noise(x,0,'',0,0,0);
    const[h,hx]=cv(256);hx.drawImage(c,0,0);mk('lino','Lino',{map:tex(c,6,true),normal:tex(heightToNormal(h,1.6),6),rough:0.95,metal:0,sheen:0.5});}
  {const[c,x]=cv(256);x.fillStyle='#ececec';x.fillRect(0,0,256,256);for(let i=0;i<1400;i++){const px=rnd()*256,py=rnd()*256,r=1.5+rnd()*3.5;x.fillStyle=`rgba(${rnd()<0.5?255:0},${rnd()<0.5?255:0},${rnd()<0.5?255:0},0)`;x.fillStyle=rnd()<0.5?'rgba(255,255,255,0.55)':'rgba(0,0,0,0.12)';x.beginPath();x.arc(px,py,r,0,7);x.fill();}
    const[h,hx]=cv(256);hx.drawImage(c,0,0);mk('boucle','Bouclé',{map:tex(c,4,true),normal:tex(heightToNormal(h,4),4),rough:1,metal:0,sheen:0.8});}
  {const[c,x]=cv(256);noise(x,256,'#d6d6d6',0.2,9000,1.5);const[h,hx]=cv(256);hx.drawImage(c,0,0);hx.filter='blur(1px)';
    mk('cuero','Cuero',{map:tex(c,4,true),normal:tex(heightToNormal(h,1.2),4),rough:0.5,metal:0});}
}};
Assets.PBR=PBR;
const AUTO=[[/glass|cristal|vidrio/i,'cristal'],[/marble|marmol|mármol|stone|piedra/i,'marmol'],[/azulejo|baldosa|\btile/i,'ceramica'],[/ceramic|porcelain|ceramica|cerámica|porcelana|sanitari/i,'porcelana'],
  [/metal|steel|chrome|brass|iron|aluminum|acero|laton|latón/i,'metal'],[/boucle|bouclé/i,'boucle'],[/leather|cuero/i,'cuero'],
  [/linen|fabric|lino|tela|velvet|cotton|wool/i,'lino'],[/wood|oak|walnut|madera|roble|nogal|teak|teca/i,'madera']];
Assets.FINISHES={
  inox:{label:'Acero inoxidable',swatch:'#c9cac8',ext:{c:'#cdcdca',m:1,r:1,n:0.12},side:{c:'#a9abab',m:0.6,r:0.38},handle:{c:'#d4d5d6',m:1,r:0.22}},
  negro:{label:'Acero negro',swatch:'#3a3a3c',ext:{c:'#58585c',m:1,r:1.05,n:0.1},side:{c:'#2a2a2c',m:0.5,r:0.42},handle:{c:'#3a3a3d',m:1,r:0.3}},
  blanco:{label:'Blanco',swatch:'#ecedeb',ext:{c:'#eeeeec',m:0,r:0.7,n:0.03},side:{c:'#e6e6e4',m:0,r:0.35},handle:{c:'#d4d5d6',m:1,r:0.22}}
};
function applyFinish(m,f){const nm=m.clone();nm.color=new T.Color(f.c).convertSRGBToLinear();nm.metalness=f.m;nm.roughness=f.r;if(nm.normalMap&&f.n!=null)nm.normalScale=new T.Vector2(f.n,(nm.normalScale&&nm.normalScale.y<0?-1:1)*f.n);nm.name=m.name;return nm;}
Assets.autoPreset=name=>{for(const[re,p]of AUTO)if(re.test(name||''))return p;return null;};
function applyPreset(m,presetId){
  const p=PBR.presets[presetId];if(!p)return m;
  const color=m.color?m.color.clone():new T.Color(1,1,1),map=m.map||null;
  const nm=p.transmission?new T.MeshPhysicalMaterial({color,roughness:p.rough,metalness:0,transparent:true,opacity:p.opacity,reflectivity:0.9,depthWrite:false,side:T.DoubleSide}):
    new T.MeshPhysicalMaterial({color,roughness:p.rough,metalness:p.metal,map:map||p.map||null,normalMap:map?null:(p.normal||null),clearcoat:p.clearcoat||0,clearcoatRoughness:0.15,});
  if(nm.normalMap)nm.normalScale=new T.Vector2(0.6,0.6);
  if(p.sheen&&nm.sheen!==undefined)nm.sheen=new T.Color(color).multiplyScalar(p.sheen);
  nm.name=m.name;nm.envMapIntensity=1;return nm;
}

/* ---------------- loading & cache ---------------- */
const cache=new Map();
function key(it){return it.url+'|'+(it.rotY||0)+'|'+JSON.stringify(it.materials||{})+'|'+(it.autoPbr===false?0:1)+'|'+(it.finishSlots&&it.finish||'');}
Assets.url=it=>it.url;
Assets.load=function(it){
  const k=key(it);if(cache.has(k)){const e=cache.get(k);e.last=Date.now();return e.p;}
  const e={last:Date.now(),p:null,proto:null};
  e.p=new Promise((res,rej)=>loader.load(it.url,g=>{try{const P=prepare(g,it);e.proto=P;res(P);}catch(err){rej(err);}},undefined,rej)).catch(err=>{cache.delete(k);throw err;});
  cache.set(k,e);return e.p;
};
Assets.parse=function(text,it){return new Promise((res,rej)=>loader.parse(text,'',g=>{try{res(prepare(g,it||{}));}catch(e){rej(e);}},rej));};
function prepare(g,it){
  const root=g.scene;const lights=[];root.traverse(o=>{if(o.isLight||o.isCamera)lights.push(o);});lights.forEach(l=>l.parent&&l.parent.remove(l));
  root.rotation.y=(it.rotY||0)*Math.PI/180;root.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(root),c=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());if(it.pivot==='origin'){size.y=box.max.y;}
  const anchor=it.anchor||'floor';
  const off=new T.Vector3(it.pivot==='origin'?0:-c.x,it.pivot==='origin'?0:(anchor==='ceiling'?-box.max.y:-box.min.y),anchor==='wall'?-box.min.z:-c.z);
  const ov=it.materials||{},matMap=new Map(),slots=new Set();
  const meshes=[];
  root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.userData.shared=true;
    const ms=Array.isArray(o.material)?o.material:[o.material];
    const FS=it.finishSlots&&Assets.FINISHES[it.finish]?it.finishSlots:null,FN=FS&&Assets.FINISHES[it.finish];
    const out=ms.map(m=>{slots.add(m.name||'material');if(!matMap.has(m)){let pid=ov[m.name];if(pid===undefined&&it.autoPbr!==false)pid=Assets.autoPreset(m.name);
        let nm=pid&&pid!=='original'?applyPreset(m,pid):m;if(FS&&(!pid||pid==='original')){const role=Object.keys(FS).find(r=>FS[r]===m.name);if(role&&FN[role])nm=applyFinish(nm,FN[role]);}['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'].forEach(k=>{if(nm[k]){nm[k].anisotropy=maxAniso;}});nm.envMapIntensity=nm.envMapIntensity||1;if(/^ap_/.test(nm.name||'')&&nm.metalness>0.5)nm.envMapIntensity=1.8;matMap.set(m,nm);}return matMap.get(m);});
    o.material=Array.isArray(o.material)?out:out[0];
  });
  const proto=new T.Group();root.position.copy(off);proto.add(root);proto.updateMatrixWorld(true);
  proto.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&!o.isSkinnedMesh)meshes.push({geometry:o.geometry,material:o.material,matrix:o.matrixWorld.clone()});});
  let tris=0;meshes.forEach(m=>{tris+=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;});
  return {proto,dims:size,anchor,meshes,slots:[...slots],tris:Math.round(tris),canInstance:meshes.length>0&&meshes.length<=40&&(()=>{let n=0;proto.traverse(o=>{if(o.isMesh)n++;});return n===meshes.length;})()};
}
Assets.scaleFor=function(M,it,fp){
  let s=+it.scale||1;const d=M.dims;
  if(fp){if((it.fit||'real')==='fit'){s=Math.min(fp.W/Math.max(d.x,0.05),fp.D/Math.max(d.z,0.05));s=Math.max(0.5,Math.min(1.6,s));}
    else{const over=Math.max(d.x*s/(fp.W+0.25),d.z*s/(fp.D+0.25));if(over>1)s/=over;}}
  return s;
};
Assets.gc=function(maxIdleMs){const now=Date.now();for(const[k,e]of cache){if(e.proto&&now-e.last>maxIdleMs&&!e.pinned){disposeProto(e.proto);cache.delete(k);}}};
Assets.touch=function(it){const e=cache.get(key(it));if(e)e.last=Date.now();};
function disposeProto(P){const seen=new Set();P.proto.traverse(o=>{if(o.isMesh){if(!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(seen.has(m))return;seen.add(m);['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'].forEach(k=>{const t=m[k];if(t&&!isPresetTex(t))t.dispose();});m.dispose();});}});}
function isPresetTex(t){for(const p of Object.values(PBR.presets))if(p.map===t||p.normal===t)return true;return false;}
Assets.stats=()=>({cached:cache.size});

/* ---------------- instancing ---------------- */
Assets.build=function(entries,opts){
  opts=opts||{};const out=new T.Group();out.name='assets';
  const by=new Map();entries.forEach(e=>{if(!by.has(e.M))by.set(e.M,[]);by.get(e.M).push(e);});
  for(const[M,list]of by){
    if(M.canInstance&&list.length>=(opts.minInstances||3)){
      M.meshes.forEach(sub=>{const im=new T.InstancedMesh(sub.geometry,sub.material,list.length);im.castShadow=true;im.receiveShadow=true;
        const mtx=new T.Matrix4();list.forEach((e,i)=>{mtx.compose(e.pos,new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),e.rot),e.sv||new T.Vector3(e.s,e.s,e.s)).multiply(sub.matrix);im.setMatrixAt(i,mtx);});
        im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.userData={...(list[0].userData||{}),instanced:true,shared:true};im.frustumCulled=false;out.add(im);});
    }else list.forEach(e=>{const g=M.proto.clone(true);g.position.copy(e.pos);g.rotation.y=e.rot;if(e.sv)g.scale.copy(e.sv);else g.scale.setScalar(e.s);g.userData={...(e.userData||{})};out.add(g);});
  }
  return out;
};

/* ---------------- kitchen kit ---------------- */
Assets.KIT_PARTS=['B_door2_60','B_door1_45','B_drw3_60','B_drw3_40','B_oven_60','B_sink_80','B_sink_60','F_base_10','W_door2_60','W_door1_40','W_glass2_60','F_wall_10','H_hood_60','H_chimney','D_set1','D_set2'];
function denorm(a){const arr=a.array,n=a.count*a.itemSize,out=new Float32Array(n);let d=1;
  if(a.normalized){if(arr instanceof Int8Array)d=127;else if(arr instanceof Uint8Array)d=255;else if(arr instanceof Int16Array)d=32767;else if(arr instanceof Uint16Array)d=65535;}
  for(let i=0;i<a.count;i++)for(let c=0;c<a.itemSize;c++){let v=(a.isInterleavedBufferAttribute?a.data.array[i*a.data.stride+a.offset+c]:arr[i*a.itemSize+c])/d;if(a.normalized&&d!==1&&!(arr instanceof Uint8Array||arr instanceof Uint16Array))v=Math.max(-1,v);out[i*a.itemSize+c]=v;}
  return new T.BufferAttribute(out,a.itemSize);}
function bake(g,m){const o=new T.BufferGeometry();['position','normal','uv'].forEach(k=>{if(g.attributes[k])o.setAttribute(k,denorm(g.attributes[k]));});
  if(g.index)o.setIndex(new T.BufferAttribute(new Uint32Array(g.index.array),1));o.applyMatrix4(m);return o;}
function kitModule(node){
  node.position.set(0,0,0);node.rotation.set(0,0,0);node.scale.set(1,1,1);
  const proto=new T.Group();proto.add(node);proto.updateMatrixWorld(true);
  const meshes=[];let tris=0;
  proto.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.userData.shared=true;meshes.push({geometry:bake(o.geometry,o.matrixWorld),material:o.material,matrix:new T.Matrix4()});
    tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});
  const box=new T.Box3().setFromObject(proto);
  return {proto,dims:box.getSize(new T.Vector3()),box,anchor:'wall',meshes,slots:[],tris:Math.round(tris),canInstance:meshes.length>0&&meshes.length<=40};
}
Assets.loadKit=function(it){
  const k='kit|'+it.url;if(cache.has(k)){const e=cache.get(k);e.last=Date.now();return e.p;}
  const e={last:Date.now(),p:null,proto:null,pinned:true};
  e.p=new Promise((res,rej)=>loader.load(it.url,g=>{try{
    const mats={};const seen=new Set();
    g.scene.traverse(o=>{if(o.isLight||o.isCamera)return;if(!o.isMesh)return;const m=o.material;if(seen.has(m))return;seen.add(m);mats[m.name]=m;
      ['map','normalMap','emissiveMap'].forEach(t=>{if(m[t])m[t].anisotropy=maxAniso;});m.envMapIntensity=1;
      if(m.transparent){m.depthWrite=false;m.side=T.DoubleSide;}else m.side=T.FrontSide;
      if(m.emissive&&m.emissive.getHex()>0){m.toneMapped=false;}});
    const mods={};g.scene.children.slice().forEach(n=>{if(/^K_/.test(n.name))mods[n.name.slice(2)]=kitModule(n);});
    const missing=Assets.KIT_PARTS.filter(p=>!mods[p]);if(missing.length)throw new Error('Faltan piezas en el kit: '+missing.join(', '));
    const q=mats.k_cuarzo||null;if(q&&q.map){q.map.wrapS=q.map.wrapT=T.MirroredRepeatWrapping;q.map.repeat.set(1/2.4,1/1.2);q.map.needsUpdate=true;}
    const K={kit:true,mods,mats,quartz:q};
    const pv=kitPreview(K);Object.assign(K,pv);e.proto=K;res(K);}catch(err){rej(err);}},undefined,rej)).catch(err=>{cache.delete(k);throw err;});
  cache.set(k,e);return e.p;
};
function kitPreview(K){
  const g=new T.Group(),add=(n,x,sx)=>{const o=K.mods[n].proto.clone(true);o.position.x=x;if(sx)o.scale.x=sx;g.add(o);};
  const row=[['B_drw3_60',0.3],['B_oven_60',0.9],['B_door2_60',1.5],['B_sink_80',2.2],['B_door1_45',2.825]];row.forEach(([n,x])=>add(n,x));
  [['W_door2_60',0.3],['H_hood_60',0.9],['W_glass2_60',1.5],['W_door2_60',2.2],['W_door1_40',2.825],['D_set1',1.45],['D_set2',2.75]].forEach(([n,x])=>add(n,x));
  const ch=K.mods.H_chimney.proto.clone(true);ch.position.set(0.9,1.92,0);ch.scale.y=0.45;g.add(ch);
  if(root.Furn&&Furn.countertop&&K.quartz){const geo=Furn.countertop(T,3.05,0.62,[{x:2.2,w:0.54}]);const m=new T.Mesh(geo,K.quartz);m.castShadow=m.receiveShadow=true;g.add(m);}
  g.position.x=-1.525;const p=new T.Group();p.add(g);p.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(p);let tris=0;Object.values(K.mods).forEach(M=>tris+=M.tris);
  return {proto:p,dims:box.getSize(new T.Vector3()),tris,anchor:'wall',meshes:[],slots:Object.keys(K.mats),canInstance:false};
}

Assets.mergeStatic=function(entries){
  const out=new T.Group();out.name='kit';const by=new Map(),m4=new T.Matrix4(),q=new T.Quaternion(),Y=new T.Vector3(0,1,0);
  entries.forEach(e=>{m4.compose(e.pos,q.setFromAxisAngle(Y,e.rot),e.sv||new T.Vector3(e.s,e.s,e.s));const loose=!!(e.userData&&e.userData.furn);
    if(m4.determinant()<0)return;
    e.M.meshes.forEach(sub=>{const key=sub.material.uuid+'|'+loose;if(!by.has(key))by.set(key,{mat:sub.material,loose,ud:e.userData,list:[]});by.get(key).list.push(sub.geometry.clone().applyMatrix4(m4));});});
  for(const v of by.values()){const g=T.BufferGeometryUtils.mergeBufferGeometries(v.list,false);v.list.forEach(x=>x.dispose());if(!g)continue;
    const me=new T.Mesh(g,v.mat);me.castShadow=!v.mat.transparent;me.receiveShadow=true;me.userData={...(v.ud||{}),furn:v.loose,kitMerged:true};out.add(me);}
  return out;
};

/* ---------------- thumbnails ---------------- */
let thumbR=null;
Assets.thumbnail=function(M,size){
  size=size||256;
  if(!thumbR){const c=document.createElement('canvas');thumbR={r:new T.WebGLRenderer({canvas:c,antialias:true,alpha:true,preserveDrawingBuffer:true}),sc:new T.Scene(),cam:new T.PerspectiveCamera(32,1,0.01,100)};
    const r=thumbR.r;r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;r.setClearColor(0x000000,0);
    if(T.RoomEnvironment){const pm=new T.PMREMGenerator(r);thumbR.sc.environment=pm.fromScene(new T.RoomEnvironment(),0.04).texture;pm.dispose();}
    thumbR.sc.add(new T.HemisphereLight(0xffffff,0x888888,0.4));const dl=new T.DirectionalLight(0xffffff,0.8);dl.position.set(2,4,3);thumbR.sc.add(dl);}
  const {r,sc,cam}=thumbR;r.setSize(size,size,false);
  const o=M.proto.clone(true);sc.add(o);const d=M.dims,R=Math.max(d.x,d.y,d.z);
  cam.position.set(R*1.25,d.y*0.5+R*0.85,R*1.75);cam.lookAt(0,d.y*0.42,0);cam.updateProjectionMatrix();
  r.render(sc,cam);const url=r.domElement.toDataURL('image/png');sc.remove(o);return url;
};

if(typeof module!=='undefined'&&module.exports)module.exports=Assets;else root.Assets=Assets;
})(typeof globalThis!=='undefined'?globalThis:this);

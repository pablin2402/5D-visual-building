(function(root){
const Mats={};
let T=null,renderer=null,maxAniso=8,Q='high',onUpdate=()=>{};
const list=[],byId=new Map(),mats=new Map(),texCache=new Map(),loader={};
const QUALITY={
  low:{suffix:'-512',aniso:1,normal:false},
  medium:{suffix:'',aniso:4,normal:true},
  high:{suffix:'',aniso:16,normal:true}
};
Mats.QUALITY=QUALITY;
Mats.init=function(THREE,rend,opts){T=THREE;renderer=rend;maxAniso=rend.capabilities.getMaxAnisotropy?rend.capabilities.getMaxAnisotropy():8;opts=opts||{};if(opts.quality)Q=opts.quality;if(opts.onUpdate)onUpdate=opts.onUpdate;loader.tex=new T.TextureLoader();};
Mats.load=async function(url){
  const r=await fetch(url);if(!r.ok)throw new Error('manifest '+r.status);const j=await r.json();
  list.length=0;byId.clear();(j.materials||[]).forEach(m=>{list.push(m);byId.set(m.id,m);});return list;
};
Mats.list=(f)=>list.filter(m=>!f||((!f.surface||m.surfaces.includes(f.surface))&&(!f.category||m.category===f.category)));
Mats.info=id=>byId.get(id)||null;
Mats.has=id=>byId.has(id);
Mats.quality=()=>Q;
const qs=()=>QUALITY[Q]||QUALITY.high;
function mapUrl(def,k){const u=def.maps[k];if(!u)return null;return qs().suffix?u.replace(/\.webp$/,qs().suffix+'.webp'):u;}
function getTex(url,srgb,rep){
  const key=url+'|'+rep[0].toFixed(4)+','+rep[1].toFixed(4);
  if(texCache.has(key)){const e=texCache.get(key);e.refs++;return e.tex;}
  const tex=loader.tex.load(url,()=>{onUpdate();},undefined,()=>console.warn('textura no cargó',url));
  tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(rep[0],rep[1]);tex.anisotropy=Math.min(maxAniso,qs().aniso);
  if(srgb)tex.encoding=T.sRGBEncoding;
  texCache.set(key,{tex,refs:1,url});return tex;
}
function dropTex(tex){for(const[k,e]of texCache){if(e.tex===tex){if(--e.refs<=0){e.tex.dispose();texCache.delete(k);}return;}}}
function build(def,opts){
  const rep=[1/def.sizeM[0],1/def.sizeM[1]];
  const m=new T.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:def.metalness||0});
  m.map=getTex(mapUrl(def,'color'),true,rep);
  m.roughnessMap=getTex(mapUrl(def,'rough'),false,rep);
  if(qs().normal){m.normalMap=getTex(mapUrl(def,'normal'),false,rep);const ns=def.normalScale||1;m.normalScale=new T.Vector2(ns,-ns);}
  m.envMapIntensity=def.envIntensity||1;
  if(opts&&opts.vertexColors&&def.tintable)m.vertexColors=true;
  m.name='mat:'+def.id;m.userData.matId=def.id;m.userData.shared=true;
  return m;
}
Mats.get=function(id,opts){
  id=String(id).replace(/^mat:/,'');const def=byId.get(id);if(!def)return null;
  const key=id+(opts&&opts.vertexColors&&def.tintable?'|vc':'');
  if(mats.has(key))return mats.get(key);
  const m=build(def,opts);mats.set(key,m);return m;
};
function lumNormal(img,strength){
  const n=Math.min(1024,Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=n;c.height=n;const x=c.getContext('2d');x.drawImage(img,0,0,n,n);
  const src=x.getImageData(0,0,n,n).data,H=new Float32Array(n*n);let mn=1,mx=0;
  for(let i=0;i<n*n;i++){const v=(0.2126*src[i*4]+0.7152*src[i*4+1]+0.0722*src[i*4+2])/255;H[i]=v;if(v<mn)mn=v;if(v>mx)mx=v;}
  const rg=Math.max(0.05,mx-mn),out=x.createImageData(n,n),d=out.data,h=(i,j)=>H[((j+n)%n)*n+((i+n)%n)];
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const dx=(h(i+1,j)-h(i-1,j))/rg*strength,dy=(h(i,j+1)-h(i,j-1))/rg*strength,l=Math.hypot(dx,dy,1),k=(j*n+i)*4;
    d[k]=(-dx/l*0.5+0.5)*255;d[k+1]=(dy/l*0.5+0.5)*255;d[k+2]=(1/l*0.5+0.5)*255;d[k+3]=255;}
  x.putImageData(out,0,0);return c;
}
Mats.fromImage=function(key,img,sizeM,opts){
  opts=opts||{};const k='img:'+key+'|'+sizeM+(opts.vertexColors?'|vc':'');if(mats.has(k))return mats.get(k);
  const rep=[1/sizeM,1/sizeM];
  const map=new T.Texture(img);map.needsUpdate=true;map.encoding=T.sRGBEncoding;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(rep[0],rep[1]);map.anisotropy=Math.min(maxAniso,qs().aniso);
  const m=new T.MeshStandardMaterial({color:0xffffff,map,roughness:opts.roughness!=null?opts.roughness:0.45,metalness:0});
  if(qs().normal){try{const nt=new T.CanvasTexture(lumNormal(img,opts.relief||1.2));nt.wrapS=nt.wrapT=T.RepeatWrapping;nt.repeat.set(rep[0],rep[1]);nt.anisotropy=map.anisotropy;m.normalMap=nt;m.normalScale=new T.Vector2(0.8,-0.8);}catch(e){}}
  if(opts.vertexColors)m.vertexColors=true;m.name=k;m.userData.shared=true;mats.set(k,m);return m;
};
Mats.copyInto=function(dst,src,keepVC){
  if(!src)return;['map','normalMap','roughnessMap'].forEach(p=>{dst[p]=src[p]||null;});
  dst.roughness=src.roughness;dst.metalness=src.metalness;dst.color.copy(src.color);if(src.normalScale)dst.normalScale=src.normalScale.clone();
  dst.envMapIntensity=src.envMapIntensity;if(!keepVC)dst.vertexColors=!!src.vertexColors;dst.needsUpdate=true;
};
Mats.setQuality=function(q){
  if(!QUALITY[q]||q===Q)return;Q=q;
  for(const[key,m]of mats){if(key.startsWith('img:'))continue;const def=byId.get(m.userData.matId);if(!def)continue;
    ['map','roughnessMap','normalMap'].forEach(p=>{if(m[p]){dropTex(m[p]);m[p]=null;}});
    const fresh=build(def,{vertexColors:m.vertexColors});['map','roughnessMap','normalMap'].forEach(p=>{m[p]=fresh[p];});if(fresh.normalScale)m.normalScale=fresh.normalScale;fresh.dispose();m.needsUpdate=true;}
  for(const[key,m]of mats){if(!key.startsWith('img:'))continue;[m.map,m.normalMap].forEach(t=>{if(t)t.anisotropy=Math.min(maxAniso,qs().aniso);});if(!qs().normal&&m.normalMap){m.userData.nm=m.normalMap;m.normalMap=null;}else if(qs().normal&&!m.normalMap&&m.userData.nm)m.normalMap=m.userData.nm;m.needsUpdate=true;}
  onUpdate();
};
Mats.release=function(inUse,filter){
  for(const[key,m]of mats){if(inUse.has(m))continue;if(filter&&!filter(key))continue;['map','roughnessMap','normalMap'].forEach(p=>{if(m[p]){if(key.startsWith('img:'))m[p].dispose();else dropTex(m[p]);}});m.dispose();mats.delete(key);}
};
Mats.stats=function(){let px=0;for(const e of texCache.values()){const im=e.tex.image;if(im&&im.width)px+=im.width*im.height;}
  for(const[k,m]of mats)if(k.startsWith('img:'))[m.map,m.normalMap].forEach(t=>{if(t&&t.image&&t.image.width)px+=t.image.width*t.image.height;});
  return {materials:mats.size,textures:texCache.size,gpuMB:+(px*4*1.33/1048576).toFixed(1),quality:Q};};

if(typeof module!=='undefined'&&module.exports)module.exports=Mats;else root.Mats=Mats;
})(typeof globalThis!=='undefined'?globalThis:this);

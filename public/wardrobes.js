(function(root){
const R={};
let T=null,KIT=null,OPT={};
const REG=new Set();

const TB=0.018,TH=0.006,TF=0.019,G=0.003,PL=0.08,PLR=0.035,DRH=0.19,TC=0.015;

R.MODELS=[
  {id:'2p',name:'Ropero 2 puertas',desc:'Compacto y funcional, ideal para dormitorios pequeños.',kind:'hinge',open:'Abatible',doors:2,grp:[1,1],
   def:{w:1.0,h:2.0,d:0.55},range:{w:[0.8,1.2],h:[1.9,2.4],d:[0.5,0.65]},
   cfg:{drawers:2,divider:true,bays:[{p:'colgar',n:0},{p:'estantes',n:4}],body:'blanco-mate',front:'blanco-mate',surf:'mate',handle:'alu',mirror:false,led:false,clothes:false}},
  {id:'3p',name:'Ropero 3 puertas',desc:'Mayor capacidad de almacenamiento y organización.',kind:'hinge',open:'Abatible',doors:3,grp:[1,2],
   def:{w:1.5,h:2.0,d:0.55},range:{w:[1.2,1.8],h:[1.9,2.4],d:[0.5,0.65]},
   cfg:{drawers:2,divider:true,bays:[{p:'estantes',n:4},{p:'colgar',n:0}],body:'roble-natural',front:'roble-natural',surf:'texturizado',handle:'alu',mirror:false,led:false,clothes:false}},
  {id:'4p',name:'Ropero 4 puertas',desc:'Espacio y comodidad para toda la familia.',kind:'hinge',open:'Abatible',doors:4,grp:[2,2],
   def:{w:2.0,h:2.0,d:0.55},range:{w:[1.6,2.4],h:[1.9,2.4],d:[0.5,0.65]},
   cfg:{drawers:2,divider:true,bays:[{p:'colgar',n:0},{p:'cajonera',n:3}],body:'grafito',front:'grafito',surf:'mate',handle:'alu',mirror:false,led:false,clothes:false}},
  {id:'corredera',name:'Ropero corredera',desc:'Puertas corredizas: ideal para espacios reducidos y ambientes modernos.',kind:'slide',open:'Corrediza',doors:2,grp:[1,1],noDrawers:true,
   def:{w:1.8,h:2.1,d:0.6},range:{w:[1.4,2.4],h:[1.9,2.5],d:[0.55,0.7]},
   cfg:{drawers:0,divider:true,bays:[{p:'estantes',n:4},{p:'colgar',n:0}],body:'roble-natural',front:'greige',surf:'satinado',handle:'gola',mirror:true,led:false,clothes:false}},
  {id:'esquinero',name:'Ropero esquinero',desc:'Aprovecha al máximo cada rincón de tu habitación.',kind:'corner',open:'Abatible',doors:2,noDrawers:true,
   def:{w:1.2,h:2.0,d:1.2,dc:0.55},range:{w:[1.0,1.8],h:[1.9,2.4],d:[1.0,1.8],dc:[0.5,0.65]},
   cfg:{drawers:0,divider:true,bays:[{p:'colgar',n:0},{p:'estantes',n:5}],body:'gris-claro',front:'gris-claro',surf:'mate',handle:'alu',mirror:false,led:false,clothes:false}},
  {id:'vestidor',name:'Ropero con vestidor',desc:'Diseño premium abierto, con iluminación integrada.',kind:'open',open:'Abierto',doors:0,noDrawers:true,
   def:{w:3.0,h:2.4,d:0.6},range:{w:[1.6,4.0],h:[2.1,2.6],d:[0.5,0.65]},
   cfg:{drawers:0,divider:true,bays:[{p:'colgar',n:0},{p:'cajonera',n:3},{p:'doble_barra',n:0},{p:'estantes',n:5}],body:'nogal-americano',front:'nogal-americano',surf:'texturizado',handle:'alu',mirror:false,led:true,clothes:true}}
];
R.FINISHES=[
  {id:'blanco-mate',name:'Blanco mate',kind:'Melamina',hex:'#efeee9'},
  {id:'blanco-calido',name:'Blanco cálido',kind:'Melamina',hex:'#ece6da'},
  {id:'gris-claro',name:'Gris mate',kind:'Melamina',hex:'#b9b8b5'},
  {id:'gris-cemento',name:'Gris cemento',kind:'Melamina',hex:'#9c9a95'},
  {id:'greige',name:'Greige',kind:'Melamina',hex:'#b9b0a3'},
  {id:'arena',name:'Arena',kind:'Melamina',hex:'#d6c8b0'},
  {id:'beige',name:'Beige',kind:'Melamina',hex:'#ddd2c1'},
  {id:'grafito',name:'Grafito',kind:'Melamina',hex:'#4a4b4d'},
  {id:'negro-mate',name:'Negro mate',kind:'Melamina',hex:'#232425'},
  {id:'ceniza',name:'Ceniza',kind:'Melamina',hex:'#a69d93'},
  {id:'roble-natural',name:'Roble natural',kind:'Madera',tex:true},
  {id:'roble-claro',name:'Roble claro',kind:'Madera',tex:true},
  {id:'roble-blanco',name:'Roble blanco',kind:'Madera',tex:true},
  {id:'roble-ahumado',name:'Roble ahumado',kind:'Madera',tex:true},
  {id:'nogal-americano',name:'Nogal',kind:'Madera',tex:true},
  {id:'castano',name:'Castaño',kind:'Madera',tex:true},
  {id:'haya',name:'Haya',kind:'Madera',tex:true},
  {id:'wengue',name:'Wengué',kind:'Madera',tex:true},
  {id:'oscura-premium',name:'Madera oscura premium',kind:'Madera',tex:true},
  {id:'aluminio',name:'Aluminio',kind:'Metal',hex:'#c3c5c6',metal:true,front:true},
  {id:'espejo',name:'Espejo',kind:'Vidrio',hex:'#dfe3e4',mirror:true,front:true}
];
R.SURFS=[
  {id:'mate',name:'Lacado mate',desc:'Sin brillo, tacto sedoso.',rough:0.72,env:0.55},
  {id:'satinado',name:'Lacado satinado',desc:'Brillo suave, fácil de limpiar.',rough:0.38,env:0.8},
  {id:'brillo',name:'Alto brillo',desc:'Reflejo de espejo, laca pulida.',rough:0.06,env:1.0,coat:1},
  {id:'texturizado',name:'Madera texturizada',desc:'Poro y veta en relieve.',rough:0.66,env:0.5,relief:2.2}
];
R.HANDLES=[
  {id:'alu',name:'Aluminio',desc:'Barra de aluminio cepillado, 320 mm en puertas y 160 mm en cajones.'},
  {id:'negro',name:'Negro',desc:'La misma barra en negro mate.'},
  {id:'gola',name:'Integrado',desc:'Perfil de aluminio embutido en el canto, sin tirador.'},
  {id:'push',name:'Push',desc:'Sin tirador: se abre presionando la puerta.'}
];
R.PRESETS=[
  {id:'colgar',name:'Barra para colgar',desc:'Chaquetas y camisas; vestidos largos si hay altura.'},
  {id:'colgar_corto',name:'Barra y estante',desc:'Camisas arriba, compartimento abajo.',n:[0,2],dn:0},
  {id:'doble_barra',name:'Doble barra',desc:'Camisas arriba, pantalones abajo.',need:1.72},
  {id:'pantalonero',name:'Pantalonero',desc:'Barra arriba y pantalonero extraíble abajo.'},
  {id:'estantes',name:'Estantes',desc:'Ropa doblada en estantes regulables.',n:[2,6],dn:4},
  {id:'cajonera',name:'Cajonera',desc:'Cajones interiores con estantes encima.',n:[2,4],dn:3},
  {id:'zapatero',name:'Zapatero',desc:'Bandejas inclinadas para zapatos.',n:[1,3],dn:2},
  {id:'accesorios',name:'Accesorios',desc:'Joyero, bandeja y espacio para bolsos.',n:[0,2],dn:1}
];
R.DISTS=[
  {id:'basica',name:'Distribución básica',desc:'Barra para colgar y estantes.',seq:['colgar','estantes']},
  {id:'cajones',name:'Con cajones',desc:'Mayor organización para tu ropa.',seq:['colgar','cajonera']},
  {id:'zapatera',name:'Con zapatera',desc:'Espacio especial para tus zapatos.',seq:['colgar','zapatero']},
  {id:'pantalonero',name:'Con pantalonero',desc:'Mantén tus pantalones ordenados.',seq:['pantalonero','estantes']},
  {id:'repisas',name:'Con repisas y accesorios',desc:'Detalles que marcan la diferencia.',seq:['estantes','accesorios']},
  {id:'completo',name:'Vestidor completo',desc:'Todo en un solo lugar.',seq:['colgar','cajonera','doble_barra','zapatero','estantes','accesorios']}
];
R.DETAILS=[
  {id:'bisagra',name:'Bisagras de cierre suave',desc:'Mayor durabilidad y comodidad.'},
  {id:'riel',name:'Correderas telescópicas',desc:'Apertura total y resistencia.'},
  {id:'tirador',name:'Tiradores de aluminio',desc:'Diseño moderno y ergonómico.'},
  {id:'barra',name:'Barras de alta resistencia',desc:'Soporte seguro para tu ropa.'}
];
R.EXTRAS=[
  {id:'led',name:'Iluminación LED',desc:'Perfil LED cálido bajo el maletero de cada espacio.'},
  {id:'mirror',name:'Espejo integrado',desc:'Espejo de cuerpo entero en una puerta.'},
  {id:'lock',name:'Cajones con cerradura',desc:'Cerradura de cilindro en el cajón superior.'},
  {id:'org',name:'Organizadores internos',desc:'Separadores en los cajones para ropa interior y accesorios.'}
];

const byId=(a,id)=>a.find(x=>x.id===id);
R.model=id=>byId(R.MODELS,id)||R.MODELS[0];
R.finish=id=>byId(R.FINISHES,id)||R.FINISHES[0];
R.surf=id=>byId(R.SURFS,id)||R.SURFS[0];
R.preset=id=>byId(R.PRESETS,id)||R.PRESETS[0];
R.dist=id=>byId(R.DISTS,id)||null;
R.defaults=function(id){const M=R.model(id);return JSON.parse(JSON.stringify({model:M.id,...M.def,...M.cfg,lock:false,org:false}));};
R.nBays=function(c){const M=R.model(c.model);if(M.kind==='open')return Math.max(2,Math.min(5,Math.round(c.w/0.8)));if(M.id==='2p')return c.divider?2:1;if(M.kind==='corner')return 2;return M.grp?M.grp.length:2;};
R.applyDist=function(c,id){const D=R.dist(id);if(!D)return c;const n=R.nBays(c);const bays=[];for(let k=0;k<n;k++){const p=D.seq[k%D.seq.length];bays.push({p,n:R.preset(p).dn||0});}
  if(n===1)bays[0]={p:D.seq[0],n:R.preset(D.seq[0]).dn||0};return {...c,bays};};
R.distOf=function(c){c=R.clean(c);return (R.DISTS.find(D=>JSON.stringify(R.applyDist(c,D.id).bays.map(b=>b.p))===JSON.stringify(c.bays.map(b=>b.p)))||{}).id||null;};
R.clean=function(c){const M=R.model(c&&c.model),d=R.defaults(M.id),o={...d,...(c||{})};o.model=M.id;
  ['w','h','d','dc'].forEach(k=>{const r=M.range[k];if(!r){delete o[k];return;}o[k]=Math.round(Math.min(r[1],Math.max(r[0],+o[k]||d[k]))*1000)/1000;});
  if(M.noDrawers)o.drawers=0;else{if(![0,2,3].includes(+o.drawers))o.drawers=d.drawers;o.drawers=+o.drawers;}
  o.divider=M.id==='2p'?!!o.divider:true;const nb=R.nBays(o);
  o.bays=(Array.isArray(o.bays)?o.bays:d.bays).slice(0,nb).map(b=>({p:R.preset(b&&b.p).id,n:+((b&&b.n)!=null?b.n:R.preset(b&&b.p).dn||0)}));
  while(o.bays.length<nb){const s=d.bays[o.bays.length%d.bays.length]||{p:'estantes',n:4};o.bays.push({...s});}
  o.bays.forEach(b=>{const P=R.preset(b.p);if(P.n)b.n=Math.max(P.n[0],Math.min(P.n[1],Math.round(b.n)));else b.n=0;});
  ['body','front'].forEach(k=>{if(!byId(R.FINISHES,o[k]))o[k]=d[k];});if(R.finish(o.body).front)o.body=R.finish(d.body).front?'blanco-mate':d.body;
  if(!byId(R.SURFS,o.surf))o.surf=d.surf;if(!byId(R.HANDLES,o.handle))o.handle=d.handle;
  if(o.surf==='texturizado'&&!R.finish(o.front).tex)o.surf='mate';
  if(M.kind==='open')o.mirror=false;
  o.mirror=!!o.mirror;o.led=!!o.led;o.clothes=!!o.clothes;o.lock=!!o.lock;o.org=!!o.org;
  return o;
};
R.foot=c=>({w:c.w,d:c.d});

function hingeCount(h){return h<0.9?2:h<1.6?3:4;}
function slideLen(depth){const L=[0.55,0.5,0.45,0.4,0.35,0.3,0.25];return L.find(l=>l<=depth)||0.25;}
function splitDoors(x0,x1,n,hinges){const w=(x1-x0)/n,out=[];for(let k=0;k<n;k++)out.push({x0:x0+k*w,x1:x0+(k+1)*w,hinge:hinges?hinges[k]:(k<n/2?-1:1)});return out;}
function units(c){
  const M=R.model(c.model),H=c.h,out=[];
  if(M.kind==='corner'){const D=c.dc,Wt=c.w,Dt=c.d,va=Wt-D,vb=Dt-D,na=Math.max(1,Math.ceil(va/0.66)),nb=Math.max(1,Math.ceil(vb/0.66));
    const ha=na===1?[1]:null,hb=nb===1?[-1]:null;
    out.push({W:Wt,D,ry:0,t:[0,-Dt/2+D/2],doors:splitDoors(-Wt/2+D+0.004,Wt/2,na,ha),bays:[[-Wt/2+TB,Wt/2-TB]],kind:'hinge',drawers:0,blind:D});
    out.push({W:vb,D,ry:Math.PI/2,t:[-Wt/2+D/2,D/2],doors:splitDoors(-vb/2,vb/2-0.004,nb,hb),bays:[[-vb/2+TB,vb/2-TB]],kind:'hinge',drawers:0});
    return out;}
  const W=c.w,D=c.d,xi0=-W/2+TB,xi1=W/2-TB;
  if(M.kind==='open'){const n=R.nBays(c),bw=(xi1-xi0-(n-1)*TB)/n,bays=[];for(let k=0;k<n;k++){const a=xi0+k*(bw+TB);bays.push([a,a+bw]);}
    out.push({W,D,ry:0,t:[0,0],doors:[],bays,kind:'open',drawers:0});return out;}
  if(M.kind==='slide'){const half=(xi1-xi0-TB)/2,bays=[[xi0,xi0+half],[xi1-half,xi1]];
    out.push({W,D,ry:0,t:[0,0],doors:[{x0:-W/2+0.004,x1:0.025,track:0},{x0:-0.025,x1:W/2-0.004,track:1}],bays,kind:'slide',drawers:0});return out;}
  const n=M.doors,doors=splitDoors(-W/2+G/2,W/2-G/2,n,null);
  let bays;if(!c.divider)bays=[[xi0,xi1]];else{const g=M.grp,dw=(W-G)/n;bays=[];let k=0;g.forEach((cnt,j)=>{const a=-W/2+G/2+k*dw,b=a+cnt*dw;k+=cnt;bays.push([j?a+TB/2:xi0,j<g.length-1?b-TB/2:xi1]);});}
  if(M.grp&&c.divider){let k=0;M.grp.forEach(cnt=>{if(cnt===1)doors[k].hinge=k===0?-1:1;else if(cnt===2){doors[k].hinge=-1;doors[k+1].hinge=1;}k+=cnt;});}
  out.push({W,D,ry:0,t:[0,0],doors,bays,kind:'hinge',drawers:c.drawers});return out;
}
function ugeom(U,c){
  const W=U.W,H=c.h,D=U.D,zb=-D/2,open=U.kind==='open',zc=open?D/2:D/2-TF-0.002-(U.kind==='slide'?0.05:0),zf=zc+0.002,xi0=-W/2+TB,xi1=W/2-TB;
  const Fz=U.drawers*DRH,y0=U.drawers?PL+Fz+TB/2:PL+TB,yd0=U.drawers?PL+Fz+G/2:PL+0.002,yd1=H-0.002;
  const zs0=zb+0.012+TH+0.002,zs1=zc-(open?0.01:0.022);
  return {W,H,D,zb,zc,zf,xi0,xi1,Fz,y0,yd0,yd1,zs0,zs1,bays:U.bays,y1:H-TB};
}
function bayPlan(b,bx,g,i){
  const [bx0,bx1]=bx,by0=g.y0,by1=g.y1,bw=bx1-bx0,bh=by1-by0,P=R.preset(b.p),err=[],warn=[];
  const top=P.id==='doble_barra'?(bh>=2.08?by1-0.3:null):bh>1.25?by1-(bh>1.7?0.38:0.3):null,ytop=top!=null?top:by1;
  const pl={x0:bx0,x1:bx1,y0:by0,y1:by1,top,fixed:[],adj:[],rods:[],drawers:[],shoes:[],tray:null,divs:[],trouser:null,kind:P.id,n:b.n};
  const rodY=ytop-0.065;
  const needD=g.zs1-g.zs0;
  const hang=()=>{if(needD<0.44)err.push(`Espacio ${i+1}: falta fondo para colgar perchas (${Math.round(needD*100)} cm útiles, mínimo 44).`);if(bw<0.3)err.push(`Espacio ${i+1}: muy angosto para una barra (mínimo 30 cm).`);};
  if(top!=null)pl.fixed.push(top);
  if(P.id==='colgar'){hang();const free=rodY-by0;if(free<0.95)err.push(`Espacio ${i+1}: la barra necesita 95 cm libres y hay ${Math.round(free*100)}. Subí la altura o quitá cajones.`);pl.rods.push({y:rodY,hang:free>=1.3?'largo':'corto',free});}
  else if(P.id==='colgar_corto'){hang();const ys=rodY-0.92;if(ys-by0<0.15)err.push(`Espacio ${i+1}: no entra barra y estantes; probá «Barra para colgar».`);else{pl.fixed.push(ys);pl.rods.push({y:rodY,hang:'corto',free:rodY-ys-TB});spread(pl.adj,by0,ys,b.n,err,i);}}
  else if(P.id==='doble_barra'){hang();const mid=by0+0.86;const up=rodY-(mid+TB);if(up<0.86)err.push(`Espacio ${i+1}: la doble barra necesita ${Math.round((1.72-(rodY-by0))*100+1)} cm más de alto.`);else{pl.fixed.push(mid);pl.rods.push({y:rodY,hang:'corto',free:up});pl.rods.push({y:mid-0.065,hang:'pantalon',free:mid-0.065-by0});}}
  else if(P.id==='pantalonero'){if(needD<0.4)err.push(`Espacio ${i+1}: falta fondo para el pantalonero.`);const yr=ytop-0.1,ys=yr-0.78;if(ys-by0<0.2)err.push(`Espacio ${i+1}: el pantalonero necesita más alto.`);else{pl.fixed.push(ys);pl.trouser={y:yr,y0:ys+TB};spread(pl.adj,by0,ys,Math.max(0,Math.round((ys-by0)/0.34)-1),err,i);}}
  else if(P.id==='estantes'){spread(pl.adj,by0,ytop,b.n,err,i);}
  else if(P.id==='cajonera'){if(bw<0.3)err.push(`Espacio ${i+1}: muy angosto para cajones (mínimo 30 cm).`);const pitch=0.17,h=b.n*pitch;pl.drawers=Array.from({length:b.n},(_,k)=>({y0:by0+0.004+k*pitch,y1:by0+(k+1)*pitch-0.006}));const ys=by0+h+0.006;pl.fixed.push(ys);if(ytop-ys-TB<0.3)err.push(`Espacio ${i+1}: no queda espacio sobre los cajones.`);else spread(pl.adj,ys+TB,ytop,Math.max(1,Math.round((ytop-ys)/0.36)-1),err,i);}
  else if(P.id==='zapatero'){if(bw<0.28)err.push(`Espacio ${i+1}: muy angosto para zapatos.`);const k=b.n;for(let s=0;s<k;s++)pl.shoes.push(by0+0.03+s*0.2);const ys=by0+k*0.2+0.04;pl.fixed.push(ys);if(ytop-ys<0.3)err.push(`Espacio ${i+1}: no queda espacio sobre el zapatero.`);else spread(pl.adj,ys+TB,ytop,Math.max(1,Math.round((ytop-ys)/0.34)-1),err,i);}
  else if(P.id==='accesorios'){const yt=Math.min(ytop-0.3,by0+0.98);if(yt-by0<0.5)err.push(`Espacio ${i+1}: no entra el módulo de accesorios.`);else{pl.tray={y:yt};pl.fixed.push(yt-0.012);const ys=yt+0.1;pl.fixed.push(ys);if(ytop-ys>0.5){const yb=ys+TB+0.34;pl.fixed.push(yb);pl.divs.push({y0:ys+TB,y1:yb});}spread(pl.adj,by0,yt-0.012,b.n,err,i);}}
  if(bw>1.0&&pl.rods.length)warn.push(`Espacio ${i+1}: barra de más de 1 m, se agrega soporte central.`);
  return {pl,err,warn};
}
function spread(arr,a,b,n,err,i){if(n<=0)return;const gap=(b-a)/(n+1);if(gap<0.16){err.push(`Espacio ${i+1}: ${n} estantes no entran (quedarían a ${Math.round(gap*100)} cm). Quitá alguno.`);return;}for(let k=1;k<=n;k++)arr.push(a+gap*k-TB/2);}

R.validate=function(c0){c0=R.clean(c0);const err=[],warn=[],M=R.model(c0.model);
  const US=units(c0);let bi=0;
  US.forEach((U,ui)=>{const g=ugeom(U,c0);
    U.doors.forEach(d=>{const w=d.x1-d.x0;if(U.kind==='hinge'&&w>0.67)err.push('Una puerta quedaría de '+Math.round(w*100)+' cm: el máximo para una puerta abatible es 60 cm.');if(U.kind==='slide'&&w>1.25)err.push('Cada hoja corrediza quedaría de '+Math.round(w*100)+' cm: el máximo es 120 cm.');if(w<0.28)err.push('Una puerta quedaría muy angosta ('+Math.round(w*100)+' cm).');});
    if(U.kind!=='open'&&g.yd1-g.yd0<1.2)err.push('Las puertas quedarían muy bajas.');
    U.bays.forEach(bx=>{const r=bayPlan(c0.bays[bi],bx,g,bi);err.push(...r.err);warn.push(...r.warn);bi++;});});
  if(M.kind==='corner'&&(c0.w-c0.dc<0.35||c0.d-c0.dc<0.35))err.push('Cada lado del esquinero necesita al menos 35 cm de frente.');
  return {ok:!err.length,err,warn,cfg:c0};
};

function rotPt(U,p){const c=Math.cos(U.ry),s=Math.sin(U.ry);return [p[0]*c+p[2]*s+U.t[0],p[1],-p[0]*s+p[2]*c+U.t[1]];}
R.layout=function(c0){
  const c=R.clean(c0),M=R.model(c.model),US=units(c),parts=[],hw=[],groups={},lights=[],tags=[];
  let bi=0,di=0,gAll=null;
  US.forEach((U,ui)=>{
  const g=ugeom(U,c);if(!gAll)gAll=g;
  const P=(n,grp,m,b,gr,o)=>parts.push({n,g:grp,m,b,gr,u:ui,...(o||{})});
  const K=(k,grp,m,p,o)=>hw.push({k,g:grp,m,p,u:ui,...(o||{})});
  const {W,H,D,zb,zc,zf,xi0,xi1}=g,sfx=ui?'_b':'';
  P('lateral_izq'+sfx,'cuerpo','body',[-W/2,0,zb,-W/2+TB,H,zc],'y');
  P('lateral_der'+sfx,'cuerpo','body',[W/2-TB,0,zb,W/2,H,zc],'y');
  P('techo'+sfx,'cuerpo','body',[xi0,H-TB,zb,xi1,H,zc],'x');
  P('base'+sfx,'cuerpo','body',[xi0,PL,zb,xi1,PL+TB,zc],'x');
  P('zocalo'+sfx,'cuerpo','body',[xi0,0,zc-PLR-TB,xi1,PL,zc-PLR],'x');
  P('trasera'+sfx,'cuerpo','back',[xi0,PL+TB,zb+0.012,xi1,H-TB,zb+0.012+TH],'y',{bev:0.0004});
  [[-W/2+0.05,zb+0.05],[W/2-0.05,zb+0.05],[-W/2+0.05,zc-PLR-TB-0.05],[W/2-0.05,zc-PLR-TB-0.05]].forEach(([x,z])=>K('nivelador','cuerpo','plastic',[x,0,z],{h:PL}));
  if(U.drawers)P('separador','cuerpo','body',[xi0,PL+g.Fz-TB/2,zb+0.012+TH,xi1,PL+g.Fz+TB/2,zc],'x');
  for(let k=0;k+1<U.bays.length;k++){const a=U.bays[k][1],b=U.bays[k+1][0];P('division_'+bi+'_'+k,'cuerpo','body',[a,g.y0,zb+0.012+TH,b,g.y1,zc],'y');}
  if(U.kind==='open'){P('copete'+sfx,'cuerpo','body',[xi0,H-TB-0.08,zc-0.02,xi1,H-TB,zc],'x');}
  const hcol=c.handle==='negro'?'negro':'alu',yd0=g.yd0,yd1=g.yd1,hd=yd1-yd0,nh=hingeCount(hd);
  const plans=U.bays.map((bx,k)=>bayPlan(c.bays[bi+k],bx,g,bi+k).pl);
  let hy=Array.from({length:nh},(_,k)=>yd0+0.1+(hd-0.2)*k/(nh-1));
  plans.forEach(pl=>{pl.drawers.forEach(d=>{hy=hy.map(y=>y>d.y0-0.04&&y<d.y1+0.04?d.y1+0.05:y);});
    [...pl.fixed,...pl.adj].forEach(y=>{hy=hy.map(v=>Math.abs(v-(y+TB/2))<0.035?(y+TB/2+(v>=y+TB/2?0.04:-0.04)):v);});});
  hy=hy.map(y=>Math.min(yd1-0.08,Math.max(yd0+0.08,y)));
  const bayOf=(x0,x1)=>{const xm=(x0+x1)/2;let best=0,bd=1e9;U.bays.forEach((b,k)=>{const d=xm<b[0]?b[0]-xm:xm>b[1]?xm-b[1]:0;if(d<bd){bd=d;best=k;}});return bi+best;};
  const mirrorDoor=c.mirror?(U.kind==='slide'?0:U.doors.length-1):-1;
  U.doors.forEach((d,k)=>{const name='puerta_'+(di++),x0=d.x0,x1=d.x1,bays=[];
    for(let q=0;q<U.bays.length;q++){const b=U.bays[q];if(Math.min(x1,b[1])-Math.max(x0,b[0])>0.05)bays.push(bi+q);}
    if(U.kind==='slide'){const zt=zf+(d.track?0.028:0);groups[name]={type:'slide',ax:'x',dir:d.track?-1:1,max:(x1-x0)-0.06,bays,u:ui};
      P(name,name,ui===0&&k===mirrorDoor?'front':'front',[x0,PL+0.012,zt,x1,H-0.035,zt+TF],'y',{bev:0.0012});
      if(k===mirrorDoor)P('espejo',name,'espejo',[x0+0.03,PL+0.05,zt+TF,x1-0.03,H-0.08,zt+TF+0.004],'y',{bev:0.0008});
      if(c.handle==='alu'||c.handle==='negro'){const hx=d.track?x0+0.05:x1-0.05;K('tir_320',name,hcol,[hx,1.05,zt+TF]);}
      else K('gola',name,'alu',[d.track?x0+0.01:x1-0.01,PL+0.012,zt+TF],{len:H-0.047-PL,vert:1});
      return;}
    const side=d.hinge,px=side<0?x0:x1;
    groups[name]={type:'hinge',pivot:[px,0,zf],dir:side<0?-1:1,max:1.75,bays,u:ui};
    P(name,name,'front',[x0,yd0,zf,x1,yd1,zf+TF],'y',{bev:0.0012});
    hy.forEach(y=>{K('bisagra_brazo',name,'cromo',[px,y,zf],{mx:side<0?1:-1});K('bisagra_base','cuerpo','cromo',[px,y,zf],{mx:side<0?1:-1});});
    const inner=side<0?x1:x0,hx=inner+(side<0?-0.04:0.04),hyc=Math.min(yd1-0.25,Math.max(yd0+0.25,1.05));
    if(c.handle==='alu'||c.handle==='negro')K('tir_320',name,hcol,[hx,hyc,zf+TF]);
    else if(c.handle==='gola')K('gola',name,'alu',[inner,side<0?yd1:yd0,zf+TF],{len:hd,vert:side<0?-1:1});
    else K('push','cuerpo','plastic',[inner+(side<0?-0.06:0.06),yd1-0.12,zc]);
    if(k===mirrorDoor){const mx0=x0+(side>0&&(c.handle==='alu'||c.handle==='negro')?0.075:0.02),mx1=x1-(side<0&&(c.handle==='alu'||c.handle==='negro')?0.075:0.02);P('espejo',name,'espejo',[mx0,yd0+0.03,zf+TF,mx1,yd1-0.03,zf+TF+0.004],'y',{bev:0.0008});}
  });
  if(U.kind==='slide'){P('riel_sup','cuerpo','alu',[-W/2+0.002,H-0.035,zf-0.004,W/2-0.002,H,zf+0.06],'x',{bev:0.001});P('riel_inf','cuerpo','alu',[-W/2+0.002,PL-0.01,zf-0.004,W/2-0.002,PL+0.012,zf+0.06],'x',{bev:0.001});}
  if(U.drawers){
    const depth=zc-(zb+0.012+TH)-0.01,L=slideLen(depth);
    for(let k=0;k<U.drawers;k++){
      const name='cajon_'+k,fy0=PL+k*DRH+(k?G/2:0.002),fy1=PL+(k+1)*DRH-G/2;
      groups[name]={type:'slide',max:L*0.85,u:ui};
      P('frente_'+k,name,'front',[-W/2+G/2,fy0,zf,W/2-G/2,fy1,zf+TF],'x',{bev:0.0012});
      const by0=Math.max(fy0,PL+TB)+0.014,bh=Math.min(0.14,fy1-by0-0.02);
      drawerBox(P,K,name,xi0,xi1,by0,bh,zc-L,zc,c.clothes?'toallas':null,c.org);
      const hcy=(fy0+fy1)/2;
      if(c.handle==='alu'||c.handle==='negro')K('tir_160',name,hcol,[0,hcy,zf+TF],{rz:Math.PI/2});
      else if(c.handle==='gola')K('gola',name,'alu',[-W/2+G/2,fy1,zf+TF],{len:W-G,vert:0});
      else K('push','cuerpo','plastic',[0,fy1-0.03,zc]);
      if(c.lock&&k===U.drawers-1)lockAt(P,name,(c.handle==='alu'||c.handle==='negro')?0.13:0,fy1-0.035,zf+TF);
    }
  }
  plans.forEach((pl,q)=>{const i=bi+q;
    const {x0,x1}=pl,bw=x1-x0,zs0=g.zs0,zs1=g.zs1,zm=(zs0+zs1)/2;
    const fixed=(y,nm)=>P(nm,'cuerpo','body',[x0,y,zs0,x1,y+TB,zs1+0.004],'x');
    pl.fixed.forEach((y,k)=>fixed(y,`estante_fijo_${i}_${k}`));
    pl.adj.forEach((y,k)=>{P(`estante_${i}_${k}`,'cuerpo','body',[x0+0.001,y,zs0,x1-0.001,y+TB,zs1],'x');[[x0,zs0+0.05],[x0,zs1-0.05],[x1,zs0+0.05],[x1,zs1-0.05]].forEach(([x,z])=>K('pin','cuerpo','cromo',[x,y,z],{mx:x===x0?1:-1}));});
    pl.rods.forEach((r,k)=>{K('barra','cuerpo','cromo',[x0,r.y,zm],{len:bw});K('soporte_barra','cuerpo','cromo',[x0,r.y,zm],{mx:1});K('soporte_barra','cuerpo','cromo',[x1,r.y,zm],{mx:-1});
      if(bw>1.0)K('soporte_central','cuerpo','cromo',[(x0+x1)/2,r.y,zm]);
      if(c.clothes)tags.push({k:'colgar',x0,x1,y:r.y,z:zm,hang:r.hang,free:r.free,i,ri:k,u:ui});});
    if(pl.trouser){const name=`pantalonero_${i}`,y=pl.trouser.y,L=slideLen(zs1-zs0-0.02),z0=zs1-0.005-L,z1=zs1-0.005;groups[name]={type:'slide',max:L*0.8,inner:i,u:ui};
      P('pant_lat_i_'+i,name,'alu',[x0+0.013,y-0.02,z0,x0+0.025,y+0.02,z1],'z',{bev:0.001});P('pant_lat_d_'+i,name,'alu',[x1-0.025,y-0.02,z0,x1-0.013,y+0.02,z1],'z',{bev:0.001});
      P('pant_fr_'+i,name,'alu',[x0+0.013,y-0.02,z1-0.012,x1-0.013,y+0.02,z1],'x',{bev:0.001});
      const nr=Math.max(2,Math.floor(L/0.1));for(let q2=0;q2<nr;q2++){const z=z0+0.04+(L-0.08)*q2/(nr-1);K('tubo',name,'cromo',[x0+0.025,y,z],{len:bw-0.05});
        if(c.clothes)tags.push({k:'colgar',x0:x0+0.02,x1:x1-0.02,y:y+0.02,z,hang:'pantalon',free:y-pl.trouser.y0,i,ri:9+q2,g:name,u:ui,one:true});}
      K('riel_fijo','cuerpo','cromo',[x0+0.00625,y,zs1-0.005-L/2],{len:L});K('riel_fijo','cuerpo','cromo',[x1-0.00625,y,zs1-0.005-L/2],{len:L,mx:-1});
      K('riel_movil',name,'cromo',[x0+0.00625,y,zs1-0.005-L/2],{len:L});K('riel_movil',name,'cromo',[x1-0.00625,y,zs1-0.005-L/2],{len:L,mx:-1});}
    pl.drawers.forEach((d,k)=>{const name=`cajon_int_${i}_${k}`,depth=zs1-zs0-0.02,L=slideLen(depth),zfr=zs1-0.005;
      groups[name]={type:'slide',max:L*0.8,inner:i,u:ui};
      P('frente_int_'+i+'_'+k,name,'body',[x0+0.003,d.y0,zfr-TB,x1-0.003,d.y1,zfr],'x',{bev:0.001});
      drawerBox(P,K,name,x0,x1,d.y0+0.012,Math.min(0.11,d.y1-d.y0-0.03),zfr-TB-L,zfr-TB,c.clothes?(k%2?'doblada':'toallas'):null,c.org);
      K('tir_160',name,'cromo',[(x0+x1)/2,d.y1-0.035,zfr],{rz:Math.PI/2,s:0.6});
      if(c.lock&&k===pl.drawers.length-1&&!U.drawers)lockAt(P,name,(x0+x1)/2+0.07,d.y1-0.035,zfr);});
    pl.shoes.forEach((y,k)=>{const name=`zapatero_${i}_${k}`;P(name,'cuerpo','body',[x0+0.002,y,zs0+0.02,x1-0.002,y+0.012,zs1-0.02],'x',{rx:-0.26,piv:[0,y,zs0+0.02]});
      K('tubo','cuerpo','cromo',[x0,y+0.035+Math.sin(0.26)*(zs1-zs0-0.04),zs1-0.03],{len:bw});
      K('soporte_barra','cuerpo','cromo',[x0,y+0.04,zs1-0.03],{mx:1,s:0.6});K('soporte_barra','cuerpo','cromo',[x1,y+0.04,zs1-0.03],{mx:-1,s:0.6});
      if(c.clothes)tags.push({k:'zapatos',x0,x1,y,z0:zs0,z1:zs1,i,u:ui});});
    if(pl.tray){const name=`bandeja_${i}`,y=pl.tray.y,L=slideLen(zs1-zs0-0.02);groups[name]={type:'slide',max:L*0.8,inner:i,u:ui};
      P('bandeja_base_'+i,name,'caja',[x0+0.013,y,zs1-0.005-L,x1-0.013,y+0.012,zs1-0.005],'x');
      ['f','b'].forEach((s,q2)=>P(`bandeja_${s}_${i}`,name,'caja',[x0+0.013,y+0.012,q2?zs1-0.005-L:zs1-0.017,x1-0.013,y+0.07,q2?zs1-0.005-L+0.012:zs1-0.005],'x'));
      [0,1].forEach(q2=>P(`bandeja_l${q2}_${i}`,name,'caja',[q2?x1-0.025:x0+0.013,y+0.012,zs1-0.005-L+0.012,q2?x1-0.013:x0+0.025,y+0.07,zs1-0.017],'z'));
      P('fieltro_'+i,name,'felt',[x0+0.025,y+0.012,zs1-0.005-L+0.012,x1-0.025,y+0.016,zs1-0.017],'x',{bev:0});
      const nx=Math.max(2,Math.round((bw-0.05)/0.11));for(let q2=1;q2<nx;q2++){const x=x0+0.025+(bw-0.05)*q2/nx;P(`div_bandeja_${i}_${q2}`,name,'felt',[x-0.003,y+0.016,zs1-0.005-L+0.012,x+0.003,y+0.055,zs1-0.017],'z',{bev:0});}
      const zmid=zs1-0.005-L/2;P(`div_bandeja_z_${i}`,name,'felt',[x0+0.025,y+0.016,zmid-0.003,x1-0.025,y+0.055,zmid+0.003],'x',{bev:0});
      K('riel_fijo','cuerpo','cromo',[x0+0.00625,y+0.03,zs1-0.005-L/2],{len:L});K('riel_fijo','cuerpo','cromo',[x1-0.00625,y+0.03,zs1-0.005-L/2],{len:L,mx:-1});
      K('riel_movil',name,'cromo',[x0+0.00625,y+0.03,zs1-0.005-L/2],{len:L});K('riel_movil',name,'cromo',[x1-0.00625,y+0.03,zs1-0.005-L/2],{len:L,mx:-1});
      if(c.clothes)tags.push({k:'joyas',x0:x0+0.025,x1:x1-0.025,y:y+0.016,z0:zs1-0.005-L+0.012,z1:zs1-0.017,g:name,i,u:ui});}
    pl.divs.forEach(d=>{const n=2;for(let q2=1;q2<=n;q2++){const x=x0+bw*q2/(n+1);P(`separador_bolsos_${i}_${q2}`,'cuerpo','body',[x-TB/2,d.y0,zs0,x+TB/2,d.y1,zs1],'y');}
      if(c.clothes)tags.push({k:'bolsos',x0,x1,y:d.y0,n:n+1,z0:zs0,z1:zs1,i,u:ui});});
    if(c.clothes){const shelves=[...pl.fixed.map(y=>y+TB),...pl.adj.map(y=>y+TB)].filter(y=>y<pl.y1-0.1);
      shelves.forEach((y,k)=>{if(pl.top!=null&&Math.abs(y-(pl.top+TB))<0.002){tags.push({k:'maletero',x0,x1,y,z0:zs0,z1:zs1,h:pl.y1-y,i,u:ui});return;}
        const above=[pl.y1,...pl.fixed,...pl.adj].filter(v=>v>y+0.01);const h=Math.min(...above)-y;
        if(pl.rods.some(r=>r.y>y&&r.y<y+h))return;if(pl.divs.some(d=>Math.abs(d.y0-y)<0.01))return;if(pl.trouser&&y<pl.trouser.y+0.1)return;
        tags.push({k:'estante',x0,x1,y,z0:zs0,z1:zs1,h,i,s:k,u:ui});});}
    if(c.led){const yl=(pl.top!=null?pl.top:pl.y1)-0.002;K('led_perfil','cuerpo','alu',[x0+0.01,yl,zs1-0.03],{len:bw-0.02});K('led_difusor','cuerpo','led',[x0+0.01,yl,zs1-0.03],{len:bw-0.02});
      lights.push({p:rotPt(U,[(x0+x1)/2,yl-0.04,zs1-0.06]),i});}
  });
  bi+=U.bays.length;});
  return {cfg:c,g:gAll,units:US.map(U=>({ry:U.ry,t:U.t})),parts,hw,groups,lights,tags};
};
function lockAt(P,name,x,y,z){P('cerradura_'+name,name,'cromo',[x-0.011,y-0.011,z,x+0.011,y+0.011,z+0.008],'z',{bev:0.003});P('cerradura_ranura_'+name,name,'negro',[x-0.0015,y-0.006,z+0.008,x+0.0015,y+0.006,z+0.0095],'z',{bev:0});}
function drawerBox(P,K,name,xi0,xi1,y0,h,z0,z1,fill,org){
  const x0=xi0+0.0125,x1=xi1-0.0125;
  P(name+'_lat_i',name,'caja',[x0,y0,z0,x0+TC,y0+h,z1],'z',{bev:0.0008});
  P(name+'_lat_d',name,'caja',[x1-TC,y0,z0,x1,y0+h,z1],'z',{bev:0.0008});
  P(name+'_fondo',name,'caja',[x0+TC,y0+0.012,z0,x1-TC,y0+h,z0+TC],'x',{bev:0.0008});
  P(name+'_contra',name,'caja',[x0+TC,y0,z1-TC,x1-TC,y0+h,z1],'x',{bev:0.0008});
  P(name+'_piso',name,'caja',[x0+TC,y0,z0+TC,x1-TC,y0+0.008,z1-TC],'x',{bev:0.0004});
  const L=z1-z0,zm=(z0+z1)/2;
  K('riel_fijo','cuerpo','cromo',[xi0+0.00625,y0+0.03,zm],{len:L});K('riel_fijo','cuerpo','cromo',[xi1-0.00625,y0+0.03,zm],{len:L,mx:-1});
  K('riel_movil',name,'cromo',[xi0+0.00625,y0+0.03,zm],{len:L});K('riel_movil',name,'cromo',[xi1-0.00625,y0+0.03,zm],{len:L,mx:-1});
  if(org){const ih=Math.min(0.07,h-0.02),ix0=x0+TC,ix1=x1-TC,iz0=z0+TC,iz1=z1-TC,nx=Math.max(2,Math.round((ix1-ix0)/0.13)),nz=Math.max(2,Math.round((iz1-iz0)/0.16));
    for(let q=1;q<nx;q++){const x=ix0+(ix1-ix0)*q/nx;P(`${name}_org_x${q}`,name,'felt',[x-0.003,y0+0.008,iz0,x+0.003,y0+0.008+ih,iz1],'z',{bev:0});}
    for(let q=1;q<nz;q++){const z=iz0+(iz1-iz0)*q/nz;P(`${name}_org_z${q}`,name,'felt',[ix0,y0+0.008,z-0.003,ix1,y0+0.008+ih,z+0.003],'x',{bev:0});}
    P(`${name}_org_base`,name,'felt',[ix0,y0+0.008,iz0,ix1,y0+0.011,iz1],'x',{bev:0});}
  else if(fill)K('__fill',name,null,[(x0+x1)/2,y0+0.008,zm],{w:x1-x0-2*TC,d:L-2*TC,h:h-0.02,fill});
}

R.summary=function(c0){const L=R.layout(c0),c=L.cfg,M=R.model(c.model);let hang=0,shelves=0,drw=0,rods=0,doors=0;
  L.hw.forEach(h=>{if(h.k==='barra'){hang+=h.len;rods++;}if(h.k==='pin')shelves+=0.25;});
  L.parts.forEach(p=>{if(/^estante_fijo/.test(p.n))shelves++;if(/^frente_/.test(p.n))drw++;});
  Object.keys(L.groups).forEach(n=>{if(/^puerta/.test(n))doors++;});
  const vol=M.kind==='corner'?((c.w-2*TB)+(c.d-c.dc-2*TB))*(c.h-PL-2*TB)*(c.dc-0.04):(c.w-2*TB)*(c.h-PL-2*TB)*(c.d-0.04);
  const dims=M.kind==='corner'?`${Math.round(c.w*100)} × ${Math.round(c.d*100)} cm, alto ${Math.round(c.h*100)}, fondo ${Math.round(c.dc*100)}`:`${Math.round(c.w*100)} × ${Math.round(c.h*100)} × ${Math.round(c.d*100)} cm`;
  return {model:M,cfg:c,dims,doors,open:M.open,hang:+hang.toFixed(2),rods,shelves:Math.round(shelves),drawers:drw,vol:+vol.toFixed(2)};};

/* ---------------- geometry ---------------- */
function Acc(){this.p=[];this.n=[];this.u=[];this.i=[];this.v=0;}
Acc.prototype.tri=function(a,b,c,n,ua,ub,uc){const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
  const ok=cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]>=0,v=this.v;[a,b,c].forEach((q,k)=>{this.p.push(q[0],q[1],q[2]);this.n.push(n[0],n[1],n[2]);const uu=[ua,ub,uc][k];this.u.push(uu[0],uu[1]);});
  if(ok)this.i.push(v,v+1,v+2);else this.i.push(v,v+2,v+1);this.v+=3;};
Acc.prototype.quad=function(a,b,c,d,n,uv){this.tri(a,b,c,n,uv(a,n),uv(b,n),uv(c,n));this.tri(a,c,d,n,uv(a,n),uv(c,n),uv(d,n));};
Acc.prototype.geo=function(){if(!this.v)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));
  g.setIndex(this.v>65535?new T.Uint32BufferAttribute(this.i,1):new T.Uint16BufferAttribute(this.i,1));g.computeBoundingSphere();return g;};
const AX={x:0,y:1,z:2};
function uvFn(gr,off){const ga=AX[gr]||0;return (p,n)=>{const an=Math.abs(n[0])>=Math.abs(n[1])&&Math.abs(n[0])>=Math.abs(n[2])?0:Math.abs(n[1])>=Math.abs(n[2])?1:2;
  let ua=ga,va=[0,1,2].find(a=>a!==an&&a!==ga);if(ga===an){ua=[0,1,2].find(a=>a!==an);va=[0,1,2].find(a=>a!==an&&a!==ua);}return [p[ua]+off[0],p[va]+off[1]];};}
R.box=function(acc,b,bev,gr,off,xf){
  const e=Math.min(bev,(b[3]-b[0])/3,(b[4]-b[1])/3,(b[5]-b[2])/3),uv=uvFn(gr,off||[0,0]);
  const lo=[b[0],b[1],b[2]],hi=[b[3],b[4],b[5]];
  const pt=(s,ins)=>[0,1,2].map(a=>(s[a]>0?hi[a]:lo[a])-s[a]*(ins[a]?e:0));
  const X=xf?(q=>xf(q)):(q=>q),XN=xf&&xf.n?xf.n:(n=>n);
  const add4=(a,b2,c,d,n)=>{const N=XN(n);acc.quad(X(a),X(b2),X(c),X(d),N,(p,nn)=>uv(p,N));};
  const add3=(a,b2,c,n)=>{const N=XN(n);acc.tri(X(a),X(b2),X(c),N,uv(a,N),uv(b2,N),uv(c,N));};
  if(e<=0){for(let a=0;a<3;a++)for(const s of[-1,1]){const o=[0,1,2].filter(k=>k!==a),c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([p,q])=>{const S=[0,0,0];S[a]=s;S[o[0]]=p;S[o[1]]=q;return pt(S,[0,0,0]);});const n=[0,0,0];n[a]=s;add4(c[0],c[1],c[2],c[3],n);}return;}
  for(let a=0;a<3;a++)for(const s of[-1,1]){const o=[0,1,2].filter(k=>k!==a);const c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([p,q])=>{const S=[0,0,0];S[a]=s;S[o[0]]=p;S[o[1]]=q;const I=[0,0,0];I[o[0]]=1;I[o[1]]=1;return pt(S,I);});const n=[0,0,0];n[a]=s;add4(c[0],c[1],c[2],c[3],n);}
  for(let k=0;k<3;k++){const [a,c]=[0,1,2].filter(q=>q!==k);for(const sa of[-1,1])for(const sc of[-1,1]){
    const S0=[0,0,0],S1=[0,0,0];S0[a]=sa;S0[c]=sc;S0[k]=-1;S1[a]=sa;S1[c]=sc;S1[k]=1;
    const IA=[0,0,0];IA[c]=1;IA[k]=1;const IC=[0,0,0];IC[a]=1;IC[k]=1;
    const n=[0,0,0];n[a]=sa*0.7071;n[c]=sc*0.7071;add4(pt(S0,IA),pt(S1,IA),pt(S1,IC),pt(S0,IC),n);}}
  for(const sx of[-1,1])for(const sy of[-1,1])for(const sz of[-1,1]){const S=[sx,sy,sz];add3(pt(S,[0,1,1]),pt(S,[1,0,1]),pt(S,[1,1,0]),[sx*0.577,sy*0.577,sz*0.577]);}
};
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}

/* ---------------- materials ---------------- */
const MATS=new Map(),TEXC=new Map();
function tex(url,srgb,rep){const k=url;let t=TEXC.get(k);if(!t){t=new T.TextureLoader().load(url,()=>{if(OPT.onChange)OPT.onChange();});t.wrapS=t.wrapT=T.MirroredRepeatWrapping;t.anisotropy=OPT.aniso||8;if(srgb)t.encoding=T.sRGBEncoding;TEXC.set(k,t);}return t;}
const TEXW=1.38,TEXH=0.69;
function finishMat(fid,sid,role){
  const key=role+'|'+fid+'|'+sid;if(MATS.has(key))return MATS.get(key);
  const F=R.finish(fid),S=R.surf(sid),base=OPT.base||'library/roperos/';
  if(F.mirror){const m=fixedMat('espejo');MATS.set(key,m);return m;}
  if(F.metal){const m=new T.MeshStandardMaterial({color:new T.Color(F.hex).convertSRGBToLinear(),metalness:0.85,roughness:S.coat?0.18:0.34});m.normalMap=tex(base+'tex/melamina_nrm.webp',false);m.normalScale=new T.Vector2(0.15,-0.15);m.userData.envBase=1.1;m.envMapIntensity=1.1*(OPT.envScale?OPT.envScale():1);m.name='ropero_'+key;m.userData.shared=true;MATS.set(key,m);return m;}
  const P={color:0xffffff,roughness:S.rough,metalness:0};
  const m=S.coat?new T.MeshPhysicalMaterial({...P,clearcoat:1,clearcoatRoughness:0.04}):new T.MeshStandardMaterial(P);
  if(F.tex){const d=base+'tex/'+fid+'/';m.map=tex(d+'color.webp',true);m.roughnessMap=tex(d+'rough.webp',false);m.normalMap=tex(d+'normal.webp',false);
    const ns=S.relief||(S.coat?0.25:0.7);m.normalScale=new T.Vector2(ns,-ns);m.roughness=S.coat?0.5:(S.id==='satinado'?0.75:1.1);if(S.coat)m.roughnessMap=null,m.roughness=0.25;}
  else{m.color.set(F.hex).convertSRGBToLinear();m.normalMap=tex(base+'tex/melamina_nrm.webp',false);m.normalScale=new T.Vector2(S.coat?0.03:0.35,-(S.coat?0.03:0.35));m.roughnessMap=null;}
  if(m.map)['map','roughnessMap','normalMap'].forEach(k=>{});
  m.userData.envBase=S.env;m.envMapIntensity=S.env*(OPT.envScale?OPT.envScale():1);m.name='ropero_'+key;m.userData.shared=true;
  MATS.set(key,m);return m;
}
function fixedMat(k){
  const key='fx|'+k;if(MATS.has(key))return MATS.get(key);let m;
  const S=(o)=>new T.MeshStandardMaterial(o);
  if(k==='alu')m=S({color:0xc9cbcc,metalness:1,roughness:0.32});
  else if(k==='negro')m=S({color:0x1b1c1d,metalness:0.6,roughness:0.42});
  else if(k==='cromo')m=S({color:0xd8d9db,metalness:1,roughness:0.18});
  else if(k==='plastic')m=S({color:0x6a6b6c,metalness:0,roughness:0.6});
  else if(k==='caja')m=S({color:0xf2f1ec,metalness:0,roughness:0.6});
  else if(k==='felt')m=S({color:0x2c3540,metalness:0,roughness:1});
  else if(k==='led')m=S({color:0xf6f3ea,metalness:0,roughness:0.5,emissive:0x000000});
  else if(k==='espejo')m=S({color:0xe8eaea,metalness:1,roughness:0.02});
  else m=S({color:0x888888,roughness:0.7});
  m.name='ropero_'+k;m.userData.shared=true;m.userData.envBase=k==='espejo'?1.4:(k==='alu'||k==='cromo'?1.1:0.8);m.envMapIntensity=m.userData.envBase*(OPT.envScale?OPT.envScale():1);
  MATS.set(key,m);return m;
}
function matFor(key,c){
  if(key==='body'||key==='back')return finishMat(c.body,c.body===c.front&&c.surf!=='brillo'?c.surf:'mate','b');
  if(key==='front')return finishMat(c.front,c.surf,'f');
  return fixedMat(key);
}
R.envScaleUpdate=function(){for(const m of MATS.values())if(m.userData.envBase!=null)m.envMapIntensity=m.userData.envBase*(OPT.envScale?OPT.envScale():1);REG.forEach(r=>{const mm=r.userData.wr&&r.userData.wr.mirrorMat;if(mm)mm.envMapIntensity=1.4;});};

/* ---------------- kit ---------------- */
R.init=function(THREE,opts){T=THREE;OPT=opts||{};};
R.load=function(url){
  return new Promise(res=>{
    if(!T.GLTFLoader){KIT={};return res(false);}
    new T.GLTFLoader().load(url,gl=>{const K={};gl.scene.updateMatrixWorld(true);
      gl.scene.children.forEach(n=>{const list=[];n.updateMatrixWorld(true);const inv=new T.Matrix4().copy(n.matrixWorld).invert();
        n.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));['tangent','color','uv2'].forEach(a=>{if(g.attributes[a])g.deleteAttribute(a);});
          const m=o.material;if(m){m.userData.shared=true;m.envMapIntensity=0.7;}list.push({g,m:m&&m.name,mat:m});});
        K[n.name]=list;});
      KIT=K;R.kitLoaded=true;res(true);},undefined,()=>{KIT={};res(false);});
  });
};
function itemMatrix(item){
  const M=new T.Matrix4(),p=item.p,len=item.len;
  M.makeTranslation(p[0],p[1],p[2]);
  if(item.rz)M.multiply(new T.Matrix4().makeRotationZ(item.rz));
  if(item.rx)M.multiply(new T.Matrix4().makeRotationX(item.rx));
  if(item.vert)M.multiply(new T.Matrix4().makeRotationZ(item.vert*Math.PI/2));
  if(item.k==='riel_fijo'||item.k==='riel_movil')M.multiply(new T.Matrix4().makeScale(item.mx||1,1,len||1));
  else if(len)M.multiply(new T.Matrix4().makeScale((item.mx||1)*len,1,1));
  else M.multiply(new T.Matrix4().makeScale((item.mx||1)*(item.s||1),item.s||1,item.s||1));
  return M;
}
function resolveKey(k,r){if(!KIT)return null;if(KIT[k])return k;const v=Object.keys(KIT).filter(n=>n.startsWith(k+'_')).sort();if(!v.length)return null;return v[Math.floor(r()*v.length)%v.length];}
function unitM(U){const M=new T.Matrix4().makeRotationY(U.ry);M.setPosition(U.t[0],0,U.t[1]);return M;}
function emit(sink,grp,item){const k=resolveKey(item.k,sink.r);if(!k)return;let M=itemMatrix({...item,k});if(item.u&&sink.units&&sink.units[item.u])M=unitM(sink.units[item.u]).multiply(M);sink.list.push({k,g:grp,m:item.m||null,M});}
function kitGeo(buckets,e){
  const list=KIT[e.k];if(!list)return;const M=e.M,flip=M.determinant()<0,NM=new T.Matrix3().getNormalMatrix(M);
  list.forEach(x=>{const B=bucket(buckets,e.g,e.m?'k:'+e.m:'own:'+x.m,e.m?null:x.mat);
    const P=x.g.attributes.position,N=x.g.attributes.normal,U=x.g.attributes.uv,I=x.g.index,b=B.acc.v,v=new T.Vector3(),n=new T.Vector3();
    for(let q=0;q<P.count;q++){v.fromBufferAttribute(P,q).applyMatrix4(M);B.acc.p.push(v.x,v.y,v.z);if(N){n.fromBufferAttribute(N,q).applyMatrix3(NM).normalize();B.acc.n.push(n.x,n.y,n.z);}else B.acc.n.push(0,1,0);B.acc.u.push(U?U.getX(q):0,U?U.getY(q):0);}
    const ix=I?I.array:null,cnt=I?I.count:P.count;
    for(let q=0;q<cnt;q+=3){const i0=ix?ix[q]:q,i1=ix?ix[q+1]:q+1,i2=ix?ix[q+2]:q+2;if(flip)B.acc.i.push(b+i0,b+i2,b+i1);else B.acc.i.push(b+i0,b+i1,b+i2);}
    B.acc.v+=P.count;});
}
function bucket(buckets,grp,key,mat){const k=grp+'|'+key;let B=buckets.get(k);if(!B){B={grp,key,mat,acc:new Acc()};buckets.set(k,B);}return B;}

/* ---------------- clothes placement ---------------- */
function rnd(seed){let s=Math.floor(seed*2147483646)+1;return ()=>(s=(s*16807)%2147483647)/2147483647;}
function dressUp(L,sink){
  const r=sink.r,add=(k,grp,p,o)=>emit(sink,grp,{k,p,...(o||{})});
  L.tags.forEach(t=>{
    const add=(k,grp,p,o)=>emit(sink,t.g&&grp==='cuerpo'?t.g:grp,{k,p,u:t.u,...(o||{})});
    if(t.k==='colgar'){const span=t.x1-t.x0-0.08,step=t.ri>=9?0.11:0.075,n=Math.max(0,Math.floor(span/step));
      const pool=t.hang==='largo'?['abrigo','vestido','chaqueta','vestido','abrigo','chaqueta']:t.hang==='pantalon'?['pantalon']:['camisa','camisa','chaqueta','camisa'];
      const fill=Math.max(1,Math.round(n*0.72));for(let q=0;q<fill;q++){const x=t.x0+0.04+(q+0.5)*span/fill;let k=pool[Math.floor(r()*pool.length)];
        if(k==='abrigo'&&t.free<1.2)k='chaqueta';if(k==='vestido'&&t.free<1.3)k='camisa';
        add(k,'cuerpo',[x+(r()-0.5)*0.012,t.y,t.z],{rz:0});}}
    else if(t.k==='estante'){const h=t.h;if(h<0.12)return;const opts=h>0.3?['doblada','doblada','caja','toallas']:['doblada','toallas'];
      let x=t.x0+0.03;while(x<t.x1-0.3){const k=opts[Math.floor(r()*opts.length)];add(k,'cuerpo',[x+0.15,t.y,(t.z0+t.z1)/2+0.02],{s:k==='caja'?Math.min(1,(h-0.02)/0.23):Math.min(1,(h-0.02)/0.2)});x+=0.32+r()*0.05;}}
    else if(t.k==='maletero'){if(t.h<0.2)return;const w=t.x1-t.x0,zc=(t.z0+t.z1)/2;if(w>0.6)add('maleta','cuerpo',[t.x0+0.29,t.y,zc],{s:Math.min(1,(t.h-0.03)/0.26)});if(w>0.95||w<=0.6)add('caja','cuerpo',[t.x1-0.17,t.y,zc],{s:Math.min(1,(t.h-0.03)/0.23)});}
    else if(t.k==='zapatos'){const w=t.x1-t.x0,n=Math.max(1,Math.floor((w-0.02)/0.22));for(let q=0;q<n;q++){const x=t.x0+(w)*(q+0.5)/n;add('zapatos','cuerpo',[x,t.y+0.012+Math.sin(0.26)*0.0,(t.z0+t.z1)/2+0.0],{rx:-0.26});}}
    else if(t.k==='bolsos'){const w=(t.x1-t.x0)/t.n;for(let q=0;q<t.n;q++)if(r()>0.2)add('bolso','cuerpo',[t.x0+w*(q+0.5),t.y,(t.z0+t.z1)/2+0.03],{s:Math.min(1,(w-0.03)/0.3)});}
    else if(t.k==='joyas'){const w=t.x1-t.x0;add('relojes',t.g,[t.x0+w*0.27,t.y,(t.z0+t.z1)/2-0.06]);add('joyas',t.g,[t.x0+w*0.7,t.y,(t.z0+t.z1)/2+0.05]);}
  });
}
function fillDrawer(sink,h){const n=Math.max(1,Math.floor(h.w/0.32));for(let q=0;q<n;q++){const x=h.p[0]-h.w/2+h.w*(q+0.5)/n;emit(sink,h.g,{k:h.fill,p:[x,h.p[1],h.p[2]],s:Math.min(1,h.h/0.12),u:h.u});}}
R.plan=function(cfg,seed){const L=R.layout(cfg),sink={list:[],r:rnd(seed||0.37),units:L.units};
  L.hw.forEach(h=>{if(h.k==='__fill'){if(L.cfg.clothes)fillDrawer(sink,h);return;}emit(sink,h.g,h);});
  if(L.cfg.clothes)dressUp(L,sink);
  return {layout:L,items:sink.list};};
R.setKitKeys=function(keys){KIT={};keys.forEach(k=>KIT[k]=[]);};
R.useThree=function(THREE){T=THREE;};

/* ---------------- build ---------------- */
function addParts(L,buckets){const c=L.cfg;
  L.parts.forEach(pt=>{const B=bucket(buckets,pt.g,'m:'+pt.m,null),off=[hash(pt.n+c.model)*1.2,hash(pt.n+'v')*0.6];
    let xf=null;if(pt.rx){const piv=pt.piv,cs=Math.cos(pt.rx),sn=Math.sin(pt.rx);xf=q=>{const y=q[1]-piv[1],z=q[2]-piv[2];return [q[0],piv[1]+y*cs-z*sn,piv[2]+y*sn+z*cs];};xf.n=n=>[n[0],n[1]*cs-n[2]*sn,n[1]*sn+n[2]*cs];}
    const U=pt.u&&L.units?L.units[pt.u]:null;if(U&&(U.ry||U.t[0]||U.t[1])){const c2=Math.cos(U.ry),s2=Math.sin(U.ry),r=v=>[v[0]*c2+v[2]*s2,v[1],-v[0]*s2+v[2]*c2],x0=xf;xf=q=>{const a=x0?x0(q):q,b=r(a);return [b[0]+U.t[0],b[1],b[2]+U.t[1]];};xf.n=n=>r(x0&&x0.n?x0.n(n):n);}
    R.box(B.acc,pt.b,pt.bev!=null?pt.bev:0.0015,pt.gr,off,xf);});
}
R.partOffset=(pt,c)=>[hash(pt.n+c.model)*1.2,hash(pt.n+'v')*0.6];
R.build=function(cfg,opts){
  const L=R.layout(cfg),root=new T.Group();root.name='ropero_'+L.cfg.model;
  const st={cfg:L.cfg,groups:{},anim:{},meshes:[],lights:[],seed:(opts&&opts.seed)||0.37};root.userData.wr=st;
  fill(root,L);REG.add(root);return root;
};
function fill(root,L){
  const st=root.userData.wr,c=L.cfg;st.cfg=c;st.layout=L;
  const buckets=new Map();addParts(L,buckets);R.plan(c,st.seed).items.forEach(e=>kitGeo(buckets,e));
  const gobj={cuerpo:new T.Group()};gobj.cuerpo.name='cuerpo';root.add(gobj.cuerpo);
  Object.entries(L.groups).forEach(([n,G])=>{const pv=new T.Group();pv.name=n;const inner=new T.Group();
    const U=G.u&&L.units?L.units[G.u]:null;if(G.type==='hinge'){let pp=G.pivot;if(U)pp=[pp[0]*Math.cos(U.ry)+pp[2]*Math.sin(U.ry)+U.t[0],0,-pp[0]*Math.sin(U.ry)+pp[2]*Math.cos(U.ry)+U.t[1]];pv.position.set(pp[0],0,pp[2]);inner.position.set(-pp[0],0,-pp[2]);}
    else{const lv=G.ax==='x'?[(G.dir||1),0]:[0,1],ry=U?U.ry:0;G.vec=[lv[0]*Math.cos(ry)+lv[1]*Math.sin(ry),-lv[0]*Math.sin(ry)+lv[1]*Math.cos(ry)];}
    pv.add(inner);pv.userData.inner=inner;root.add(pv);gobj[n]=pv;const prev=st.anim[n];st.anim[n]={v:prev?prev.v:0,t:prev?prev.t:0,G};});
  Object.keys(st.anim).forEach(n=>{if(!L.groups[n])delete st.anim[n];});
  for(const B of buckets.values()){const g=B.acc.geo();if(!g)continue;const mat=B.key.startsWith('m:')?matFor(B.key.slice(2),c):B.key.startsWith('k:')?matFor(B.key.slice(2),c):B.mat;
    const me=new T.Mesh(g,mat);me.castShadow=B.grp==='cuerpo'||/^puerta/.test(B.grp)||/^cajon_\d/.test(B.grp);me.receiveShadow=true;me.userData.wrGroup=B.grp;me.userData.wrKey=B.key;me.userData.shared=false;
    const tgt=gobj[B.grp];(tgt.userData.inner||tgt).add(me);st.meshes.push(me);}
  st.groups=gobj;
  if(c.mirror){const mm=fixedMat('espejo').clone();mm.userData.shared=false;st.mirrorMat=mm;st.meshes.forEach(me=>{if(me.userData.wrKey==='m:espejo')me.material=mm;});}else st.mirrorMat=null;
  st.lights=[];if(c.led){L.lights.forEach(l=>{const pl=new T.PointLight(0xffe7c4,0.55,1.6,2);pl.position.set(l.p[0],l.p[1],l.p[2]);pl.castShadow=false;gobj.cuerpo.add(pl);st.lights.push(pl);});}
  applyLed(root);applyAnim(root,true);
}
function clear(root){const st=root.userData.wr;[...root.children].forEach(ch=>{root.remove(ch);ch.traverse(o=>{if(o.isMesh)o.geometry.dispose();});});if(st.mirrorMat){if(st.mirrorMat.envMap&&st.cube){}st.mirrorMat.dispose();}st.meshes=[];}
function applyLed(root){const m=fixedMat('led');m.emissive.set(0xfff1d8);m.emissiveIntensity=2.2;m.toneMapped=false;}
R.update=function(root,cfg){
  const st=root.userData.wr,v=R.validate({...st.cfg,...cfg});if(!v.ok)return v;
  const n=v.cfg,o=st.cfg;
  const geoKeys=['model','w','h','d','dc','drawers','divider','bays','handle','mirror','led','clothes','lock','org'],same=geoKeys.every(k=>JSON.stringify(n[k])===JSON.stringify(o[k]));
  if(same){st.cfg=n;st.layout.cfg=n;st.meshes.forEach(me=>{const k=me.userData.wrKey;if(k&&k.startsWith('m:')&&k!=='m:espejo'){me.material=matFor(k.slice(2),n);}});R.gc();if(OPT.onChange)OPT.onChange();return v;}
  const mirrorEnv=st.mirrorMat&&st.mirrorMat.envMap;clear(root);fill(root,R.layout(n));if(st.mirrorMat&&mirrorEnv){st.mirrorMat.envMap=mirrorEnv;st.mirrorMat.needsUpdate=true;}
  R.gc();if(OPT.onChange)OPT.onChange();return v;
};
R.dispose=function(root){if(!root||!root.userData.wr)return;clear(root);const st=root.userData.wr;if(st.cube){st.cube.dispose();st.cube=null;}REG.delete(root);if(root.parent)root.parent.remove(root);R.gc();};
R.gc=function(){const used=new Set();REG.forEach(r=>r.traverse(o=>{if(o.isMesh)used.add(o.material);}));
  for(const[k,m]of MATS){if(k.startsWith('fx|'))continue;if(!used.has(m)){m.dispose();MATS.delete(k);}}
  const live=new Set();for(const m of MATS.values())['map','roughnessMap','normalMap'].forEach(p=>{if(m[p])live.add(m[p]);});
  for(const[k,t]of TEXC){if(!live.has(t)&&!/melamina/.test(k)){t.dispose();TEXC.delete(k);}}};
R.stats=()=>({wardrobes:REG.size,materials:MATS.size,textures:TEXC.size});

/* ---------------- animation ---------------- */
function applyAnim(root,snap){const st=root.userData.wr;
  for(const[n,a]of Object.entries(st.anim)){if(snap)a.v=a.t;const o=st.groups[n];if(!o)continue;const e=a.v<=0?0:a.v>=1?1:a.v*a.v*(3-2*a.v);
    if(a.G.type==='hinge')o.rotation.y=a.G.dir*a.G.max*e;else{const v=a.G.vec||[0,1];o.position.x=v[0]*a.G.max*e;o.position.z=v[1]*a.G.max*e;}}}
R.setOpen=function(root,which,val){const st=root.userData.wr;if(!st)return;
  const isSl=n=>/^puerta/.test(n)&&st.anim[n]&&st.anim[n].G.ax==='x';
  let names=Object.keys(st.anim).filter(n=>which==='puertas'?/^puerta/.test(n):which==='cajones'?/^cajon_\d+$/.test(n):which==='todo'?true:n===which);
  const sl=names.filter(isSl);if(sl.length>1){const keep=sl[0];names=names.filter(n=>!isSl(n)||n===keep);}
  names.forEach(n=>{if(isSl(n)){const t=val==null?(st.anim[n].t>0.5?0:1):val;if(t>0)Object.keys(st.anim).forEach(m=>{if(m!==n&&isSl(m))st.anim[m].t=0;});}});
  names.forEach(n=>{const a=st.anim[n],t=val==null?(a.t>0.5?0:1):val;a.t=t;
    if(a.G.inner!=null&&t>0){const d=doorFor(st,a.G.inner);if(d&&st.anim[d])st.anim[d].t=1;}
    if(/^puerta/.test(n)&&t===0){Object.entries(st.anim).forEach(([m,b])=>{if(b.G.inner!=null&&doorFor(st,b.G.inner)===n)b.t=0;});}});
  if(OPT.onChange)OPT.onChange();};
function doorFor(st,bay){const ds=Object.keys(st.anim).filter(n=>/^puerta/.test(n));if(!ds.length)return null;return ds.find(n=>(st.anim[n].G.bays||[]).includes(bay))||ds[0];}
R.anyOpen=function(root,which){const st=root.userData.wr;if(!st)return false;return Object.entries(st.anim).some(([n,a])=>(which==='puertas'?/^puerta/.test(n):/^cajon_\d+$/.test(n))&&a.t>0.5);};
R.groupOf=function(obj){let o=obj;while(o){if(o.userData&&o.userData.wrGroup)return o.userData.wrGroup;o=o.parent;}return null;};
R.rootOf=function(obj){let o=obj;while(o){if(o.userData&&o.userData.wr)return o;o=o.parent;}return null;};
R.toggleAt=function(obj){const r=R.rootOf(obj),g=R.groupOf(obj);if(!r||!g||g==='cuerpo')return false;let n=g;if(/^cajon_int|^bandeja/.test(n)||true)R.setOpen(r,n);return true;};
R.isOpen=function(root,n){const a=root.userData.wr.anim[n];return !!a&&a.t>0.5;};
R.tick=function(dt){let moving=false;REG.forEach(r=>{const st=r.userData.wr;let ch=false;for(const a of Object.values(st.anim)){if(a.v!==a.t){const sp=dt/0.55;a.v=a.v<a.t?Math.min(a.t,a.v+sp):Math.max(a.t,a.v-sp);ch=true;}}if(ch){applyAnim(r);moving=true;}});return moving;};

/* ---------------- mirror reflections ---------------- */
R.refreshMirror=function(root,renderer,scene){const st=root.userData.wr;if(!st||!st.mirrorMat)return;
  if(!st.cube){const rt=new T.WebGLCubeRenderTarget(256,{format:T.RGBFormat,generateMipmaps:true,minFilter:T.LinearMipmapLinearFilter,encoding:T.sRGBEncoding});st.cube=rt;st.cubeCam=new T.CubeCamera(0.05,30,rt);}
  const box=new T.Box3();st.meshes.forEach(me=>{if(me.userData.wrKey==='m:espejo')box.expandByObject(me);});if(box.isEmpty())return;
  const c=box.getCenter(new T.Vector3());c.y=Math.min(c.y,1.55);const n=new T.Vector3(0,0,1).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));c.addScaledVector(n,0.05);
  st.cubeCam.position.copy(c);const vis=root.visible;root.visible=false;st.cubeCam.update(renderer,scene);root.visible=vis;
  st.mirrorMat.envMap=st.cube.texture;st.mirrorMat.envMapIntensity=1.4;st.mirrorMat.needsUpdate=true;};

R.fits=function(cfg,space){const c=R.clean(cfg);return !space||(c.w<=space.w+1e-6&&c.d<=space.d+1e-6&&c.h<=space.h+1e-6);};

if(typeof module!=='undefined'&&module.exports)module.exports=R;else root.Wardrobes=R;
})(typeof globalThis!=='undefined'?globalThis:this);

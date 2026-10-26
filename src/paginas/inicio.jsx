import { Link, useNavigate } from 'react-router-dom'
import Icono from '../iconos.jsx'
import { useSesion } from '../sesion.jsx'
import { useCatalogo, useEdificios } from '../datos.js'
import { useVisor } from '../visor.jsx'

const CAMPOS = ['nombre', 'telefono', 'ciudad', 'rol', 'empresa']

export default function Inicio() {
  const { me, perfil, invitado } = useSesion()
  const cat = useCatalogo()
  const eds = useEdificios()
  const { abrir } = useVisor()
  const nav = useNavigate()
  const nombre = (perfil.nombre || (me && me.name) || '').split(' ')[0]
  const completo = Math.round(CAMPOS.filter(k => String(perfil[k] || '').trim()).length / CAMPOS.length * 100)

  const ir = async (id) => { nav('/visor'); await abrir(id) }

  return (
    <div className="pg">
      <header className="pg-cab">
        <p className="pg-eyebrow">Inicio</p>
        <h1>{nombre ? `Hola, ${nombre}` : 'Hola'}</h1>
        <p className="pg-desc">Elegí un edificio para recorrerlo en 3D, revisá el catálogo de muebles y acabados, o completá tu perfil.</p>
      </header>

      <section className="kpis" aria-label="Resumen">
        <Link to="/edificios" className="kpi"><span className="kpi-n">{eds ? eds.length : '–'}</span><span className="kpi-l">Edificios</span></Link>
        <Link to="/catalogo" className="kpi"><span className="kpi-n">{cat ? cat.modelos.length : '–'}</span><span className="kpi-l">Modelos 3D en catálogo</span></Link>
        <Link to="/catalogo?v=tiendas" className="kpi"><span className="kpi-n">{cat ? cat.tiendas.length : '–'}</span><span className="kpi-l">Tiendas asociadas</span></Link>
        <Link to="/perfil" className="kpi"><span className="kpi-n">{completo}%</span><span className="kpi-l">Perfil completo</span><span className="kpi-barra"><i style={{ width: completo + '%' }} /></span></Link>
      </section>

      <section className="bloque">
        <div className="bloque-cab"><h2>Edificios</h2><Link to="/edificios" className="lnk">Ver todos <Icono n="flecha" size={16} /></Link></div>
        <div className="eds">
          {(eds || []).slice(0, 3).map(e => (
            <button type="button" key={e.id} className="ed" onClick={() => ir(e.id)}>
              <span className="ed-ico"><Icono n="edificios" size={22} /></span>
              <span className="ed-txt"><b>{e.name}</b><small>{e.sub || (e.pisos ? e.pisos + ' plantas' : '')}</small></span>
              <span className="ed-ir">Abrir en 3D <Icono n="flecha" size={16} /></span>
            </button>
          ))}
          {!eds && <p className="vacio">Cargando edificios…</p>}
        </div>
      </section>

      {invitado && (
        <p className="sh-aviso">Estás como invitado: podés recorrer los edificios, pero tu perfil se guarda solo en este navegador.</p>
      )}
    </div>
  )
}

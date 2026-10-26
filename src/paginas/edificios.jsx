import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Icono from '../iconos.jsx'
import { useEdificios } from '../datos.js'
import { useVisor } from '../visor.jsx'
import { usar } from '../claude.js'

const fecha = t => t ? new Date(t).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export default function Edificios() {
  const eds = useEdificios()
  const { abrir, pulsar } = useVisor()
  const nav = useNavigate()
  const [puedeSubir, setPuedeSubir] = useState(false)

  useEffect(() => { usar('assets').then(a => setPuedeSubir(!!a)) }, [])

  const ir = async (id) => { nav('/visor'); await abrir(id) }
  const subir = async () => { nav('/visor'); await pulsar('upBtn') }

  return (
    <div className="pg">
      <header className="pg-cab fila">
        <div>
          <p className="pg-eyebrow">Mis edificios</p>
          <h1>Edificios</h1>
          <p className="pg-desc">Cada edificio se genera a partir de sus planos. Abrilo para recorrer las plantas, amoblar y elegir acabados.</p>
        </div>
        {puedeSubir && <button type="button" className="bt bt-pri" onClick={subir}><Icono n="subir" size={18} />Cargar plano</button>}
      </header>
      {!eds ? <p className="vacio">Cargando edificios…</p> : (
        <ul className="tabla">
          {eds.map(e => (
            <li key={e.id}>
              <button type="button" className="tabla-fila" onClick={() => ir(e.id)}>
                <span className="ed-ico"><Icono n="edificios" size={22} /></span>
                <span className="tabla-c t-grow"><b>{e.name}</b><small>{e.sub}</small></span>
                <span className="tabla-c t-num"><b>{e.pisos || '–'}</b><small>plantas</small></span>
                <span className="tabla-c fecha"><small>{e.base ? 'Proyecto de ejemplo' : 'Cargado el ' + fecha(e.createdAt)}</small></span>
                <span className="ed-ir">Abrir <Icono n="flecha" size={16} /></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

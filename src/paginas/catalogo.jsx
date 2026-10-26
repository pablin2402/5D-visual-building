import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Icono from '../iconos.jsx'
import { catNombre, useCatalogo } from '../datos.js'
import { useVisor } from '../visor.jsx'

const m = v => (+v).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Catalogo() {
  const cat = useCatalogo()
  const [qs, setQs] = useSearchParams()
  const vista = qs.get('v') === 'tiendas' ? 'tiendas' : 'modelos'
  const [filtro, setFiltro] = useState('')
  const [q, setQ] = useState('')
  const { pulsar } = useVisor()
  const nav = useNavigate()

  const cats = useMemo(() => cat ? [...new Set(cat.modelos.map(x => x.category))].sort((a, b) => catNombre(a).localeCompare(catNombre(b))) : [], [cat])
  const lista = useMemo(() => {
    if (!cat) return []
    const t = q.trim().toLowerCase()
    return cat.modelos.filter(x => (!filtro || x.category === filtro) && (!t || (x.name || '').toLowerCase().includes(t)))
  }, [cat, filtro, q])

  const verEnVisor = async () => { nav('/visor'); await pulsar('libBtn') }

  return (
    <div className="pg">
      <header className="pg-cab fila">
        <div>
          <p className="pg-eyebrow">Catálogo</p>
          <h1>{vista === 'tiendas' ? 'Tiendas' : 'Muebles y artefactos'}</h1>
          <p className="pg-desc">{vista === 'tiendas' ? 'Proveedores cuyos productos podés colocar en tu departamento y cotizar.' : 'Modelos 3D a escala real, listos para colocar en cualquier ambiente.'}</p>
        </div>
        <button type="button" className="bt" onClick={verEnVisor}><Icono n="visor" size={18} />Amoblar en el visor</button>
      </header>

      <div className="sh-tabs" role="tablist">
        <button role="tab" type="button" aria-selected={vista === 'modelos'} onClick={() => setQs({})}>Modelos {cat && <span>{cat.modelos.length}</span>}</button>
        <button role="tab" type="button" aria-selected={vista === 'tiendas'} onClick={() => setQs({ v: 'tiendas' })}>Tiendas {cat && <span>{cat.tiendas.length}</span>}</button>
      </div>

      {!cat ? <p className="vacio">Cargando catálogo…</p> : vista === 'modelos' ? (
        <>
          <div className="filtros">
            <label className="buscar"><Icono n="buscar" size={18} /><input type="search" placeholder="Buscar por nombre" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar modelo" /></label>
            <div className="sh-chips">
              <button type="button" className={'sh-chip' + (!filtro ? ' on' : '')} onClick={() => setFiltro('')}>Todos</button>
              {cats.map(c => <button key={c} type="button" className={'sh-chip' + (filtro === c ? ' on' : '')} onClick={() => setFiltro(c)}>{catNombre(c)}</button>)}
            </div>
          </div>
          {lista.length ? (
            <ul className="grilla">
              {lista.map(x => (
                <li key={x.id} className="prod">
                  <div className="prod-img"><img src={x.thumb} alt="" loading="lazy" /></div>
                  <div className="prod-txt">
                    <small>{catNombre(x.category)}</small>
                    <b>{x.name}</b>
                    {x.dims && <span className="prod-dims">{m(x.dims[0])} × {m(x.dims[2])} × {m(x.dims[1])} m</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="vacio">Ningún modelo coincide con la búsqueda.</p>}
        </>
      ) : (
        <ul className="tiendas">
          {cat.tiendas.map(t => (
            <li key={t.id} className="tienda">
              <div className="tienda-cab">
                <span className="ed-ico"><Icono n="tienda" size={22} /></span>
                <div><b>{t.name}</b><small>{t.tagline}</small></div>
                {t.whatsapp && <a className="bt bt-pri" href={'https://wa.me/' + t.whatsapp} target="_blank" rel="noreferrer">Escribir por WhatsApp</a>}
              </div>
              <p>{t.desc}</p>
              {t.brands && <div className="sh-chips">{t.brands.map(b => <span key={b} className="sh-chip estatico">{b}</span>)}</div>}
              {t.sucursales && (
                <ul className="sucursales">
                  {t.sucursales.map((s, i) => <li key={i}><b>{s.ciudad}</b><span>{s.direccion}</span><small>{s.telefono}</small></li>)}
                </ul>
              )}
              {t.horario && <p className="tienda-hor">{t.horario}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Icono from './iconos.jsx'
import { useSesion } from './sesion.jsx'
import { ls } from './claude.js'

const ITEMS = [
  ['/', 'inicio', 'Inicio'],
  ['/visor', 'visor', 'Visor 3D'],
  ['/edificios', 'edificios', 'Mis edificios'],
  ['/catalogo', 'catalogo', 'Catálogo'],
  ['/perfil', 'perfil', 'Perfil']
]

export default function Shell({ children }) {
  const { me, perfil, salir, invitado } = useSesion()
  const loc = useLocation()
  const enVisor = loc.pathname === '/visor'
  const [plegado, setPlegado] = useState(() => ls.get('plegado', false))
  const [abierto, setAbierto] = useState(false)
  const corto = plegado || enVisor

  useEffect(() => { setAbierto(false) }, [loc.pathname])
  useEffect(() => { ls.set('plegado', plegado) }, [plegado])

  const nombre = perfil.nombre || (me && me.name) || 'Invitado'

  return (
    <div className={'sh' + (corto ? ' sh-corto' : '') + (enVisor ? ' sh-en-visor' : '')}>
      <header className="sh-top">
        <button className="sh-icobtn" type="button" aria-label="Abrir menú" aria-expanded={abierto} onClick={() => setAbierto(v => !v)}><Icono n={abierto ? 'cerrar' : 'menu'} /></button>
        <span className="sh-marca-txt">5D Visual Building</span>
      </header>
      <nav className={'sh-nav' + (abierto ? ' sh-nav-abierto' : '')} aria-label="Menú principal">
        <div className="sh-marca">
          <span className="sh-logo" aria-hidden="true">5D</span>
          <span className="sh-marca-txt">Visual Building</span>
        </div>
        <ul className="sh-lista">
          {ITEMS.map(([to, ic, txt]) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} className={({ isActive }) => 'sh-item' + (isActive ? ' activo' : '')} title={corto ? txt : undefined}>
                <Icono n={ic} /><span className="sh-txt">{txt}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sh-pie">
          {!enVisor && (
            <button type="button" className="sh-item sh-plegar" onClick={() => setPlegado(v => !v)} title={plegado ? 'Expandir menú' : 'Contraer menú'}>
              <Icono n={plegado ? 'desplegar' : 'plegar'} /><span className="sh-txt">Contraer menú</span>
            </button>
          )}
          <NavLink to="/perfil" className="sh-yo" title={corto ? nombre : undefined}>
            <img src={me && me.avatarUrl} alt="" width="32" height="32" />
            <span className="sh-txt"><b>{nombre}</b><small>{invitado ? 'Sesión de invitado' : 'Sesión iniciada'}</small></span>
          </NavLink>
          <button type="button" className="sh-item" onClick={salir} title={corto ? 'Cerrar sesión' : undefined}>
            <Icono n="salir" /><span className="sh-txt">Cerrar sesión</span>
          </button>
        </div>
      </nav>
      {abierto && <div className="sh-velo" onClick={() => setAbierto(false)} />}
      <main className="sh-main">{children}</main>
    </div>
  )
}

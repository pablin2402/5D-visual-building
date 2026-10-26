import { useEffect, useState } from 'react'
import Icono from '../iconos.jsx'
import { ROLES, useSesion } from '../sesion.jsx'

export default function Perfil() {
  const { me, perfil, guardarPerfil, guardadoEn, invitado } = useSesion()
  const [f, setF] = useState(perfil)
  const [estado, setEstado] = useState(null)
  useEffect(() => { setF(perfil) }, [perfil])

  const cambio = k => e => { setF(v => ({ ...v, [k]: e.target.value })); setEstado(null) }
  const sucio = JSON.stringify(f) !== JSON.stringify(perfil)

  const enviar = async e => {
    e.preventDefault()
    setEstado('guardando')
    const donde = await guardarPerfil(f)
    setEstado(donde)
  }

  return (
    <div className="pg pg-estrecha">
      <header className="pg-cab">
        <p className="pg-eyebrow">Perfil</p>
        <h1>Tu perfil</h1>
        <p className="pg-desc">Estos datos se usan para tus cotizaciones y para que las tiendas puedan contactarte.</p>
      </header>

      <section className="perfil-cab">
        <img src={me && me.avatarUrl} alt="" width="72" height="72" />
        <div>
          <b>{f.nombre || (me && me.name) || 'Invitado'}</b>
          <small>{invitado ? 'Sesión de invitado' : 'Cuenta conectada'}{me && me.isOwner ? ' · Administrador' : ''}</small>
        </div>
      </section>

      <form className="sh-form" onSubmit={enviar}>
        <label className="campo"><span>Nombre completo</span><input value={f.nombre} onChange={cambio('nombre')} autoComplete="name" required /></label>
        <div className="form-2">
          <label className="campo"><span>Teléfono / WhatsApp</span><input value={f.telefono} onChange={cambio('telefono')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+591 7…" /></label>
          <label className="campo"><span>Ciudad</span><input value={f.ciudad} onChange={cambio('ciudad')} autoComplete="address-level2" /></label>
        </div>
        <fieldset className="campo">
          <legend>¿Cómo vas a usar la plataforma?</legend>
          <div className="roles">
            {ROLES.map(([v, t]) => (
              <label key={v} className={'rol' + (f.rol === v ? ' on' : '')}>
                <input type="radio" name="rol" value={v} checked={f.rol === v} onChange={cambio('rol')} />
                {f.rol === v && <Icono n="check" size={16} />}{t}
              </label>
            ))}
          </div>
        </fieldset>
        {(f.rol === 'tienda' || f.rol === 'constructora' || f.rol === 'arquitecto') && (
          <label className="campo"><span>Empresa o tienda</span><input value={f.empresa} onChange={cambio('empresa')} autoComplete="organization" /></label>
        )}
        <label className="campo"><span>Sobre vos <em>opcional</em></span><textarea rows="3" value={f.bio} onChange={cambio('bio')} placeholder="Qué departamento buscás, estilo que te gusta, presupuesto aproximado…" /></label>
        <div className="form-pie">
          <button type="submit" className="bt bt-pri" disabled={estado === 'guardando' || !sucio}>{estado === 'guardando' ? 'Guardando…' : 'Guardar cambios'}</button>
          <span className="form-msg" role="status">
            {estado === 'cuenta' && 'Guardado en tu cuenta.'}
            {estado === 'navegador' && 'Guardado solo en este navegador. Con una cuenta conectada se guarda en todos tus dispositivos.'}
            {!estado && !sucio && guardadoEn === 'cuenta' && 'Sincronizado con tu cuenta.'}
          </span>
        </div>
      </form>
    </div>
  )
}

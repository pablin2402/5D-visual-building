import { useState } from 'react'
import { useSesion } from '../sesion.jsx'

function Arte() {
  return (
    <div className="lg-arte" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="lg-iso">
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <g key={i} transform={`translate(0 ${-i * 34})`}>
            <path d="M200 300l120-60-120-60-120 60z" className="lg-losa" />
            <path d="M80 240v8l120 60v-8zM320 240v8l-120 60v-8z" className="lg-canto" />
            {[[110, 245], [200, 290], [290, 245], [200, 200]].map(([x, y], k) => <path key={k} d={`M${x} ${y - 4}v-28`} className="lg-col" />)}
          </g>
        ))}
      </svg>
      <p className="lg-lema">De un plano PDF a un edificio que se puede recorrer.</p>
    </div>
  )
}

function Supabase({ entrar }) {
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState(null)
  const [error, setError] = useState('')

  const enviar = async e => {
    e.preventDefault()
    setError('')
    setEstado('enviando')
    try { await window.SB.correo(email.trim()); setEstado('enviado') }
    catch (er) { setEstado(null); setError(/rate|seconds/i.test(er.message || '') ? 'Esperá un minuto antes de pedir otro enlace.' : 'No se pudo enviar el enlace. Revisá el correo e intentá de nuevo.') }
  }
  const google = async () => {
    setError('')
    try { await window.SB.google() } catch { setError('El acceso con Google todavía no está activado.') }
  }

  if (estado === 'enviado') {
    return (
      <>
        <p className="lg-ok" role="status">Te mandamos un enlace a <b>{email}</b>. Abrilo desde este mismo navegador para entrar.</p>
        <button type="button" className="lg-invitado" onClick={() => setEstado(null)}>Usar otro correo</button>
      </>
    )
  }

  return (
    <>
      <button type="button" className="lg-google" onClick={google}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        Continuar con Google
      </button>
      <div className="lg-sep"><span>o con tu correo</span></div>
      <form className="lg-form" onSubmit={enviar}>
        <label className="campo"><span>Correo electrónico</span>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="nombre@correo.com" />
        </label>
        <button type="submit" className="bt bt-pri lg-enviar" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar enlace de acceso'}</button>
      </form>
      <p className="lg-nota">Sin contraseñas: te llega un enlace al correo y con eso entrás.</p>
      {error && <p className="lg-error" role="alert">{error}</p>}
      <button type="button" className="lg-invitado" onClick={() => entrar(true)}>Entrar como invitado</button>
    </>
  )
}

export default function Login() {
  const { modo, estado, me, perfil, entrar } = useSesion()
  const conCuenta = me && me.id
  const nombre = perfil.nombre || (me && me.name) || ''

  return (
    <div className="lg">
      <Arte />
      <div className="lg-panel">
        <div className="lg-card">
          <span className="sh-logo grande" aria-hidden="true">5D</span>
          <h1>Iniciar sesión</h1>
          <p className="lg-sub">5D Visual Building · visor de arquitectura 3D</p>
          {estado === 'cargando' ? (
            <p className="lg-cargando" role="status">Verificando tu cuenta…</p>
          ) : modo === 'supabase' ? (
            <Supabase entrar={entrar} />
          ) : (
            <>
              {conCuenta ? (
                <>
                  <button type="button" className="lg-cuenta" onClick={() => entrar(false)}>
                    <img src={me.avatarUrl} alt="" width="44" height="44" />
                    <span><small>Continuar como</small><b>{nombre || 'tu cuenta'}</b></span>
                    <span className="lg-ir" aria-hidden="true">→</span>
                  </button>
                  <p className="lg-nota">Entrás con la cuenta con la que abriste este enlace. No hace falta contraseña: tu perfil y tus edificios quedan asociados a esa cuenta.</p>
                </>
              ) : modo === 'claude' ? (
                <p className="lg-nota">No detectamos una cuenta en este navegador. Abrí el enlace con tu sesión iniciada para guardar tu perfil, o entrá como invitado para mirar.</p>
              ) : (
                <p className="lg-nota">Las cuentas se activan cuando conectemos la base de datos. Por ahora entrá como invitado: podés recorrer los edificios y tu perfil se guarda en este navegador.</p>
              )}
              <button type="button" className="lg-invitado" onClick={() => entrar(true)}>Entrar como invitado</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

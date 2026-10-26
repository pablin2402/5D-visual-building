import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usar, ls } from './claude.js'

const Ctx = createContext(null)
export const useSesion = () => useContext(Ctx)

const VACIO = { nombre: '', telefono: '', ciudad: 'Cochabamba', rol: 'comprador', empresa: '', bio: '' }

export function SesionProvider({ children }) {
  const [estado, setEstado] = useState('cargando')
  const [me, setMe] = useState(null)
  const [perfil, setPerfil] = useState(VACIO)
  const [guardadoEn, setGuardadoEn] = useState(null)
  const [db, setDb] = useState(null)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const [user, base] = await Promise.all([usar('user'), usar('db')])
      const yo = user ? await user.me() : { id: null, name: '', avatarUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23dcd8d1'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%235e5a53'/%3E%3Cpath d='M7 36a13 11 0 0 1 26 0z' fill='%235e5a53'/%3E%3C/svg%3E", color: '#2f45a8', isOwner: false, canEdit: false }
      if (!vivo) return
      setMe(yo)
      setDb(base)
      const local = ls.get('perfil.' + (yo.id || 'invitado'))
      let p = { ...VACIO, nombre: yo.name || '', ...(local || {}) }
      if (base && yo.id) {
        try {
          const snap = await base.collection('data/users/' + yo.id).doc('perfil').get()
          if (snap.exists) { p = { ...p, ...snap.data() }; setGuardadoEn('cuenta') }
        } catch {}
      }
      if (!vivo) return
      setPerfil(p)
      const s = ls.get('sesion')
      if (window.SB && window.SB.sesion) { ls.set('sesion', yo.id); setEstado('dentro'); return }
      setEstado(s && (s === yo.id || s === 'invitado') ? 'dentro' : 'fuera')
    })()
    return () => { vivo = false }
  }, [])

  const entrar = useCallback((invitado) => {
    ls.set('sesion', invitado ? 'invitado' : me && me.id)
    setEstado('dentro')
  }, [me])

  const salir = useCallback(async () => {
    ls.del('sesion')
    if (window.SB && window.SB.sesion) { await window.SB.salir(); location.replace(location.pathname + '#/'); location.reload(); return }
    setEstado('fuera')
  }, [])

  const guardarPerfil = useCallback(async (datos) => {
    const limpio = Object.fromEntries(Object.keys(VACIO).map(k => [k, String(datos[k] ?? '').slice(0, 400)]))
    limpio.actualizado = Date.now()
    setPerfil(limpio)
    ls.set('perfil.' + ((me && me.id) || 'invitado'), limpio)
    if (db && me && me.id) {
      try { await db.collection('data/users/' + me.id).doc('perfil').set(limpio); setGuardadoEn('cuenta'); return 'cuenta' } catch {}
    }
    setGuardadoEn('navegador')
    return 'navegador'
  }, [db, me])

  const invitado = ls.get('sesion') === 'invitado' || !(me && me.id)
  const modo = window.SB ? 'supabase' : window.claude && window.claude.use ? 'claude' : 'local'
  const valor = useMemo(() => ({ modo, estado, me, perfil, guardadoEn, db, invitado, entrar, salir, guardarPerfil }),
    [modo, estado, me, perfil, guardadoEn, db, invitado, entrar, salir, guardarPerfil])
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export const ROLES = [
  ['comprador', 'Comprador'],
  ['tienda', 'Tienda / proveedor'],
  ['arquitecto', 'Arquitecto o diseñador'],
  ['constructora', 'Constructora / inmobiliaria']
]

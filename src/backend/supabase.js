import { createClient } from '@supabase/supabase-js'

const TABLA = 'docs'
const BUCKET = 'assets'

const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
const fallo = e => ({ code: /permission|policy|rls|42501/i.test((e && (e.message + e.code)) || '') ? 'invalid_argument' : 'unavailable', message: (e && e.message) || 'Error de base de datos' })

function iniciales(nombre, color) {
  const t = (nombre || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}"/><text x="20" y="25.5" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">${t}</text></svg>`
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

function colorDe(id) {
  let h = 0
  for (const c of id || 'x') h = (h * 31 + c.charCodeAt(0)) >>> 0
  return `hsl(${h % 360} 45% 42%)`
}

export async function instalar(url, key) {
  const sb = createClient(url, key, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } })
  const { data: { session } } = await sb.auth.getSession()
  const qs = new URLSearchParams(location.search)
  if (qs.has('code') || qs.has('error_description')) history.replaceState(null, '', location.pathname + (location.hash || '#/'))

  const u = session && session.user
  const uid = u ? u.id : null
  let admin = false
  if (uid) {
    const { data } = await sb.rpc('is_admin')
    admin = !!data
  }
  const meta = (u && u.user_metadata) || {}
  const nombre = meta.full_name || meta.name || (u && u.email ? u.email.split('@')[0] : '')
  const color = colorDe(uid)
  const yo = {
    id: uid,
    name: nombre,
    avatarUrl: meta.avatar_url || meta.picture || iniciales(nombre, color),
    color,
    email: (u && u.email) || null,
    isOwner: admin,
    canEdit: admin
  }

  let canal = 0
  function escuchar(filtro, fn) {
    let t = null
    const avisar = () => { clearTimeout(t); t = setTimeout(fn, 120) }
    const ch = sb.channel('d' + (++canal))
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLA, filter: filtro }, avisar)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: TABLA }, avisar)
      .subscribe()
    return () => { clearTimeout(t); sb.removeChannel(ch) }
  }

  const snapDoc = (path, fila) => ({ id: path.split('/').pop(), exists: !!fila, ref: { path }, data: () => (fila ? fila.data : undefined) })

  function doc(path) {
    const partes = path.split('/')
    const col = partes.slice(0, -1).join('/')
    const id = partes[partes.length - 1]
    const d = {
      id,
      path,
      async get() {
        const { data, error } = await sb.from(TABLA).select('data').eq('path', path).maybeSingle()
        if (error) throw fallo(error)
        return snapDoc(path, data)
      },
      async set(v) {
        const { error } = await sb.from(TABLA).upsert({ path, col, id, data: v ?? {}, updated_at: new Date().toISOString() })
        if (error) throw fallo(error)
      },
      async update(v) {
        const s = await d.get()
        await d.set({ ...(s.exists ? s.data() : {}), ...v })
      },
      async delete() {
        const { error } = await sb.from(TABLA).delete().eq('path', path)
        if (error) throw fallo(error)
      },
      onSnapshot(cb, mal) {
        const correr = () => d.get().then(cb, e => mal && mal(e))
        correr()
        return escuchar('path=eq.' + path, correr)
      }
    }
    return d
  }

  const OPS = {
    '==': (a, b) => a === b, '!=': (a, b) => a !== b, '<': (a, b) => a < b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '>=': (a, b) => a >= b,
    'in': (a, b) => b.includes(a), 'array-contains': (a, b) => Array.isArray(a) && a.includes(b)
  }

  function collection(col, q = { filtros: [], orden: null, lim: 0 }) {
    const c = {
      path: col,
      doc: id => doc(col + '/' + (id || nuevoId())),
      async add(v) { const d = doc(col + '/' + nuevoId()); await d.set(v); return d },
      where: (f, op, v) => collection(col, { ...q, filtros: [...q.filtros, [f, op, v]] }),
      orderBy: (f, dir = 'asc') => collection(col, { ...q, orden: [f, dir] }),
      limit: n => collection(col, { ...q, lim: n }),
      async get() {
        const { data, error } = await sb.from(TABLA).select('path,data').eq('col', col)
        if (error) throw fallo(error)
        let filas = data.filter(r => q.filtros.every(([f, op, v]) => (OPS[op] || OPS['=='])(r.data && r.data[f], v)))
        if (q.orden) {
          const [f, dir] = q.orden
          const s = dir === 'desc' ? -1 : 1
          filas.sort((a, b) => ((a.data[f] ?? 0) > (b.data[f] ?? 0) ? s : (a.data[f] ?? 0) < (b.data[f] ?? 0) ? -s : 0))
        }
        if (q.lim) filas = filas.slice(0, q.lim)
        const docs = filas.map(r => snapDoc(r.path, r))
        return { docs, size: docs.length, empty: !docs.length, forEach: fn => docs.forEach(fn) }
      },
      onSnapshot(cb, mal) {
        const correr = () => c.get().then(cb, e => mal && mal(e))
        correr()
        return escuchar('col=eq.' + col, correr)
      }
    }
    return c
  }

  const db = { doc, collection }

  const user = {
    me: async () => ({ ...yo }),
    id: async () => yo.id,
    name: async () => yo.name,
    email: async () => yo.email,
    avatarUrl: async () => (yo.id ? yo.avatarUrl : null),
    isOwner: async () => admin,
    canEdit: async () => admin,
    can: async n => (n === 'data.write' || n === 'assets.write' || n === 'files.write' ? admin : false),
    profiles: async ids => Object.fromEntries([].concat(ids).map(id => [id, id === yo.id ? { ...yo, isMe: true, guest: false } : { id, name: '', avatarUrl: iniciales('', colorDe(id)), color: colorDe(id), email: null, isMe: false, guest: false }])),
    search: async () => []
  }

  const base = url.replace(/\/$/, '') + '/storage/v1/object/public/' + BUCKET + '/'
  const assets = admin ? {
    async upload(blob, opts) {
      const tipo = (opts && opts.type) || blob.type || 'application/octet-stream'
      const ext = (tipo.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 5)
      const id = nuevoId() + '.' + ext
      const { error } = await sb.storage.from(BUCKET).upload(id, blob, { contentType: tipo, upsert: false })
      if (error) throw fallo(error)
      return { id, url: base + id, sizeBytes: blob.size, contentType: tipo }
    },
    async list() {
      const { data, error } = await sb.storage.from(BUCKET).list('', { limit: 1000 })
      if (error) throw fallo(error)
      return { assets: data.map(f => ({ id: f.name, url: base + f.name, sizeBytes: f.metadata && f.metadata.size, contentType: f.metadata && f.metadata.mimetype })), usage: null }
    },
    async delete(id) {
      const { error } = await sb.storage.from(BUCKET).remove([id])
      if (error) throw fallo(error)
    }
  } : null

  const api = { db, user, assets }
  window.BLOB_BASE = base
  window.claude = { use: async n => api[n] || null }
  window.SB = {
    client: sb,
    sesion: !!uid,
    admin,
    async correo(email) {
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } })
      if (error) throw error
    },
    async google() {
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } })
      if (error) throw error
    },
    async salir() { await sb.auth.signOut() }
  }
}

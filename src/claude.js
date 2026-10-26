const cache = {}

export function usar(nombre) {
  if (!cache[nombre]) {
    cache[nombre] = (async () => {
      if (!window.claude || !window.claude.use) return null
      try { return await window.claude.use(nombre) } catch { return null }
    })()
  }
  return cache[nombre]
}

export const ls = {
  get(k, d = null) { try { const v = localStorage.getItem('5dvb.' + k); return v == null ? d : JSON.parse(v) } catch { return d } },
  set(k, v) { try { localStorage.setItem('5dvb.' + k, JSON.stringify(v)) } catch {} },
  del(k) { try { localStorage.removeItem('5dvb.' + k) } catch {} }
}

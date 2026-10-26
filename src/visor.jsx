import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import markup from './visor/markup.html?raw'

const SCRIPTS = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/BufferGeometryUtils.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/geometries/RoundedBoxGeometry.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/environments/RoomEnvironment.js',
  'plan2geo.js', 'rooms.js', 'assets.js', 'materials.js', 'furniture.js', 'physics.js', 'glazing.js', 'doors.js',
  'zocalos.js', 'luces.js', 'planks.js', 'floors.js', 'calles.js', 'cortinas.js', 'techos.js', 'wardrobes.js', 'visor.js'
]

function cargar(src) {
  return new Promise((ok, mal) => {
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.onload = ok
    s.onerror = () => mal(new Error(src))
    document.body.appendChild(s)
  })
}

const Ctx = createContext(null)
export const useVisor = () => useContext(Ctx)

let arranque = null
let nodo = null
const listo = () => new Promise(r => {
  if (window.VISOR_LISTO) return r()
  window.addEventListener('visor:listo', () => r(), { once: true })
})

export function VisorProvider({ children }) {
  const [iniciado, setIniciado] = useState(false)
  const [error, setError] = useState(null)
  const iniciar = useCallback(() => setIniciado(true), [])

  const abrir = useCallback(async (id) => {
    setIniciado(true)
    await listo()
    if (id && typeof window.openProject === 'function') {
      const sel = document.getElementById('projSel')
      if (sel) sel.value = id
      await window.openProject(id)
    }
  }, [])

  const pulsar = useCallback(async (btnId) => {
    setIniciado(true)
    await listo()
    const b = document.getElementById(btnId)
    if (b && !b.hidden) { b.click(); return true }
    return false
  }, [])

  return <Ctx.Provider value={{ iniciado, iniciar, abrir, pulsar, error, setError }}>{children}</Ctx.Provider>
}

export function VisorHost({ visible }) {
  const { iniciado, error, setError } = useVisor()
  const ref = useRef(null)

  useEffect(() => {
    if (!iniciado) return
    if (!nodo) { nodo = document.createElement('div'); nodo.className = 'sh-visor-raiz'; nodo.innerHTML = markup }
    ref.current.appendChild(nodo)
    if (arranque) return
    arranque = (async () => {
      for (const s of SCRIPTS) await cargar(s)
    })().catch(e => setError('No se pudo cargar el visor (' + e.message + '). Recargá la página.'))
  }, [iniciado, setError])

  return (
    <section className="sh-visor" hidden={!visible} aria-label="Visor 3D">
      {error && <p className="sh-aviso sh-aviso-error" role="alert">{error}</p>}
      <div ref={ref} className="sh-visor-host" />
    </section>
  )
}

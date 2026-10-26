import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import './app.css'
import { SesionProvider, useSesion } from './sesion.jsx'
import { VisorHost, VisorProvider, useVisor } from './visor.jsx'
import Shell from './shell.jsx'
import Login from './paginas/login.jsx'
import Inicio from './paginas/inicio.jsx'
import Edificios from './paginas/edificios.jsx'
import Catalogo from './paginas/catalogo.jsx'
import Perfil from './paginas/perfil.jsx'

function Rutas() {
  const { estado } = useSesion()
  const loc = useLocation()
  const { iniciar } = useVisor()
  const enVisor = loc.pathname === '/visor'
  useEffect(() => { if (enVisor) iniciar() }, [enVisor, iniciar])

  if (estado !== 'dentro') return <Login />
  return (
    <Shell>
      <VisorHost visible={enVisor} />
      {!enVisor && (
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/edificios" element={<Edificios />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Shell>
  )
}

async function arrancar() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && key && !(window.claude && window.claude.use)) {
    try { const m = await import('./backend/supabase.js'); await m.instalar(url, key) } catch (e) { console.error(e) }
  }
  render()
}

const render = () => createRoot(document.getElementById('root')).render(
  <SesionProvider>
    <VisorProvider>
      <HashRouter>
        <Rutas />
      </HashRouter>
    </VisorProvider>
  </SesionProvider>
)

arrancar()

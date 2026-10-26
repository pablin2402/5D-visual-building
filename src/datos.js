import { useEffect, useState } from 'react'
import { useSesion } from './sesion.jsx'

let libro = null
export function useCatalogo() {
  const [d, setD] = useState(null)
  useEffect(() => {
    if (!libro) {
      libro = Promise.all([
        fetch('library/index.json').then(r => r.json()).catch(() => ({ models: [] })),
        fetch('library/stores.json').then(r => r.json()).catch(() => ({ stores: [] }))
      ]).then(([i, s]) => ({ modelos: i.models || [], tiendas: s.stores || [] }))
    }
    let vivo = true
    libro.then(v => { if (vivo) setD(v) })
    return () => { vivo = false }
  }, [])
  return d
}

export const BASE = { id: 'peredo', name: 'Edificio Peredo Rivas', sub: 'Zona Hipódromo · Cochabamba', pisos: 10, base: true }

export function useEdificios() {
  const { db } = useSesion()
  const [lista, setLista] = useState(null)
  useEffect(() => {
    if (!db) { setLista([BASE]); return }
    const off = db.collection('projects').onSnapshot(
      s => setLista([BASE, ...s.docs.map(d => { const v = d.data(); return { id: d.id, name: v.name || 'Sin nombre', sub: v.sub || '', pisos: (v.floors || []).length, createdAt: v.createdAt } })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))]),
      () => setLista([BASE])
    )
    return () => off && off()
  }, [db])
  return lista
}

export const CATS = {
  sofas: 'Sofás y sillones', camas: 'Camas', 'sillas-mesas': 'Mesas y sillas', banos: 'Baño', cocina: 'Cocina',
  iluminacion: 'Iluminación', armarios: 'Roperos', oficina: 'Oficina', deco: 'Decoración'
}
export const catNombre = c => CATS[c] || (c ? c[0].toUpperCase() + c.slice(1) : 'Otros')

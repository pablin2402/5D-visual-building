const P = {
  inicio: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  visor: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  edificios: 'M4 21V6l7-3v18M11 8h9v13M3 21h18M7 8v.5M7 12v.5M7 16v.5M14.5 12v.5M17 12v.5M14.5 16v.5M17 16v.5',
  catalogo: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  perfil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  salir: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  menu: 'M4 7h16M4 12h16M4 17h16',
  plegar: 'M15 6l-6 6 6 6',
  desplegar: 'M9 6l6 6-6 6',
  subir: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  tienda: 'M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  check: 'M5 12.5l4.5 4.5L19 7',
  cerrar: 'M6 6l12 12M18 6L6 18'
}

export default function Icono({ n, size = 20 }) {
  return (
    <svg className="sh-ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={P[n]} />
    </svg>
  )
}

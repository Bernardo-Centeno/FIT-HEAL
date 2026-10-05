import React from 'react'

// Íconos de línea. Heredan el color del texto (currentColor).
const FORMAS = {
  hoy: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></>),
  entrenar: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
  comida: <path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3c-2 1.5-3 4-3 7 0 2 1 3 3 3v8" />,
  progreso: <path d="M5 20v-6M12 20V6M19 20v-10M3 20.5h18" />,
  perfil: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>),
  ajustes: (<><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>),
  reloj: (<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9.5 3h5" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  mas: <path d="M12 5v14M5 12h14" />,
  cerrar: <path d="M6 6l12 12M18 6L6 18" />,
  fuego: <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
  trofeo: <path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4" />,
  ayuda: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" /></>),
  atras: <path d="M15 5l-7 7 7 7" />,
  cambiar: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
}

export default function Icono({ nombre, tam = 22 }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {FORMAS[nombre] || null}
    </svg>
  )
}

// Marca: tres discos concentrados, como las placas de una barra
export function Marca({ tam = 28 }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--rojo)" strokeWidth="4" />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="var(--azul)" strokeWidth="4" />
      <circle cx="16" cy="16" r="2.2" fill="var(--amarillo)" />
    </svg>
  )
}
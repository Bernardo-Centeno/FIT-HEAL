import React, { useEffect, useState } from 'react'
import { cargar, guardar } from './lib/storage.js'
import Hoy from './components/Hoy.jsx'
import Perfil from './components/Perfil.jsx'
import Entrenar from './components/Entrenar.jsx'
import Comida from './components/Comida.jsx'
import Progreso from './components/Progreso.jsx'
import Ajustes from './components/Ajustes.jsx'
import Onboarding from './components/Onboarding.jsx'
import Icono, { Marca } from './components/Icono.jsx'

// Nombre de la app: cambialo acá y se actualiza en toda la pantalla.
const APP_NOMBRE = 'Gym y Comida'

const TABS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'entrenar', label: 'Entrenar' },
  { id: 'comida', label: 'Comida' },
  { id: 'progreso', label: 'Progreso' },
  { id: 'perfil', label: 'Perfil' },
]

export default function App() {
  const [estado, setEstado] = useState(cargar)
  const [tab, setTab] = useState('hoy')
  const [entrada, setEntrada] = useState({})

  useEffect(() => { guardar(estado) }, [estado])

  // actualizar(fn): fn recibe el estado actual y devuelve el nuevo
  const actualizar = fn => setEstado(prev => fn(prev))

  // irA('entrenar', { dia: 2 }) abre esa pestaña y le pasa datos de entrada
  const irA = (destino, opciones = {}) => {
    setEntrada(opciones)
    setTab(destino)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }

  const nuevo = !estado.plan && !(estado.perfil.nombre || '').trim()
  if (nuevo) return <Onboarding actualizar={actualizar} />

  const props = { estado, actualizar, irA, entrada }

  return (
    <div className="app">
      <header className="top">
        <div className="marca">
          <Marca tam={26} />
          <span className="marca-nombre">{APP_NOMBRE}</span>
        </div>
        <button className={`icono-boton ${tab === 'ajustes' ? 'activa' : ''}`} onClick={() => irA('ajustes')} aria-label="Ajustes">
          <Icono nombre="ajustes" tam={22} />
        </button>
      </header>

      <main className="contenido">
        {tab === 'hoy' && <Hoy {...props} />}
        {tab === 'entrenar' && <Entrenar {...props} />}
        {tab === 'comida' && <Comida {...props} />}
        {tab === 'progreso' && <Progreso {...props} />}
        {tab === 'perfil' && <Perfil {...props} />}
        {tab === 'ajustes' && <Ajustes {...props} />}
      </main>

      <nav className="tabs" aria-label="Secciones">
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? 'activa' : ''} onClick={() => irA(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <Icono nombre={t.id === 'hoy' ? 'hoy' : t.id} tam={22} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
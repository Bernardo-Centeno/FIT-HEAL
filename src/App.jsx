import React, { useEffect, useState } from 'react'
import { cargar, guardar } from './lib/storage.js'
import Perfil from './components/Perfil.jsx'

const TABS = [
  { id: 'perfil', label: 'Perfil', icono: '👤' },
]

export default function App() {
  const [estado, setEstado] = useState(cargar)
  const [tab, setTab] = useState('perfil')

  useEffect(() => { guardar(estado) }, [estado])

  // actualizar(fn): fn recibe el estado actual y devuelve el nuevo
  const actualizar = fn => setEstado(prev => fn(prev))

  const props = { estado, actualizar, irA: setTab }

  return (
    <div className="app">
      <header className="top">
        <h1>Gym y Comida</h1>
        <span className="sub">{estado.perfil.nombre ? `Hola, ${estado.perfil.nombre}` : 'Tu entrenamiento y tu alimentación'}</span>
      </header>

      <main className="contenido">
        {tab === 'perfil' && <Perfil {...props} />}
      </main>

      <nav className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? 'activa' : ''} onClick={() => setTab(t.id)}>
            <span aria-hidden="true">{t.icono}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
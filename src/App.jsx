import React, { useEffect, useState } from 'react'
import { cargar, guardar } from './lib/storage.js'
import Perfil from './components/Perfil.jsx'
import Entrenar from './components/Entrenar.jsx'
import Comida from './components/Comida.jsx'
import Ajustes from './components/Ajustes.jsx'

const TABS = [
  { id: 'entrenar', label: 'Entrenar', icono: '🏋️' },
  { id: 'comida', label: 'Comida', icono: '🍽️' },
  { id: 'perfil', label: 'Perfil', icono: '👤' },
  { id: 'ajustes', label: 'Ajustes', icono: '⚙️' },
]

export default function App() {
  const [estado, setEstado] = useState(cargar)
  const [tab, setTab] = useState(() => (cargar().plan ? 'entrenar' : 'perfil'))

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
        {tab === 'entrenar' && <Entrenar {...props} />}
        {tab === 'comida' && <Comida {...props} />}
        {tab === 'perfil' && <Perfil {...props} />}
        {tab === 'ajustes' && <Ajustes {...props} />}
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
import React from 'react'
import { INTENSIDADES } from '../lib/plan.js'

// Elegir la intensidad de los entrenamientos. planActual: la intensidad con la que se armó el plan (para avisar si hay que renovarlo).
export default function SelectorIntensidad({ valor, onElegir, planActual }) {
  const info = INTENSIDADES[valor] || INTENSIDADES.moderada
  const desfasado = planActual && planActual !== valor
  return (
    <div className="intensidad">
      <span className="etiqueta">Intensidad</span>
      <div className="pildoras chicas" role="group" aria-label="Intensidad del entrenamiento">
        {Object.entries(INTENSIDADES).map(([id, i]) => (
          <button key={id} type="button" aria-pressed={valor === id} className={valor === id ? 'activa' : ''} onClick={() => onElegir(id)}>{i.label}</button>
        ))}
      </div>
      <p className="nota">{info.descripcion} Esfuerzo buscado: {info.esfuerzo} sobre 10.</p>
      {desfasado && <p className="aviso">Tu plan actual se armó con intensidad {INTENSIDADES[planActual] ? INTENSIDADES[planActual].label.toLowerCase() : 'moderada'}. Tocá "Plan nuevo" en Entrenar para armarlo con esta.</p>}
    </div>
  )
}
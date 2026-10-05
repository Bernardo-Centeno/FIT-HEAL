import React, { useEffect, useState } from 'react'
import Icono from './Icono.jsx'

const formato = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Temporizador de descanso fijo sobre la barra de abajo. fin: marca de tiempo en ms; total: segundos.
export default function Descanso({ fin, total, onSumar, onCerrar }) {
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 250)
    return () => clearInterval(t)
  }, [])
  const resta = Math.max(0, Math.ceil((fin - ahora) / 1000))
  const listo = resta === 0
  useEffect(() => {
    if (listo && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200])
  }, [listo])
  const avance = total > 0 ? Math.min(1, 1 - resta / total) : 1

  return (
    <div className={`descanso ${listo ? 'listo' : ''}`} role="timer" aria-live="off">
      <Icono nombre="reloj" tam={22} />
      <div className="descanso-centro">
        <span className="num">{listo ? 'Listo' : formato(resta)}</span>
        <span className="descanso-barra"><i style={{ width: `${avance * 100}%` }} /></span>
      </div>
      {!listo && <button type="button" onClick={onSumar}>+15 s</button>}
      <button type="button" className="icono-boton" onClick={onCerrar} aria-label="Cerrar temporizador"><Icono nombre="cerrar" tam={20} /></button>
    </div>
  )
}
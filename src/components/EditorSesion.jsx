import React, { useState } from 'react'

// Corregir una sesión ya guardada: pesos, repeticiones, o borrar series o la sesión entera.
export default function EditorSesion({ sesion, onGuardar, onBorrar, onCerrar }) {
  const [series, setSeries] = useState(() => sesion.series.map(s => ({ ...s, pesoKg: s.pesoKg ?? 0, reps: s.reps ?? '' })))
  const [error, setError] = useState('')

  const cambiar = (i, campo, valor) => setSeries(lista => lista.map((s, j) => (j === i ? { ...s, [campo]: valor } : s)))
  const quitar = i => setSeries(lista => lista.filter((_, j) => j !== i))

  const guardar = () => {
    if (series.length === 0) { setError('No quedó ninguna serie. Si querés eliminar la sesión, usá "Borrar sesión".'); return }
    const limpias = []
    for (const s of series) {
      const reps = Number(s.reps)
      const peso = Number(s.pesoKg) || 0
      if (!(reps > 0)) { setError('Revisá las repeticiones: tienen que ser mayores a 0.'); return }
      if (peso < 0) { setError('El peso no puede ser negativo.'); return }
      limpias.push({ ...s, reps, pesoKg: peso })
    }
    setError('')
    onGuardar({ ...sesion, series: limpias })
  }

  const borrar = () => {
    if (window.confirm('Se borra esta sesión completa. ¿Seguro?')) onBorrar()
  }

  // Para numerar las series de cada ejercicio
  const contador = {}

  return (
    <div className="cambio editor">
      <p className="nota">Corregí lo que haga falta. Los cambios actualizan tu historial y tus gráficos.</p>
      {series.map((s, i) => {
        contador[s.nombre] = (contador[s.nombre] || 0) + 1
        return (
          <div key={i} className="editor-fila">
            <strong>{s.nombre} <span className="nota">serie {contador[s.nombre]}</span></strong>
            <div className="editor-campos">
              <label>Peso (kg)
                <input type="number" inputMode="decimal" step="0.5" value={s.pesoKg} onChange={e => cambiar(i, 'pesoKg', e.target.value)} />
              </label>
              <label>Reps
                <input type="number" inputMode="numeric" value={s.reps} onChange={e => cambiar(i, 'reps', e.target.value)} />
              </label>
              <button type="button" className="icono-boton" onClick={() => quitar(i)} aria-label={`Quitar serie de ${s.nombre}`}>×</button>
            </div>
          </div>
        )
      })}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="fila">
        <button type="button" className="primario" onClick={guardar}>Guardar cambios</button>
        <button type="button" onClick={onCerrar}>Cancelar</button>
      </div>
      <button type="button" className="peligro" onClick={borrar}>Borrar sesión</button>
    </div>
  )
}
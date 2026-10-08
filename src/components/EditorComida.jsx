import React, { useState } from 'react'
import { alimentoPorId, macrosDeItems, textoCantidad } from '../lib/alimentos.js'

// Corregir una comida ya guardada: gramos por alimento, quitar alimentos, o cambiar la descripción.
export default function EditorComida({ comida, onGuardar, onCerrar }) {
  const tieneItems = Array.isArray(comida.items) && comida.items.length > 0
  const [items, setItems] = useState(() => (comida.items || []).map(i => ({ ...i })))
  const [descripcion, setDescripcion] = useState(comida.descripcion)
  const [error, setError] = useState('')

  const cambiar = (i, gramos) => setItems(l => l.map((x, j) => (j === i ? { ...x, gramos } : x)))
  const quitar = i => setItems(l => l.filter((_, j) => j !== i))

  const guardar = () => {
    if (tieneItems) {
      if (items.length === 0) { setError('No quedó ningún alimento. Si querés sacar la comida, usá "Borrar esta comida".'); return }
      const limpios = []
      for (const it of items) {
        const g = Number(it.gramos)
        if (!(g > 0)) { setError('Las cantidades tienen que ser mayores a 0.'); return }
        limpios.push({ ...it, gramos: g })
      }
      const macros = macrosDeItems(limpios)
      const desc = limpios.map(i => `${alimentoPorId(i.id).nombre.replace(/ \(.*\)$/, '')} ${textoCantidad(i.id, i.gramos)}`).join(', ')
      onGuardar({ ...comida, items: limpios, descripcion: desc, ...macros })
    } else {
      if (!descripcion.trim()) { setError('Escribí qué comiste.'); return }
      onGuardar({ ...comida, descripcion: descripcion.trim() })
    }
  }

  return (
    <div className="cambio editor">
      {tieneItems ? (
        <>
          <p className="nota">Cambiá los gramos o quitá lo que sobre. Las calorías se recalculan.</p>
          {items.map((it, i) => {
            const a = alimentoPorId(it.id)
            return (
              <div key={i} className="editor-fila">
                <strong>{a ? a.nombre : it.id}</strong>
                <div className="editor-campos">
                  <label>Gramos
                    <input type="number" inputMode="decimal" value={it.gramos} onChange={e => cambiar(i, e.target.value)} />
                  </label>
                  <button type="button" className="icono-boton" onClick={() => quitar(i)} aria-label={`Quitar ${a ? a.nombre : 'alimento'}`}>×</button>
                </div>
              </div>
            )
          })}
        </>
      ) : (
        <label>Qué comiste
          <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        </label>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="fila">
        <button type="button" className="primario" onClick={guardar}>Guardar cambios</button>
        <button type="button" onClick={onCerrar}>Cancelar</button>
      </div>
    </div>
  )
}
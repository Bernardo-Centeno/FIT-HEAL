import React, { useState } from 'react'
import { catalogo, ejercicioPropio } from '../lib/plan.js'

// Selector "Solo hoy / En todo el plan"
function Alcance({ modo, onModo, textoHoy, textoPlan }) {
  return (
    <>
      <div className="pildoras chicas" role="group" aria-label="Dónde aplicar el cambio">
        <button type="button" className={modo === 'hoy' ? 'activa' : ''} onClick={() => onModo('hoy')}>Solo hoy</button>
        <button type="button" className={modo === 'plan' ? 'activa' : ''} onClick={() => onModo('plan')}>En todo el plan</button>
      </div>
      <p className="nota">{modo === 'hoy' ? textoHoy : textoPlan}</p>
    </>
  )
}

function ListaOpciones({ titulo, lista, onElegir }) {
  if (lista.length === 0) return null
  return (
    <div className="cambio-grupo">
      <strong>{titulo}</strong>
      {lista.map(o => (
        <button key={o.id} type="button" className="opcion-ej" onClick={() => onElegir(o)}>
          <span>{o.nombre}</span>
          <span className="chip">{o.series} × {o.repsMin}-{o.repsMax}</span>
        </button>
      ))}
    </div>
  )
}

// Panel de un ejercicio del día: cambiarlo, editar series y repeticiones, o quitarlo.
// extra: ejercicio agregado solo por hoy (solo se puede quitar).
export function PanelEjercicio({ original, actual, cambiado, extra, opciones, reemplazo, modo, onModo, onCambiar, onQuitar, onEditar, onVolver }) {
  const [pestana, setPestana] = useState(extra ? 'quitar' : 'cambiar')
  const [series, setSeries] = useState(actual.series)
  const [repsMin, setRepsMin] = useState(actual.repsMin)
  const [repsMax, setRepsMax] = useState(actual.repsMax)
  const [error, setError] = useState('')

  const guardarEdicion = () => {
    const s = Number(series), a = Number(repsMin), b = Number(repsMax)
    if (!(s >= 1 && s <= 10)) { setError('Las series tienen que ser entre 1 y 10.'); return }
    if (!(a >= 1 && b >= a && b <= 100)) { setError('El mínimo de repeticiones no puede superar al máximo.'); return }
    setError('')
    onEditar({ series: s, repsMin: a, repsMax: b })
  }

  const pestanas = extra ? [['quitar', 'Quitar']] : [['cambiar', 'Cambiar'], ['editar', 'Series y reps'], ['quitar', 'Quitar']]

  return (
    <div className="cambio">
      {pestanas.length > 1 && (
        <div className="pildoras chicas" role="tablist">
          {pestanas.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={pestana === id} className={pestana === id ? 'activa' : ''} onClick={() => { setPestana(id); setError('') }}>{label}</button>
          ))}
        </div>
      )}

      {pestana === 'cambiar' && (
        <>
          <Alcance modo={modo} onModo={onModo}
            textoHoy="Solo para la sesión de hoy. Mañana vuelve el ejercicio de tu plan."
            textoPlan={`Reemplaza "${original.nombre}" en este día del plan, de acá en adelante.`} />
          {opciones.parecidos.length + opciones.sinPiernas.length === 0 && <p className="nota">No encontré más opciones para este ejercicio.</p>}
          <ListaOpciones titulo="Parecidos" lista={opciones.parecidos} onElegir={onCambiar} />
          <ListaOpciones titulo="Sin cargar las piernas" lista={opciones.sinPiernas} onElegir={onCambiar} />
          {cambiado && <button type="button" className="enlace" onClick={onVolver}>Volver a {original.nombre}</button>}
        </>
      )}

      {pestana === 'editar' && (
        <>
          <p className="nota">Cambia las series y el rango de repeticiones de "{actual.nombre}" en tu plan.</p>
          <div className="fila tres">
            <label>Series<input type="number" inputMode="numeric" value={series} onChange={e => setSeries(e.target.value)} /></label>
            <label>Reps mín.<input type="number" inputMode="numeric" value={repsMin} onChange={e => setRepsMin(e.target.value)} /></label>
            <label>Reps máx.<input type="number" inputMode="numeric" value={repsMax} onChange={e => setRepsMax(e.target.value)} /></label>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="button" className="primario" onClick={guardarEdicion}>Guardar en el plan</button>
        </>
      )}

      {pestana === 'quitar' && (
        <>
          {!extra && (
            <Alcance modo={modo} onModo={onModo}
              textoHoy="Lo salteás solo hoy. Mañana vuelve."
              textoPlan="Se saca de este día del plan, de acá en adelante." />
          )}
          {extra ? (
            <button type="button" className="peligro" onClick={() => onQuitar({ reemplazar: false })}>Quitar de hoy</button>
          ) : (
            <>
              {reemplazo && (
                <button type="button" className="opcion-ej" onClick={() => onQuitar({ reemplazar: true })}>
                  <span>Quitar y poner {reemplazo.nombre}</span>
                  <span className="chip">recomendado</span>
                </button>
              )}
              <button type="button" className="peligro" onClick={() => onQuitar({ reemplazar: false })}>Quitar sin reemplazo</button>
            </>
          )}
        </>
      )}
    </div>
  )
}

// Agregar un ejercicio al día (de la lista por zona, o uno propio)
export function PanelAgregar({ perfil, dia, modo, onModo, onAgregar }) {
  const grupos = catalogo(perfil, dia)
  const [grupo, setGrupo] = useState(grupos[0] ? grupos[0].grupo : '')
  const [propio, setPropio] = useState({ nombre: '', series: 3, repsMin: 8, repsMax: 12, corporal: false })
  const [error, setError] = useState('')
  const actual = grupos.find(g => g.grupo === grupo) || grupos[0]

  const agregarPropio = () => {
    const r = ejercicioPropio(propio, dia)
    if (r.error) { setError(r.error); return }
    setError('')
    onAgregar(r.ejercicio)
    setPropio({ nombre: '', series: 3, repsMin: 8, repsMax: 12, corporal: false })
  }

  return (
    <section className="cambio agregar">
      <h3>Agregar ejercicio</h3>
      <Alcance modo={modo} onModo={onModo}
        textoHoy="Se suma solo a la sesión de hoy. Ideal si te sobró tiempo."
        textoPlan="Se suma a este día de tu plan, de acá en adelante." />

      {grupos.length > 0 && (
        <>
          <label>Zona
            <select value={actual ? actual.grupo : ''} onChange={e => setGrupo(e.target.value)}>
              {grupos.map(g => <option key={g.grupo} value={g.grupo}>{g.grupo}</option>)}
            </select>
          </label>
          <ListaOpciones titulo="Elegí uno" lista={actual ? actual.ejercicios : []} onElegir={onAgregar} />
        </>
      )}

      <details>
        <summary>Escribir uno propio</summary>
        <div className="propio">
          <label>Nombre<input value={propio.nombre} onChange={e => setPropio(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Remo al mentón" /></label>
          <div className="fila tres">
            <label>Series<input type="number" inputMode="numeric" value={propio.series} onChange={e => setPropio(p => ({ ...p, series: e.target.value }))} /></label>
            <label>Reps mín.<input type="number" inputMode="numeric" value={propio.repsMin} onChange={e => setPropio(p => ({ ...p, repsMin: e.target.value }))} /></label>
            <label>Reps máx.<input type="number" inputMode="numeric" value={propio.repsMax} onChange={e => setPropio(p => ({ ...p, repsMax: e.target.value }))} /></label>
          </div>
          <label className="check"><input type="checkbox" checked={propio.corporal} onChange={e => setPropio(p => ({ ...p, corporal: e.target.checked }))} /> Se hace con el peso del cuerpo</label>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="button" className="primario" onClick={agregarPropio}>Agregar este ejercicio</button>
        </div>
      </details>
    </section>
  )
}
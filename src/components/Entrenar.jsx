import React, { useEffect, useMemo, useState } from 'react'
import {
  generarPlan, planVencido, sugerirProgresion, feedbackSesion, cumplimientoSemanal, diasDesde,
  alternativas, cambiosPorFatiga, esDePierna, reemplazoAutomatico, CICLOS, semanaDelPlan, fechaRenovacion,
} from '../lib/plan.js'
import { planConIA, explicarEjercicio } from '../lib/ai.js'
import { records as calcularRecords } from '../lib/metricas.js'
import Explicacion from './Explicacion.jsx'
import Descanso from './Descanso.jsx'
import EditorSesion from './EditorSesion.jsx'
import { PanelEjercicio, PanelAgregar } from './EditoresPlan.jsx'
import Icono from './Icono.jsx'
import { uid } from '../lib/storage.js'

const ICONO = { subir: '⬆️', mantener: '➡️', bajar: '⬇️', estancado: '⚠️', nuevo: '🆕' }
const PAUSAS = [60, 90, 120, 180]

// Cambios solo por hoy: { fecha, sust: { 'Día|id': ejercicio }, quitados: ['Día|id'], extras: { 'Día': [ejercicio] } }
const vacio = () => ({ sust: {}, quitados: [], extras: {} })
const vigente = h => (h && h.fecha === new Date().toDateString()
  ? { sust: { ...(h.sust || {}) }, quitados: [...(h.quitados || [])], extras: { ...(h.extras || {}) } }
  : vacio())

export default function Entrenar({ estado, actualizar, irA, entrada }) {
  const { plan, perfil, sesiones, ajustes } = estado
  const [diaIdx, setDiaIdx] = useState(() => (entrada && Number.isInteger(entrada.dia) ? entrada.dia : 0))
  const [descanso, setDescanso] = useState(null) // { fin, total } mientras corre el temporizador
  const [nuevosRecords, setNuevosRecords] = useState([])
  const [borrador, setBorrador] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [abierto, setAbierto] = useState(null) // id del ejercicio con la explicación abierta
  const [textosIA, setTextosIA] = useState({}) // explicaciones pedidas a la IA, por id
  const [cargandoIA, setCargandoIA] = useState('')
  const [panel, setPanel] = useState(null) // ejercicio con el panel de edición abierto
  const [modo, setModo] = useState('hoy') // 'hoy' | 'plan'
  const [agregando, setAgregando] = useState(false)
  const [modoAgregar, setModoAgregar] = useState('hoy')
  const [aviso, setAviso] = useState('')
  const [editandoSesion, setEditandoSesion] = useState(null)

  const dia = plan ? plan.dias[Math.min(diaIdx, plan.dias.length - 1)] : null
  const cumplimiento = cumplimientoSemanal(sesiones, perfil.diasPorSemana)

  // ---- Lo que se muestra hoy: el día del plan + los cambios de solo-hoy ----
  const ch = vigente(estado.hoyCambios)
  const clave = ej => `${dia.nombre}|${ej.id}`
  const filas = dia
    ? [
        ...dia.ejercicios
          .filter(orig => !ch.quitados.includes(clave(orig)))
          .map(orig => ({ orig, ej: ch.sust[clave(orig)] || orig, extra: false })),
        ...(ch.extras[dia.nombre] || []).map(ej => ({ orig: ej, ej, extra: true })),
      ]
    : []
  const ejerciciosHoy = filas.map(f => f.ej)
  const diaHoy = dia ? { ...dia, ejercicios: ejerciciosHoy } : null // el día tal como se entrena hoy
  const hayCambiosHoy = dia
    ? dia.ejercicios.some(ej => ch.sust[clave(ej)] || ch.quitados.includes(clave(ej))) || (ch.extras[dia.nombre] || []).length > 0
    : false
  const tienePiernas = dia ? dia.ejercicios.some(ej => esDePierna(ej, perfil)) : false

  const sugerencias = useMemo(() => {
    if (!dia) return {}
    return Object.fromEntries(ejerciciosHoy.map(ej => [ej.id, sugerirProgresion(ej, sesiones)]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia, sesiones, estado.hoyCambios, plan])

  // ---- Editar lo de hoy y editar el plan ----
  const editarHoy = fn => actualizar(e => ({ ...e, hoyCambios: { fecha: new Date().toDateString(), ...fn(vigente(e.hoyCambios)) } }))
  const editarDiaDelPlan = fn => actualizar(e => ({
    ...e,
    plan: { ...e.plan, dias: e.plan.dias.map(d => (d.nombre !== dia.nombre ? d : fn(d))) },
  }))
  const limpiarHoyDe = (v, orig) => {
    delete v.sust[clave(orig)]
    v.quitados = v.quitados.filter(k => k !== clave(orig))
    return v
  }
  const cerrarPaneles = () => { setPanel(null); setAgregando(false); setAviso('') }
  const soltarBorrador = id => setBorrador(b => { const c = { ...b }; delete c[id]; return c })

  const cambiarEjercicio = (orig, actual, nuevo) => {
    if (modo === 'plan') {
      editarHoy(v => limpiarHoyDe(v, orig))
      editarDiaDelPlan(d => ({ ...d, ejercicios: d.ejercicios.map(x => (x.id === orig.id ? nuevo : x)) }))
    } else {
      editarHoy(v => { limpiarHoyDe(v, orig); v.sust[clave(orig)] = nuevo; return v })
    }
    soltarBorrador(actual.id); cerrarPaneles()
  }

  const volverAlOriginal = (orig, actual) => {
    editarHoy(v => limpiarHoyDe(v, orig))
    soltarBorrador(actual.id); cerrarPaneles()
  }

  const quitarEjercicio = (orig, actual, { reemplazar }) => {
    const reemplazo = reemplazar ? reemplazoAutomatico(orig, perfil, diaHoy) : null
    if (modo === 'plan') {
      if (!reemplazo && dia.ejercicios.length <= 1) { setAviso('Un día no puede quedar sin ejercicios.'); return }
      editarHoy(v => limpiarHoyDe(v, orig))
      editarDiaDelPlan(d => ({
        ...d,
        ejercicios: reemplazo ? d.ejercicios.map(x => (x.id === orig.id ? reemplazo : x)) : d.ejercicios.filter(x => x.id !== orig.id),
      }))
    } else if (reemplazo) {
      editarHoy(v => { limpiarHoyDe(v, orig); v.sust[clave(orig)] = reemplazo; return v })
    } else {
      editarHoy(v => { limpiarHoyDe(v, orig); v.quitados.push(clave(orig)); return v })
    }
    soltarBorrador(actual.id); cerrarPaneles()
  }

  const quitarExtra = ej => {
    editarHoy(v => { v.extras[dia.nombre] = (v.extras[dia.nombre] || []).filter(x => x.id !== ej.id); return v })
    soltarBorrador(ej.id); cerrarPaneles()
  }

  const editarSeries = (orig, parche) => {
    editarDiaDelPlan(d => ({ ...d, ejercicios: d.ejercicios.map(x => (x.id === orig.id ? { ...x, ...parche } : x)) }))
    cerrarPaneles()
  }

  const agregarEjercicio = ej => {
    if (ejerciciosHoy.some(x => x.id === ej.id)) { setAviso('Ese ejercicio ya está en este día.'); return }
    if (modoAgregar === 'plan') {
      editarDiaDelPlan(d => ({ ...d, ejercicios: [...d.ejercicios, ej] }))
    } else {
      editarHoy(v => { v.extras[dia.nombre] = [...(v.extras[dia.nombre] || []), ej]; return v })
    }
    cerrarPaneles()
  }

  const piernasCansadas = () => {
    const cambios = cambiosPorFatiga(diaHoy, perfil)
    // solo se tocan los ejercicios que vienen del plan
    const ids = Object.keys(cambios).filter(id => dia.ejercicios.some(x => x.id === id))
    if (ids.length === 0) { setAviso('Este día no tiene ejercicios de piernas.'); return }
    editarHoy(v => {
      ids.forEach(id => {
        v.quitados = v.quitados.filter(k => k !== `${dia.nombre}|${id}`)
        v.sust[`${dia.nombre}|${id}`] = cambios[id]
      })
      return v
    })
    setBorrador({}); cerrarPaneles()
  }

  const deshacerHoy = () => {
    editarHoy(v => {
      Object.keys(v.sust).forEach(k => { if (k.startsWith(`${dia.nombre}|`)) delete v.sust[k] })
      v.quitados = v.quitados.filter(k => !k.startsWith(`${dia.nombre}|`))
      delete v.extras[dia.nombre]
      return v
    })
    setBorrador({}); cerrarPaneles()
  }

  // Si venís desde "Hoy" con las piernas cansadas, se aplica al abrir
  useEffect(() => {
    if (entrada && entrada.fatiga && dia && !hayCambiosHoy) piernasCansadas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cambiarCiclo = semanas => actualizar(e => ({ ...e, perfil: { ...e.perfil, cicloSemanas: semanas }, plan: { ...e.plan, semanasCiclo: semanas } }))

  // ---- Plan nuevo ----
  const crearPlanReglas = () => {
    actualizar(e => ({ ...e, plan: generarPlan(e.perfil), hoyCambios: null }))
    setDiaIdx(0); setBorrador({}); setFeedback(null); setNuevosRecords([]); setError(''); cerrarPaneles()
  }

  const crearPlanIA = async () => {
    setCargando(true); setError('')
    try {
      const nuevo = await planConIA({ ajustes, perfil, planActual: plan, sesiones, comidas: estado.comidas })
      actualizar(e => ({ ...e, plan: nuevo, hoyCambios: null }))
      setDiaIdx(0); setBorrador({}); setFeedback(null); cerrarPaneles()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const pedirExplicacionIA = async ej => {
    setCargandoIA(ej.id); setError('')
    try {
      const texto = await explicarEjercicio({ ajustes, perfil, ejercicio: ej })
      setTextosIA(t => ({ ...t, [ej.id]: texto }))
    } catch (err) {
      setError(err.message)
    } finally {
      setCargandoIA('')
    }
  }

  const iniciarDescanso = seg => setDescanso({ fin: Date.now() + seg * 1000, total: seg })
  const sumarDescanso = () => setDescanso(d => (d ? { fin: d.fin + 15000, total: d.total + 15 } : d))

  const campo = (ej, parte, valor, i) => {
    setBorrador(b => {
      const actual = b[ej.id] || { peso: '', reps: [], rpe: '' }
      if (parte === 'reps') {
        const reps = [...actual.reps]
        reps[i] = valor
        return { ...b, [ej.id]: { ...actual, reps } }
      }
      return { ...b, [ej.id]: { ...actual, [parte]: valor } }
    })
  }

  const pesoMostrado = ej => {
    const b = borrador[ej.id]
    if (b && b.peso !== '') return b.peso
    const s = sugerencias[ej.id]
    return s && s.pesoSugerido ? s.pesoSugerido : (ej.pesoKg || '')
  }

  const guardarSesion = () => {
    const series = []
    ejerciciosHoy.forEach(ej => {
      const b = borrador[ej.id]
      if (!b) return
      const peso = ej.corporal ? Number(b.peso) || 0 : Number(pesoMostrado(ej)) || 0
      for (let i = 0; i < ej.series; i++) {
        const reps = Number(b.reps[i])
        if (reps > 0) series.push({ ejercicioId: ej.id, nombre: ej.nombre, pesoKg: peso, reps, rpe: Number(b.rpe) || null })
      }
    })
    if (series.length === 0) { setError('Anotá al menos una serie antes de guardar.'); return }
    setError('')
    const sesion = { id: uid(), fecha: new Date().toISOString(), diaNombre: dia.nombre, series }
    const todas = [...sesiones, sesion]
    const fb = feedbackSesion(plan, sesion, todas, ejerciciosHoy)
    setNuevosRecords(calcularRecords(sesiones, sesion))
    setDescanso(null)
    actualizar(e => ({
      ...e,
      sesiones: todas,
      // el peso de partida de la próxima vez queda en el plan
      plan: {
        ...e.plan,
        dias: e.plan.dias.map(d => d.nombre !== dia.nombre ? d : {
          ...d,
          ejercicios: d.ejercicios.map(ej => {
            const f = fb.find(x => x.ejercicio === ej.nombre)
            return f && f.pesoSugerido ? { ...ej, pesoKg: f.pesoSugerido } : ej
          }),
        }),
      },
    }))
    setFeedback(fb)
    setBorrador({})
  }

  const guardarSesionEditada = nueva => {
    actualizar(e => ({ ...e, sesiones: e.sesiones.map(s => (s.id === nueva.id ? nueva : s)) }))
    setEditandoSesion(null)
  }
  const borrarSesion = id => {
    actualizar(e => ({ ...e, sesiones: e.sesiones.filter(s => s.id !== id) }))
    setEditandoSesion(null)
  }

  const vencido = planVencido(plan)

  if (!plan) {
    return (
      <div className="pantalla">
        <section className="card destacada">
          <h2>Todavía no tenés plan</h2>
          <p>Armo un plan según tu perfil ({perfil.diasPorSemana} días por semana, {perfil.equipamiento === 'casa' ? 'en casa' : 'en gimnasio'}, objetivo: {perfil.objetivo}).</p>
          <button className="primario" onClick={crearPlanReglas}>Crear mi plan</button>
          <button onClick={crearPlanIA} disabled={!ajustes.apiKey || cargando}>
            {cargando ? 'Pensando…' : 'Crear con IA'}
          </button>
          {!ajustes.apiKey && <p className="nota">Para usar la IA pegá tu clave en <a href="#ajustes" onClick={e => { e.preventDefault(); irA('ajustes') }}>Ajustes</a>.</p>}
          {error && <p className="error">{error}</p>}
          <p className="nota">Si todavía no cargaste tus datos, hacelo primero en <a href="#perfil" onClick={e => { e.preventDefault(); irA('perfil') }}>Perfil</a>.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="pantalla">
      <section className="card">
        <div className="fila-sb">
          <strong>Esta semana: {cumplimiento.hechas} de {cumplimiento.objetivo} sesiones</strong>
          <span className="chip">{plan.origen === 'ia' ? 'Plan con IA' : 'Plan por reglas'}</span>
        </div>
        <progress max={cumplimiento.objetivo} value={Math.min(cumplimiento.hechas, cumplimiento.objetivo)} />
        {plan.nota && <p className="nota">{plan.nota}</p>}
        {vencido && (
          <p className="aviso">Hace {diasDesde(plan.creadoEl)} días que armaste este plan. Ya toca renovarlo según tu progreso.</p>
        )}
        <label>Renovar el plan
          <select value={plan.semanasCiclo || 6} onChange={e => cambiarCiclo(Number(e.target.value))}>
            {(CICLOS.some(c => c.semanas === (plan.semanasCiclo || 6)) ? CICLOS : [...CICLOS, { semanas: plan.semanasCiclo, label: `Cada ${plan.semanasCiclo} semanas` }]).map(c => (
              <option key={c.semanas} value={c.semanas}>{c.label}</option>
            ))}
          </select>
        </label>
        <p className="nota">Vas por la semana {semanaDelPlan(plan)} de {plan.semanasCiclo || 6}. Se renueva el {fechaRenovacion(plan).toLocaleDateString('es-AR')}.</p>
        <div className="fila">
          <button onClick={crearPlanReglas}>Plan nuevo (reglas)</button>
          <button onClick={crearPlanIA} disabled={!ajustes.apiKey || cargando}>{cargando ? 'Pensando…' : 'Plan nuevo (IA)'}</button>
        </div>
        {!ajustes.apiKey && <p className="nota">La opción con IA necesita tu clave en Ajustes.</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <div className="pildoras">
        {plan.dias.map((d, i) => (
          <button key={i} className={i === diaIdx ? 'activa' : ''} onClick={() => { setDiaIdx(i); setFeedback(null); setNuevosRecords([]); setBorrador({}); cerrarPaneles() }}>{d.nombre}</button>
        ))}
      </div>

      <div className="pausas">
        <span><Icono nombre="reloj" tam={18} /> Descanso entre series</span>
        <div className="pildoras chicas">
          {PAUSAS.map(seg => <button key={seg} type="button" onClick={() => iniciarDescanso(seg)}>{seg >= 120 ? `${seg / 60} min` : `${seg} s`}</button>)}
        </div>
      </div>

      {tienePiernas && !hayCambiosHoy && (
        <section className="fatiga">
          <div>
            <strong>¿Piernas cansadas?</strong>
            <p className="nota">Si jugaste, corriste o entrenaste fuerte ayer, cambio los ejercicios de piernas de hoy por otros que no las carguen. El plan no se modifica.</p>
          </div>
          <button type="button" onClick={piernasCansadas}>Cambiar ejercicios de piernas</button>
        </section>
      )}
      {hayCambiosHoy && (
        <section className="fatiga activa">
          <p>Hoy cambiaste ejercicios solo para esta sesión. Mañana vuelve todo como en tu plan.</p>
          <button type="button" onClick={deshacerHoy}>Volver al plan original</button>
        </section>
      )}
      {aviso && <p className="aviso" role="status">{aviso}</p>}

      {filas.length === 0 && <p className="nota centro">No queda ningún ejercicio hoy. Agregá uno abajo o volvé al plan original.</p>}

      {filas.map(({ orig, ej, extra }, n) => {
        const cambiado = !extra && ej.id !== orig.id
        const s = sugerencias[ej.id]
        const b = borrador[ej.id] || { peso: '', reps: [], rpe: '' }
        const unidad = ej.unidad === 'seg' ? 'seg' : 'reps'
        const idPanel = extra ? `extra:${ej.id}` : orig.id
        return (
          <section key={ej.id} className="ejercicio">
            <div className="ej-cabecera">
              <span className="ej-num" aria-hidden="true">{n + 1}</span>
              <div className="ej-titulo">
                <h3>{ej.nombre}</h3>
                <span className="chip">{ej.series} × {ej.repsMin}-{ej.repsMax} {unidad}{cambiado || extra ? ' · solo hoy' : ''}</span>
              </div>
            </div>
            <div className="ej-acciones">
              <button className="enlace" onClick={() => setAbierto(abierto === ej.id ? null : ej.id)}>
                <Icono nombre="ayuda" tam={16} /> {abierto === ej.id ? 'Ocultar explicación' : 'Cómo se hace'}
              </button>
              <button className="enlace" onClick={() => { setPanel(panel === idPanel ? null : idPanel); setModo('hoy'); setAgregando(false); setAviso('') }}>
                <Icono nombre="cambiar" tam={16} /> {panel === idPanel ? 'Cerrar' : 'Editar ejercicio'}
              </button>
            </div>
            {panel === idPanel && (
              <PanelEjercicio
                key={ej.id}
                original={orig}
                actual={ej}
                cambiado={cambiado}
                extra={extra}
                opciones={alternativas(ej, perfil, diaHoy)}
                reemplazo={extra ? null : reemplazoAutomatico(orig, perfil, diaHoy)}
                modo={modo}
                onModo={setModo}
                onCambiar={nuevo => cambiarEjercicio(orig, ej, nuevo)}
                onQuitar={opc => (extra ? quitarExtra(ej) : quitarEjercicio(orig, ej, opc))}
                onEditar={parche => editarSeries(orig, parche)}
                onVolver={() => volverAlOriginal(orig, ej)}
              />
            )}
            {abierto === ej.id && (
              <Explicacion ej={ej} texto={textosIA[ej.id]} cargando={cargandoIA === ej.id} tieneIA={!!ajustes.apiKey} onPedirIA={() => pedirExplicacionIA(ej)} />
            )}
            {s && <p className={`sugerencia ${s.accion}`}>{ICONO[s.accion]} {s.mensaje}</p>}
            {!ej.corporal && (
              <label>Peso (kg)
                <input type="number" inputMode="decimal" step="0.5" value={pesoMostrado(ej)} onChange={ev => campo(ej, 'peso', ev.target.value)} />
              </label>
            )}
            <div className="series">
              {Array.from({ length: ej.series }).map((_, i) => (
                <label key={i}>Serie {i + 1}
                  <input type="number" inputMode="numeric" placeholder={unidad} value={b.reps[i] ?? ''} onChange={ev => campo(ej, 'reps', ev.target.value, i)} />
                </label>
              ))}
            </div>
            <label>Esfuerzo (1 fácil – 10 al límite)
              <input type="number" inputMode="decimal" min="1" max="10" step="0.5" value={b.rpe} onChange={ev => campo(ej, 'rpe', ev.target.value)} />
            </label>
          </section>
        )
      })}

      <button type="button" className="agregar-boton" onClick={() => { setAgregando(a => !a); setPanel(null); setModoAgregar('hoy'); setAviso('') }}>
        <Icono nombre="mas" tam={18} /> {agregando ? 'Cerrar' : 'Agregar ejercicio'}
      </button>
      {agregando && <PanelAgregar perfil={perfil} dia={diaHoy} modo={modoAgregar} onModo={setModoAgregar} onAgregar={agregarEjercicio} />}

      {error && <p className="error">{error}</p>}
      <button className="primario grande" onClick={guardarSesion}>Guardar sesión</button>

      {nuevosRecords.length > 0 && (
        <section className="records" role="status">
          <Icono nombre="trofeo" tam={26} />
          <div>
            <h2>{nuevosRecords.length === 1 ? 'Récord nuevo' : `${nuevosRecords.length} récords nuevos`}</h2>
            {nuevosRecords.map((r, i) => <p key={i}>{r.ejercicio}: {r.valor} {r.unidad === 'kg' ? 'kg de fuerza estimada' : 'repeticiones'}</p>)}
          </div>
        </section>
      )}

      {feedback && (
        <section className="card destacada">
          <h2>Cómo te fue</h2>
          {feedback.length === 0 && <p>Sin datos para evaluar.</p>}
          {feedback.map((f, i) => (
            <p key={i} className={`sugerencia ${f.accion}`}><strong>{f.ejercicio}:</strong> {ICONO[f.accion]} {f.mensaje}</p>
          ))}
        </section>
      )}

      {sesiones.length > 0 && (
        <section className="card">
          <h2>Últimas sesiones</h2>
          {[...sesiones].reverse().slice(0, 5).map(s => (
            <details key={s.id}>
              <summary>{new Date(s.fecha).toLocaleDateString('es-AR')} · {s.diaNombre}</summary>
              {editandoSesion === s.id ? (
                <EditorSesion sesion={s} onGuardar={guardarSesionEditada} onBorrar={() => borrarSesion(s.id)} onCerrar={() => setEditandoSesion(null)} />
              ) : (
                <>
                  <ul>
                    {s.series.map((x, i) => <li key={i}>{x.nombre}: {x.pesoKg ? `${x.pesoKg} kg × ` : ''}{x.reps}</li>)}
                  </ul>
                  <button className="enlace" onClick={() => setEditandoSesion(s.id)}>Editar sesión</button>
                </>
              )}
            </details>
          ))}
        </section>
      )}

      {descanso && <Descanso fin={descanso.fin} total={descanso.total} onSumar={sumarDescanso} onCerrar={() => setDescanso(null)} />}
    </div>
  )
}
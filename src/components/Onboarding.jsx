import React, { useState } from 'react'
import { estadoInicial } from '../lib/storage.js'
import { generarPlan, objetivosNutricion } from '../lib/plan.js'
import { Marca } from './Icono.jsx'

const OBJETIVOS = [
  { id: 'masa', titulo: 'Ganar músculo', desc: 'Más volumen y más comida' },
  { id: 'fuerza', titulo: 'Ganar fuerza', desc: 'Levantar cada vez más pesado' },
  { id: 'grasa', titulo: 'Bajar grasa', desc: 'Déficit moderado, sin perder músculo' },
  { id: 'salud', titulo: 'Estar en forma', desc: 'Moverme bien y comer mejor' },
]
const NIVELES = [
  { id: 'principiante', titulo: 'Recién empiezo', desc: 'Menos de 6 meses entrenando' },
  { id: 'intermedio', titulo: 'Ya tengo base', desc: 'Entre 6 meses y 2 años' },
  { id: 'avanzado', titulo: 'Entreno hace años', desc: 'Más de 2 años con constancia' },
]
const SITIOS = [
  { id: 'gimnasio', titulo: 'En el gimnasio', desc: 'Máquinas, barras y mancuernas' },
  { id: 'casa', titulo: 'En casa', desc: 'Peso corporal y poco material' },
]
const DEPORTES = ['Fútbol', 'Rugby', 'Pádel', 'Tenis', 'Running', 'Ciclismo', 'Básquet', 'Esquí']
const PRESUPUESTOS = [
  { id: 'bajo', titulo: 'Ajustado' },
  { id: 'medio', titulo: 'Normal' },
  { id: 'alto', titulo: 'Sin límite' },
]
const MINUTOS = [15, 30, 45, 60]
const PASOS = 6

function Opciones({ lista, valor, onElegir, una }) {
  return (
    <div className={`opciones ${una ? 'c1' : ''}`}>
      {lista.map(o => (
        <button key={o.id} type="button" className={`opcion ${valor === o.id ? 'activa' : ''}`} onClick={() => onElegir(o.id)} aria-pressed={valor === o.id}>
          <strong>{o.titulo}</strong>
          {o.desc && <span>{o.desc}</span>}
        </button>
      ))}
    </div>
  )
}

export default function Onboarding({ actualizar }) {
  const [paso, setPaso] = useState(0)
  const [p, setP] = useState({ ...estadoInicial.perfil, nombre: '', diasPorSemana: 3, deporte: '' })
  const [error, setError] = useState('')

  const poner = (campo, valor) => { setP(x => ({ ...x, [campo]: valor })); setError('') }
  const num = campo => ev => poner(campo, ev.target.value === '' ? '' : Number(ev.target.value))

  const validar = () => {
    if (paso === 0 && !p.nombre.trim()) return 'Escribí cómo te llamás.'
    if (paso === 1) {
      if (!(p.edad >= 14 && p.edad <= 90)) return 'Revisá la edad (entre 14 y 90).'
      if (!(p.pesoKg >= 30 && p.pesoKg <= 250)) return 'Revisá el peso en kilos.'
      if (!(p.alturaCm >= 120 && p.alturaCm <= 230)) return 'Revisá la altura en centímetros.'
    }
    return ''
  }

  const siguiente = () => {
    const e = validar()
    if (e) { setError(e); return }
    if (paso < PASOS - 1) { setPaso(paso + 1); return }
    const perfil = { ...p, nombre: p.nombre.trim(), deporte: p.deporte.trim() }
    actualizar(est => ({ ...est, perfil, plan: generarPlan(perfil) }))
  }

  const metas = paso === PASOS - 1 ? objetivosNutricion(p, 'entreno') : null

  return (
    <div className="onb">
      <div className="onb-cabecera">
        <Marca tam={30} />
        <div className="onb-prog" role="progressbar" aria-valuemin={1} aria-valuemax={PASOS} aria-valuenow={paso + 1} aria-label={`Paso ${paso + 1} de ${PASOS}`}>
          {Array.from({ length: PASOS }).map((_, i) => <span key={i} className={i <= paso ? 'hecho' : ''} />)}
        </div>
      </div>

      <div className="onb-cuerpo">
        {paso === 0 && (
          <>
            <h1>Armemos tu plan</h1>
            <p className="onb-sub">Son 6 preguntas rápidas. Con tus respuestas te armo la rutina y las metas de comida.</p>
            <label>¿Cómo te llamás?
              <input value={p.nombre} onChange={e => poner('nombre', e.target.value)} placeholder="Tu nombre" autoComplete="given-name" autoFocus />
            </label>
          </>
        )}

        {paso === 1 && (
          <>
            <h1>Tu cuerpo hoy</h1>
            <p className="onb-sub">Sirve para calcular cuánto necesitás comer y con qué peso arrancar.</p>
            <Opciones lista={[{ id: 'masculino', titulo: 'Masculino' }, { id: 'femenino', titulo: 'Femenino' }]} valor={p.sexo} onElegir={v => poner('sexo', v)} />
            <div className="fila tres">
              <label>Edad
                <input type="number" inputMode="numeric" value={p.edad} onChange={num('edad')} />
              </label>
              <label>Peso (kg)
                <input type="number" inputMode="decimal" value={p.pesoKg} onChange={num('pesoKg')} />
              </label>
              <label>Altura (cm)
                <input type="number" inputMode="numeric" value={p.alturaCm} onChange={num('alturaCm')} />
              </label>
            </div>
          </>
        )}

        {paso === 2 && (
          <>
            <h1>¿Qué querés lograr?</h1>
            <p className="onb-sub">Elegí lo principal. Se puede cambiar cuando quieras.</p>
            <Opciones una lista={OBJETIVOS} valor={p.objetivo} onElegir={v => poner('objetivo', v)} />
          </>
        )}

        {paso === 3 && (
          <>
            <h1>Cómo entrenás</h1>
            <Opciones una lista={NIVELES} valor={p.nivel} onElegir={v => poner('nivel', v)} />
            <Opciones una lista={SITIOS} valor={p.equipamiento} onElegir={v => poner('equipamiento', v)} />
            <div>
              <p className="onb-etiqueta">Días por semana</p>
              <div className="pildoras">
                {[2, 3, 4, 5, 6].map(n => (
                  <button key={n} type="button" className={p.diasPorSemana === n ? 'activa' : ''} onClick={() => poner('diasPorSemana', n)}>{n}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {paso === 4 && (
          <>
            <h1>¿Hacés algún deporte?</h1>
            <p className="onb-sub">Si jugás o corrés, cuido las piernas los días cercanos y ajusto las comidas.</p>
            <div className="pildoras envuelta">
              <button type="button" className={p.deporte === '' ? 'activa' : ''} onClick={() => poner('deporte', '')}>Ninguno</button>
              {DEPORTES.map(d => (
                <button key={d} type="button" className={p.deporte === d ? 'activa' : ''} onClick={() => poner('deporte', d)}>{d}</button>
              ))}
            </div>
            <label>Otro deporte
              <input value={DEPORTES.includes(p.deporte) ? '' : p.deporte} onChange={e => poner('deporte', e.target.value)} placeholder="Escribilo acá" />
            </label>
            {p.deporte.trim() !== '' && (
              <div>
                <p className="onb-etiqueta">Días por semana que lo hacés</p>
                <div className="pildoras">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" className={p.deporteDias === n ? 'activa' : ''} onClick={() => poner('deporteDias', n)}>{n}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {paso === 5 && (
          <>
            <h1>Tu comida</h1>
            <p className="onb-sub">Con esto filtro las recetas que te sugiero.</p>
            <label>Qué no comés
              <input value={p.noComo} onChange={e => poner('noComo', e.target.value)} placeholder="Ej: pescado, hígado" />
            </label>
            <label>Alergias o intolerancias
              <input value={p.alergias} onChange={e => poner('alergias', e.target.value)} placeholder="Ej: lactosa, maní" />
            </label>
            <div>
              <p className="onb-etiqueta">Presupuesto para comida</p>
              <Opciones lista={PRESUPUESTOS} valor={p.presupuesto} onElegir={v => poner('presupuesto', v)} />
            </div>
            <div>
              <p className="onb-etiqueta">Tiempo para cocinar</p>
              <div className="pildoras">
                {MINUTOS.map(m => (
                  <button key={m} type="button" className={p.minutosParaCocinar === m ? 'activa' : ''} onClick={() => poner('minutosParaCocinar', m)}>{m} min</button>
                ))}
              </div>
            </div>
            {metas && <p className="nota">Con estos datos tu meta ronda las {metas.kcal} kcal y {metas.proteinaG} g de proteína por día.</p>}
          </>
        )}

        {error && <p className="error" role="alert">{error}</p>}
      </div>

      <div className="onb-pie">
        {paso > 0 && <button type="button" onClick={() => { setPaso(paso - 1); setError('') }}>Atrás</button>}
        <button type="button" className="primario grande" onClick={siguiente}>{paso === PASOS - 1 ? 'Armar mi plan' : 'Siguiente'}</button>
      </div>
    </div>
  )
}
import React from 'react'
import { objetivosNutricion } from '../lib/plan.js'

export default function Perfil({ estado, actualizar, irA }) {
  const p = estado.perfil
  const set = (campo, valor) => actualizar(e => ({ ...e, perfil: { ...e.perfil, [campo]: valor } }))
  const num = campo => ev => set(campo, ev.target.value === '' ? '' : Number(ev.target.value))
  const txt = campo => ev => set(campo, ev.target.value)

  const entreno = objetivosNutricion(p, true)
  const descanso = objetivosNutricion(p, false)

  return (
    <div className="pantalla">
      <section className="card">
        <h2>Sobre vos</h2>
        <label>Nombre<input value={p.nombre} onChange={txt('nombre')} /></label>
        <div className="fila">
          <label>Sexo
            <select value={p.sexo} onChange={txt('sexo')}>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </label>
          <label>Edad<input type="number" inputMode="numeric" value={p.edad} onChange={num('edad')} /></label>
        </div>
        <div className="fila">
          <label>Peso (kg)<input type="number" inputMode="decimal" value={p.pesoKg} onChange={num('pesoKg')} /></label>
          <label>Altura (cm)<input type="number" inputMode="numeric" value={p.alturaCm} onChange={num('alturaCm')} /></label>
        </div>
      </section>

      <section className="card">
        <h2>Entrenamiento</h2>
        <label>Objetivo
          <select value={p.objetivo} onChange={txt('objetivo')}>
            <option value="masa">Ganar masa muscular</option>
            <option value="fuerza">Ganar fuerza</option>
            <option value="grasa">Bajar grasa</option>
            <option value="salud">Salud general</option>
          </select>
        </label>
        <div className="fila">
          <label>Nivel
            <select value={p.nivel} onChange={txt('nivel')}>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </label>
          <label>Días por semana
            <select value={p.diasPorSemana} onChange={num('diasPorSemana')}>
              {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <label>Dónde entrenás
          <select value={p.equipamiento} onChange={txt('equipamiento')}>
            <option value="gimnasio">Gimnasio</option>
            <option value="casa">En casa (mancuernas y peso corporal)</option>
          </select>
        </label>
        <label>Lesiones o limitaciones
          <textarea rows={2} value={p.lesiones} onChange={txt('lesiones')} placeholder="Ej: molestia en el hombro derecho" />
        </label>
      </section>

      <section className="card">
        <h2>Tu día a día y la comida</h2>
        <label>Horarios y rutina
          <textarea rows={2} value={p.horarios} onChange={txt('horarios')} placeholder="Ej: trabajo de 9 a 18, entreno a las 19, ceno tarde" />
        </label>
        <label>Cosas que no comés
          <input value={p.noComo} onChange={txt('noComo')} placeholder="Ej: pescado, hígado" />
        </label>
        <label>Alergias o intolerancias
          <input value={p.alergias} onChange={txt('alergias')} />
        </label>
        <div className="fila">
          <label>Presupuesto
            <select value={p.presupuesto} onChange={txt('presupuesto')}>
              <option value="bajo">Bajo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
            </select>
          </label>
          <label>Min. para cocinar
            <input type="number" inputMode="numeric" value={p.minutosParaCocinar} onChange={num('minutosParaCocinar')} />
          </label>
        </div>
      </section>

      <section className="card destacada">
        <h2>Tus metas de nutrición (estimadas)</h2>
        <table className="tabla">
          <thead><tr><th></th><th>Entreno</th><th>Descanso</th></tr></thead>
          <tbody>
            <tr><td>Calorías</td><td>{entreno.kcal}</td><td>{descanso.kcal}</td></tr>
            <tr><td>Proteína (g)</td><td>{entreno.proteinaG}</td><td>{descanso.proteinaG}</td></tr>
            <tr><td>Carbohidratos (g)</td><td>{entreno.carbosG}</td><td>{descanso.carbosG}</td></tr>
            <tr><td>Grasas (g)</td><td>{entreno.grasasG}</td><td>{descanso.grasasG}</td></tr>
          </tbody>
        </table>
        <p className="nota">Son valores orientativos para una persona adulta sana. No reemplazan a un nutricionista, sobre todo si tenés alguna condición médica.</p>
        <button className="primario" onClick={() => irA('entrenar')}>Ir a entrenar</button>
      </section>
    </div>
  )
}
import React, { useState } from 'react'
import { objetivosNutricion } from '../lib/plan.js'
import { sesionesPorSemana, kcalPorDia, ejerciciosConHistorial, serieFuerza, rachaSemanas } from '../lib/metricas.js'
import { Barras, Linea } from './Graficos.jsx'
import Icono from './Icono.jsx'

export default function Progreso({ estado, irA }) {
  const { perfil, sesiones, comidas } = estado
  const ejercicios = ejerciciosConHistorial(sesiones)
  const [elegido, setElegido] = useState('')
  const idActual = ejercicios.some(e => e.id === elegido) ? elegido : (ejercicios[0] && ejercicios[0].id)
  const fuerza = idActual ? serieFuerza(sesiones, idActual) : null
  const semanas = sesionesPorSemana(sesiones, 8)
  const total = sesiones.length
  const racha = rachaSemanas(sesiones, perfil.diasPorSemana)
  const kcal = kcalPorDia(comidas, 7)
  const hayComida = kcal.some(d => d.valor > 0)
  const metaKcal = objetivosNutricion(perfil, 'descanso').kcal

  if (total === 0 && !hayComida) {
    return (
      <div className="pantalla">
        <section className="vacio">
          <Icono nombre="progreso" tam={40} />
          <h2>Acá vas a ver cómo avanzás</h2>
          <p>Guardá tu primera sesión o anotá una comida y empiezan a aparecer los gráficos.</p>
          <button className="primario" onClick={() => irA('entrenar')}>Ir a entrenar</button>
        </section>
      </div>
    )
  }

  return (
    <div className="pantalla">
      <section className="cifras">
        <div><span className="num">{total}</span><span>sesiones en total</span></div>
        <div><span className="num">{racha}</span><span>{racha === 1 ? 'semana' : 'semanas'} seguidas</span></div>
      </section>

      <section className="card">
        <h2>Sesiones por semana</h2>
        <Barras datos={semanas} meta={Number(perfil.diasPorSemana) || undefined} titulo="Sesiones por semana en las últimas 8 semanas" />
        <p className="nota">La línea punteada es tu objetivo de {perfil.diasPorSemana} por semana.</p>
      </section>

      <section className="card">
        <h2>Fuerza por ejercicio</h2>
        {ejercicios.length === 0 ? (
          <p className="nota">Todavía no hay series guardadas.</p>
        ) : (
          <>
            <label>Ejercicio
              <select value={idActual} onChange={e => setElegido(e.target.value)}>
                {ejercicios.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.veces} {e.veces === 1 ? 'sesión' : 'sesiones'})</option>)}
              </select>
            </label>
            {fuerza.puntos.length > 0 && <Linea puntos={fuerza.puntos} unidad={fuerza.unidad === 'kg' ? 'kg' : 'reps'} titulo="Evolución del ejercicio elegido" />}
            <p className="nota">{fuerza.unidad === 'kg' ? 'Es tu fuerza estimada: combina el peso y las repeticiones de tu mejor serie, así se compara aunque cambies las reps.' : 'Es tu mejor serie de repeticiones en cada sesión.'}</p>
          </>
        )}
      </section>

      {hayComida && (
        <section className="card">
          <h2>Calorías de los últimos 7 días</h2>
          <Barras datos={kcal} meta={metaKcal} titulo="Calorías anotadas por día" />
          <p className="nota">Cuenta solo lo que anotaste con cantidades. La línea es tu meta de {metaKcal} kcal.</p>
        </section>
      )}
    </div>
  )
}
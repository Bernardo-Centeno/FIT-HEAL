// Cálculos para las pantallas "Hoy" y "Progreso": semana, racha, series para gráficos y récords.
import { e1rm } from './plan.js'

const empezarDia = f => { const d = new Date(f); d.setHours(0, 0, 0, 0); return d }
const mismoDia = (a, b) => empezarDia(a).getTime() === empezarDia(b).getTime()
const sumarDias = (f, n) => { const d = new Date(f); d.setDate(d.getDate() + n); return d }

export const lunesDe = f => { const d = empezarDia(f); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d }

function sesionesEntre(sesiones, ini, fin) {
  return sesiones.filter(s => { const t = new Date(s.fecha).getTime(); return t >= ini.getTime() && t < fin.getTime() }).length
}

// Qué día del plan toca: el siguiente al de la última sesión (da la vuelta al llegar al final)
export function proximoDia(plan, sesiones) {
  if (!plan || !plan.dias || plan.dias.length === 0) return null
  const ultima = [...(sesiones || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
  let indice = 0
  if (ultima) {
    const i = plan.dias.findIndex(d => d.nombre === ultima.diaNombre)
    indice = i >= 0 ? (i + 1) % plan.dias.length : 0
  }
  return { indice, dia: plan.dias[indice] }
}

export const entrenoHoy = (sesiones, hoy = new Date()) => (sesiones || []).some(s => mismoDia(s.fecha, hoy))

// Lunes a domingo de esta semana
export function semanaActual(sesiones, hoy = new Date()) {
  const lunes = lunesDe(hoy)
  return ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((letra, i) => {
    const fecha = sumarDias(lunes, i)
    return {
      letra,
      fecha,
      entreno: (sesiones || []).some(s => mismoDia(s.fecha, fecha)),
      esHoy: mismoDia(fecha, hoy),
      futuro: fecha.getTime() > empezarDia(hoy).getTime(),
    }
  })
}

// Semanas seguidas en las que llegaste a tu objetivo de sesiones. La semana en curso suma si ya la cumpliste,
// pero no corta la racha mientras todavía está en marcha.
export function rachaSemanas(sesiones, objetivo, hoy = new Date()) {
  const meta = Math.max(1, Number(objetivo) || 1)
  const lunes = lunesDe(hoy)
  let racha = 0
  for (let k = 1; k <= 520; k++) {
    const ini = sumarDias(lunes, -7 * k)
    if (sesionesEntre(sesiones || [], ini, sumarDias(ini, 7)) >= meta) racha++
    else break
  }
  if (sesionesEntre(sesiones || [], lunes, sumarDias(lunes, 7)) >= meta) racha++
  return racha
}

export function sesionesPorSemana(sesiones, n = 8, hoy = new Date()) {
  const lunes = lunesDe(hoy)
  const salida = []
  for (let i = n - 1; i >= 0; i--) {
    const ini = sumarDias(lunes, -7 * i)
    salida.push({ etiqueta: `${ini.getDate()}/${ini.getMonth() + 1}`, valor: sesionesEntre(sesiones || [], ini, sumarDias(ini, 7)) })
  }
  return salida
}

export function kcalPorDia(comidas, n = 7, hoy = new Date()) {
  const salida = []
  for (let i = n - 1; i >= 0; i--) {
    const d = sumarDias(hoy, -i)
    const kcal = (comidas || []).filter(c => mismoDia(c.fecha, d)).reduce((s, c) => s + (Number(c.kcal) || 0), 0)
    salida.push({ etiqueta: 'DLMMJVS'[d.getDay()], valor: Math.round(kcal) })
  }
  return salida
}

export function ejerciciosConHistorial(sesiones) {
  const mapa = new Map()
  for (const s of sesiones || []) {
    const vistos = new Set()
    for (const x of s.series || []) {
      if (vistos.has(x.ejercicioId)) continue
      vistos.add(x.ejercicioId)
      const previo = mapa.get(x.ejercicioId) || { id: x.ejercicioId, nombre: x.nombre, veces: 0 }
      previo.veces++
      mapa.set(x.ejercicioId, previo)
    }
  }
  return [...mapa.values()].sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre))
}

const redondear1 = n => Math.round(n * 10) / 10

// Mejor marca de una sesión para un ejercicio: fuerza estimada (kg) o, si es de peso corporal, repeticiones.
function marca(series, unidad) {
  if (unidad === 'kg') {
    const valores = series.filter(x => Number(x.pesoKg) > 0).map(x => e1rm(Number(x.pesoKg), Number(x.reps) || 0))
    return valores.length ? Math.max(...valores) : null
  }
  const valores = series.map(x => Number(x.reps) || 0)
  return valores.length ? Math.max(...valores) : null
}

const unidadDe = series => (series.some(x => Number(x.pesoKg) > 0) ? 'kg' : 'reps')

export function serieFuerza(sesiones, ejercicioId) {
  const ordenadas = [...(sesiones || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const conEjercicio = ordenadas
    .map(s => ({ fecha: s.fecha, series: (s.series || []).filter(x => x.ejercicioId === ejercicioId) }))
    .filter(s => s.series.length > 0)
  const unidad = conEjercicio.some(s => unidadDe(s.series) === 'kg') ? 'kg' : 'reps'
  const puntos = conEjercicio
    .map(s => ({ fecha: s.fecha, valor: marca(s.series, unidad) }))
    .filter(p => p.valor !== null)
    .map(p => ({ fecha: p.fecha, valor: redondear1(p.valor) }))
  return { puntos, unidad }
}

// Ejercicios en los que la sesión nueva superó todo lo anterior (solo si ya había historial)
export function records(previas, nueva) {
  const salida = []
  const ids = [...new Set((nueva.series || []).map(x => x.ejercicioId))]
  for (const id of ids) {
    const ahora = (nueva.series || []).filter(x => x.ejercicioId === id)
    const unidad = unidadDe(ahora)
    const nuevo = marca(ahora, unidad)
    if (nuevo === null) continue
    let mejor = null
    for (const s of previas || []) {
      const ant = (s.series || []).filter(x => x.ejercicioId === id)
      if (ant.length === 0 || unidadDe(ant) !== unidad) continue
      const m = marca(ant, unidad)
      if (m !== null && (mejor === null || m > mejor)) mejor = m
    }
    if (mejor !== null && nuevo > mejor * 1.005) {
      salida.push({ ejercicio: ahora[0].nombre, valor: redondear1(nuevo), unidad })
    }
  }
  return salida
}

export function minutosEstimados(dia) {
  const series = (dia.ejercicios || []).reduce((s, e) => s + (Number(e.series) || 0), 0)
  return Math.round((series * 2.5 + 8) / 5) * 5
}
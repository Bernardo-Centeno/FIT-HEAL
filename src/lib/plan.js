// Lógica sin IA: generación de plan por reglas, progresión de pesos y metas de nutrición.
// Funciones puras (sin DOM), así se pueden probar con `npm test`.

// ---------- Biblioteca de ejercicios ----------
// tipo: 'compuesto' | 'aislamiento'. corporal: se hace con el peso del cuerpo (se progresa en reps).
// unidad: 'reps' | 'seg'.
const L = (nombre, tipo = 'compuesto', extra = {}) => ({ nombre, tipo, unidad: 'reps', corporal: false, inferior: false, ...extra })

const BIBLIOTECA = {
  gimnasio: {
    pierna_cuad: [L('Sentadilla con barra', 'compuesto', { inferior: true }), L('Prensa de piernas', 'compuesto', { inferior: true })],
    bisagra: [L('Peso muerto rumano', 'compuesto', { inferior: true }), L('Hip thrust', 'compuesto', { inferior: true })],
    pierna_acc: [L('Zancadas con mancuernas', 'compuesto', { inferior: true }), L('Sentadilla búlgara', 'compuesto', { inferior: true })],
    isquios: [L('Curl femoral', 'aislamiento')],
    cuadriceps_aisl: [L('Extensión de cuádriceps', 'aislamiento')],
    gemelos: [L('Elevación de gemelos', 'aislamiento')],
    empuje_h: [L('Press banca con barra'), L('Press inclinado con mancuernas'), L('Press en máquina')],
    empuje_v: [L('Press militar con mancuernas'), L('Press de hombros en máquina')],
    tiron_h: [L('Remo en polea baja'), L('Remo con mancuerna'), L('Remo con barra')],
    tiron_v: [L('Jalón al pecho'), L('Dominadas asistidas')],
    hombro_lat: [L('Elevaciones laterales', 'aislamiento')],
    hombro_post: [L('Face pull', 'aislamiento')],
    biceps: [L('Curl de bíceps con mancuernas', 'aislamiento'), L('Curl martillo', 'aislamiento')],
    triceps: [L('Extensión de tríceps en polea', 'aislamiento'), L('Press francés con mancuerna', 'aislamiento')],
    core: [L('Plancha', 'aislamiento', { unidad: 'seg', corporal: true }), L('Elevación de piernas', 'aislamiento', { corporal: true })],
  },
  casa: {
    pierna_cuad: [L('Sentadilla goblet con mancuerna', 'compuesto', { inferior: true }), L('Sentadilla con peso corporal', 'compuesto', { inferior: true, corporal: true })],
    bisagra: [L('Peso muerto rumano con mancuernas', 'compuesto', { inferior: true }), L('Puente de glúteos', 'compuesto', { inferior: true, corporal: true })],
    pierna_acc: [L('Zancadas con mancuernas', 'compuesto', { inferior: true }), L('Sentadilla búlgara', 'compuesto', { inferior: true, corporal: true })],
    isquios: [L('Curl nórdico asistido', 'aislamiento', { corporal: true })],
    cuadriceps_aisl: [L('Sentadilla isométrica en pared', 'aislamiento', { unidad: 'seg', corporal: true })],
    gemelos: [L('Elevación de gemelos en escalón', 'aislamiento', { corporal: true })],
    empuje_h: [L('Flexiones', 'compuesto', { corporal: true }), L('Press con mancuernas en el suelo')],
    empuje_v: [L('Press de hombros con mancuernas'), L('Flexiones pike', 'compuesto', { corporal: true })],
    tiron_h: [L('Remo con mancuerna'), L('Remo inclinado con dos mancuernas')],
    tiron_v: [L('Dominadas o remo invertido', 'compuesto', { corporal: true }), L('Pullover con mancuerna', 'aislamiento')],
    hombro_lat: [L('Elevaciones laterales', 'aislamiento')],
    hombro_post: [L('Pájaros con mancuernas', 'aislamiento')],
    biceps: [L('Curl de bíceps con mancuernas', 'aislamiento'), L('Curl martillo', 'aislamiento')],
    triceps: [L('Fondos en silla', 'aislamiento', { corporal: true }), L('Extensión de tríceps sobre la cabeza', 'aislamiento')],
    core: [L('Plancha', 'aislamiento', { unidad: 'seg', corporal: true }), L('Elevación de piernas', 'aislamiento', { corporal: true })],
  },
}

// ---------- Divisiones por días ----------
const DIAS = {
  fullA: { nombre: 'Cuerpo completo A', patrones: ['pierna_cuad', 'empuje_h', 'tiron_h', 'hombro_lat', 'core'] },
  fullB: { nombre: 'Cuerpo completo B', patrones: ['bisagra', 'empuje_v', 'tiron_v', 'biceps', 'triceps'] },
  fullC: { nombre: 'Cuerpo completo C', patrones: ['pierna_acc', 'empuje_h', 'tiron_h', 'isquios', 'core'] },
  superior: { nombre: 'Tren superior', patrones: ['empuje_h', 'tiron_h', 'empuje_v', 'tiron_v', 'biceps', 'triceps'] },
  inferior: { nombre: 'Tren inferior', patrones: ['pierna_cuad', 'bisagra', 'pierna_acc', 'isquios', 'gemelos', 'core'] },
  empuje: { nombre: 'Empuje', patrones: ['empuje_h', 'empuje_v', 'empuje_h', 'hombro_lat', 'triceps'] },
  tiron: { nombre: 'Tirón', patrones: ['tiron_v', 'tiron_h', 'tiron_h', 'hombro_post', 'biceps'] },
  piernas: { nombre: 'Piernas', patrones: ['pierna_cuad', 'bisagra', 'pierna_acc', 'isquios', 'gemelos', 'core'] },
}

const SPLITS = {
  2: ['fullA', 'fullB'],
  3: ['fullA', 'fullB', 'fullC'],
  4: ['superior', 'inferior', 'superior', 'inferior'],
  5: ['empuje', 'tiron', 'piernas', 'superior', 'inferior'],
  6: ['empuje', 'tiron', 'piernas', 'empuje', 'tiron', 'piernas'],
}

// ---------- Series y repeticiones según objetivo ----------
export function esquema(objetivo, nivel, tipo, unidad) {
  if (unidad === 'seg') return { series: 3, repsMin: 30, repsMax: 60 }
  const extraCompuesto = nivel === 'principiante' ? 0 : 1
  if (tipo === 'compuesto') {
    if (objetivo === 'fuerza') return { series: 3 + extraCompuesto, repsMin: 4, repsMax: 6 }
    if (objetivo === 'masa') return { series: 3 + extraCompuesto, repsMin: 6, repsMax: 10 }
    return { series: 3, repsMin: 8, repsMax: 12 } // grasa | salud
  }
  if (objetivo === 'fuerza') return { series: 3, repsMin: 8, repsMax: 12 }
  if (objetivo === 'grasa') return { series: 3, repsMin: 12, repsMax: 15 }
  return { series: 3, repsMin: 10, repsMax: 15 }
}
// ---------- Deporte ----------
export const deporteActivo = p => !!(p.deporte && p.deporte.trim()) && Number(p.deporteDias) > 0

// Deportes que cargan mucho las piernas (se compara sin tildes ni mayúsculas)
const PIERNAS_EXIGENTES = /futbol|rugby|basquet|basket|voley|hockey|tenis|padel|running|correr|trail|maraton|atletismo|ciclismo|bici|handball|esqui|ski/

export function deporteExigePiernas(deporte = '') {
  const t = deporte.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return PIERNAS_EXIGENTES.test(t)
}

function armarNota(perfil, diasGym) {
  const notas = []
  if (perfil.lesiones && perfil.lesiones.trim()) {
    notas.push('Cargaste lesiones o limitaciones. Este plan automático NO las tiene en cuenta: revisalo con un profesional antes de empezar.')
  }
  if (deporteActivo(perfil)) {
    const n = Number(perfil.deporteDias)
    const dep = `${perfil.deporte.trim()} ${n} ${n === 1 ? 'día' : 'días'} por semana`
    if (deporteExigePiernas(perfil.deporte)) {
      notas.push(`Como hacés ${dep}, bajé una serie en los ejercicios de piernas. Evitá entrenar piernas el día antes de jugar o competir.`)
    } else {
      notas.push(`Hacés ${dep}: tené en cuenta ese desgaste al elegir qué días entrenar.`)
    }
    if (diasGym + n >= 7) {
      notas.push('Entre gym y deporte no te queda ningún día de descanso. Considerá bajar los días de gym.')
    }
  }
  return notas.join(' ')
}

// ---------- Generación del plan ----------
export function generarPlan(perfil, hoy = new Date()) {
  const dias = Math.min(6, Math.max(2, Number(perfil.diasPorSemana) || 3))
  const lugar = perfil.equipamiento === 'casa' ? 'casa' : 'gimnasio'
  const lib = BIBLIOTECA[lugar]
  const usados = {} // cuántas veces se usó cada patrón, para variar ejercicios entre días
  const bajarPiernas = deporteActivo(perfil) && deporteExigePiernas(perfil.deporte)
  const plan = {
    creadoEl: hoy.toISOString(),
    semanasCiclo: 6,
    objetivo: perfil.objetivo,
    origen: 'reglas',
    nota: armarNota(perfil, dias),
    dias: SPLITS[dias].map((clave, i) => {
      const def = DIAS[clave]
      const ejercicios = def.patrones.map((patron, j) => {
        const opciones = lib[patron]
        const n = usados[patron] || 0
        usados[patron] = n + 1
        const base = opciones[n % opciones.length]
        const esq = esquema(perfil.objetivo, perfil.nivel, base.tipo, base.unidad)
        const { repsMin, repsMax } = esq
        const series = base.inferior && bajarPiernas ? Math.max(2, esq.series - 1) : esq.series        return {
          id: slug(base.nombre), // sin posición: el historial del ejercicio se conserva entre planes
          nombre: base.nombre,
          tipo: base.tipo,
          unidad: base.unidad,
          corporal: base.corporal,
          inferior: base.inferior,
          series,
          repsMin,
          repsMax,
          pesoKg: 0, // se completa en la primera sesión: elegí un peso con el que sobren ~2 reps
        }
      })
      return { nombre: def.nombre, ejercicios }
    }),
  }
  // Si un día se repite en la semana (ej. 4 días: superior/inferior x2), se distingue con una letra.
  const vistos = {}
  plan.dias.forEach(d => {
    vistos[d.nombre] = (vistos[d.nombre] || 0) + 1
    if (vistos[d.nombre] > 1) d.nombre = `${d.nombre} B`
  })
  return plan
}

function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function diasDesde(fechaIso, hoy = new Date()) {
  return Math.floor((hoy.getTime() - new Date(fechaIso).getTime()) / 86400000)
}

export function planVencido(plan, hoy = new Date()) {
  if (!plan) return false
  return diasDesde(plan.creadoEl, hoy) >= (plan.semanasCiclo || 6) * 7
}

// ---------- Progresión ----------
export const e1rm = (peso, reps) => peso * (1 + reps / 30)

function incremento(ej) {
  if (ej.tipo === 'compuesto') return ej.inferior ? 5 : 2.5
  return 2
}

function redondear(x, paso = 0.5) {
  return Math.round(x / paso) * paso
}

// Devuelve las series "de trabajo" (las del peso más alto) de cada sesión donde aparece el ejercicio,
// de la más reciente a la más antigua.
export function historialEjercicio(ejercicioId, sesiones) {
  return [...sesiones]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .map(s => (s.series || []).filter(x => x.ejercicioId === ejercicioId))
    .filter(arr => arr.length > 0)
    .map(arr => {
      const maxPeso = Math.max(...arr.map(x => Number(x.pesoKg) || 0))
      return arr.filter(x => (Number(x.pesoKg) || 0) === maxPeso)
    })
}

export function sugerirProgresion(ej, sesiones) {
  const hist = historialEjercicio(ej.id, sesiones)
  if (hist.length === 0) {
    return { accion: 'nuevo', pesoSugerido: ej.pesoKg || null, mensaje: ej.corporal
      ? 'Primera vez: hacé las series con buena técnica y anotá las repeticiones.'
      : 'Primera vez: elegí un peso con el que te sobren unas 2 repeticiones y anotalo.' }
  }
  const ult = hist[0]
  const peso = Number(ult[0].pesoKg) || 0
  const reps = ult.map(x => Number(x.reps) || 0)
  const rpes = ult.map(x => Number(x.rpe)).filter(x => Number.isFinite(x) && x > 0)
  const rpeProm = rpes.length ? rpes.reduce((a, b) => a + b, 0) / rpes.length : null
  const hizoSeries = ult.length >= ej.series
  const llegoAlTope = hizoSeries && reps.every(r => r >= ej.repsMax)
  const todasSobreMin = reps.every(r => r >= ej.repsMin)

  if (llegoAlTope) {
    if (rpeProm !== null && rpeProm > 8.5) {
      return { accion: 'mantener', pesoSugerido: peso, mensaje: `Llegaste al tope de repeticiones, pero se sintió muy pesado (esfuerzo ${rpeProm.toFixed(1)}). Repetí con ${peso} kg y subí cuando te resulte más cómodo.` }
    }
    if (ej.corporal && peso === 0) {
      return { accion: 'subir', pesoSugerido: null, mensaje: ej.unidad === 'seg'
        ? 'Llegaste al máximo de tiempo. Pasá a una variante más difícil o sumá carga.'
        : 'Llegaste al máximo de repeticiones. Sumá lastre o pasá a una variante más difícil.' }
    }
    const nuevo = redondear(peso + incremento(ej))
    return { accion: 'subir', pesoSugerido: nuevo, mensaje: `Completaste todas las series en el tope del rango. Subí a ${nuevo} kg (+${nuevo - peso} kg).` }
  }

  if (!todasSobreMin) {
    const prev = hist[1]
    const prevMismoPeso = prev && (Number(prev[0].pesoKg) || 0) === peso
    const prevFallo = prev && prevMismoPeso && prev.some(x => (Number(x.reps) || 0) < ej.repsMin)
    if (prevFallo && peso > 0) {
      const nuevo = redondear(peso * 0.9, 0.5)
      return { accion: 'bajar', pesoSugerido: nuevo, mensaje: `Dos sesiones seguidas por debajo del mínimo de repeticiones con ${peso} kg. Bajá a ${nuevo} kg, ganá reps y volvé a subir.` }
    }
    return { accion: 'mantener', pesoSugerido: peso, mensaje: `Te quedaste por debajo de ${ej.repsMin} repeticiones en alguna serie. Repetí ${peso || 'el mismo esfuerzo'}${peso ? ' kg' : ''} e intentá llegar al mínimo en todas.` }
  }

  // Estancamiento: sin mejora del mejor e1RM en las últimas 3 sesiones
  if (hist.length >= 3 && peso > 0) {
    const mejor = h => Math.max(...h.map(x => e1rm(Number(x.pesoKg) || 0, Number(x.reps) || 0)))
    const [a, b, c] = [mejor(hist[0]), mejor(hist[1]), mejor(hist[2])]
    if (a <= Math.max(b, c) * 1.01) {
      return { accion: 'estancado', pesoSugerido: peso, mensaje: 'Llevás 3 sesiones sin mejorar. Probá dormir y comer un poco más, descansar más entre series, o hacer una semana más liviana (-10% de peso) y volver a empujar.' }
    }
  }

  return { accion: 'mantener', pesoSugerido: peso, mensaje: `Vas bien. Mantené ${peso || 'el mismo esfuerzo'}${peso ? ' kg' : ''} y tratá de sumar una repetición por serie hasta llegar a ${ej.repsMax}.` }
}

// Feedback de una sesión recién guardada: un mensaje por ejercicio entrenado.
export function feedbackSesion(plan, sesion, sesiones) {
  if (!plan) return []
  const dia = plan.dias.find(d => d.nombre === sesion.diaNombre)
  if (!dia) return []
  return dia.ejercicios
    .filter(ej => sesion.series.some(s => s.ejercicioId === ej.id))
    .map(ej => ({ ejercicio: ej.nombre, ...sugerirProgresion(ej, sesiones) }))
}

// Cumplimiento: sesiones en los últimos 7 días vs. objetivo semanal
export function cumplimientoSemanal(sesiones, diasPorSemana, hoy = new Date()) {
  const hechas = sesiones.filter(s => {
    const d = diasDesde(s.fecha, hoy)
    return d >= 0 && d < 7
  }).length
  return { hechas, objetivo: diasPorSemana }
}

// ---------- Nutrición por reglas ----------
// tipoDia: 'entreno' | 'descanso' | 'deporte' (también acepta true/false por compatibilidad)
export function objetivosNutricion(perfil, tipoDia = 'entreno') {
  const tipo = tipoDia === true ? 'entreno' : tipoDia === false ? 'descanso' : tipoDia
  const w = Number(perfil.pesoKg) || 70
  const h = Number(perfil.alturaCm) || 170
  const a = Number(perfil.edad) || 30
  const bmr = 10 * w + 6.25 * h - 5 * a + (perfil.sexo === 'femenino' ? -161 : 5)

  // Días de actividad por semana: gym + deporte (fuera de temporada cuenta la mitad), máximo 7
  const diasDeporte = deporteActivo(perfil) ? Number(perfil.deporteDias) * (perfil.deporteTemporada === 'fuera' ? 0.5 : 1) : 0
  const diasActivos = Math.min(7, (Number(perfil.diasPorSemana) || 3) + diasDeporte)
  const factor = 1.2 + 0.075 * diasActivos
  const mantenimiento = bmr * factor

  const ajuste = { masa: 1.1, fuerza: 1.05, grasa: 0.85, salud: 1.0 }[perfil.objetivo] ?? 1.0
  let kcal = mantenimiento * ajuste
  kcal = Math.max(kcal, bmr) // nunca por debajo del metabolismo basal
  kcal *= { entreno: 1.05, deporte: 1.08, descanso: 0.95 }[tipo] ?? 1

  const protPorKg = { masa: 1.8, fuerza: 1.8, grasa: 2.0, salud: 1.4 }[perfil.objetivo] ?? 1.6
  const proteinaG = protPorKg * w
  const grasasG = 0.9 * w
  const carbosG = Math.max(0, (kcal - proteinaG * 4 - grasasG * 9) / 4)

  return {
    kcal: Math.round(kcal / 10) * 10,
    proteinaG: Math.round(proteinaG),
    grasasG: Math.round(grasasG),
    carbosG: Math.round(carbosG),
    mantenimientoKcal: Math.round(mantenimiento / 10) * 10,
  }
}
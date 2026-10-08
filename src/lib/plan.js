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

// ---------- Días de entrenamiento (qué patrones de movimiento lleva cada uno) ----------
const DIAS = {
  fullA: { nombre: 'Cuerpo completo A', patrones: ['pierna_cuad', 'empuje_h', 'tiron_h', 'hombro_lat', 'core'] },
  fullB: { nombre: 'Cuerpo completo B', patrones: ['bisagra', 'empuje_v', 'tiron_v', 'biceps', 'triceps'] },
  fullC: { nombre: 'Cuerpo completo C', patrones: ['pierna_acc', 'empuje_h', 'tiron_h', 'isquios', 'core'] },
  fullD: { nombre: 'Cuerpo completo D', patrones: ['bisagra', 'empuje_h', 'tiron_h', 'hombro_lat', 'triceps'] },
  fullE: { nombre: 'Cuerpo completo E', patrones: ['pierna_acc', 'empuje_v', 'tiron_v', 'biceps', 'core'] },
  superior: { nombre: 'Tren superior', patrones: ['empuje_h', 'tiron_h', 'empuje_v', 'tiron_v', 'biceps', 'triceps'] },
  inferior: { nombre: 'Tren inferior', patrones: ['pierna_cuad', 'bisagra', 'pierna_acc', 'isquios', 'gemelos', 'core'] },
  empuje: { nombre: 'Empuje', patrones: ['empuje_h', 'empuje_v', 'empuje_h', 'hombro_lat', 'triceps'] },
  tiron: { nombre: 'Tirón', patrones: ['tiron_v', 'tiron_h', 'tiron_h', 'hombro_post', 'biceps'] },
  piernas: { nombre: 'Piernas', patrones: ['pierna_cuad', 'bisagra', 'pierna_acc', 'isquios', 'gemelos', 'core'] },
}

// ---------- Divisiones del plan ----------
export const DIVISIONES = {
  auto: { nombre: 'Automática (recomendada)', dias: [2, 3, 4, 5, 6], descripcion: 'Elige según tus días: cuerpo completo con 2-3, superior/inferior con 4, y empuje/tirón/piernas con 5-6.' },
  completo: { nombre: 'Cuerpo completo', dias: [2, 3, 4, 5], descripcion: 'Todo el cuerpo en cada sesión. Buena opción si entrenás pocos días o querés trabajar cada músculo varias veces por semana.' },
  superior_inferior: { nombre: 'Superior / inferior', dias: [2, 3, 4, 5, 6], descripcion: 'Alterna tren superior e inferior. Con 4 días cada músculo se trabaja unas 2 veces por semana, y te deja manejar mejor los días de piernas si hacés deporte.' },
  ppl: { nombre: 'Empuje / tirón / piernas', dias: [3, 4, 5, 6], descripcion: 'Un día de empuje (pecho, hombros, tríceps), uno de tirón (espalda, bíceps) y uno de piernas. Con 3 o 4 días cada músculo se entrena pocas veces por semana; rinde mejor con 5 o 6.' },
}

const SPLITS = {
  auto: {
    2: ['fullA', 'fullB'],
    3: ['fullA', 'fullB', 'fullC'],
    4: ['superior', 'inferior', 'superior', 'inferior'],
    5: ['empuje', 'tiron', 'piernas', 'superior', 'inferior'],
    6: ['empuje', 'tiron', 'piernas', 'empuje', 'tiron', 'piernas'],
  },
  completo: {
    2: ['fullA', 'fullB'],
    3: ['fullA', 'fullB', 'fullC'],
    4: ['fullA', 'fullB', 'fullC', 'fullD'],
    5: ['fullA', 'fullB', 'fullC', 'fullD', 'fullE'],
  },
  superior_inferior: {
    2: ['superior', 'inferior'],
    3: ['superior', 'inferior', 'superior'],
    4: ['superior', 'inferior', 'superior', 'inferior'],
    5: ['superior', 'inferior', 'superior', 'inferior', 'superior'],
    6: ['superior', 'inferior', 'superior', 'inferior', 'superior', 'inferior'],
  },
  ppl: {
    3: ['empuje', 'tiron', 'piernas'],
    4: ['empuje', 'tiron', 'piernas', 'superior'],
    5: ['empuje', 'tiron', 'piernas', 'superior', 'inferior'],
    6: ['empuje', 'tiron', 'piernas', 'empuje', 'tiron', 'piernas'],
  },
}

// Si la división elegida no existe para esa cantidad de días, se usa la automática.
export function elegirSplit(division, dias) {
  return (SPLITS[division] && SPLITS[division][dias]) || SPLITS.auto[dias]
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
  const t = deporte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return PIERNAS_EXIGENTES.test(t)
}

function armarNota(perfil, diasGym) {
  const notas = []
  const zonas = zonasActivas(perfil)
  if (zonas.length) {
    notas.push(`No entrenás: ${zonas.map(z => z.toLowerCase()).join(', ')}. Esos ejercicios se reemplazaron por otros de las demás zonas.`)
  }
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
  const excluidos = patronesExcluidos(perfil)

  const plan = {
    creadoEl: hoy.toISOString(),
    semanasCiclo: cicloElegido(perfil),
    objetivo: perfil.objetivo,
    origen: 'reglas',
    nota: armarNota(perfil, dias),
    dias: elegirSplit(perfil.division, dias).map((clave, i) => {
      const def = DIAS[clave]
      const enDia = new Set()
      const usoDia = {} // cuántos ejercicios de cada patrón lleva este día
      const ejercicios = []
      for (const patron of def.patrones) {
        let base = null
        if (!excluidos.includes(patron)) {
          const opciones = lib[patron]
          const n = usados[patron] || 0
          usados[patron] = n + 1
          for (let k = 0; k < opciones.length && !base; k++) {
            const c = opciones[(n + k) % opciones.length]
            if (!enDia.has(c.nombre)) base = c // si ya está en el día (por un reemplazo), prueba la siguiente opción
          }
          usoDia[patron] = (usoDia[patron] || 0) + 1
        } else {
          // Zona que no querés entrenar: se reemplaza por la zona (de las que sí) menos usada ese día
          let mejor = null
          for (const cand of PATRONES_SIN_PIERNAS.concat(['pierna_cuad', 'pierna_acc', 'bisagra'])) {
            if (excluidos.includes(cand)) continue
            const b = lib[cand].find(x => !enDia.has(x.nombre))
            if (!b) continue
            const uso = usoDia[cand] || 0
            if (!mejor || uso < mejor.uso) mejor = { cand, b, uso }
          }
          if (mejor) { base = mejor.b; usoDia[mejor.cand] = mejor.uso + 1 }
        }
        if (!base || enDia.has(base.nombre)) continue
        enDia.add(base.nombre)
        ejercicios.push(aEjercicio(base, perfil, bajarPiernas))
      }
      return { nombre: def.nombre, ejercicios }
    }),
  }
  // Si un día se repite en la semana (ej. superior/inferior x2), se distingue con una letra: B, C, D...
  const vistos = {}
  plan.dias.forEach(d => {
    vistos[d.nombre] = (vistos[d.nombre] || 0) + 1
    if (vistos[d.nombre] > 1) d.nombre = `${d.nombre} ${'ABCDEF'[vistos[d.nombre] - 1]}`
  })
  return plan
}

// ---------- Ejercicio a partir de la biblioteca ----------
function aEjercicio(base, perfil, bajarPiernas = false) {
  const esq = esquema(perfil.objetivo, perfil.nivel, base.tipo, base.unidad)
  const series = base.inferior && bajarPiernas ? Math.max(2, esq.series - 1) : esq.series
  return {
    id: slug(base.nombre), // sin posición: el historial del ejercicio se conserva entre planes
    nombre: base.nombre,
    tipo: base.tipo,
    unidad: base.unidad,
    corporal: base.corporal,
    inferior: base.inferior,
    series,
    repsMin: esq.repsMin,
    repsMax: esq.repsMax,
    pesoKg: 0, // se completa en la primera sesión: elegí un peso con el que sobren ~2 reps
  }
}

// ---------- Cada cuánto se renueva el plan ----------
export const CICLOS = [
  { semanas: 4, label: 'Cada 1 mes (4 semanas)' },
  { semanas: 6, label: 'Cada 6 semanas' },
  { semanas: 8, label: 'Cada 2 meses (8 semanas)' },
  { semanas: 12, label: 'Cada 3 meses (12 semanas)' },
]

export function cicloElegido(perfil) {
  const n = Number(perfil && perfil.cicloSemanas)
  return CICLOS.some(c => c.semanas === n) ? n : 6
}

export function semanaDelPlan(plan, hoy = new Date()) {
  const ciclo = plan.semanasCiclo || 6
  return Math.min(ciclo, Math.max(1, Math.floor(diasDesde(plan.creadoEl, hoy) / 7) + 1))
}

export function fechaRenovacion(plan) {
  const d = new Date(plan.creadoEl)
  d.setDate(d.getDate() + (plan.semanasCiclo || 6) * 7)
  return d
}

// ---------- Cambiar ejercicios ----------
const PATRONES_PIERNA = ['pierna_cuad', 'bisagra', 'pierna_acc', 'isquios', 'cuadriceps_aisl', 'gemelos']
// Alternativas que no cargan las piernas, en orden de preferencia
const PATRONES_SIN_PIERNAS = ['tiron_h', 'empuje_h', 'hombro_post', 'core', 'biceps', 'triceps', 'hombro_lat', 'tiron_v', 'empuje_v']
const RELACIONADOS = {
  pierna_cuad: ['pierna_acc', 'bisagra'], bisagra: ['pierna_acc', 'pierna_cuad'], pierna_acc: ['pierna_cuad', 'bisagra'],
  isquios: ['bisagra'], cuadriceps_aisl: ['pierna_cuad'], gemelos: [],
  empuje_h: ['empuje_v'], empuje_v: ['empuje_h'], tiron_h: ['tiron_v'], tiron_v: ['tiron_h'],
  hombro_lat: ['hombro_post'], hombro_post: ['hombro_lat'], biceps: ['triceps'], triceps: ['biceps'], core: [],
}

const lugarDe = perfil => (perfil.equipamiento === 'casa' ? 'casa' : 'gimnasio')

export function patronDe(nombre, perfil) {
  const lib = BIBLIOTECA[lugarDe(perfil)]
  for (const [patron, lista] of Object.entries(lib)) {
    if (lista.some(e => e.nombre === nombre)) return patron
  }
  return null
}

export function esDePierna(ej, perfil) {
  return PATRONES_PIERNA.includes(patronDe(ej.nombre, perfil))
}

// Opciones para cambiar un ejercicio de un día: parecidos (mismo movimiento) y, si es de piernas, otros sin piernas.
export function alternativas(ej, perfil, dia) {
  const lib = BIBLIOTECA[lugarDe(perfil)]
  const enDia = new Set(dia.ejercicios.map(e => e.nombre))
  const patron = patronDe(ej.nombre, perfil)
  const vistos = new Set()
  const tomar = patrones => patrones
    .flatMap(p => lib[p] || [])
    .filter(b => !enDia.has(b.nombre) && !vistos.has(b.nombre) && (vistos.add(b.nombre), true))
    .map(b => aEjercicio(b, perfil))
  const parecidos = patron ? tomar([patron, ...(RELACIONADOS[patron] || [])]) : []
  const sinPiernas = PATRONES_PIERNA.includes(patron) ? tomar(PATRONES_SIN_PIERNAS) : []
  return { parecidos, sinPiernas }
}

// "Tengo las piernas cansadas": reemplaza cada ejercicio de piernas del día por uno que no las cargue.
// Devuelve { [idOriginal]: ejercicioNuevo }
export function cambiosPorFatiga(dia, perfil) {
  const lib = BIBLIOTECA[lugarDe(perfil)]
  const usados = new Set(dia.ejercicios.map(e => e.nombre))
  const cambios = {}
  for (const ej of dia.ejercicios) {
    if (!esDePierna(ej, perfil)) continue
    for (const p of PATRONES_SIN_PIERNAS) {
      const base = (lib[p] || []).find(b => !usados.has(b.nombre))
      if (base) {
        usados.add(base.nombre)
        cambios[ej.id] = aEjercicio(base, perfil)
        break
      }
    }
  }
  return cambios
}

// ---------- Zonas del cuerpo (para excluir, agregar o buscar ejercicios) ----------
export const GRUPOS = {
  Pecho: ['empuje_h'],
  Espalda: ['tiron_h', 'tiron_v'],
  Hombros: ['empuje_v', 'hombro_lat', 'hombro_post'],
  Bíceps: ['biceps'],
  Tríceps: ['triceps'],
  Piernas: PATRONES_PIERNA,
  Core: ['core'],
}

export function zonasActivas(perfil) {
  const z = Array.isArray(perfil && perfil.zonasExcluidas) ? perfil.zonasExcluidas : []
  return Object.keys(GRUPOS).filter(g => z.includes(g))
}

function patronesExcluidos(perfil) {
  const zonas = zonasActivas(perfil)
  // si se excluyera todo, no se excluye nada
  if (zonas.length >= Object.keys(GRUPOS).length - 1) return []
  return zonas.flatMap(g => GRUPOS[g])
}

// Ejercicios de la biblioteca agrupados por zona, sin los que ya están en el día
export function catalogo(perfil, dia) {
  const lib = BIBLIOTECA[lugarDe(perfil)]
  const enDia = new Set(dia.ejercicios.map(e => e.nombre))
  const salida = []
  for (const [grupo, patrones] of Object.entries(GRUPOS)) {
    const vistos = new Set()
    const ejercicios = patrones
      .flatMap(p => lib[p] || [])
      .filter(b => !enDia.has(b.nombre) && !vistos.has(b.nombre) && (vistos.add(b.nombre), true))
      .map(b => aEjercicio(b, perfil))
    if (ejercicios.length) salida.push({ grupo, ejercicios })
  }
  return salida
}

// Ejercicio escrito por la persona. Devuelve { ejercicio } o { error }.
export function ejercicioPropio({ nombre, series = 3, repsMin = 8, repsMax = 12, corporal = false, unidad = 'reps' }, dia = null) {
  const limpio = String(nombre || '').trim().replace(/\s+/g, ' ')
  if (limpio.length < 2) return { error: 'Escribí el nombre del ejercicio.' }
  const s = Number(series), a = Number(repsMin), b = Number(repsMax)
  if (!(s >= 1 && s <= 10)) return { error: 'Las series tienen que ser entre 1 y 10.' }
  if (!(a >= 1 && b >= a && b <= 100)) return { error: 'Revisá el rango de repeticiones: el mínimo no puede superar al máximo.' }
  const nombreFinal = limpio.charAt(0).toUpperCase() + limpio.slice(1)
  if (dia && dia.ejercicios.some(e => e.nombre.toLowerCase() === nombreFinal.toLowerCase())) {
    return { error: 'Ese ejercicio ya está en este día.' }
  }
  return {
    ejercicio: {
      id: slug(nombreFinal), nombre: nombreFinal, tipo: 'aislamiento', unidad: unidad === 'seg' ? 'seg' : 'reps',
      corporal: !!corporal, inferior: false, series: s, repsMin: a, repsMax: b, pesoKg: 0, propio: true,
    },
  }
}

// Qué poner cuando se quita un ejercicio: si era de piernas, uno de tren superior; si no, uno parecido.
export function reemplazoAutomatico(ej, perfil, dia) {
  const alt = alternativas(ej, perfil, dia)
  const lista = esDePierna(ej, perfil) ? alt.sinPiernas : alt.parecidos
  return lista[0] || alt.parecidos[0] || alt.sinPiernas[0] || null
}

function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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

export function incremento(ej) {
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
// ejerciciosDelDia (opcional): la lista que se usó de verdad hoy, por si cambiaste algún ejercicio solo por esa sesión.
export function feedbackSesion(plan, sesion, sesiones, ejerciciosDelDia = null) {
  if (!plan) return []
  const dia = plan.dias.find(d => d.nombre === sesion.diaNombre)
  const lista = ejerciciosDelDia || (dia ? dia.ejercicios : null)
  if (!lista) return []
  return lista
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
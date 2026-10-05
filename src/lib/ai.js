// Conexión directa con la API de Anthropic desde el navegador, con la clave que pegás en Ajustes.
// La clave queda solo en este navegador. No compartas el link de la app ni el respaldo con la clave incluida.

const API_URL = 'https://api.anthropic.com/v1/messages'

export class ErrorIA extends Error {}

async function llamar({ apiKey, modelo, system, content, maxTokens = 1500 }) {
  if (!apiKey) throw new ErrorIA('Falta la clave de API. Pegala en Ajustes.')
  let res
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: modelo || 'claude-sonnet-5-5',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content }],
      }),
    })
  } catch {
    throw new ErrorIA('No se pudo conectar. Revisá tu internet.')
  }
  if (!res.ok) {
    let detalle = ''
    try { detalle = (await res.json()).error?.message || '' } catch { /* sin detalle */ }
    if (res.status === 401) throw new ErrorIA('La clave de API no es válida.')
    if (res.status === 429) throw new ErrorIA('Demasiados pedidos seguidos. Esperá un momento.')
    if (res.status === 400 && /credit|balance/i.test(detalle)) throw new ErrorIA('No tenés crédito en la cuenta de Anthropic.')
    throw new ErrorIA(`Error ${res.status}${detalle ? ': ' + detalle : ''}`)
  }
  const data = await res.json()
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
}

const resumenPerfil = p => `Perfil: ${p.sexo}, ${p.edad} años, ${p.pesoKg} kg, ${p.alturaCm} cm.
Objetivo: ${p.objetivo}. Nivel: ${p.nivel}. Entrena ${p.diasPorSemana} días por semana en ${p.equipamiento}.
Lesiones o limitaciones: ${p.lesiones || 'ninguna'}.
Horarios y vida diaria: ${p.horarios || 'sin datos'}.
No come: ${p.noComo || 'sin restricciones'}. Alergias o intolerancias: ${p.alergias || 'ninguna'}.
Presupuesto: ${p.presupuesto}. Tiempo para cocinar: ${p.minutosParaCocinar} min.`

const BASE = `Sos un asistente de entrenamiento y alimentación dentro de una app personal. Respondé en español rioplatense, claro y concreto.
Reglas: no diagnostiques ni indiques tratamientos; si hay lesiones, dolor o condiciones médicas, recomendá consultar a un profesional. Las estimaciones de calorías y macros a partir de fotos son aproximadas y decilo. No uses un tono de culpa ni juzgues la comida como "buena" o "mala": orientá a mejorar según el objetivo de la persona.`

export async function feedbackComida({ ajustes, perfil, objetivos, imagenBase64, mediaType, descripcion }) {
  const content = []
  if (imagenBase64) content.push({ type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imagenBase64 } })
  content.push({
    type: 'text',
    text: `${resumenPerfil(perfil)}
Metas diarias aproximadas: ${objetivos.kcal} kcal, ${objetivos.proteinaG} g de proteína, ${objetivos.carbosG} g de carbohidratos, ${objetivos.grasasG} g de grasas.
${descripcion ? 'Descripción de la comida: ' + descripcion : ''}

Analizá este plato: 1) qué ves, 2) estimación aproximada de calorías y macros, 3) cómo encaja con mi objetivo, 4) uno o dos cambios concretos para mejorarlo. Sé breve.`,
  })
  return llamar({ apiKey: ajustes.apiKey, modelo: ajustes.modelo, system: BASE, content, maxTokens: 900 })
}

export async function sugerirComidaYReceta({ ajustes, perfil, objetivos, pedido, esDiaEntrenamiento, ingredientes }) {
  const text = `${resumenPerfil(perfil)}
Hoy es día de ${esDiaEntrenamiento ? 'entrenamiento' : 'descanso'}. Metas del día: ${objetivos.kcal} kcal, ${objetivos.proteinaG} g de proteína, ${objetivos.carbosG} g de carbohidratos, ${objetivos.grasasG} g de grasas.
${ingredientes ? 'Tengo en casa: ' + ingredientes : ''}
Pedido: ${pedido || 'Sugerime qué comer hoy'}

Dame una propuesta con: nombre del plato, ingredientes con cantidades para 1 persona, pasos breves, tiempo total y macros aproximados. Respetá mis restricciones y mi tiempo para cocinar.`
  return llamar({ apiKey: ajustes.apiKey, modelo: ajustes.modelo, system: BASE, content: text, maxTokens: 1200 })
}

export async function listaDeCompras({ ajustes, perfil, recetas }) {
  const text = `${resumenPerfil(perfil)}
Estas son las recetas de la semana:
${recetas.map((r, i) => `Receta ${i + 1}:\n${r.texto}`).join('\n\n')}

Armá una lista de compras unificada, agrupada por sección del supermercado, sumando cantidades repetidas.`
  return llamar({ apiKey: ajustes.apiKey, modelo: ajustes.modelo, system: BASE, content: text, maxTokens: 1200 })
}

export async function planConIA({ ajustes, perfil, planActual, sesiones, comidas }) {
  const ultimas = sesiones.slice(-30).map(s => ({
    fecha: s.fecha.slice(0, 10),
    dia: s.diaNombre,
    series: s.series.map(x => `${x.nombre}: ${x.pesoKg} kg x ${x.reps}${x.rpe ? ' (esfuerzo ' + x.rpe + ')' : ''}`),
  }))
  const text = `${resumenPerfil(perfil)}
Plan actual: ${planActual ? JSON.stringify(planActual.dias.map(d => ({ dia: d.nombre, ejercicios: d.ejercicios.map(e => `${e.nombre} ${e.series}x${e.repsMin}-${e.repsMax}`) }))) : 'no hay'}
Últimas sesiones: ${JSON.stringify(ultimas)}
Cantidad de comidas registradas últimamente: ${comidas.slice(-14).length}.

Armá el plan de las próximas 4 a 6 semanas ajustado a mi historial. Respondé SOLO con un JSON válido, sin texto extra, con esta forma exacta:
{"nota":"resumen breve de qué cambió y por qué","dias":[{"nombre":"...","ejercicios":[{"nombre":"...","tipo":"compuesto|aislamiento","unidad":"reps|seg","corporal":false,"inferior":false,"series":3,"repsMin":8,"repsMax":12,"pesoKg":0}]}]}
Usá exactamente ${perfil.diasPorSemana} días, 4 a 6 ejercicios por día, y poné en pesoKg el peso de partida sugerido según mi historial (0 si es corporal o no hay datos). Respetá mis lesiones y mi equipamiento.`
  const raw = await llamar({ apiKey: ajustes.apiKey, modelo: ajustes.modelo, system: BASE, content: text, maxTokens: 3000 })
  return parsearPlan(raw, perfil)
}

export function parsearPlan(raw, perfil, hoy = new Date()) {
  const ini = raw.indexOf('{')
  const fin = raw.lastIndexOf('}')
  if (ini < 0 || fin < 0) throw new ErrorIA('La IA no devolvió un plan válido. Probá de nuevo.')
  let data
  try { data = JSON.parse(raw.slice(ini, fin + 1)) } catch { throw new ErrorIA('La IA devolvió un plan que no se pudo leer. Probá de nuevo.') }
  if (!Array.isArray(data.dias) || data.dias.length === 0) throw new ErrorIA('El plan de la IA vino vacío. Probá de nuevo.')
  return {
    creadoEl: hoy.toISOString(),
    semanasCiclo: 6,
    objetivo: perfil.objetivo,
    origen: 'ia',
    nota: data.nota || '',
    dias: data.dias.map((d, i) => ({
      nombre: String(d.nombre || `Día ${i + 1}`),
      ejercicios: (d.ejercicios || []).map((e, j) => ({
        id: String(e.nombre || `ej-${i}-${j}`).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        nombre: String(e.nombre || 'Ejercicio'),
        tipo: e.tipo === 'aislamiento' ? 'aislamiento' : 'compuesto',
        unidad: e.unidad === 'seg' ? 'seg' : 'reps',
        corporal: !!e.corporal,
        inferior: !!e.inferior,
        series: Math.min(8, Math.max(1, Number(e.series) || 3)),
        repsMin: Math.max(1, Number(e.repsMin) || 8),
        repsMax: Math.max(Number(e.repsMin) || 8, Number(e.repsMax) || 12),
        pesoKg: Math.max(0, Number(e.pesoKg) || 0),
      })),
    })),
  }
}

export function archivoABase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1])
    r.onerror = () => reject(new Error('No se pudo leer la foto'))
    r.readAsDataURL(file)
  })
}

// Achica la foto antes de mandarla: más rápido y más barato.
export function reducirImagen(file, maxLado = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * escala)
      c.height = Math.round(img.height * escala)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve({ base64: c.toDataURL('image/jpeg', 0.85).split(',')[1], mediaType: 'image/jpeg' })
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo abrir la foto')) }
    img.src = url
  })
}
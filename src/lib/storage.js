// Todo se guarda en el navegador (localStorage). Sin cuentas ni servidor.
const KEY = 'gymnutri.v1'

export const estadoInicial = {
  perfil: {
    nombre: '',
    sexo: 'masculino',
    edad: 30,
    pesoKg: 75,
    alturaCm: 175,
    objetivo: 'masa', // masa | fuerza | grasa | salud
    nivel: 'principiante', // principiante | intermedio | avanzado
    diasPorSemana: 3,
    equipamiento: 'gimnasio', // gimnasio | casa
    lesiones: '',
    horarios: '',
    noComo: '',
    alergias: '',
    presupuesto: 'medio',
    minutosParaCocinar: 30,
    deporte: '', // vacío = ninguno
    deporteDias: 2,
    deporteTemporada: 'en', // en | fuera
  },
  plan: null,
  sesiones: [],
  comidas: [],
  recetas: [],
  ajustes: { apiKey: '', modelo: 'claude-sonnet-5-5' },
}

export function cargar() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(estadoInicial)
    const data = JSON.parse(raw)
    return {
      ...structuredClone(estadoInicial),
      ...data,
      perfil: { ...estadoInicial.perfil, ...(data.perfil || {}) },
      ajustes: { ...estadoInicial.ajustes, ...(data.ajustes || {}) },
    }
  } catch {
    return structuredClone(estadoInicial)
  }
}

export function guardar(estado) {
  try {
    localStorage.setItem(KEY, JSON.stringify(estado))
  } catch (e) {
    console.error('No se pudo guardar', e)
  }
}

// Respaldo: por defecto NO incluye la clave de API, para que no se filtre al compartir el archivo.
export function exportarRespaldo(estado, incluirClave = false) {
  const copia = structuredClone(estado)
  if (!incluirClave) copia.ajustes = { ...copia.ajustes, apiKey: '' }
  const blob = new Blob([JSON.stringify(copia, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `respaldo-gym-comida-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importarRespaldo(texto, estadoActual) {
  const data = JSON.parse(texto)
  if (!data || typeof data !== 'object' || !data.perfil) {
    throw new Error('El archivo no parece un respaldo válido')
  }
  return {
    ...structuredClone(estadoInicial),
    ...data,
    perfil: { ...estadoInicial.perfil, ...data.perfil },
    // si el respaldo no trae clave, se conserva la actual
    ajustes: {
      ...estadoInicial.ajustes,
      ...(data.ajustes || {}),
      apiKey: (data.ajustes && data.ajustes.apiKey) || estadoActual.ajustes.apiKey,
    },
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
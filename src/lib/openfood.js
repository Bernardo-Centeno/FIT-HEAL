// Búsqueda de alimentos envasados en Open Food Facts (base abierta y gratuita, sin clave).
// Funciona desde el navegador. Los datos los cargan voluntarios: pueden estar incompletos o ser imprecisos.

const URL_BASE = 'https://world.openfoodfacts.org/cgi/search.pl'

const num = v => { const n = Number(v); return Number.isFinite(n) ? n : null }

// Convierte un producto de Open Food Facts a valores por 100 g. Devuelve null si faltan datos clave.
export function productoAAlimento(prod) {
  if (!prod) return null
  const nu = prod.nutriments || {}
  let kcal = num(nu['energy-kcal_100g'])
  if (kcal == null) { const kj = num(nu['energy_100g']); if (kj != null) kcal = kj / 4.184 }
  const p = num(nu.proteins_100g), c = num(nu.carbohydrates_100g), g = num(nu.fat_100g)
  const nombre = String(prod.product_name_es || prod.product_name || '').trim()
  if (!nombre || kcal == null || kcal < 0 || kcal > 900 || p == null || c == null || g == null) return null
  if (p + c + g > 100.5) return null
  const marca = String(prod.brands || '').split(',')[0].trim()
  const porcion = num(prod.serving_quantity)
  return {
    nombre: marca && !nombre.toLowerCase().includes(marca.toLowerCase()) ? `${nombre} (${marca})` : nombre,
    kcal: Math.round(kcal), p: Math.round(p * 10) / 10, c: Math.round(c * 10) / 10, g: Math.round(g * 10) / 10,
    porcionG: porcion && porcion > 0 && porcion < 1000 ? porcion : null,
  }
}

export async function buscarOnline(texto, { limite = 8, fetchFn = fetch } = {}) {
  const q = String(texto || '').trim()
  if (q.length < 2) return []
  const params = new URLSearchParams({
    search_terms: q, search_simple: '1', action: 'process', json: '1', page_size: '24',
    fields: 'product_name,product_name_es,brands,nutriments,serving_quantity',
  })
  let res
  try { res = await fetchFn(`${URL_BASE}?${params}`) } catch { throw new Error('No se pudo conectar con Open Food Facts. Revisá tu internet.') }
  if (!res.ok) throw new Error('Open Food Facts no respondió bien. Probá de nuevo en un rato.')
  const data = await res.json()
  const vistos = new Set()
  const out = []
  for (const prod of data.products || []) {
    const a = productoAAlimento(prod)
    if (!a || vistos.has(a.nombre.toLowerCase())) continue
    vistos.add(a.nombre.toLowerCase())
    out.push(a)
    if (out.length >= limite) break
  }
  return out
}
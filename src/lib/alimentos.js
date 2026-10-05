// Comida SIN IA: alimentos con macros, recetas, filtros según tu perfil y lista de compras.
// Valores aproximados por cada 100 g (carnes, arroz, fideos, avena y legumbres secas: crudos).

const A = (id, nombre, cat, kcal, p, c, g, tags = [], unidad = null) => ({ id, nombre, cat, kcal, p, c, g, tags, unidad })

export const CATEGORIAS = ['Carnes y pescados', 'Lácteos y huevos', 'Verduras y frutas', 'Almacén', 'Otros']

export const ALIMENTOS = [
  // Carnes y pescados
  A('pechuga-de-pollo', 'Pechuga de pollo (cruda)', 'Carnes y pescados', 120, 23, 0, 2.5, ['pollo', 'ave']),
  A('carne-vacuna-magra', 'Carne vacuna magra (cruda)', 'Carnes y pescados', 150, 21, 0, 7, ['carne', 'vacuna']),
  A('carne-picada-magra', 'Carne picada magra (cruda)', 'Carnes y pescados', 170, 20, 0, 10, ['carne', 'vacuna', 'picada']),
  A('atun-al-natural', 'Atún al natural (lata, escurrido)', 'Carnes y pescados', 110, 25, 0, 1, ['pescado', 'atun']),
  A('merluza', 'Merluza (cruda)', 'Carnes y pescados', 80, 17, 0, 1, ['pescado']),
  A('salmon', 'Salmón (crudo)', 'Carnes y pescados', 200, 20, 0, 13, ['pescado']),
  A('jamon-cocido', 'Jamón cocido', 'Carnes y pescados', 110, 17, 1, 4, ['cerdo', 'fiambre']),
  // Lácteos y huevos
  A('huevo', 'Huevo', 'Lácteos y huevos', 143, 12.5, 1, 10, ['huevo'], { g: 50, uno: 'huevo', varios: 'huevos' }),
  A('leche-entera', 'Leche entera', 'Lácteos y huevos', 62, 3.2, 4.8, 3.3, ['lacteo']),
  A('yogur-natural', 'Yogur natural', 'Lácteos y huevos', 60, 3.5, 5, 3, ['lacteo']),
  A('yogur-griego', 'Yogur griego natural', 'Lácteos y huevos', 97, 9, 4, 5, ['lacteo']),
  A('queso-cremoso', 'Queso cremoso', 'Lácteos y huevos', 300, 22, 1, 23, ['lacteo']),
  A('ricota', 'Ricota', 'Lácteos y huevos', 150, 11, 3, 10, ['lacteo']),
  // Verduras y frutas
  A('banana', 'Banana', 'Verduras y frutas', 90, 1, 23, 0.3, [], { g: 120, uno: 'banana', varios: 'bananas' }),
  A('manzana', 'Manzana', 'Verduras y frutas', 52, 0.3, 14, 0.2, [], { g: 180, uno: 'manzana', varios: 'manzanas' }),
  A('naranja', 'Naranja', 'Verduras y frutas', 47, 0.9, 12, 0.1, [], { g: 200, uno: 'naranja', varios: 'naranjas' }),
  A('frutillas', 'Frutillas', 'Verduras y frutas', 32, 0.7, 8, 0.3),
  A('palta', 'Palta', 'Verduras y frutas', 160, 2, 9, 15),
  A('tomate', 'Tomate', 'Verduras y frutas', 18, 0.9, 3.9, 0.2),
  A('lechuga', 'Lechuga', 'Verduras y frutas', 15, 1.4, 2.9, 0.2),
  A('zanahoria', 'Zanahoria', 'Verduras y frutas', 41, 0.9, 10, 0.2),
  A('zapallito', 'Zapallito', 'Verduras y frutas', 17, 1.2, 3.1, 0.3),
  A('zapallo', 'Zapallo', 'Verduras y frutas', 26, 1, 6.5, 0.1),
  A('cebolla', 'Cebolla', 'Verduras y frutas', 40, 1.1, 9, 0.1),
  A('espinaca', 'Espinaca', 'Verduras y frutas', 23, 2.9, 3.6, 0.4),
  A('brocoli', 'Brócoli', 'Verduras y frutas', 34, 2.8, 7, 0.4),
  A('morron', 'Morrón', 'Verduras y frutas', 31, 1, 6, 0.3),
  A('papa', 'Papa', 'Verduras y frutas', 77, 2, 17, 0.1),
  A('batata', 'Batata', 'Verduras y frutas', 86, 1.6, 20, 0.1),
  // Almacén
  A('arroz', 'Arroz (crudo)', 'Almacén', 360, 7, 80, 0.6),
  A('fideos', 'Fideos secos (crudos)', 'Almacén', 360, 12, 72, 1.5, ['gluten']),
  A('avena', 'Avena', 'Almacén', 380, 13, 66, 7, ['gluten']),
  A('pan', 'Pan', 'Almacén', 270, 9, 52, 3, ['gluten'], { g: 40, uno: 'rebanada', varios: 'rebanadas' }),
  A('polenta', 'Polenta (cruda)', 'Almacén', 360, 8, 77, 1.5),
  A('quinoa', 'Quinoa (cruda)', 'Almacén', 370, 14, 64, 6),
  A('lentejas', 'Lentejas secas', 'Almacén', 340, 25, 60, 1.5, ['legumbres']),
  A('garbanzos-cocidos', 'Garbanzos cocidos (lata o hervidos)', 'Almacén', 130, 7, 20, 2.5, ['legumbres']),
  A('pure-de-tomate', 'Puré de tomate', 'Almacén', 30, 1.5, 6, 0.2),
  A('aceite-de-oliva', 'Aceite de oliva', 'Almacén', 884, 0, 0, 100),
  A('manteca-de-mani', 'Manteca de maní', 'Almacén', 590, 25, 20, 50, ['mani', 'frutos_secos']),
  A('nueces', 'Nueces', 'Almacén', 650, 15, 14, 65, ['frutos_secos']),
  A('miel', 'Miel', 'Almacén', 300, 0.3, 82, 0),
  A('proteina-whey', 'Proteína en polvo (whey)', 'Otros', 380, 78, 8, 6, ['lacteo']),
]

const POR_ID = Object.fromEntries(ALIMENTOS.map(a => [a.id, a]))
export const alimentoPorId = id => POR_ID[id] || null

export const MOMENTOS = [
  { id: 'desayuno', label: 'Desayuno', parte: 0.25 },
  { id: 'almuerzo', label: 'Almuerzo', parte: 0.35 },
  { id: 'merienda', label: 'Merienda / snack', parte: 0.12 },
  { id: 'cena', label: 'Cena', parte: 0.28 },
]

export function momentoSegunHora(fecha = new Date()) {
  const h = fecha.getHours()
  if (h < 11) return 'desayuno'
  if (h < 15) return 'almuerzo'
  if (h < 19) return 'merienda'
  return 'cena'
}

const R = (id, nombre, momentos, minutos, costo, ingredientes, pasos) => ({ id, nombre, momentos, minutos, costo, ingredientes, pasos })

export const RECETAS = [
  R('avena-con-banana', 'Avena con banana y leche', ['desayuno', 'merienda'], 10, 'bajo',
    [['avena', 60], ['leche-entera', 250], ['banana', 120], ['miel', 10]],
    ['Calentá la leche con la avena 4 o 5 minutos, revolviendo.', 'Cortá la banana en rodajas y ponela arriba.', 'Terminá con la miel.']),
  R('tostadas-huevo-palta', 'Tostadas con huevo y palta', ['desayuno', 'merienda'], 10, 'medio',
    [['pan', 80], ['huevo', 100], ['palta', 50]],
    ['Tostá el pan.', 'Hacé los huevos a la plancha o revueltos.', 'Pisá la palta sobre las tostadas y poné el huevo arriba.']),
  R('yogur-frutillas-nueces', 'Yogur griego con frutillas y nueces', ['desayuno', 'merienda'], 5, 'medio',
    [['yogur-griego', 200], ['frutillas', 100], ['nueces', 20], ['miel', 10]],
    ['Poné el yogur en un bowl.', 'Sumá las frutillas cortadas y las nueces picadas.', 'Un hilo de miel y listo.']),
  R('licuado-banana-avena', 'Licuado de banana, avena y manteca de maní', ['desayuno', 'merienda'], 5, 'bajo',
    [['leche-entera', 300], ['banana', 120], ['avena', 30], ['manteca-de-mani', 15]],
    ['Poné todo en la licuadora.', 'Licuá 1 minuto hasta que quede parejo.']),
  R('tostadas-queso-tomate', 'Tostadas con queso y tomate', ['desayuno', 'merienda'], 5, 'bajo',
    [['pan', 80], ['queso-cremoso', 40], ['tomate', 80]],
    ['Tostá el pan.', 'Ponele el queso y el tomate en rodajas.']),
  R('sandwich-jamon-queso', 'Sándwich de jamón y queso', ['merienda', 'cena'], 5, 'bajo',
    [['pan', 80], ['jamon-cocido', 40], ['queso-cremoso', 30], ['tomate', 40]],
    ['Armá el sándwich con el jamón, el queso y el tomate.', 'Si querés, calentalo en la plancha un minuto por lado.']),
  R('manzana-manteca-mani', 'Manzana con manteca de maní', ['merienda'], 3, 'bajo',
    [['manzana', 180], ['manteca-de-mani', 20]],
    ['Cortá la manzana en gajos.', 'Comela con la manteca de maní para untar.']),
  R('huevos-duros-fruta', 'Huevos duros con naranja', ['merienda'], 12, 'bajo',
    [['huevo', 100], ['naranja', 200]],
    ['Hervilos 10 minutos y pasalos por agua fría.', 'Acompañalos con la naranja.']),
  R('ricota-miel-nueces', 'Ricota con miel y nueces', ['merienda', 'desayuno'], 3, 'medio',
    [['ricota', 150], ['miel', 10], ['nueces', 15]],
    ['Poné la ricota en un plato.', 'Sumá la miel y las nueces picadas.']),
  R('pollo-arroz-brocoli', 'Pollo con arroz y brócoli', ['almuerzo', 'cena'], 30, 'bajo',
    [['pechuga-de-pollo', 180], ['arroz', 80], ['brocoli', 150], ['aceite-de-oliva', 10]],
    ['Hervilo el arroz unos 15 minutos.', 'Cortá el pollo en cubos y salteálo con el aceite hasta dorar.', 'Hervilo el brócoli 5 minutos y servilo todo junto.']),
  R('milanesa-pollo-papas', 'Milanesa de pollo al horno con papas', ['almuerzo', 'cena'], 40, 'bajo',
    [['pechuga-de-pollo', 180], ['huevo', 50], ['pan', 30], ['papa', 200], ['lechuga', 80], ['tomate', 100], ['aceite-de-oliva', 10]],
    ['Cortá la pechuga en bifes finos, pasalos por huevo batido y pan rallado.', 'Horno a 200° unos 20 minutos, dándolos vuelta a la mitad.', 'Cortá las papas en bastones, aceite y al horno junto con las milanesas.', 'Serví con ensalada de lechuga y tomate.']),
  R('fideos-salsa-carne', 'Fideos con salsa de carne', ['almuerzo', 'cena'], 30, 'medio',
    [['fideos', 90], ['carne-picada-magra', 120], ['pure-de-tomate', 150], ['cebolla', 50], ['aceite-de-oliva', 5]],
    ['Rehogá la cebolla con el aceite y sumá la carne hasta que se dore.', 'Agregá el puré de tomate y dejá hacer 15 minutos.', 'Hervilo los fideos y mezclalos con la salsa.']),
  R('tortilla-papa', 'Tortilla de papa y cebolla', ['almuerzo', 'cena'], 35, 'bajo',
    [['papa', 250], ['huevo', 150], ['cebolla', 60], ['aceite-de-oliva', 10]],
    ['Cortá la papa y la cebolla finas y cocinalas en la sartén tapada hasta que estén tiernas.', 'Mezclalas con los huevos batidos.', 'Cuajá la tortilla de los dos lados a fuego medio.']),
  R('guiso-lentejas', 'Guiso de lentejas', ['almuerzo', 'cena'], 45, 'bajo',
    [['lentejas', 90], ['zanahoria', 80], ['cebolla', 50], ['papa', 100], ['pure-de-tomate', 80], ['aceite-de-oliva', 8]],
    ['Rehogá la cebolla y la zanahoria con el aceite.', 'Sumá las lentejas (remojadas si hace falta), la papa en cubos, el puré y agua que las cubra.', 'Cociná 30 minutos hasta que estén tiernas.']),
  R('ensalada-atun-papa-huevo', 'Ensalada de atún, papa y huevo', ['almuerzo', 'cena'], 25, 'medio',
    [['atun-al-natural', 120], ['papa', 200], ['huevo', 100], ['tomate', 100], ['lechuga', 60], ['aceite-de-oliva', 10]],
    ['Hervilo las papas y los huevos.', 'Cortá todo y mezclalo con el atún y la lechuga.', 'Condimentá con el aceite.']),
  R('bife-pure-ensalada', 'Bife con puré de papa y ensalada', ['almuerzo', 'cena'], 35, 'alto',
    [['carne-vacuna-magra', 180], ['papa', 250], ['leche-entera', 50], ['lechuga', 60], ['tomate', 80], ['aceite-de-oliva', 5]],
    ['Hervilo las papas y pisalas con la leche.', 'Cociná el bife en plancha caliente 3 o 4 minutos por lado.', 'Serví con la ensalada.']),
  R('merluza-batata', 'Merluza al horno con batata y zapallito', ['almuerzo', 'cena'], 35, 'medio',
    [['merluza', 200], ['batata', 250], ['zapallito', 120], ['aceite-de-oliva', 10]],
    ['Cortá la batata y el zapallito, ponelos en una fuente con la mitad del aceite.', 'Horno a 200° 15 minutos.', 'Sumá la merluza con el resto del aceite y 12 minutos más.']),
  R('revuelto-espinaca-jamon', 'Revuelto de huevos con espinaca y jamón', ['almuerzo', 'cena', 'desayuno'], 10, 'bajo',
    [['huevo', 150], ['espinaca', 80], ['jamon-cocido', 40], ['pan', 60], ['aceite-de-oliva', 5]],
    ['Salteá la espinaca con el aceite un minuto.', 'Sumá el jamón picado y los huevos batidos.', 'Revolvé hasta que cuaje y serví con el pan.']),
  R('arroz-salteado-pollo', 'Arroz salteado con pollo y verduras', ['almuerzo', 'cena'], 30, 'bajo',
    [['arroz', 90], ['pechuga-de-pollo', 150], ['zanahoria', 60], ['morron', 60], ['cebolla', 40], ['aceite-de-oliva', 10]],
    ['Hervilo el arroz.', 'Salteá el pollo en cubos y las verduras en tiras.', 'Mezclá con el arroz y salteá todo 2 minutos.']),
  R('hamburguesa-casera', 'Hamburguesa casera con ensalada', ['almuerzo', 'cena'], 20, 'medio',
    [['carne-picada-magra', 150], ['pan', 70], ['huevo', 50], ['lechuga', 40], ['tomate', 80], ['aceite-de-oliva', 5]],
    ['Mezclá la carne con el huevo y formá una hamburguesa.', 'Cocinala en plancha 4 minutos por lado.', 'Armala en el pan con la lechuga y el tomate.']),
  R('garbanzos-huevo-espinaca', 'Garbanzos con huevo y espinaca', ['almuerzo', 'cena'], 20, 'bajo',
    [['garbanzos-cocidos', 200], ['huevo', 100], ['espinaca', 100], ['cebolla', 40], ['aceite-de-oliva', 8]],
    ['Rehogá la cebolla con el aceite.', 'Sumá la espinaca y los garbanzos escurridos.', 'Hacé huecos, rompé los huevos adentro y tapá hasta que cuajen.']),
  R('polenta-salsa-queso', 'Polenta con salsa y queso', ['almuerzo', 'cena'], 25, 'bajo',
    [['polenta', 90], ['pure-de-tomate', 120], ['queso-cremoso', 40], ['cebolla', 40], ['aceite-de-oliva', 5]],
    ['Cociná la polenta según el paquete.', 'Hacé una salsa rápida con la cebolla y el puré.', 'Serví la polenta con salsa y el queso por encima.']),
  R('bowl-quinoa-pollo-palta', 'Bowl de quinoa, pollo y palta', ['almuerzo', 'cena'], 30, 'alto',
    [['quinoa', 70], ['pechuga-de-pollo', 150], ['palta', 60], ['tomate', 80], ['aceite-de-oliva', 5]],
    ['Hervilo la quinoa 12 minutos y escurrila.', 'Cociná el pollo a la plancha y cortalo en tiras.', 'Armá el bowl con la palta y el tomate en cubos.']),
  R('salmon-papas-brocoli', 'Salmón con papas y brócoli', ['almuerzo', 'cena'], 35, 'alto',
    [['salmon', 180], ['papa', 200], ['brocoli', 120], ['aceite-de-oliva', 10]],
    ['Papas en cubos al horno con aceite 20 minutos a 200°.', 'Sumá el salmón y cociná 12 minutos más.', 'Hervilo el brócoli 5 minutos y serví.']),
]

// ---------- Macros ----------

const redondear1 = n => Math.round(n * 10) / 10

export function macrosDeItems(items) {
  const t = { kcal: 0, p: 0, c: 0, g: 0 }
  for (const it of items || []) {
    const a = alimentoPorId(it.id)
    if (!a) continue
    const f = (Number(it.gramos) || 0) / 100
    t.kcal += a.kcal * f
    t.p += a.p * f
    t.c += a.c * f
    t.g += a.g * f
  }
  return { kcal: Math.round(t.kcal), p: redondear1(t.p), c: redondear1(t.c), g: redondear1(t.g) }
}

export function totalesDelDia(comidas, fecha = new Date()) {
  const dia = fecha.toDateString()
  const t = { kcal: 0, p: 0, c: 0, g: 0 }
  for (const c of comidas || []) {
    if (new Date(c.fecha).toDateString() !== dia) continue
    t.kcal += Number(c.kcal) || 0
    t.p += Number(c.p) || 0
    t.c += Number(c.c) || 0
    t.g += Number(c.g) || 0
  }
  return { kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), g: Math.round(t.g) }
}

// ---------- Filtros según el perfil ----------

const sinTildes = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

const SINONIMOS = {
  lactosa: ['lacteo'],
  lacteo: ['lacteo'],
  gluten: ['gluten'],
  celiaco: ['gluten'],
  celiaquia: ['gluten'],
  tacc: ['gluten'],
  'frutos secos': ['frutos_secos', 'mani'],
  mani: ['mani'],
  vegetariano: ['carne', 'pollo', 'pescado', 'cerdo', 'fiambre'],
  vegano: ['carne', 'pollo', 'pescado', 'cerdo', 'fiambre', 'lacteo', 'huevo', 'miel'],
}

export function terminosProhibidos(perfil) {
  const crudo = `${perfil.noComo || ''},${perfil.alergias || ''}`
  const partes = sinTildes(crudo).split(/[,;\n/]|\sy\s|\se\s/).map(s => s.trim()).filter(s => s.length >= 3)
  const salida = new Set()
  for (const original of partes) {
    // "huevos" -> "huevo" (solo palabras sueltas; "frutos secos" queda igual)
    const t = !original.includes(' ') && original.endsWith('s') && original.length > 4 ? original.slice(0, -1) : original
    salida.add(t)
    for (const extra of [...(SINONIMOS[t] || []), ...(SINONIMOS[original] || [])]) salida.add(extra)
  }
  return [...salida]
}

function coincide(texto, termino) {
  if (texto === termino) return true
  if (termino.includes(' ')) return texto.includes(termino)
  return texto.split(/[\s_]+/).some(w => w === termino || (termino.length >= 4 && w.startsWith(termino)))
}

export function huella(receta) {
  const textos = [sinTildes(receta.nombre)]
  for (const [id] of receta.ingredientes) {
    const a = alimentoPorId(id)
    if (!a) continue
    textos.push(sinTildes(a.nombre))
    for (const t of a.tags) textos.push(sinTildes(t))
  }
  return textos
}

export function recetaProhibida(receta, perfil) {
  const terminos = terminosProhibidos(perfil)
  if (terminos.length === 0) return false
  const textos = huella(receta)
  return terminos.some(t => textos.some(x => coincide(x, t)))
}

const COSTOS_OK = { bajo: ['bajo'], medio: ['bajo', 'medio'], alto: ['bajo', 'medio', 'alto'] }

// ---------- Escalado y sugerencias ----------

export function escalar(receta, factor = 1) {
  const ingredientes = receta.ingredientes.map(([id, g]) => {
    const a = alimentoPorId(id)
    const bruto = g * factor
    let gramos
    if (a && a.unidad) gramos = Math.max(1, Math.round(bruto / a.unidad.g)) * a.unidad.g
    else gramos = Math.max(5, Math.round(bruto / 5) * 5)
    return { id, nombre: a ? a.nombre : id, gramos }
  })
  const m = macrosDeItems(ingredientes)
  return { ...receta, factor, ingredientes, kcal: m.kcal, p: m.p, c: m.c, g: m.g }
}

export function textoCantidad(id, gramos) {
  const a = alimentoPorId(id)
  if (a && a.unidad) {
    const n = Math.round(gramos / a.unidad.g)
    return `${n} ${n === 1 ? a.unidad.uno : a.unidad.varios}`
  }
  if (gramos >= 1000) return `${(gramos / 1000).toFixed(1).replace('.', ',')} kg`
  return `${gramos} g`
}

const limitar = (n, min, max) => Math.min(max, Math.max(min, n))

// Devuelve { opciones: [recetas escaladas, mejor primero], descartadas: { prohibidas, tiempo, costo } }
export function sugerirRecetas(perfil, metas, momento = 'almuerzo') {
  const parte = (MOMENTOS.find(m => m.id === momento) || MOMENTOS[1]).parte
  const kcalObj = metas.kcal * parte
  const protObj = metas.proteinaG * parte
  const minutos = Number(perfil.minutosParaCocinar) || 0
  const costos = COSTOS_OK[perfil.presupuesto] || COSTOS_OK.medio
  const descartadas = { prohibidas: 0, tiempo: 0, costo: 0 }
  const opciones = []

  for (const r of RECETAS) {
    if (!r.momentos.includes(momento)) continue
    if (recetaProhibida(r, perfil)) { descartadas.prohibidas++; continue }
    if (minutos > 0 && r.minutos > minutos) { descartadas.tiempo++; continue }
    if (!costos.includes(r.costo)) { descartadas.costo++; continue }
    const base = macrosDeItems(r.ingredientes.map(([id, gramos]) => ({ id, gramos })))
    const factor = limitar(Math.round((kcalObj / Math.max(base.kcal, 1)) * 4) / 4, 0.5, 2)
    const esc = escalar(r, factor)
    const puntaje = Math.abs(esc.p - protObj) + Math.abs(esc.kcal - kcalObj) / 15
    opciones.push({ ...esc, puntaje })
  }
  opciones.sort((a, b) => a.puntaje - b.puntaje)
  return { opciones, descartadas, kcalObj: Math.round(kcalObj), protObj: Math.round(protObj) }
}

export function recetaPorId(id) {
  return RECETAS.find(r => r.id === id) || null
}

// ---------- Lista de compras ----------

// elegidas: [{ id, factor }]  ->  [{ cat, items: [{ id, nombre, gramos, texto }] }]
export function comprasDe(elegidas) {
  const total = {}
  for (const e of elegidas || []) {
    const r = recetaPorId(e.id)
    if (!r) continue
    for (const ing of escalar(r, e.factor || 1).ingredientes) {
      total[ing.id] = (total[ing.id] || 0) + ing.gramos
    }
  }
  const grupos = []
  for (const cat of CATEGORIAS) {
    const items = Object.entries(total)
      .filter(([id]) => (alimentoPorId(id) || {}).cat === cat)
      .map(([id, gramos]) => ({ id, nombre: alimentoPorId(id).nombre.replace(/ \(.*\)$/, ''), gramos, texto: textoCantidad(id, gramos) }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
    if (items.length) grupos.push({ cat, items })
  }
  return grupos
}

export function comprasATexto(grupos) {
  return grupos.map(g => `${g.cat}\n${g.items.map(i => `- ${i.nombre}: ${i.texto}`).join('\n')}`).join('\n\n')
}
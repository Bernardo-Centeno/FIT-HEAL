import React, { useMemo, useState } from 'react'
import { objetivosNutricion, deporteActivo } from '../lib/plan.js'
import { feedbackComida, sugerirComidaYReceta, listaDeCompras, reducirImagen } from '../lib/ai.js'
import { uid } from '../lib/storage.js'
import {
  ALIMENTOS, CATEGORIAS, MOMENTOS, alimentoPorId, macrosDeItems, totalesDelDia, momentoSegunHora,
  sugerirRecetas, textoCantidad, comprasDe, comprasATexto,
} from '../lib/alimentos.js'
import { Anillos, anillosDe } from './Graficos.jsx'
import EditorComida from './EditorComida.jsx'

function Macros({ m }) {
  return <span className="nota">{m.kcal} kcal · P {Math.round(m.p)} g · C {Math.round(m.c)} g · G {Math.round(m.g)} g</span>
}

// ---------- Registrar lo que comiste (sin IA) ----------

function Registrar({ actualizar }) {
  const [alimentoId, setAlimentoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [modo, setModo] = useState('g')
  const [plato, setPlato] = useState([])
  const [error, setError] = useState('')

  const alimento = alimentoPorId(alimentoId)
  const macros = macrosDeItems(plato)

  const elegir = id => { setAlimentoId(id); setModo('g'); setError('') }

  const agregar = () => {
    if (!alimento) { setError('Elegí un alimento.'); return }
    const n = Number(cantidad)
    if (!(n > 0)) { setError('Poné una cantidad mayor a 0.'); return }
    const gramos = modo === 'u' && alimento.unidad ? n * alimento.unidad.g : n
    setPlato(p => [...p, { id: alimento.id, gramos }])
    setCantidad(''); setError('')
  }

  const guardar = () => {
    if (plato.length === 0) { setError('Agregá al menos un alimento.'); return }
    const descripcion = plato.map(i => `${alimentoPorId(i.id).nombre.replace(/ \(.*\)$/, '')} ${textoCantidad(i.id, i.gramos)}`).join(', ')
    actualizar(e => ({
      ...e,
      comidas: [...e.comidas, { id: uid(), fecha: new Date().toISOString(), descripcion, feedback: '', origen: 'manual', items: plato, ...macros }],
    }))
    setPlato([]); setError('')
  }

  return (
    <section className="card">
      <h2>Anotar lo que comí</h2>
      <p className="nota">Elegí el alimento y la cantidad. Los valores son aproximados (carnes, arroz, fideos y legumbres secas, en crudo).</p>
      <label>Alimento
        <select value={alimentoId} onChange={e => elegir(e.target.value)}>
          <option value="">Elegí uno…</option>
          {CATEGORIAS.map(cat => (
            <optgroup key={cat} label={cat}>
              {ALIMENTOS.filter(a => a.cat === cat).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="fila">
        <label>Cantidad
          <input type="number" inputMode="decimal" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder={modo === 'u' ? 'unidades' : 'gramos'} />
        </label>
        <label>Medida
          <select value={modo} onChange={e => setModo(e.target.value)} disabled={!alimento || !alimento.unidad}>
            <option value="g">gramos</option>
            {alimento && alimento.unidad && <option value="u">{alimento.unidad.varios} (≈ {alimento.unidad.g} g c/u)</option>}
          </select>
        </label>
      </div>
      <button onClick={agregar}>Agregar al plato</button>

      {plato.length > 0 && (
        <div className="plato">
          {plato.map((i, k) => (
            <div key={k} className="fila-sb">
              <span>{alimentoPorId(i.id).nombre.replace(/ \(.*\)$/, '')}: {textoCantidad(i.id, i.gramos)}</span>
              <button className="enlace" onClick={() => setPlato(p => p.filter((_, j) => j !== k))}>Quitar</button>
            </div>
          ))}
          <strong>Total del plato</strong>
          <Macros m={macros} />
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <button className="primario" onClick={guardar} disabled={plato.length === 0}>Guardar comida</button>
    </section>
  )
}

// ---------- ¿Qué como? (sin IA) ----------

function QueComo({ perfil, metas, elegidas, actualizar }) {
  const [momento, setMomento] = useState(momentoSegunHora())
  const [salto, setSalto] = useState(0)
  const [abierta, setAbierta] = useState(null)

  const { opciones, descartadas, kcalObj, protObj } = useMemo(() => sugerirRecetas(perfil, metas, momento), [perfil, metas, momento])
  const visibles = opciones.length <= 3
    ? opciones
    : [0, 1, 2].map(i => opciones[(salto + i) % opciones.length])

  const yaElegida = r => elegidas.some(e => e.id === r.id)

  const alternarCompras = r => actualizar(e => {
    const lista = e.elegidas || []
    return { ...e, elegidas: lista.some(x => x.id === r.id) ? lista.filter(x => x.id !== r.id) : [...lista, { id: r.id, factor: r.factor }] }
  })

  const yaLaComi = r => actualizar(e => ({
    ...e,
    comidas: [...e.comidas, {
      id: uid(), fecha: new Date().toISOString(), descripcion: `${r.nombre} (×${r.factor})`, feedback: '', origen: 'receta',
      items: r.ingredientes.map(i => ({ id: i.id, gramos: i.gramos })), kcal: r.kcal, p: r.p, c: r.c, g: r.g,
    }],
  }))

  return (
    <section className="card">
      <h2>¿Qué como?</h2>
      <div className="pildoras chicas">
        {MOMENTOS.map(m => (
          <button key={m.id} className={momento === m.id ? 'activa' : ''} onClick={() => { setMomento(m.id); setSalto(0); setAbierta(null) }}>{m.label}</button>
        ))}
      </div>
      <p className="nota">Para este momento apunto a unas {kcalObj} kcal y {protObj} g de proteína. Las cantidades ya están ajustadas a eso.</p>

      {visibles.length === 0 && (
        <p className="aviso">
          No encontré recetas para este momento con tus filtros
          {descartadas.prohibidas > 0 && `, ${descartadas.prohibidas} se descartaron por lo que no comés o tus alergias`}
          {descartadas.tiempo > 0 && `, ${descartadas.tiempo} por el tiempo para cocinar`}
          {descartadas.costo > 0 && `, ${descartadas.costo} por el presupuesto`}.
          Podés ajustarlos en Perfil.
        </p>
      )}

      {visibles.map(r => (
        <div key={r.id} className="receta-op">
          <div className="fila-sb">
            <h3>{r.nombre}</h3>
            <span className="chip">×{r.factor}</span>
          </div>
          <Macros m={r} />
          <span className="nota">{r.minutos} min · costo {r.costo}</span>
          <button className="enlace" onClick={() => setAbierta(abierta === r.id ? null : r.id)}>{abierta === r.id ? 'Ocultar receta' : 'Ver ingredientes y pasos'}</button>
          {abierta === r.id && (
            <div className="explicacion">
              <strong>Ingredientes</strong>
              <ul>{r.ingredientes.map(i => <li key={i.id}>{i.nombre.replace(/ \(.*\)$/, '')}: {textoCantidad(i.id, i.gramos)}</li>)}</ul>
              <strong>Pasos</strong>
              <ol>{r.pasos.map((p, k) => <li key={k}>{p}</li>)}</ol>
            </div>
          )}
          <div className="fila">
            <button onClick={() => yaLaComi(r)}>Ya la comí</button>
            <button onClick={() => alternarCompras(r)}>{yaElegida(r) ? 'Quitar de compras' : 'A la lista de compras'}</button>
          </div>
        </div>
      ))}

      {opciones.length > 3 && <button onClick={() => setSalto(s => (s + 3) % opciones.length)}>Ver otras opciones</button>}
      <p className="nota">Son ideas generales de alimentación, no un plan médico.</p>
    </section>
  )
}

// ---------- Lista de compras (sin IA) ----------

function Compras({ elegidas, actualizar }) {
  const [comprado, setComprado] = useState({})
  const [copiada, setCopiada] = useState(false)
  const grupos = useMemo(() => comprasDe(elegidas), [elegidas])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(comprasATexto(grupos))
      setCopiada(true)
      setTimeout(() => setCopiada(false), 2000)
    } catch { /* si el navegador no deja copiar, la lista igual se ve en pantalla */ }
  }

  return (
    <section className="card">
      <h2>Lista de compras</h2>
      {grupos.length === 0 ? (
        <p className="nota">Todavía no elegiste recetas. Tocá "A la lista de compras" en las recetas de arriba y acá se suman los ingredientes.</p>
      ) : (
        <>
          <p className="nota">Armada con {elegidas.length} {elegidas.length === 1 ? 'receta elegida' : 'recetas elegidas'}, una porción de cada una.</p>
          {grupos.map(g => (
            <div key={g.cat}>
              <strong>{g.cat}</strong>
              {g.items.map(i => (
                <label key={i.id} className="check item-compra">
                  <input type="checkbox" checked={!!comprado[i.id]} onChange={e => setComprado(c => ({ ...c, [i.id]: e.target.checked }))} />
                  <span className={comprado[i.id] ? 'tachado' : ''}>{i.nombre}: {i.texto}</span>
                </label>
              ))}
            </div>
          ))}
          <div className="fila">
            <button onClick={copiar}>{copiada ? '¡Copiada!' : 'Copiar lista'}</button>
            <button className="peligro" onClick={() => { actualizar(e => ({ ...e, elegidas: [] })); setComprado({}) }}>Vaciar</button>
          </div>
        </>
      )}
    </section>
  )
}

// ---------- Opcional con IA ----------

function ConIA({ estado, actualizar, metas, irA, tipoDia }) {
  const { perfil, recetas, ajustes } = estado
  const tieneIA = !!ajustes.apiKey
  const [foto, setFoto] = useState(null)
  const [descripcion, setDescripcion] = useState('')
  const [resultado, setResultado] = useState('')
  const [pedido, setPedido] = useState('')
  const [ingredientes, setIngredientes] = useState('')
  const [receta, setReceta] = useState('')
  const [compras, setCompras] = useState('')
  const [cargando, setCargando] = useState('')
  const [error, setError] = useState('')

  const elegirFoto = async ev => {
    const file = ev.target.files && ev.target.files[0]
    if (!file) return
    try {
      const { base64, mediaType } = await reducirImagen(file)
      setFoto({ base64, mediaType, preview: `data:${mediaType};base64,${base64}` })
      setError('')
    } catch (e) { setError(e.message) }
  }

  const analizar = async () => {
    if (!foto && !descripcion.trim()) { setError('Sacá o subí una foto, o describí lo que comiste.'); return }
    setCargando('plato'); setError(''); setResultado('')
    try {
      const texto = await feedbackComida({ ajustes, perfil, objetivos: metas, imagenBase64: foto && foto.base64, mediaType: foto && foto.mediaType, descripcion })
      setResultado(texto)
      actualizar(e => ({ ...e, comidas: [...e.comidas, { id: uid(), fecha: new Date().toISOString(), descripcion: descripcion.trim() || 'Comida con foto', feedback: texto, origen: foto ? 'foto' : 'texto' }] }))
      setFoto(null); setDescripcion('')
    } catch (e) { setError(e.message) } finally { setCargando('') }
  }

  const pedirReceta = async () => {
    setCargando('receta'); setError(''); setReceta('')
    try {
      const texto = await sugerirComidaYReceta({ ajustes, perfil, objetivos: metas, pedido, ingredientes, tipoDia })
      setReceta(texto)
      actualizar(e => ({ ...e, recetas: [...e.recetas, { id: uid(), fecha: new Date().toISOString(), titulo: texto.split('\n')[0].replace(/[#*]/g, '').trim().slice(0, 60) || 'Receta', texto }] }))
    } catch (e) { setError(e.message) } finally { setCargando('') }
  }

  const armarCompras = async () => {
    const ultimas = recetas.slice(-5)
    if (ultimas.length === 0) { setError('Primero pedí al menos una receta con IA.'); return }
    setCargando('compras'); setError(''); setCompras('')
    try { setCompras(await listaDeCompras({ ajustes, perfil, recetas: ultimas })) } catch (e) { setError(e.message) } finally { setCargando('') }
  }

  if (!tieneIA) {
    return (
      <section className="card">
        <h2>Con IA (opcional)</h2>
        <p className="nota">Todo lo de arriba funciona sin clave. Analizar la foto de un plato, pedir recetas a medida y armar listas con IA necesitan tu clave de API: pegala en <a href="#ajustes" onClick={e => { e.preventDefault(); irA('ajustes') }}>Ajustes</a>.</p>
      </section>
    )
  }

  return (
    <>
      <section className="card">
        <h2>¿Cómo está mi plato? (IA)</h2>
        <input type="file" accept="image/*" onChange={elegirFoto} />
        {foto && <img className="preview" src={foto.preview} alt="Tu comida" />}
        <label>Descripción (opcional, mejora el análisis)
          <textarea rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: milanesa de pollo al horno con ensalada, unos 200 g" />
        </label>
        <button className="primario" onClick={analizar} disabled={cargando === 'plato'}>{cargando === 'plato' ? 'Analizando…' : 'Analizar con IA'}</button>
        {resultado && <div className="respuesta">{resultado}</div>}
        <p className="nota">Las calorías y macros que salen de una foto son aproximadas: no se ve el aceite ni el tamaño real de la porción.</p>
      </section>

      <section className="card">
        <h2>Receta a medida (IA)</h2>
        <label>Pedido
          <input value={pedido} onChange={e => setPedido(e.target.value)} placeholder="Ej: una cena rápida alta en proteína" />
        </label>
        <label>Qué tenés en casa (opcional)
          <input value={ingredientes} onChange={e => setIngredientes(e.target.value)} placeholder="Ej: pollo, arroz, zapallito, huevos" />
        </label>
        <button className="primario" onClick={pedirReceta} disabled={cargando === 'receta'}>{cargando === 'receta' ? 'Pensando…' : 'Sugerime una receta'}</button>
        {receta && <div className="respuesta">{receta}</div>}
        <button onClick={armarCompras} disabled={cargando === 'compras' || recetas.length === 0}>{cargando === 'compras' ? 'Armando…' : `Lista de compras de mis últimas ${Math.min(5, recetas.length)} recetas IA`}</button>
        {compras && <div className="respuesta">{compras}</div>}
        {error && <p className="error">{error}</p>}
      </section>
    </>
  )
}

// ---------- Pantalla ----------

export default function Comida({ estado, actualizar, irA }) {
  const { perfil, comidas, recetas } = estado
  const elegidas = estado.elegidas || []

  const hoy = new Date().toDateString()
  const entrenoHoy = estado.sesiones.some(s => new Date(s.fecha).toDateString() === hoy)
  const [tipoDia, setTipoDia] = useState(entrenoHoy ? 'entreno' : 'descanso') // entreno | deporte | descanso
  const metas = objetivosNutricion(perfil, tipoDia)
  const consumido = totalesDelDia(comidas)

  const [editando, setEditando] = useState(null)
  const borrar = id => actualizar(e => ({ ...e, comidas: e.comidas.filter(c => c.id !== id) }))
  const guardarComida = nueva => { actualizar(e => ({ ...e, comidas: e.comidas.map(c => (c.id === nueva.id ? nueva : c)) })); setEditando(null) }

  return (
    <div className="pantalla">
      <section className="card destacada">
        <div className="cabecera-metas">
          <h2>Metas de hoy</h2>
          <div className="pildoras chicas">
            <button className={tipoDia === 'entreno' ? 'activa' : ''} onClick={() => setTipoDia('entreno')}>Entreno</button>
            {deporteActivo(perfil) && <button className={tipoDia === 'deporte' ? 'activa' : ''} onClick={() => setTipoDia('deporte')}>Deporte</button>}
            <button className={tipoDia === 'descanso' ? 'activa' : ''} onClick={() => setTipoDia('descanso')}>Descanso</button>
          </div>
        </div>
        <Anillos anillos={anillosDe(metas, consumido)} centroNumero={Math.max(0, metas.kcal - consumido.kcal)} centroTexto="kcal por comer" />
        <p className="nota">Cuenta solo lo que anotaste hoy con cantidades. Son metas orientativas, no hace falta clavarlas al gramo.</p>
      </section>

      <Registrar actualizar={actualizar} />
      <QueComo perfil={perfil} metas={metas} elegidas={elegidas} actualizar={actualizar} />
      <Compras elegidas={elegidas} actualizar={actualizar} />
      <ConIA estado={estado} actualizar={actualizar} metas={metas} irA={irA} tipoDia={tipoDia} />

      {comidas.length > 0 && (
        <section className="card">
          <h2>Últimas comidas</h2>
          {[...comidas].reverse().slice(0, 10).map(c => (
            <details key={c.id}>
              <summary>{new Date(c.fecha).toLocaleDateString('es-AR')} · {c.descripcion.slice(0, 60)}{c.kcal ? ` · ${c.kcal} kcal` : ''}</summary>
              {c.kcal ? <Macros m={c} /> : null}
              {c.feedback ? <div className="respuesta">{c.feedback}</div> : null}
              {editando === c.id ? (
                <EditorComida comida={c} onGuardar={guardarComida} onCerrar={() => setEditando(null)} />
              ) : (
                <div className="fila">
                  <button className="enlace" onClick={() => setEditando(c.id)}>Editar esta comida</button>
                  <button className="enlace" onClick={() => borrar(c.id)}>Borrar esta comida</button>
                </div>
              )}
            </details>
          ))}
        </section>
      )}

      {recetas.length > 0 && (
        <section className="card">
          <h2>Recetas guardadas (IA)</h2>
          {[...recetas].reverse().slice(0, 8).map(r => (
            <details key={r.id}>
              <summary>{r.titulo}</summary>
              <div className="respuesta">{r.texto}</div>
            </details>
          ))}
        </section>
      )}
    </div>
  )
}
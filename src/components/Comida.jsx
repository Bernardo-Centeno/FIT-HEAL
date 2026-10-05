import React, { useState } from 'react'
import { objetivosNutricion, deporteActivo } from '../lib/plan.js'
import { feedbackComida, sugerirComidaYReceta, listaDeCompras, reducirImagen } from '../lib/ai.js'
import { uid } from '../lib/storage.js'

export default function Comida({ estado, actualizar, irA }) {
  const { perfil, comidas, recetas, ajustes } = estado
  const tieneIA = !!ajustes.apiKey

  const hoy = new Date().toDateString()
  const entrenoHoy = estado.sesiones.some(s => new Date(s.fecha).toDateString() === hoy)
  const [tipoDia, setTipoDia] = useState(entrenoHoy ? 'entreno' : 'descanso') // entreno | deporte | descanso
  const metas = objetivosNutricion(perfil, tipoDia)

  const [foto, setFoto] = useState(null) // { base64, mediaType, preview }
  const [descripcion, setDescripcion] = useState('')
  const [resultado, setResultado] = useState('')
  const [pedido, setPedido] = useState('')
  const [ingredientes, setIngredientes] = useState('')
  const [receta, setReceta] = useState('')
  const [compras, setCompras] = useState('')
  const [cargando, setCargando] = useState('') // '', 'plato', 'receta', 'compras'
  const [error, setError] = useState('')

  const elegirFoto = async ev => {
    const file = ev.target.files && ev.target.files[0]
    if (!file) return
    try {
      const { base64, mediaType } = await reducirImagen(file)
      setFoto({ base64, mediaType, preview: `data:${mediaType};base64,${base64}` })
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  const analizar = async () => {
    if (!foto && !descripcion.trim()) { setError('Sacá o subí una foto, o describí lo que comiste.'); return }
    setCargando('plato'); setError(''); setResultado('')
    try {
      const texto = await feedbackComida({
        ajustes, perfil, objetivos: metas,
        imagenBase64: foto && foto.base64, mediaType: foto && foto.mediaType, descripcion,
      })
      setResultado(texto)
      actualizar(e => ({ ...e, comidas: [...e.comidas, { id: uid(), fecha: new Date().toISOString(), descripcion: descripcion.trim() || 'Comida con foto', feedback: texto, origen: foto ? 'foto' : 'texto' }] }))
      setFoto(null); setDescripcion('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando('')
    }
  }

  const soloRegistrar = () => {
    if (!descripcion.trim()) { setError('Escribí qué comiste.'); return }
    actualizar(e => ({ ...e, comidas: [...e.comidas, { id: uid(), fecha: new Date().toISOString(), descripcion: descripcion.trim(), feedback: '', origen: 'texto' }] }))
    setDescripcion(''); setError('')
  }

  const pedirReceta = async () => {
    setCargando('receta'); setError(''); setReceta('')
    try {
      const texto = await sugerirComidaYReceta({ ajustes, perfil, objetivos: metas, pedido, ingredientes, tipoDia })
      setReceta(texto)
      actualizar(e => ({ ...e, recetas: [...e.recetas, { id: uid(), fecha: new Date().toISOString(), titulo: texto.split('\n')[0].replace(/[#*]/g, '').trim().slice(0, 60) || 'Receta', texto }] }))
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando('')
    }
  }

  const armarCompras = async () => {
    const ultimas = recetas.slice(-5)
    if (ultimas.length === 0) { setError('Primero pedí al menos una receta.'); return }
    setCargando('compras'); setError(''); setCompras('')
    try {
      setCompras(await listaDeCompras({ ajustes, perfil, recetas: ultimas }))
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando('')
    }
  }

  const SinIA = () => (
    <p className="nota">Esto necesita tu clave de API. Pegala en <a href="#ajustes" onClick={e => { e.preventDefault(); irA('ajustes') }}>Ajustes</a>.</p>
  )

  return (
    <div className="pantalla">
      <section className="card destacada">
        <div className="fila-sb">
          <h2>Metas de hoy</h2>
          <div className="pildoras chicas">
            <button className={tipoDia === 'entreno' ? 'activa' : ''} onClick={() => setTipoDia('entreno')}>Entreno</button>
            {deporteActivo(perfil) && <button className={tipoDia === 'deporte' ? 'activa' : ''} onClick={() => setTipoDia('deporte')}>Deporte</button>}
            <button className={tipoDia === 'descanso' ? 'activa' : ''} onClick={() => setTipoDia('descanso')}>Descanso</button>
          </div>
        </div>
        <div className="macros">
          <div><strong>{metas.kcal}</strong><span>kcal</span></div>
          <div><strong>{metas.proteinaG} g</strong><span>proteína</span></div>
          <div><strong>{metas.carbosG} g</strong><span>carbos</span></div>
          <div><strong>{metas.grasasG} g</strong><span>grasas</span></div>
        </div>
      </section>

      <section className="card">
        <h2>¿Cómo está mi plato?</h2>
        <input type="file" accept="image/*" onChange={elegirFoto} />
        {foto && <img className="preview" src={foto.preview} alt="Tu comida" />}
        <label>Descripción (opcional, mejora el análisis)
          <textarea rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: milanesa de pollo al horno con ensalada, unos 200 g" />
        </label>
        <div className="fila">
          <button className="primario" onClick={analizar} disabled={!tieneIA || cargando === 'plato'}>{cargando === 'plato' ? 'Analizando…' : 'Analizar con IA'}</button>
          <button onClick={soloRegistrar}>Solo registrar</button>
        </div>
        {!tieneIA && <SinIA />}
        {resultado && <div className="respuesta">{resultado}</div>}
        <p className="nota">Las calorías y macros que salen de una foto son aproximadas: no se ve el aceite ni el tamaño real de la porción.</p>
      </section>

      <section className="card">
        <h2>¿Qué como? Receta a medida</h2>
        <label>Pedido
          <input value={pedido} onChange={e => setPedido(e.target.value)} placeholder="Ej: una cena rápida alta en proteína" />
        </label>
        <label>Qué tenés en casa (opcional)
          <input value={ingredientes} onChange={e => setIngredientes(e.target.value)} placeholder="Ej: pollo, arroz, zapallito, huevos" />
        </label>
        <button className="primario" onClick={pedirReceta} disabled={!tieneIA || cargando === 'receta'}>{cargando === 'receta' ? 'Pensando…' : 'Sugerime una receta'}</button>
        {!tieneIA && <SinIA />}
        {receta && <div className="respuesta">{receta}</div>}
      </section>

      <section className="card">
        <h2>Lista de compras</h2>
        <p className="nota">Se arma con tus últimas {Math.min(5, recetas.length)} recetas guardadas.</p>
        <button onClick={armarCompras} disabled={!tieneIA || cargando === 'compras' || recetas.length === 0}>{cargando === 'compras' ? 'Armando…' : 'Armar lista'}</button>
        {compras && <div className="respuesta">{compras}</div>}
      </section>

      {error && <p className="error">{error}</p>}

      {comidas.length > 0 && (
        <section className="card">
          <h2>Últimas comidas</h2>
          {[...comidas].reverse().slice(0, 8).map(c => (
            <details key={c.id}>
              <summary>{new Date(c.fecha).toLocaleDateString('es-AR')} · {c.descripcion.slice(0, 50)}</summary>
              {c.feedback ? <div className="respuesta">{c.feedback}</div> : <p className="nota">Registrada sin análisis.</p>}
            </details>
          ))}
        </section>
      )}

      {recetas.length > 0 && (
        <section className="card">
          <h2>Recetas guardadas</h2>
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
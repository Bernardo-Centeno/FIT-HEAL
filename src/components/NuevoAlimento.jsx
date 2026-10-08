import React, { useState } from 'react'
import { alimentoPropio } from '../lib/alimentos.js'
import { buscarOnline } from '../lib/openfood.js'
import { estimarAlimento } from '../lib/ai.js'

const vacio = { nombre: '', kcal: '', p: '', c: '', g: '', unidadG: '', unidadNombre: '' }

// Agregar un alimento que no está en la lista: buscarlo online, cargarlo a mano o estimarlo con IA (si hay clave).
export default function NuevoAlimento({ textoInicial, ajustes, onGuardar, onCerrar }) {
  const [modo, setModo] = useState('online') // online | manual
  const [consulta, setConsulta] = useState(textoInicial || '')
  const [resultados, setResultados] = useState(null)
  const [cargando, setCargando] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ ...vacio, nombre: textoInicial || '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const tieneIA = Boolean(ajustes && ajustes.apiKey)

  const buscar = async () => {
    setError(''); setCargando('buscar'); setResultados(null)
    try { setResultados(await buscarOnline(consulta)) } catch (e) { setError(e.message) } finally { setCargando('') }
  }

  const usarResultado = r => {
    const { alimento, error: err } = alimentoPropio({
      nombre: r.nombre, kcal: r.kcal, p: r.p, c: r.c, g: r.g, unidadG: r.porcionG || '', unidadNombre: 'porción',
    })
    if (err) { setError(err); return }
    onGuardar(alimento)
  }

  const estimar = async () => {
    if (!consulta.trim() && !form.nombre.trim()) { setError('Escribí qué alimento es.'); return }
    setError(''); setCargando('ia')
    try {
      const r = await estimarAlimento({ ajustes, texto: form.nombre.trim() || consulta.trim() })
      setForm({ nombre: r.nombre, kcal: String(Math.round(r.kcal)), p: String(r.p), c: String(r.c), g: String(r.g), unidadG: r.porcionG ? String(r.porcionG) : '', unidadNombre: r.porcionG ? 'porción' : '' })
      setModo('manual')
    } catch (e) { setError(e.message) } finally { setCargando('') }
  }

  const guardarManual = () => {
    const { alimento, error: err } = alimentoPropio(form)
    if (err) { setError(err); return }
    setError('')
    onGuardar(alimento)
  }

  return (
    <div className="cambio agregar">
      <h3>Agregar un alimento que no está</h3>
      <div className="pildoras chicas" role="tablist">
        <button type="button" role="tab" aria-selected={modo === 'online'} className={modo === 'online' ? 'activa' : ''} onClick={() => { setModo('online'); setError('') }}>Buscar online</button>
        <button type="button" role="tab" aria-selected={modo === 'manual'} className={modo === 'manual' ? 'activa' : ''} onClick={() => { setModo('manual'); setError('') }}>Cargar a mano</button>
      </div>

      {modo === 'online' && (
        <>
          <p className="nota">Busca en Open Food Facts, una base abierta de productos envasados. Los datos los cargan voluntarios, así que chequeá que tengan sentido.</p>
          <label>Producto
            <input value={consulta} onChange={e => setConsulta(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') buscar() }} placeholder="Ej: alfajor Jorgito" />
          </label>
          <button type="button" className="primario" onClick={buscar} disabled={cargando !== ''}>{cargando === 'buscar' ? 'Buscando…' : 'Buscar'}</button>
          {resultados && resultados.length === 0 && <p className="nota">No encontré nada con datos completos. Probá con otro nombre o cargalo a mano.</p>}
          {resultados && resultados.map((r, i) => (
            <button key={i} type="button" className="opcion-ej" onClick={() => usarResultado(r)}>
              <span>{r.nombre}</span>
              <span className="chip">{r.kcal} kcal / 100 g</span>
            </button>
          ))}
          {tieneIA && <button type="button" className="enlace" onClick={estimar} disabled={cargando !== ''}>{cargando === 'ia' ? 'Estimando…' : 'No lo encuentro: que lo estime la IA'}</button>}
        </>
      )}

      {modo === 'manual' && (
        <>
          <p className="nota">Mirá la etiqueta y copiá los valores <strong>cada 100 g</strong> (o cada 100 ml).</p>
          <label>Nombre<input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Leche descremada La Serenísima" /></label>
          <div className="fila">
            <label>Calorías<input type="number" inputMode="decimal" value={form.kcal} onChange={e => set('kcal', e.target.value)} /></label>
            <label>Proteínas (g)<input type="number" inputMode="decimal" value={form.p} onChange={e => set('p', e.target.value)} /></label>
          </div>
          <div className="fila">
            <label>Carbohidratos (g)<input type="number" inputMode="decimal" value={form.c} onChange={e => set('c', e.target.value)} /></label>
            <label>Grasas (g)<input type="number" inputMode="decimal" value={form.g} onChange={e => set('g', e.target.value)} /></label>
          </div>
          <details>
            <summary>Cuánto pesa una unidad (opcional)</summary>
            <div className="fila propio">
              <label>Gramos de una unidad<input type="number" inputMode="decimal" value={form.unidadG} onChange={e => set('unidadG', e.target.value)} placeholder="Ej: 55" /></label>
              <label>Se llama<input value={form.unidadNombre} onChange={e => set('unidadNombre', e.target.value)} placeholder="Ej: alfajor" /></label>
            </div>
          </details>
          {tieneIA && <button type="button" className="enlace" onClick={estimar} disabled={cargando !== ''}>{cargando === 'ia' ? 'Estimando…' : 'Completar con IA según el nombre'}</button>}
          <button type="button" className="primario" onClick={guardarManual}>Guardar alimento</button>
        </>
      )}

      {error && <p className="error" role="alert">{error}</p>}
      <button type="button" onClick={onCerrar}>Cancelar</button>
    </div>
  )
}
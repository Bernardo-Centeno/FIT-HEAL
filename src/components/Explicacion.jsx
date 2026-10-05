import React from 'react'
import { explicacionDe, linkVideo, ejemploNumeros } from '../lib/ejercicios.js'

export default function Explicacion({ ej, texto, cargando, tieneIA, onPedirIA }) {
  const info = explicacionDe(ej)
  return (
    <div className="explicacion">
      {info ? (
        <>
          <p><strong>Trabaja:</strong> {info.m}</p>
          <p><strong>Cómo hacerlo</strong></p>
          <ol>{info.p.map((paso, i) => <li key={i}>{paso}</li>)}</ol>
          <p><strong>Errores comunes</strong></p>
          <ul>{info.e.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </>
      ) : (
        <p className="nota">Todavía no tengo una explicación guardada para este ejercicio. Podés ver un video de ejemplo{tieneIA ? ' o pedirle una explicación a la IA' : ''}.</p>
      )}
      <p><strong>Qué hacer con tus números</strong></p>
      <ul>{ejemploNumeros(ej).map((l, i) => <li key={i}>{l}</li>)}</ul>
      <div className="fila">
        <a className="boton" href={linkVideo(ej.nombre)} target="_blank" rel="noopener noreferrer">▶️ Ver video de ejemplo</a>
        <button onClick={onPedirIA} disabled={!tieneIA || cargando}>{cargando ? 'Pensando…' : 'Explicar con IA'}</button>
      </div>
      {!tieneIA && <p className="nota">La explicación con IA necesita tu clave en Ajustes.</p>}
      {texto && <div className="respuesta">{texto}</div>}
      <p className="nota">Es una guía básica de técnica. Si tenés dudas o dolor, consultá a un entrenador o a un profesional.</p>
    </div>
  )
}
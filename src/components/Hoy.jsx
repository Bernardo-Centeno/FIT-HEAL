import React from 'react'
import { objetivosNutricion, deporteActivo, planVencido, diasDesde, esDePierna } from '../lib/plan.js'
import { totalesDelDia } from '../lib/alimentos.js'
import { proximoDia, entrenoHoy, semanaActual, rachaSemanas, minutosEstimados } from '../lib/metricas.js'
import { Anillos, anillosDe } from './Graficos.jsx'
import Icono from './Icono.jsx'

function saludo(hora) {
  if (hora < 6) return 'Buenas noches'
  if (hora < 13) return 'Buen día'
  if (hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Hoy({ estado, irA }) {
  const { perfil, plan, sesiones, comidas } = estado
  const ahora = new Date()
  const proximo = proximoDia(plan, sesiones)
  const yaEntreno = entrenoHoy(sesiones, ahora)
  const semana = semanaActual(sesiones, ahora)
  const hechas = semana.filter(d => d.entreno).length
  const racha = rachaSemanas(sesiones, perfil.diasPorSemana, ahora)
  const tipoDia = yaEntreno ? 'entreno' : 'descanso'
  const metas = objetivosNutricion(perfil, tipoDia)
  const consumido = totalesDelDia(comidas, ahora)
  const faltan = Math.max(0, metas.kcal - consumido.kcal)
  const nombre = perfil.nombre ? `, ${perfil.nombre}` : ''

  return (
    <div className="pantalla hoy">
      <section className="hero">
        <p className="saludo">{saludo(ahora.getHours())}{nombre}</p>
        {!plan && (
          <>
            <h1 className="hero-titulo">Armá tu plan</h1>
            <p className="hero-sub">Todavía no tenés rutina. Se arma en un toque con tus datos.</p>
            <button className="primario grande" onClick={() => irA('entrenar')}>Crear mi plan</button>
          </>
        )}
        {plan && proximo && !yaEntreno && (
          <>
            <h1 className="hero-titulo">{proximo.dia.nombre}</h1>
            <p className="hero-sub">{proximo.dia.ejercicios.length} ejercicios, unos {minutosEstimados(proximo.dia)} minutos</p>
            <button className="primario grande" onClick={() => irA('entrenar', { dia: proximo.indice })}>
              <Icono nombre="entrenar" tam={20} /> Empezar entrenamiento
            </button>
            {proximo.dia.ejercicios.some(ej => esDePierna(ej, perfil)) && (
              <button className="enlace" onClick={() => irA('entrenar', { dia: proximo.indice, fatiga: true })}>¿Piernas cansadas? Cambiar los ejercicios de hoy</button>
            )}
          </>
        )}
        {plan && yaEntreno && (
          <>
            <h1 className="hero-titulo">Hoy ya entrenaste</h1>
            <p className="hero-sub">Lo que sigue es comer bien y descansar. Mañana toca {proximo ? proximo.dia.nombre : 'tu próximo día'}.</p>
            <button className="grande" onClick={() => irA('entrenar')}>Ver mi plan</button>
          </>
        )}
        {deporteActivo(perfil) && <span className="chip chip-deporte">{perfil.deporte}: {perfil.deporteDias} {Number(perfil.deporteDias) === 1 ? 'día' : 'días'} por semana</span>}
      </section>

      <section className="semana" aria-label="Tu semana">
        <div className="semana-dias">
          {semana.map((d, i) => (
            <div key={i} className={`dia ${d.entreno ? 'hecho' : ''} ${d.esHoy ? 'hoy' : ''} ${d.futuro ? 'futuro' : ''}`}>
              <span className="dia-circulo">{d.entreno ? <Icono nombre="check" tam={16} /> : null}</span>
              <span className="dia-letra">{d.letra}</span>
            </div>
          ))}
        </div>
        <div className="fila-sb semana-pie">
          <span>{hechas} de {perfil.diasPorSemana} sesiones esta semana</span>
          {racha > 0 && <span className="racha"><Icono nombre="fuego" tam={16} /> {racha} {racha === 1 ? 'semana' : 'semanas'} seguidas</span>}
        </div>
      </section>

      <section className="card">
        <div className="fila-sb">
          <h2>Tu comida de hoy</h2>
          <span className="chip">{yaEntreno ? 'Día de entreno' : 'Meta de descanso'}</span>
        </div>
        <Anillos anillos={anillosDe(metas, consumido)} centroNumero={faltan} centroTexto="kcal por comer" />
        <button onClick={() => irA('comida')}><Icono nombre="mas" tam={18} /> Anotar comida</button>
      </section>

      {plan && planVencido(plan) && (
        <section className="aviso-card">
          <p><strong>Tu plan ya cumplió su ciclo.</strong> Lo armaste hace {diasDesde(plan.creadoEl)} días. Renovarlo mantiene el progreso.</p>
          <button onClick={() => irA('entrenar')}>Renovar plan</button>
        </section>
      )}
    </div>
  )
}
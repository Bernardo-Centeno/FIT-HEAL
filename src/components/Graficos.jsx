import React from 'react'

// Anillos concéntricos, uno por métrica (como las placas de una barra).
// anillos: [{ clave, nombre, valor, meta, unidad, color }]
export function Anillos({ anillos, centroNumero, centroTexto }) {
  const tam = 200
  const c = tam / 2
  const grosor = 10
  const sep = 4
  return (
    <div className="anillos">
      <div className="anillos-dibujo">
        <svg viewBox={`0 0 ${tam} ${tam}`} role="img" aria-label={anillos.map(a => `${a.nombre}: ${a.valor} de ${a.meta} ${a.unidad}`).join('. ')}>
          {anillos.map((a, i) => {
            const r = c - grosor / 2 - 2 - i * (grosor + sep)
            const largo = 2 * Math.PI * r
            const pct = a.meta > 0 ? Math.min(a.valor / a.meta, 1) : 0
            return (
              <g key={a.clave} transform={`rotate(-90 ${c} ${c})`}>
                <circle cx={c} cy={c} r={r} fill="none" strokeWidth={grosor} className="anillo-pista" />
                <circle
                  cx={c} cy={c} r={r} fill="none" strokeWidth={grosor} strokeLinecap="round" className="anillo-valor"
                  style={{ stroke: a.color, '--largo': largo, strokeDasharray: largo, strokeDashoffset: largo * (1 - pct) }}
                />
              </g>
            )
          })}
        </svg>
        <div className="anillos-centro">
          <span className="num">{centroNumero}</span>
          <span>{centroTexto}</span>
        </div>
      </div>
      <ul className="leyenda">
        {anillos.map(a => (
          <li key={a.clave}>
            <i style={{ background: a.color }} aria-hidden="true" />
            <span className="leyenda-nombre">{a.nombre}</span>
            <span className="leyenda-valor"><b>{a.valor}</b> / {a.meta} {a.unidad}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Barras simples. datos: [{ etiqueta, valor }]. meta opcional dibuja una línea punteada.
export function Barras({ datos, meta, formato = v => v, titulo }) {
  const ancho = 320
  const alto = 150
  const base = alto - 24
  const tope = Math.max(1, meta || 0, ...datos.map(d => d.valor)) * 1.15
  const paso = ancho / datos.length
  const w = Math.min(28, paso * 0.6)
  const yDe = v => base - (v / tope) * (base - 14)
  return (
    <svg className="grafico" viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={titulo}>
      <line x1="0" x2={ancho} y1={base} y2={base} className="grafico-eje" />
      {meta ? <line x1="0" x2={ancho} y1={yDe(meta)} y2={yDe(meta)} className="grafico-meta" /> : null}
      {datos.map((d, i) => {
        const x = i * paso + paso / 2
        const y = yDe(d.valor)
        return (
          <g key={i}>
            <rect x={x - w / 2} y={d.valor > 0 ? y : base - 2} width={w} height={d.valor > 0 ? base - y : 2} rx="4" className={d.valor > 0 ? 'barra-llena' : 'barra-vacia'} />
            {d.valor > 0 && <text x={x} y={y - 5} textAnchor="middle" className="grafico-valor">{formato(d.valor)}</text>}
            <text x={x} y={alto - 6} textAnchor="middle" className="grafico-etiqueta">{d.etiqueta}</text>
          </g>
        )
      })}
    </svg>
  )
}

// Línea de evolución. puntos: [{ fecha, valor }]
export function Linea({ puntos, unidad, titulo }) {
  const ancho = 320
  const alto = 150
  const m = { i: 12, d: 12, s: 18, b: 24 }
  const valores = puntos.map(p => p.valor)
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const rango = max - min || 1
  const x = i => (puntos.length === 1 ? ancho / 2 : m.i + (i * (ancho - m.i - m.d)) / (puntos.length - 1))
  const y = v => alto - m.b - ((v - min) / rango) * (alto - m.b - m.s)
  const camino = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.valor).toFixed(1)}`).join(' ')
  const fecha = f => { const d = new Date(f); return `${d.getDate()}/${d.getMonth() + 1}` }
  return (
    <svg className="grafico" viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={titulo}>
      <line x1="0" x2={ancho} y1={alto - m.b + 6} y2={alto - m.b + 6} className="grafico-eje" />
      {puntos.length > 1 && <path d={camino} fill="none" className="linea-trazo" />}
      {puntos.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.valor)} r={i === puntos.length - 1 ? 5 : 3.5} className={i === puntos.length - 1 ? 'punto-ultimo' : 'punto'} />
      ))}
      <text x={x(puntos.length - 1)} y={y(puntos[puntos.length - 1].valor) - 10} textAnchor={puntos.length > 1 ? 'end' : 'middle'} className="grafico-valor">{puntos[puntos.length - 1].valor} {unidad}</text>
      <text x={m.i} y={alto - 6} className="grafico-etiqueta">{fecha(puntos[0].fecha)}</text>
      {puntos.length > 1 && <text x={ancho - m.d} y={alto - 6} textAnchor="end" className="grafico-etiqueta">{fecha(puntos[puntos.length - 1].fecha)}</text>}
    </svg>
  )
}

// Los cuatro anillos del día (calorías, proteína, carbos, grasas), con los colores de las placas
export function anillosDe(metas, consumido) {
  return [
    { clave: 'kcal', nombre: 'Calorías', valor: consumido.kcal, meta: metas.kcal, unidad: 'kcal', color: 'var(--rojo)' },
    { clave: 'p', nombre: 'Proteína', valor: consumido.p, meta: metas.proteinaG, unidad: 'g', color: 'var(--azul)' },
    { clave: 'c', nombre: 'Carbohidratos', valor: consumido.c, meta: metas.carbosG, unidad: 'g', color: 'var(--amarillo)' },
    { clave: 'g', nombre: 'Grasas', valor: consumido.g, meta: metas.grasasG, unidad: 'g', color: 'var(--verde)' },
  ]
}
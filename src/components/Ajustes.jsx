import React, { useRef, useState } from 'react'
import { exportarRespaldo, importarRespaldo, estadoInicial } from '../lib/storage.js'

export default function Ajustes({ estado, actualizar }) {
  const [mostrar, setMostrar] = useState(false)
  const [conClave, setConClave] = useState(false)
  const [msg, setMsg] = useState('')
  const archivo = useRef(null)

  const setAj = (campo, valor) => actualizar(e => ({ ...e, ajustes: { ...e.ajustes, [campo]: valor } }))

  const importar = async ev => {
    const file = ev.target.files && ev.target.files[0]
    if (!file) return
    try {
      const texto = await file.text()
      const nuevo = importarRespaldo(texto, estado)
      actualizar(() => nuevo)
      setMsg('Respaldo importado.')
    } catch (e) {
      setMsg(e.message)
    } finally {
      ev.target.value = ''
    }
  }

  const borrarTodo = () => {
    if (window.confirm('Se borra todo: perfil, plan, sesiones y comidas. ¿Seguro?')) {
      actualizar(() => structuredClone(estadoInicial))
      setMsg('Datos borrados.')
    }
  }

  return (
    <div className="pantalla">
      <section className="card">
        <h2>Clave de API de Anthropic</h2>
        <p className="nota">Se usa para analizar fotos, armar recetas y planes con IA. Se guarda solo en este navegador. Sin clave, el resto de la app funciona igual.</p>
        <label>Clave
          <input type={mostrar ? 'text' : 'password'} value={estado.ajustes.apiKey} onChange={e => setAj('apiKey', e.target.value.trim())} placeholder="sk-ant-..." autoComplete="off" />
        </label>
        <label className="check"><input type="checkbox" checked={mostrar} onChange={e => setMostrar(e.target.checked)} /> Mostrar clave</label>
        <label>Modelo
          <input value={estado.ajustes.modelo} onChange={e => setAj('modelo', e.target.value.trim())} />
        </label>
        <p className="aviso">No subas esta app a GitHub con la clave puesta ni compartas el link de tu sesión: quien tenga acceso a tu navegador podría usar tu clave.</p>
      </section>

      <section className="card">
        <h2>Respaldo de tus datos</h2>
        <p className="nota">Tus datos viven en este navegador. Si borrás los datos del sitio o cambiás de dispositivo, se pierden. Exportá un respaldo de vez en cuando.</p>
        <label className="check"><input type="checkbox" checked={conClave} onChange={e => setConClave(e.target.checked)} /> Incluir la clave de API en el archivo</label>
        <div className="fila">
          <button className="primario" onClick={() => exportarRespaldo(estado, conClave)}>Exportar respaldo</button>
          <button onClick={() => archivo.current && archivo.current.click()}>Importar respaldo</button>
        </div>
        <input ref={archivo} type="file" accept="application/json,.json" hidden onChange={importar} />
        {msg && <p className="nota">{msg}</p>}
      </section>

      <section className="card">
        <h2>Zona de riesgo</h2>
        <button className="peligro" onClick={borrarTodo}>Borrar todos mis datos</button>
      </section>

      <p className="nota centro">Esta app da orientación general y no reemplaza a un entrenador ni a un profesional de la salud.</p>
    </div>
  )
}
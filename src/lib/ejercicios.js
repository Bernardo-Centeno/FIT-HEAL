// Explicaciones básicas de técnica. La clave es el id del ejercicio (su nombre sin tildes ni espacios).
import { incremento } from './plan.js'

const E = (m, p, e) => ({ m, p, e }) // m: músculos, p: pasos, e: errores comunes

const SENTADILLA_BARRA = E('Cuádriceps y glúteos', [
  'Apoyá la barra en la parte alta de la espalda (no sobre el cuello), con los pies al ancho de hombros y las puntas apenas hacia afuera.',
  'Respirá, poné firme el abdomen y bajá llevando la cadera atrás y abajo, con las rodillas siguiendo la línea de los pies.',
  'Bajá hasta donde puedas mantener la espalda neutra (idealmente muslos paralelos al piso) y subí empujando el piso con todo el pie.',
], ['Las rodillas se juntan hacia adentro al subir.', 'Se despegan los talones o se redondea la espalda baja al bajar.'])

const RUMANO = E('Isquiotibiales y glúteos', [
  'De pie con la barra (o las mancuernas) a la altura de los muslos y las rodillas apenas flexionadas.',
  'Llevá la cadera hacia atrás, como cerrando una puerta con la cola, y bajá el peso pegado a las piernas con la espalda recta.',
  'Bajá hasta sentir el estiramiento atrás de los muslos y subí empujando la cadera hacia adelante.',
], ['Redondear la espalda.', 'Flexionar demasiado las rodillas (se convierte en una sentadilla) o separar el peso del cuerpo.'])

const PRESS_HOMBROS = E('Hombros y tríceps', [
  'Sentado o de pie, con las mancuernas (o las manijas) a la altura de los hombros y el abdomen firme.',
  'Empujá hacia arriba hasta estirar los brazos sobre la cabeza.',
  'Bajá controlado hasta la altura de las orejas.',
], ['Arquear la espalda baja para ayudarte: si pasa, bajá el peso o usá respaldo.', 'Llevar los codos muy atrás del cuerpo.'])

const GEMELOS = E('Gemelos', [
  'Parado con la punta de los pies sobre un escalón o plataforma y los talones al aire (agarrate de algo para el equilibrio).',
  'Subí lo más alto que puedas sobre las puntas de los pies.',
  'Bajá lento hasta estirar bien los talones por debajo del escalón.',
], ['Rebotar sin hacer el recorrido completo.', 'Flexionar las rodillas para ayudarte.'])

export const EXPLICACIONES = {
  // ----- Piernas -----
  'sentadilla-con-barra': SENTADILLA_BARRA,
  'prensa-de-piernas': E('Cuádriceps y glúteos', [
    'Apoyá bien la espalda y la cadera en el respaldo, con los pies al ancho de hombros en el centro de la plataforma.',
    'Soltá los seguros y bajá controlado hasta que las rodillas se acerquen al pecho sin que la cadera se despegue del asiento.',
    'Empujá la plataforma hasta casi estirar las piernas, sin trabar las rodillas.',
  ], ['Bajar tanto que la cadera se despega del asiento.', 'Trabar las rodillas arriba.']),
  'peso-muerto-rumano': RUMANO,
  'peso-muerto-rumano-con-mancuernas': RUMANO,
  'hip-thrust': E('Glúteos', [
    'Apoyá la espalda alta en un banco, con la barra (o el peso) sobre la cadera, y los pies al ancho de cadera.',
    'Empujá con los talones y subí la cadera hasta que el torso y los muslos queden alineados.',
    'Apretá los glúteos arriba un segundo y bajá controlado.',
  ], ['Arquear la espalda baja al subir.', 'Apoyar los pies muy lejos o muy cerca de la cola.']),
  'zancadas-con-mancuernas': E('Cuádriceps y glúteos', [
    'De pie con una mancuerna en cada mano, da un paso largo hacia adelante.',
    'Bajá hasta que ambas rodillas queden cerca de 90 grados, sin que la de atrás golpee el piso.',
    'Empujá con la pierna de adelante para volver y alterná las piernas.',
  ], ['Dar un paso demasiado corto (la rodilla se va muy adelante de los dedos).', 'Inclinar el torso hacia adelante.']),
  'sentadilla-bulgara': E('Cuádriceps y glúteos', [
    'Apoyá el empeine de una pierna en un banco detrás tuyo; la otra pierna queda adelante, a un paso largo.',
    'Bajá recto hasta que el muslo de adelante quede cerca de paralelo al piso.',
    'Subí empujando con el pie de adelante. Empezá con poco peso: cuesta el equilibrio.',
  ], ['Apoyar el pie de adelante demasiado cerca del banco.', 'Empujar con la pierna de atrás en vez de la de adelante.']),
  'curl-femoral': E('Isquiotibiales', [
    'Ajustá la máquina: el rodillo se apoya justo arriba de los talones y las rodillas quedan alineadas con el eje.',
    'Flexioná las rodillas llevando el rodillo hacia los glúteos.',
    'Volvé controlado, en unos 2 o 3 segundos.',
  ], ['Levantar la cadera del banco para ayudarte.', 'Soltar el peso de golpe al volver.']),
  'elevacion-de-gemelos': GEMELOS,
  'elevacion-de-gemelos-en-escalon': GEMELOS,
  'sentadilla-goblet-con-mancuerna': E('Cuádriceps y glúteos', [
    'Sostené una mancuerna contra el pecho con ambas manos, con los pies al ancho de hombros.',
    'Bajá la cadera hacia atrás y abajo, con el torso erguido y los codos entre las rodillas.',
    'Subí empujando el piso con todo el pie.',
  ], ['Despegar los talones.', 'Inclinar demasiado el torso hacia adelante.']),
  'sentadilla-con-peso-corporal': E('Cuádriceps y glúteos', [
    'Pies al ancho de hombros y los brazos adelante para ayudarte con el equilibrio.',
    'Bajá la cadera hacia atrás y abajo hasta que los muslos queden cerca de paralelos al piso.',
    'Subí empujando con todo el pie.',
  ], ['Las rodillas se van hacia adentro.', 'Se despegan los talones.']),
  'puente-de-gluteos': E('Glúteos', [
    'Acostado boca arriba, con las rodillas flexionadas y los pies apoyados cerca de la cola.',
    'Empujá con los talones y subí la cadera hasta alinear hombros, cadera y rodillas.',
    'Apretá los glúteos arriba y bajá lento.',
  ], ['Arquear la espalda baja al subir.', 'Empujar con la punta de los pies en lugar de los talones.']),
  'curl-nordico-asistido': E('Isquiotibiales', [
    'De rodillas, con los talones bien sujetos (debajo de un mueble pesado o sostenidos por alguien) y el cuerpo recto de rodillas a cabeza.',
    'Inclinate hacia adelante frenando la caída lo más lento que puedas con la parte de atrás de los muslos.',
    'Apoyá las manos al llegar abajo y ayudate con ellas para volver.',
  ], ['Doblarse por la cadera en lugar de mantener el cuerpo recto.', 'Caerse de golpe. Es un ejercicio exigente: si te molesta, frená y consultá.']),

  // ----- Empuje -----
  'press-banca-con-barra': E('Pecho, hombros y tríceps', [
    'Acostado con los ojos bajo la barra, pies firmes en el piso y los omóplatos juntos y hacia abajo.',
    'Bajá la barra controlada hasta rozar la parte media del pecho, con los codos a unos 45-70 grados del torso (no abiertos a 90).',
    'Empujá hacia arriba hasta estirar los brazos.',
  ], ['Despegar la cadera del banco.', 'Rebotar la barra en el pecho. Cuando vayas pesado, pedí que te asistan o usá los topes de seguridad.']),
  'press-inclinado-con-mancuernas': E('Parte alta del pecho y hombros', [
    'Con el banco inclinado unos 30 grados, mancuernas a la altura del pecho y las palmas hacia adelante.',
    'Empujá hacia arriba juntando apenas las mancuernas.',
    'Bajá controlado hasta sentir el estiramiento del pecho.',
  ], ['Inclinar el banco de más: se vuelve un press de hombros.', 'Arquear mucho la espalda.']),
  'press-en-maquina': E('Pecho y tríceps', [
    'Regulá el asiento para que las manijas queden a la altura del pecho, con la espalda apoyada.',
    'Empujá hasta estirar casi los brazos.',
    'Volvé controlado, sin apoyar las pesas.',
  ], ['Asiento mal regulado (manijas muy arriba o muy abajo).', 'Despegar la espalda del respaldo.']),
  'press-militar-con-mancuernas': PRESS_HOMBROS,
  'press-de-hombros-con-mancuernas': PRESS_HOMBROS,
  'press-de-hombros-en-maquina': PRESS_HOMBROS,
  'flexiones': E('Pecho, hombros y tríceps', [
    'Manos apoyadas un poco más abiertas que los hombros, con el cuerpo recto desde la cabeza hasta los talones.',
    'Bajá el pecho hacia el piso con los codos a unos 45 grados del cuerpo.',
    'Empujá hasta estirar los brazos. Si te cuestan, hacelas con las manos sobre un banco o una mesa firme.',
  ], ['La cadera cae o queda muy arriba.', 'Abrir los codos del todo hacia los costados.']),
  'press-con-mancuernas-en-el-suelo': E('Pecho y tríceps', [
    'Acostado boca arriba, con las rodillas flexionadas y las mancuernas sobre el pecho.',
    'Bajá hasta que los codos toquen el piso (a unos 45 grados del torso).',
    'Empujá hacia arriba hasta estirar los brazos.',
  ], ['Dejar caer los codos de golpe.', 'Arquear la espalda baja.']),
  'flexiones-pike': E('Hombros', [
    'En posición de flexión, subí la cadera formando una "V" invertida, con las manos un poco más abiertas que los hombros.',
    'Flexioná los codos llevando la cabeza hacia el piso, entre las manos.',
    'Empujá para volver a la "V".',
  ], ['Apoyar el peso sobre la cabeza.', 'Dejar caer la cadera: tiene que quedar alta.']),
  'elevaciones-laterales': E('Hombros (parte lateral)', [
    'De pie, con las mancuernas a los costados y los codos apenas flexionados.',
    'Subí los brazos hacia los lados hasta la altura de los hombros.',
    'Bajá lento. Usá poco peso.',
  ], ['Balancear el torso para subir el peso.', 'Encoger los hombros hacia las orejas.']),
  'extension-de-triceps-en-polea': E('Tríceps', [
    'De pie frente a la polea alta (con barra o cuerda), con los codos pegados a las costillas.',
    'Estirá los codos hacia abajo hasta extender los brazos.',
    'Volvé hasta que los antebrazos pasen la horizontal, sin despegar los codos.',
  ], ['Despegar los codos del cuerpo.', 'Inclinarse sobre el peso para empujar.']),
  'press-frances-con-mancuerna': E('Tríceps', [
    'Acostado, con la mancuerna sostenida con ambas manos sobre el pecho y los brazos estirados.',
    'Flexioná solo los codos bajando la mancuerna hacia atrás de la cabeza.',
    'Estirá los codos para volver. Mantené el control: que no se te caiga.',
  ], ['Abrir los codos hacia los costados.', 'Mover los hombros en lugar de solo los codos.']),
  'extension-de-triceps-sobre-la-cabeza': E('Tríceps', [
    'De pie o sentado, con una mancuerna sostenida con ambas manos sobre la cabeza.',
    'Flexioná los codos bajando la mancuerna detrás de la cabeza, sin abrir los codos.',
    'Estirá los brazos para volver arriba.',
  ], ['Abrir los codos hacia los costados.', 'Arquear la espalda baja.']),
  'fondos-en-silla': E('Tríceps', [
    'Con las manos apoyadas en el borde de una silla firme (contra la pared), detrás tuyo, y las piernas estiradas o flexionadas.',
    'Bajá flexionando los codos hacia atrás hasta unos 90 grados.',
    'Empujá hasta estirar los brazos.',
  ], ['Abrir los codos hacia los costados.', 'Bajar demasiado, lo que carga los hombros.']),

  // ----- Tirón -----
  'remo-en-polea-baja': E('Espalda y bíceps', [
    'Sentado con las rodillas apenas flexionadas y el torso erguido.',
    'Tirá llevando los codos hacia atrás y juntando los omóplatos, hasta acercar las manos al abdomen.',
    'Volvé estirando los brazos con control.',
  ], ['Balancear el torso hacia adelante y atrás.', 'Encoger los hombros hacia las orejas.']),
  'remo-con-mancuerna': E('Espalda', [
    'Apoyá una mano y una rodilla en un banco, con la espalda paralela al piso, y la mancuerna en la otra mano con el brazo estirado.',
    'Llevá el codo hacia la cadera (no hacia el techo), juntando el omóplato.',
    'Bajá lento hasta estirar el brazo.',
  ], ['Girar el torso para subir el peso.', 'Tirar solo con el brazo en lugar de con la espalda.']),
  'remo-con-barra': E('Espalda', [
    'Con la barra en las manos, flexioná cadera y rodillas e inclinate con la espalda recta.',
    'Tirá de la barra hacia la parte baja del abdomen.',
    'Bajá controlado sin cambiar la inclinación del torso.',
  ], ['Redondear la espalda.', 'Usar impulso de todo el cuerpo.']),
  'remo-inclinado-con-dos-mancuernas': E('Espalda', [
    'Con una mancuerna en cada mano, flexioná cadera y rodillas e inclinate con la espalda recta.',
    'Llevá los codos hacia atrás, hacia la cadera, juntando los omóplatos.',
    'Bajá controlado.',
  ], ['Redondear la espalda.', 'Usar impulso para subir las mancuernas.']),
  'jalon-al-pecho': E('Dorsales y bíceps', [
    'Sentado, con los muslos fijos bajo el apoyo y un agarre un poco más ancho que los hombros.',
    'Tirá de la barra hacia la parte alta del pecho, llevando los codos hacia abajo y atrás.',
    'Volvé hasta estirar los brazos, con control.',
  ], ['Tirar de la barra por detrás de la nuca.', 'Inclinarse mucho hacia atrás para balancear el peso.']),
  'dominadas-asistidas': E('Dorsales y bíceps', [
    'Agarre un poco más ancho que los hombros; la máquina o la banda te ayuda con parte del peso.',
    'Subí llevando los codos hacia abajo hasta que el mentón pase la barra.',
    'Bajá controlado hasta estirar los brazos.',
  ], ['Balancearse para subir.', 'Hacer un recorrido corto sin estirar los brazos abajo.']),
  'dominadas-o-remo-invertido': E('Espalda y bíceps', [
    'Dominadas: colgate de una barra con un agarre un poco más ancho que los hombros. Si no tenés barra, remo invertido: acostado bajo una mesa firme, agarrate del borde con el cuerpo recto.',
    'Tirá llevando el pecho hacia la barra (o la mesa), con los codos hacia abajo y atrás.',
    'Bajá controlado. Asegurate de que la mesa o la barra aguanten tu peso.',
  ], ['Dejar caer la cadera en el remo invertido.', 'Balancearse para tomar impulso.']),
  'pullover-con-mancuerna': E('Dorsales y pecho', [
    'Acostado a lo largo (o cruzado) sobre un banco, con la mancuerna sostenida con ambas manos sobre el pecho.',
    'Con los brazos casi estirados, llevá la mancuerna hacia atrás de la cabeza hasta sentir el estiramiento.',
    'Volvé al punto de partida controlando el movimiento.',
  ], ['Flexionar demasiado los codos.', 'Arquear la espalda baja.']),
  'face-pull': E('Hombros posteriores y parte alta de la espalda', [
    'Con la polea a la altura de la cara y una cuerda, agarrala con las palmas enfrentadas.',
    'Tirá hacia la cara separando las manos, con los codos altos.',
    'Volvé controlado.',
  ], ['Usar demasiado peso (se transforma en un remo).', 'Dejar los codos bajos.']),
  'pajaros-con-mancuernas': E('Hombros posteriores', [
    'Con el torso inclinado hacia adelante y la espalda recta, mancuernas colgando hacia el piso.',
    'Abrí los brazos hacia los lados, con los codos apenas flexionados, hasta la altura de los hombros.',
    'Bajá lento. Usá poco peso.',
  ], ['Subir con impulso.', 'Usar demasiado peso y perder la postura.']),
  'curl-de-biceps-con-mancuernas': E('Bíceps', [
    'De pie, con los codos pegados al cuerpo y las mancuernas con las palmas hacia adelante.',
    'Flexioná los codos subiendo las mancuernas hacia los hombros.',
    'Bajá lento hasta estirar casi del todo.',
  ], ['Balancear el torso para subir.', 'Adelantar los codos.']),
  'curl-martillo': E('Bíceps y antebrazo', [
    'De pie, con las mancuernas a los costados y las palmas enfrentadas (como sosteniendo un martillo).',
    'Subí las mancuernas manteniendo esa posición, sin mover los codos.',
    'Bajá controlado.',
  ], ['Balancear el torso.', 'Adelantar los codos.']),

  // ----- Core -----
  'plancha': E('Abdomen y core', [
    'Apoyá antebrazos y puntas de los pies, con los codos justo debajo de los hombros.',
    'Mantené el cuerpo en línea recta desde la cabeza hasta los talones, con el abdomen y los glúteos firmes.',
    'Sostené el tiempo indicado respirando con normalidad.',
  ], ['La cadera cae y la espalda baja se arquea.', 'La cadera queda demasiado arriba.']),
  'elevacion-de-piernas': E('Abdomen inferior', [
    'Acostado boca arriba, con las manos a los costados y la espalda baja pegada al piso.',
    'Subí las piernas (casi estiradas) hasta que queden verticales.',
    'Bajá lento sin que la espalda baja se despegue.',
  ], ['Arquear la espalda baja al bajar las piernas.', 'Usar impulso en lugar de control.']),
}

export const explicacionDe = ej => EXPLICACIONES[ej.id] || null

// Abre la búsqueda en YouTube: siempre devuelve varios videos del ejercicio.
export const linkVideo = nombre =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent('cómo hacer ' + nombre + ' técnica correcta')}`

const fmt = n => String(n).replace('.', ',')
const aMedio = x => Math.round(x * 2) / 2

// Ejemplo con los números del propio ejercicio, para entender qué hacer con las series y el peso.
export function ejemploNumeros(ej) {
  const unidad = ej.unidad === 'seg' ? 'segundos' : 'repeticiones'
  const tope = Array(ej.series).fill(ej.repsMax)
  const medio = Array.from({ length: ej.series }, (_, i) => Math.max(ej.repsMin, ej.repsMax - 1 - i))
  const corto = Array.from({ length: ej.series }, (_, i) => Math.max(1, ej.repsMin - 1 - i))
  const lista = a => a.join(', ')
  const cabecera = `Tu rango es ${ej.series} series de ${ej.repsMin} a ${ej.repsMax} ${unidad}.`

  if (ej.corporal) {
    return [
      `${cabecera} Se hace con el peso del cuerpo.`,
      `Si hacés ${lista(tope)}: llegaste al tope. Pasá a una variante más difícil o sumá carga.`,
      `Si hacés ${lista(medio)}: vas bien. Seguí igual e intentá sumar una repetición por serie.`,
      `Si hacés ${lista(corto)}: te quedaste corto. Seguí con la misma variante hasta llegar al mínimo en todas las series.`,
    ]
  }
  const peso = ej.pesoKg > 0 ? ej.pesoKg : 20
  const sube = aMedio(peso + incremento(ej))
  const baja = aMedio(peso * 0.9)
  return [
    `${cabecera} Ejemplo con ${fmt(peso)} kg:`,
    `Si hacés ${lista(tope)}: llegaste al tope. La próxima vez subí a ${fmt(sube)} kg.`,
    `Si hacés ${lista(medio)}: vas bien. Mantené ${fmt(peso)} kg e intentá sumar una repetición por serie.`,
    `Si hacés ${lista(corto)}: te quedaste corto. Repetí ${fmt(peso)} kg hasta llegar al mínimo; si te pasa dos sesiones seguidas, bajá a ${fmt(baja)} kg.`,
    'Anotá también el esfuerzo (1 fácil, 10 al límite). Si llegás al tope pero se sintió muy pesado (más de 8,5), la app te pide repetir el peso antes de subir.',
  ]
}
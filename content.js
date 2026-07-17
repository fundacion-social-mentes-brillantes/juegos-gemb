/* ============================================================================
   CONTENIDO DE JUEGOS GEMB  —  Gimnasio Emocional Mentes Brillantes
   ----------------------------------------------------------------------------
   ⚠️  ESTE ES EL ARCHIVO QUE SE EDITA PARA AGREGAR O CAMBIAR CONTENIDO.
   Puedes pedirle a Claude o a Codex: "agrega estas preguntas a content.js".
   Todo el contenido debe ser CONFIABLE, RESPETUOSO y DE REFLEXIÓN.
   Esto NO reemplaza acompañamiento psicológico profesional.
   ============================================================================ */

window.GEMB_CONTENT = {

  /* --- Aviso suave que se muestra en la app --- */
  aviso: "Estos juegos son para el bienestar y la reflexión. No sustituyen la ayuda de un profesional de salud mental. Si estás pasando un momento muy difícil, busca apoyo.",

  /* ======================================================================
     1) CONTRARRELOJ EMOCIONAL  —  preguntas de opción múltiple
     correcta = índice (0,1,2,3).  nota = explicación breve y confiable.
     ====================================================================== */
  eq: [
    { q:"Reconocer y entender lo que yo mismo siento se llama…",
      op:["Autoconciencia","Distracción","Indiferencia","Prisa"], correcta:0,
      nota:"La autoconciencia es la base de la inteligencia emocional: notar qué siento y por qué." },

    { q:"Cuando siento rabia, lo más saludable es…",
      op:["Reprimirla siempre","Reconocerla y expresarla sin dañar","Estallar contra alguien","Fingir que no existe"], correcta:1,
      nota:"La ira no es mala: nos avisa que algo importante se cruzó. Lo sano es expresarla con respeto." },

    { q:"La empatía es, sobre todo…",
      op:["Dar consejos","Comprender y acompañar lo que siente el otro","Tener la razón","Cambiar al otro"], correcta:1,
      nota:"Empatizar es ponerse en el lugar del otro y hacerle sentir comprendido." },

    { q:"¿Cuál de estas NO es una emoción?",
      op:["Miedo","Alegría","Responsabilidad","Tristeza"], correcta:2,
      nota:"La responsabilidad es un valor o actitud, no una emoción. Emociones básicas: alegría, tristeza, miedo, ira, sorpresa, asco." },

    { q:"Ponerle nombre a lo que siento (‘etiquetar la emoción’)…",
      op:["Lo empeora","Ayuda a regularlo","No sirve para nada","Es infantil"], correcta:1,
      nota:"Nombrar lo que sentimos baja su intensidad y nos ayuda a manejarlo mejor." },

    { q:"La autorregulación emocional significa…",
      op:["Eliminar las emociones","Manejar mis impulsos y emociones","No sentir nunca","Ocultar todo"], correcta:1,
      nota:"No se trata de no sentir, sino de elegir cómo responder en vez de reaccionar en automático." },

    { q:"Sobre las emociones, es cierto que…",
      op:["Hay emociones buenas y malas","Todas son válidas y tienen una función","Solo sirven las positivas","Hay que evitarlas"], correcta:1,
      nota:"Todas las emociones son válidas y cumplen una función; ninguna es ‘mala’, aunque algunas sean incómodas." },

    { q:"La escucha activa consiste en…",
      op:["Escuchar para responder rápido","Escuchar para comprender de verdad","Interrumpir con soluciones","Mirar el celular"], correcta:1,
      nota:"Escuchar activamente es prestar atención plena para entender, no solo para contestar." },

    { q:"La resiliencia es la capacidad de…",
      op:["No sufrir nunca","Recuperarse y aprender de lo difícil","Ignorar los problemas","Ser el más fuerte"], correcta:1,
      nota:"Resiliencia es levantarse tras la adversidad y salir con aprendizajes." },

    { q:"Respirar lento y profundo cuando estoy alterado…",
      op:["Ayuda a calmar el cuerpo","No cambia nada","Aumenta el estrés","Es peligroso"], correcta:0,
      nota:"La respiración lenta le avisa al cuerpo que está a salvo y ayuda a recuperar la calma." },

    { q:"Practicar la gratitud de forma regular…",
      op:["Mejora el bienestar emocional","Es una pérdida de tiempo","Vuelve conformista","No tiene efecto"], correcta:0,
      nota:"Agradecer con frecuencia entrena a la mente para notar lo bueno y mejora el ánimo." },

    { q:"Motivarme desde mis propios valores (no solo por premios) se llama…",
      op:["Motivación intrínseca","Obligación","Suerte","Competencia"], correcta:0,
      nota:"La motivación intrínseca nace de lo que a uno le importa; es más estable y sana que la externa." }
  ],

  /* ======================================================================
     2) EMPAREJA EMOCIONES  —  emoción ↔ para qué nos sirve
     ====================================================================== */
  pares: [
    { emocion:"Alegría",   definicion:"Surge al vivir o lograr algo valioso; nos impulsa a compartir." },
    { emocion:"Tristeza",  definicion:"Nos ayuda a procesar una pérdida y a pedir apoyo." },
    { emocion:"Miedo",     definicion:"Nos protege ante un peligro real o percibido." },
    { emocion:"Ira",       definicion:"Avisa que un límite o algo importante fue vulnerado." },
    { emocion:"Calma",     definicion:"Estado de equilibrio y seguridad interior." },
    { emocion:"Gratitud",  definicion:"Reconocer y valorar lo bueno que recibimos." },
    { emocion:"Empatía",   definicion:"Comprender y acompañar lo que siente otra persona." },
    { emocion:"Esperanza", definicion:"Confianza en que algo bueno es posible." }
  ],

  /* ======================================================================
     3) MEMORIA EMOCIONAL  —  parejas emoji ↔ nombre
     ====================================================================== */
  memoria: [
    { icono:"😊", palabra:"Alegría" },
    { icono:"😢", palabra:"Tristeza" },
    { icono:"😌", palabra:"Calma" },
    { icono:"😠", palabra:"Ira" },
    { icono:"😨", palabra:"Miedo" },
    { icono:"❤️", palabra:"Amor" },
    { icono:"🙏", palabra:"Gratitud" },
    { icono:"😮", palabra:"Sorpresa" }
  ],

  /* ======================================================================
     4) RUEDA DE LA REFLEXIÓN  —  preguntas para pensar y escribir
     ====================================================================== */
  reflexiones: [
    "¿Qué emoción sentiste con más fuerza hoy y qué crees que quería decirte?",
    "Nombra una cosa por la que te sientas agradecido en este momento.",
    "¿Qué te ayuda a recuperar la calma cuando te sientes alterado?",
    "Recuerda un momento difícil que superaste. ¿Qué fortaleza tuya te ayudó?",
    "¿Cómo te gustaría tratarte a ti mismo esta semana?",
    "¿A quién podrías escuchar hoy con más atención?",
    "¿Qué emoción te cuesta más permitirte sentir? ¿Por qué crees que pasa?",
    "Describe un pequeño logro reciente y cómo te hizo sentir.",
    "¿Qué necesitas soltar para sentirte más liviano?",
    "Si fueras tu mejor amigo, ¿qué palabra amable te dirías hoy?",
    "¿Cuándo te sentiste en paz por última vez? ¿Qué había a tu alrededor?",
    "¿Qué te motiva de verdad, más allá de lo que otros esperan de ti?",
    "Piensa en alguien que te transmite calma. ¿Qué cualidad suya admiras?",
    "¿Qué emoción te gustaría cultivar más en tu vida y cómo empezar?",
    "Respira hondo tres veces. ¿Cómo se siente tu cuerpo ahora mismo?"
  ]
};

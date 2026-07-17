# Mentes Brillantes Interactivo — Gimnasio Emocional (GEMB)

Plataforma web de **juegos y experiencias interactivas de bienestar emocional** de la
Fundación Social Mentes Brillantes. Un espacio tranquilo para entrenar las emociones,
reflexionar y crecer — jugando, leyendo, explorando.

Cada persona entra con su **cuenta de Google**, tiene su propio usuario, guarda su
progreso y sus reflexiones privadas.

> 💛 El contenido es de reflexión y bienestar, cuidado y confiable.
> No sustituye el acompañamiento de un profesional de la salud mental.

## ✨ Qué hay hoy (v1)
1. ⏱️ **Contrarreloj Emocional** — 2 minutos de preguntas de inteligencia emocional; puntúa por acierto + rapidez; ranking en línea.
2. 🧩 **Empareja Emociones** — une cada emoción con su función.
3. 🃏 **Memoria Emocional** — encuentra las parejas (emoji ↔ emoción).
4. 🌱 **Rueda de la Reflexión** — una pregunta para pensar y escribir; diario personal y privado.

## 🔭 Qué viene (visión)
Esta plataforma **no es solo de juegos**: irá creciendo con más experiencias interactivas, por ejemplo:
- 📖 **Cuento interactivo** — una historia donde el lector toma decisiones y explora emociones.
- 🧘 **Pausas guiadas** — respiración y calma en pantalla.
- ⚡ Más dinámicas (verdadero/falso relámpago, retos semanales, torneos…).

La arquitectura ya lo permite: cada experiencia es una "tarjeta" nueva en el portal
(`GAMES` en `app.js`) con su propia pantalla, compartiendo el mismo login, diseño y base de datos.

## 🧩 Tecnología
- HTML + CSS + JavaScript (sin framework, sin paso de build).
- **Firebase**: Autenticación con Google + Cloud Firestore (reglas endurecidas y auditadas).
- Tema visual **"Santuario Lúdico"**: paz (aurora lenta, halo que respira) + juego (tipografía redondeada, tarjetas vivas).
- Se despliega como sitio **estático** en Vercel.

## ✍️ Cómo agregar o editar contenido
Todo el contenido vive en **`content.js`** (preguntas, parejas, memoria y reflexiones),
con comentarios que explican el formato. Puedes pedirle a **Claude** o a **Codex**:
> "Agrega estas preguntas al bloque `eq` de content.js"

y para nuevas experiencias (como el cuento interactivo):
> "Crea una nueva experiencia en el portal siguiendo el patrón de los juegos existentes"

El contenido debe ser **confiable, respetuoso y de reflexión**.

## 🔐 Configuración de Firebase (una sola vez)
1. **Reglas de Firestore**: copia el contenido de [`firestore.rules`](./firestore.rules) en
   Firebase Console → *Firestore Database* → pestaña **Reglas** → **Publicar**.
   (Mantener siempre la versión más reciente del archivo: incluye privacidad del perfil y validación anti-trampas.)
2. **Dominios autorizados** (login con Google): Firebase Console → *Authentication* →
   *Configuración* → **Dominios autorizados** → agregar el dominio de producción
   (`juegos-gemb.vercel.app`). `localhost` ya viene autorizado.

## ▶️ Probar en local
```bash
# desde esta carpeta
python -m http.server 8099
# abrir http://localhost:8099
```

## 🚀 Despliegue
Conectado a **GitHub** (organización *fundacion-social-mentes-brillantes*) y desplegado en
**Vercel**: cada `git push` a `main` publica automáticamente en
**https://juegos-gemb.vercel.app**.

---
Fundación Social Mentes Brillantes · Proyecto `juegos-gemb`

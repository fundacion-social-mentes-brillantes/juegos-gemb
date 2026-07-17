# Juegos Mentes Brillantes — Gimnasio Emocional (GEMB)

Plataforma web de **juegos emocionales** de la Fundación Social Mentes Brillantes.
Cada persona entra con su **cuenta de Google**, juega, guarda su progreso y reflexiona.

## 🎮 Juegos incluidos
1. **Contrarreloj Emocional** — 2 minutos de preguntas de inteligencia emocional; puntúa por acierto + rapidez; ranking en línea.
2. **Empareja Emociones** — une cada emoción con su función.
3. **Memoria Emocional** — encuentra las parejas (emoji ↔ emoción).
4. **Rueda de la Reflexión** — una pregunta para pensar y escribir; diario personal y privado.

## 🧩 Tecnología
- HTML + CSS + JavaScript (sin framework, sin paso de build).
- **Firebase**: Autenticación con Google + Cloud Firestore.
- Se despliega como sitio **estático** (Vercel).

## ✍️ Cómo agregar o editar contenido
Todo el contenido vive en **`content.js`** (preguntas, parejas, memoria y reflexiones),
con comentarios que explican el formato. Puedes pedirle a **Claude** o a **Codex**:
> "Agrega estas preguntas al bloque `eq` de content.js".

El contenido debe ser **confiable, respetuoso y de reflexión**. No sustituye acompañamiento profesional.

## 🔐 Configuración de Firebase (una sola vez)
1. **Reglas de Firestore**: copia el contenido de [`firestore.rules`](./firestore.rules) en
   Firebase Console → *Firestore Database* → pestaña **Reglas** → **Publicar**.
2. **Dominios autorizados** (para el login con Google): Firebase Console → *Authentication* →
   *Configuración* → **Dominios autorizados** → agrega el dominio de Vercel (ej. `juegos-gemb.vercel.app`).
   `localhost` ya viene autorizado.

## ▶️ Probar en local
```bash
# desde esta carpeta
python -m http.server 8099
# abrir http://localhost:8099
```

## 🚀 Despliegue
Conectado a **GitHub** (organización *fundacion-social-mentes-brillantes*) y
desplegado en **Vercel**: cada `git push` publica una nueva versión automáticamente.

---
Fundación Social Mentes Brillantes · Proyecto `juegos-gemb`

<!-- deploy automático conectado a GitHub · 2026-07-16 -->

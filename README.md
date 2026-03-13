# ⚔ NPCForge

> Convierte a las personas de tu vida en fichas de personaje RPG con análisis psicológico generado por IA.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini_API-4285F4?style=flat-square&logo=google&logoColor=white)
![Sin dependencias](https://img.shields.io/badge/dependencias-ninguna-brightgreen?style=flat-square)

---

## ¿Qué es esto?

Describes a una persona de tu vida —amigo, rival, jefe, ex— y la IA genera una ficha de personaje al estilo RPG con:

- 📊 **6 estadísticas psicológicas** — Carisma, Manipulación, Lealtad, Ego, Empatía, Drama
- 🎭 **Motivación oculta** — lo que quiere pero nunca dice en voz alta
- 💀 **Punto débil** — su talón de Aquiles psicológico
- 🔑 **Cómo ganar su confianza** — estrategias concretas y accionables
- ⚠️ **Señal de alarma** — el patrón de comportamiento a vigilar
- 📜 **3 misiones de relación** — las dinámicas inconscientes que propone

Los NPCs se guardan en una **aldea** personal en el navegador. Sin servidor, sin base de datos.

---

## 🛠 Tech Stack

| Tecnología | Uso |
|---|---|
| HTML5 semántico | Estructura. Sin lógica ni estilos inline |
| CSS Variables + Grid | Sistema de diseño. Sin Bootstrap, sin Tailwind |
| Vanilla JS (ES2022) | Módulos IIFE. Sin React, sin jQuery |
| Google Gemini API | `gemini-2.0-flash` — prompt → JSON estructurado |
| localStorage | Persistencia de NPCs y API Key en el navegador |
| Google Fonts | Cinzel · Crimson Text · VT323 |

---

## 📁 Estructura

```
npcforge/
├── index.html          # HTML puro — solo estructura
├── README.md
│
├── css/
│   ├── base.css        # Variables, reset, tipografía
│   ├── layout.css      # Header, formulario, galería, botones
│   └── sheet.css       # Ficha RPG: stats, misiones, bloques
│
└── js/
    ├── storage.js      # Leer/guardar/borrar en localStorage
    ├── gemini.js       # Prompt RPG + llamada a la API
    └── app.js          # Controlador: eventos, estado, render
```

Cada archivo tiene una sola responsabilidad. Sin código espagueti.

---

## 🚀 Cómo usarlo

**1. Consigue tu API Key de Gemini — gratis, sin tarjeta**

Ve a [aistudio.google.com](https://aistudio.google.com) → **Get API Key** → **Create API Key**

```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**2. Clona el repo**

```bash
git clone https://github.com/tu-usuario/npcforge.git
cd npcforge
```

**3. Abre `index.html` en el navegador**

Sin `npm install`, sin servidor, sin nada. Doble clic y funciona.

**4. Pega tu API Key y describe a alguien**

La key se guarda automáticamente. Cuanto más detalle escribas en la descripción, mejor será la ficha.

---

## 🌐 Modo Multijugador — Fichas Compartidas

> ¿Tienes amigos con los que comparten conocidos? Cuando varias personas describen al mismo NPC desde su perspectiva, la IA puede generar una ficha de **consenso** mucho más rica y precisa.

### Cómo funciona

Cada usuario describe al NPC desde su punto de vista. El servidor agrupa todas esas descripciones y las envía juntas a Gemini en un único prompt enriquecido:

```
"Las siguientes personas describen al mismo individuo desde distintas perspectivas:
 - [Descripción de usuario A]
 - [Descripción de usuario B]
 - [Descripción de usuario C]
Genera una ficha RPG que sintetice y reconcilie todas las visiones."
```

Gemini produce una ficha de consenso con mayor profundidad psicológica que ninguna descripción individual podría lograr sola.

### Stack recomendado

| Capa | Tecnología | Por qué |
|---|---|---|
| Backend | **Node.js + Express** | Mínimo setup, fácil de desplegar |
| Base de datos | **PostgreSQL** | Relaciones claras entre usuarios, NPCs y descripciones |
| Auth | **Clerk** o **Supabase Auth** | Login sin código de auth desde cero |
| Hosting | **Railway** o **Render** | Deploy con un `git push`, tier gratuito |
| Frontend | El actual HTML/JS | Sin cambios, solo apunta las llamadas al servidor propio |

### Esquema de base de datos

```sql
-- Grupos de amigos
CREATE TABLE guilds (
  id UUID PRIMARY KEY,
  name TEXT,
  invite_code TEXT UNIQUE
);

-- Usuarios dentro de un grupo
CREATE TABLE users (
  id UUID PRIMARY KEY,
  guild_id UUID REFERENCES guilds(id),
  username TEXT
);

-- Cada descripción individual que hace un usuario
CREATE TABLE npc_descriptions (
  id UUID PRIMARY KEY,
  guild_id UUID REFERENCES guilds(id),
  npc_slug TEXT,          -- identificador del NPC: "nombre-apellido" o similar
  npc_display_name TEXT,
  author_id UUID REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ficha de consenso generada por IA (se regenera al añadir nuevas descripciones)
CREATE TABLE npc_consensus_sheets (
  id UUID PRIMARY KEY,
  guild_id UUID REFERENCES guilds(id),
  npc_slug TEXT,
  sheet_json JSONB,       -- la ficha RPG completa en JSON
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  description_count INT   -- cuántas descripciones se usaron para generarla
);
```

### Flujo de uso

```
1. Un usuario crea un "guild" y comparte el invite_code con sus amigos
2. Cada miembro describe a un NPC común (ej: "el amigo Carlos")
   → el npc_slug actúa como clave de agrupación (ej: "carlos-garcia")
3. Cuando hay ≥2 descripciones del mismo NPC, se genera la ficha de consenso
4. Todos los miembros del guild ven la misma ficha enriquecida
5. Al añadir una nueva descripción, la ficha se regenera automáticamente
```

### Matching de NPCs

El punto más delicado es identificar que "Carlos", "Carlos García" y "Carlitos del trabajo" son el mismo NPC. Opciones:

- **Manual (recomendado para empezar):** Cada usuario elige de una lista desplegable de NPCs ya existentes en su guild, o crea uno nuevo.
- **Fuzzy matching:** Comparar nombres con similitud de cadenas (distancia de Levenshtein) y sugerir candidatos.
- **Semántico:** Embeddings de Gemini sobre las descripciones para detectar perfiles similares.

---

## 📦 Portar NPCForge a otras plataformas

### Aplicación de escritorio — Java (JavaFX)

El núcleo de NPCForge es sencillo: un formulario, una llamada HTTP a Gemini y renderizado de JSON. Todo eso es trivial en Java.

**Stack:**

| Componente | Tecnología |
|---|---|
| UI | **JavaFX** (FXML + CSS propio de JavaFX) |
| Llamadas HTTP | `java.net.http.HttpClient` (nativo desde Java 11) |
| Persistencia | **SQLite** vía JDBC (`xerial/sqlite-jdbc`) |
| Build | **Maven** o **Gradle** |
| Distribución | `jpackage` → genera `.exe`, `.dmg` o `.deb` nativos |

**Estructura sugerida:**

```
npcforge-desktop/
├── src/main/java/com/npcforge/
│   ├── App.java                # Entry point JavaFX
│   ├── controller/
│   │   ├── MainController.java
│   │   └── SheetController.java
│   ├── service/
│   │   ├── GeminiService.java  # Llama a la API con HttpClient
│   │   └── StorageService.java # Lee/escribe en SQLite
│   └── model/
│       └── NpcSheet.java       # POJO que mapea el JSON de Gemini
├── src/main/resources/
│   ├── fxml/main.fxml
│   └── css/rpg-theme.css
└── pom.xml
```

**Llamada a Gemini desde Java:**

```java
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(buildPromptJson(description)))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
// Parsear response.body() con Gson o Jackson
```

**Para distribuir:**

```bash
# Genera un instalador nativo sin necesidad de JRE instalado
jpackage --input target/ --name NPCForge --main-jar npcforge.jar \
         --type dmg   # o exe, deb, rpm
```

---

### Aplicación web desplegada (del HTML actual)

La versión actual ya *es* una web app. Solo necesitas hosting estático:

| Plataforma | Comando | Coste |
|---|---|---|
| **Vercel** | `vercel deploy` | Gratis |
| **Netlify** | Arrastra la carpeta al dashboard | Gratis |
| **GitHub Pages** | `git push` a rama `gh-pages` | Gratis |

Si añades el backend multijugador, despliega el servidor en **Railway** o **Render** y actualiza las URLs de fetch en el JS.

---

### App móvil

| Opción | Esfuerzo | Resultado |
|---|---|---|
| **PWA** (Progressive Web App) | Bajo — añadir `manifest.json` + service worker | Se instala desde el navegador, funciona offline |
| **Capacitor** (sobre el HTML actual) | Medio — wrappea la web en una app nativa | `.apk` para Android, `.ipa` para iOS |
| **Flutter** | Alto — reescritura completa en Dart | App nativa de alto rendimiento en ambas plataformas |

La ruta más rápida: convertir el proyecto actual en **PWA** (2-3 horas de trabajo) y empaquetarlo con **Capacitor** para publicar en las tiendas.

---

### Aplicación de escritorio multiplataforma (sin reescribir en Java)

Si quieres evitar reescribir en Java, **Electron** convierte el proyecto HTML/JS actual en una app de escritorio `.exe`/`.dmg`/`.AppImage` con cambios mínimos:

```bash
npm init -y
npm install --save-dev electron
# Añadir main.js con BrowserWindow que carga index.html
npx electron-builder  # genera instaladores nativos
```

---

## 📋 To-Do

### ✅ Completado
- [x] Generador de ficha RPG completa con Gemini API
- [x] 6 estadísticas psicológicas con barras animadas
- [x] Persistencia en localStorage (sin backend)
- [x] Galería "Mi aldea" con tarjetas por NPC
- [x] API Key guardada automáticamente entre sesiones
- [x] Exportar ficha como JSON
- [x] Código modular separado por responsabilidad

### ⚔ Próximos pasos
- [ ] Sprite pixel art por NPC (canvas 80×80, elegir piel/pelo/ropa)
- [ ] Chat en personaje (usar la ficha como system prompt)
- [ ] Editar ficha manualmente tras generarla
- [ ] Exportar ficha como imagen para compartir
- [ ] Creación manual de personajes — formulario para construir una ficha RPG sin IA, rellenando cada campo a mano

### 🗺 Visión a futuro
- [ ] Modo multijugador con servidor compartido — fichas de consenso generadas a partir de las descripciones de varios amigos sobre el mismo NPC
- [ ] Juego tipo Animal Crossing con Phaser.js — los NPCs guardados se mueven por un mapa tile-based y hablan
- [ ] Evolución de relación — las stats cambian según tus interacciones reales
- [ ] Misión del día — la app propone una micro-misión social con uno de tus NPCs
- [ ] Comparar dos NPCs — análisis de compatibilidad y dinámicas entre ellos
- [ ] Exportar/importar aldea completa como JSON
- [ ] Versión de escritorio nativa (JavaFX o Electron)
- [ ] App móvil (PWA + Capacitor)

---

## ⚠️ Privacidad

Todo se queda en tu navegador. La única llamada externa es a la API de Google Gemini con el texto que escribes. Los NPCs no se sincronizan con ningún servidor.

> En el modo multijugador, las descripciones se envían a un servidor propio que tú controlas y a la API de Gemini. Nunca a terceros adicionales.

---

*Parte psicología. Parte juego.*
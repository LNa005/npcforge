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

### 🗺 Visión a futuro
- [ ] Juego tipo Animal Crossing con Phaser.js — los NPCs guardados se mueven por un mapa tile-based y hablan
- [ ] Evolución de relación — las stats cambian según tus interacciones reales
- [ ] Misión del día — la app propone una micro-misión social con uno de tus NPCs
- [ ] Comparar dos NPCs — análisis de compatibilidad y dinámicas entre ellos
- [ ] Exportar/importar aldea completa como JSON

---

## ⚠️ Privacidad

Todo se queda en tu navegador. La única llamada externa es a la API de Google Gemini con el texto que escribes. Los NPCs no se sincronizan con ningún servidor.

---

*Parte psicología. Parte juego.*
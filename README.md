# ⚔️ NPCForge ✨

**Las personas de tu vida, convertidas en personajes de RPG 🎀**

*Analiza, crea, explora — y algún día, comparte tu aldea con el mundo 🌍*

---

## 🔮 ¿Qué es NPCForge?

Describes a alguien de tu vida. La IA genera una **ficha RPG psicológica** completa: stats, motivación oculta, punto débil, cómo ganarte su confianza y misiones de relación 📜

Diseñas su sprite en pixel art. Lo guardas en tu aldea. Explorar un mapa top-down donde puedes hablar con ellos en personaje, completar misiones y ver cómo evoluciona vuestra relación con el tiempo ⚡

> *El objetivo final: una app nativa para móvil y PC, con servidor propio y aldeas multijugador donde explorar el mundo de otras personas.*

---

## 🌟 Estado actual

✅ Generación de ficha RPG con IA (Mistral)  
✅ 6 stats psicológicos animados  
✅ Editor de sprite pixel art 16×16  
✅ Galería "Mi aldea" con tarjetas  
✅ Mapa top-down explorable (Phaser.js)  
✅ Avatar del jugador personalizable  
✅ Chat con NPCs en personaje  
✅ Sin servidor, sin registro — todo en `localStorage` 🌷  

---

## 🗂️ Estructura

```
npcforge/
├── index.html
├── css/
│   ├── base.css
│   ├── layout.css
│   └── sheet.css
├── js/
│   ├── storage.js
│   ├── gemini.js        ← Mistral API
│   ├── sprite-editor.js
│   └── app.js
└── game/
    ├── index.html
    ├── css/
    │   └── game.css
    └── js/
        ├── world.js     ← Mapa Phaser
        └── dialog.js    ← Chat con NPCs
```

---

## 🚀 Setup

**1.** API key gratis en [console.mistral.ai](https://console.mistral.ai) — sin tarjeta 💳

**2.** Servidor local:
```bash
python -m http.server 8080
# o Live Server en VS Code
```

**3.** Pega tu key → describe a alguien → **⚔️ Generar ficha** ✨

---

## 🗺️ Hoja de ruta

### 🐛 Bugs pendientes
- [ ] Chat con NPCs — espacio y WASD no responden con el diálogo abierto (Phaser sigue capturando teclas)

### 🏗️ Fase 3 — Mapa rico
- [ ] 🏛️ Plaza central con adoquines y fuente
- [ ] 🏠 Una casa por cada NPC guardado
- [ ] 🧍 NPCs frente a su propia casa
- [ ] 🪑 Objetos decorativos — bancos, señales
- [ ] 🛤️ Caminos conectando casas con la plaza

### 📋 Fase 4 — Sistema de misiones
- [ ] 📌 HUD con las 3 misiones activas de cada NPC
- [ ] ✅ Marcar misiones como completadas
- [ ] 🎉 Recompensa / evento al completar una misión
- [ ] 📜 Historial de misiones completadas

### 📈 Fase 5 — Relaciones vivas
- [ ] 💹 Stats que evolucionan según cómo hablas con el NPC
- [ ] 🔔 Indicador visual de cambio de stat
- [ ] ❤️ Nivel de relación global (desconocido → aliado → rival…)

### 🎮 Fase 6 — Animaciones
- [ ] 🚶 Caminar en 4 direcciones
- [ ] 💤 Idle animation
- [ ] 🌀 NPCs con movimiento aleatorio suave

### 📱 Fase 7 — App nativa
- [ ] 🖥️ Versión de escritorio (Electron o Tauri)
- [ ] 📱 Versión móvil (Capacitor o PWA)
- [ ] 🎮 Controles táctiles para el mapa

### 🌐 Fase 8 — Servidor y multijugador
- [ ] 🗄️ Backend propio (Node.js + base de datos)
- [ ] 🔐 Registro y login de usuarios
- [ ] ☁️ Aldeas guardadas en la nube
- [ ] 👥 Multijugador — por definir (¿visitar aldeas ajenas? ¿eventos globales? ¿NPCs compartidos?)

### 🌈 Ideas futuras
- [ ] 📸 Exportar ficha como imagen
- [ ] ⚖️ Comparar dos NPCs
- [ ] 💾 Backup / import JSON de la aldea
- [ ] 🌍 Explorar aldeas públicas de otros jugadores

---

## 🛠️ Stack actual

🍦 **Vanilla JS** — sin frameworks, sin npm  
🤖 **Mistral AI** — `mistral-small-latest`, free tier  
🎮 **Phaser 3** — motor 2D via CDN  
💾 **localStorage** — persistencia local  
🎨 **CSS custom properties** — theming completo  

## 🔭 Stack futuro (tentativo)

🖥️ **Electron / Tauri** — app de escritorio  
📱 **Capacitor / PWA** — app móvil  
⚙️ **Node.js + Express** — servidor  
🗄️ **PostgreSQL o SQLite** — base de datos  
🔌 **WebSockets** — tiempo real para multijugador  

---

*Hecho con demasiado café y ganas 💜*
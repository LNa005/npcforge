# 🌸 NPCForge ✨

**De la vida real a tu propia aldea virtual 🎀**

*Convierte a las personas de tu entorno en NPCs interactivos con análisis psicológico generado por IA ⚡*

---

## 💜 ¿Qué es NPCForge?

Describes a alguien de tu vida. La IA lo convierte en una **ficha RPG psicológica** completa — con stats, motivaciones ocultas, su punto débil y cómo ganarte su confianza 🔮

Luego diseñas su sprite en pixel art, lo guardas en tu aldea, y puedes **explorar un mapa top-down** y hablar con ellos como si fueran personajes reales 🏘️✨

---

## 🌟 Lo que ya funciona

✅ Generación de ficha RPG completa con IA  
✅ 6 stats psicológicos con animación  
✅ Editor de sprite pixel art 16×16  
✅ Galería "Mi aldea" con tarjetas  
✅ Mapa top-down explorable (Phaser.js)  
✅ Avatar del jugador personalizable  
✅ Chat con NPCs en personaje vía Mistral  
✅ Todo guardado en `localStorage` — sin servidor 🌷  

---

## 🗂️ Estructura del proyecto

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

**1.** Crea tu API key gratis en [console.mistral.ai](https://console.mistral.ai) — sin tarjeta 💳

**2.** Sirve la carpeta con un servidor local:
```bash
python -m http.server 8080
# o usa Live Server en VS Code
```

**3.** Pega tu key → rellena los datos → **⚔ Generar ficha** ✨

---

## 🗺️ Hoja de ruta

### 🔧 Bugs pendientes
- [ ] 🐛 Chat con NPCs — el espacio y WASD no responden mientras el diálogo está abierto (Phaser captura las teclas aunque el input tenga el foco)

### 🏗️ Fase 3 — Mapa rico
- [ ] 🏛️ Plaza central con adoquines y fuente
- [ ] 🏠 Una casa por cada NPC guardado
- [ ] 🧍 NPCs situados frente a su propia casa
- [ ] 🪑 Objetos decorativos — bancos, señal de bienvenida
- [ ] 🛤️ Caminos conectando casas con la plaza

### 📋 Fase 4 — Misiones activas
- [ ] 📌 Tracker de las 3 misiones de cada NPC en el HUD
- [ ] ✅ Marcar misiones como completadas
- [ ] 🎉 Notificación al completar una misión

### 📈 Fase 5 — Stats dinámicos
- [ ] 💹 Stats que evolucionan según cómo hablas con el NPC
- [ ] 🔔 Indicador visual de cambio de stat tras conversación
- [ ] 📜 Historial de relación

### 🎮 Fase 6 — Animaciones
- [ ] 🚶 Sprite sheet para caminar (4 direcciones)
- [ ] 💤 Idle animation
- [ ] 🌀 Movimiento suave aleatorio de los NPCs

### 🌈 Ideas futuras
- [ ] 📸 Exportar ficha como imagen
- [ ] ⚖️ Comparar dos NPCs
- [ ] 💾 Backup / import JSON de toda la aldea
- [ ] 📱 Mobile support

---

## 🛠️ Stack

🍦 **Vanilla JS** — sin frameworks, sin npm  
🤖 **Mistral AI** — `mistral-small-latest`, free tier  
🎮 **Phaser 3** — motor de juego 2D via CDN  
💾 **localStorage** — persistencia local  
🎨 **CSS custom properties** — theming completo  

---

*Hecho con demasiado café y ganas 💜*
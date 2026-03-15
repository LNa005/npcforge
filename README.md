<div align="center">

# 🌸 NPCForge ✨

**De la vida real a tu propia aldea virtual 🎀**

*Convierte a las personas de tu entorno en NPCs interactivos con análisis psicológico generado por IA ⚡*

![estado](https://img.shields.io/badge/estado-en%20desarrollo-ff6b6b?style=flat-square)
![stack](https://img.shields.io/badge/stack-vanilla%20js%20%2B%20phaser3-c9a84c?style=flat-square)
![ia](https://img.shields.io/badge/IA-Mistral-7b5ea7?style=flat-square)

</div>

---

## 💜 ¿Qué es NPCForge?

Describes a alguien de tu vida. La IA genera una **ficha RPG psicológica** completa — stats, motivación oculta, punto débil, cómo ganarte su confianza y misiones de relación 🔮

Luego diseñas su sprite en pixel art, lo guardas en tu aldea, y puedes **explorar un mapa top-down** donde caminarás por una aldea con casas, plaza y NPCs que deambulan libremente, responden en personaje y evolucionan según cómo los tratas ⚡

---

## 📸 Screenshots

<div align="center">

### 🌸 Generador de fichas RPG
![App](screenshots/screen_app.png)

### 🌸 Aldea explorable
![Game](screenshots/screen_game.png)

</div>

---

## 🌟 Lo que ya funciona

🌸 Generación de ficha RPG completa con IA (Mistral)  
🌸 6 stats psicológicos animados  
🌸 Editor de sprite pixel art 16×16  
🌸 Galería "Mi aldea" con tarjetas  
🌸 Mapa top-down explorable con Phaser.js — pantalla completa  
🌸 Plaza central con adoquines, fuente, faroles y bancos  
🌸 Una casa por cada NPC con tejado de color único  
🌸 Nombre del NPC sobre la puerta de su casa  
🌸 Nombre flotante encima del sprite del NPC en el mapa  
🌸 NPCs con movimiento libre (wandering por su zona)  
🌸 Colisionadores en casas, árboles y fuente  
🌸 Avatar del jugador personalizable con editor de sprite  
🌸 Chat con NPCs en personaje vía Mistral  
🌸 Teclado capturado correctamente durante el chat  
🌸 Opciones de diálogo clicables — la IA decide cuándo presentarlas  
🌸 Panel de misiones activas — aparece al acercarte a un NPC  
🌸 Misiones que se completan automáticamente durante el chat  
🌸 Notificación dorada al completar una misión  
🌸 Stats que evolucionan según cómo hablas con el NPC  
🌸 Chips de cambio de stats visibles en el chat (+/- por cada stat)  
🌸 Sin servidor, sin registro — todo en `localStorage` 🌷  

---

## 🗂️ Estructura

```
npcforge/
├── index.html
├── README.md
├── screenshots/
│   ├── screen_app.png
│   └── screen_game.png
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
        ├── dialog.js    ← Chat con opciones de diálogo
        ├── missions.js  ← Sistema de misiones
        └── stats.js     ← Stats dinámicos
```

---

## 🗺️ Hoja de ruta

### 📈 Fase 5 — Relaciones vivas *(en progreso)*
- [x] 🌸 Stats que evolucionan según cómo hablas con el NPC
- [x] 🌸 Chips visuales de cambio de stat en el chat
- [ ] 🌸 Nivel de relación global (desconocido → aliado → rival…)
- [ ] 🌸 Historial de relación con cada NPC

### 🎮 Fase 6 — Animaciones
- [ ] 🌸 Caminar en 4 direcciones (sprite sheet)
- [ ] 🌸 Idle animation
- [ ] 🌸 Animación de NPCs más natural

### 📱 Fase 7 — App nativa
- [ ] 🌸 Versión de escritorio (Electron o Tauri)
- [ ] 🌸 Versión móvil (Capacitor o PWA)
- [ ] 🌸 Controles táctiles para el mapa

### 🌐 Fase 8 — Servidor y multijugador
- [ ] 🌸 Backend propio (Node.js + base de datos)
- [ ] 🌸 Registro y login de usuarios
- [ ] 🌸 Aldeas guardadas en la nube
- [ ] 🌸 Multijugador — *por definir* (¿visitar aldeas ajenas? ¿eventos globales? ¿NPCs compartidos?)

### 🌈 Ideas futuras
- [ ] 🌸 Exportar ficha como imagen compartible
- [ ] 🌸 Comparar dos NPCs
- [ ] 🌸 Backup / import JSON de la aldea completa
- [ ] 🌸 Explorar aldeas públicas de otros jugadores
- [ ] 🌸 Música y efectos de sonido ambient
- [ ] 🌸 Ciclo día/noche en el mapa

---

## 🛠️ Stack actual

🍦 **Vanilla JS** — sin frameworks, sin npm  
🤖 **Mistral AI** — `mistral-small-latest`, free tier  
🎮 **Phaser 3** — motor 2D via CDN  
💾 **localStorage** — persistencia local  
🎨 **CSS custom properties** — theming completo  

## 🔭 Stack futuro *(tentativo)*

🖥️ **Electron / Tauri** — app de escritorio  
📱 **Capacitor / PWA** — app móvil  
⚙️ **Node.js + Express** — servidor  
🗄️ **PostgreSQL o SQLite** — base de datos  
🔌 **WebSockets** — tiempo real para multijugador  

---

<div align="center">

*Hecho con demasiado amor, "mostesito" y ganas 💜*

</div>
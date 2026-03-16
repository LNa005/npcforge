<div align="center">

<img src="screenshots/screen_app.png" width="100%" style="border-radius:12px"/>

<br/>
<br/>

# 🌸 NPCForge ✨

<p>
  <img src="https://img.shields.io/badge/✦_estado-en_desarrollo-ffb3c6?style=for-the-badge&labelColor=fce4f0"/>
  <img src="https://img.shields.io/badge/🎮_engine-Phaser_3-d4bfee?style=for-the-badge&labelColor=ede0f8"/>
  <img src="https://img.shields.io/badge/🤖_IA-Mistral_AI-a8dfc4?style=for-the-badge&labelColor=dff0f4"/>
  <img src="https://img.shields.io/badge/💾_storage-localStorage-f8c8a8?style=for-the-badge&labelColor=feeee4"/>
</p>

### *Convierte a las personas de tu vida en personajes de RPG*
### *y vívelos en tu propia aldea virtual* 🎀

<br/>

[✦ Ver la app](https://lna005.github.io/npcforge/) &nbsp;&nbsp;·&nbsp;&nbsp; [🌸 Jugar](https://lna005.github.io/npcforge/game/index.html) &nbsp;&nbsp;·&nbsp;&nbsp; [📋 Hoja de ruta](#-hoja-de-ruta)

</div>

---

## 💜 ¿Qué es NPCForge?

> Describes a alguien de tu vida. La IA genera una **ficha RPG psicológica** completa — stats, motivación oculta, punto débil, cómo ganarte su confianza y misiones de relación 🔮

Diseñas su sprite en pixel art. Lo guardas en tu aldea. Exploras un mapa top-down donde los NPCs deambulan libremente, te responden en personaje y **evolucionan según cómo los tratas** ⚡

<br/>

<div align="center">

| 🧠 Analiza | 🎨 Diseña | 🗺️ Explora | 💬 Habla |
|:---:|:---:|:---:|:---:|
| La IA convierte a una persona real en una ficha RPG psicológica | Diseña su sprite pixel art 16×16 con el editor integrado | Pasea por la aldea y visita sus casas en el mapa top-down | Habla con ellos en personaje — con opciones de diálogo y misiones |

</div>

---

## 📸 Screenshots

<div align="center">

<table>
<tr>
<td width="50%">

**🌸 Generador de fichas**
![App](screenshots/screen_app.png)

</td>
<td width="50%">

**🌸 Aldea explorable**
![Game](screenshots/screen_game.png)

</td>
</tr>
</table>

</div>

---

## 🌟 Features

<details open>
<summary><b>🎮 Juego & Mapa</b></summary>
<br/>

- 🌸 Mapa top-down explorable — pantalla completa con Phaser.js
- 🌸 Plaza central con adoquines, fuente, faroles y bancos
- 🌸 Una casa por cada NPC con tejado de color único
- 🌸 Bosque exterior con árboles de 3 tamaños distintos
- 🌸 Arbustos y rocas decorativas en el bosque
- 🌸 Flores de colores pastel en la zona central (sin invadir caminos ni casas)
- 🌸 Lago orgánico con orilla de arena, nenúfares y pájaros
- 🌸 NPCs con movimiento libre (wandering por su zona)
- 🌸 Nombre flotante encima de cada NPC
- 🌸 Avatar del jugador personalizable con editor de sprite
- 🌸 Colisionadores en casas, árboles, fuente y lago

</details>

<details open>
<summary><b>💬 Chat & Misiones</b></summary>
<br/>

- 🌸 Chat con NPCs en personaje vía Mistral AI
- 🌸 Opciones de diálogo clicables — la IA decide cuándo presentarlas
- 🌸 Panel de misiones activas al acercarte a un NPC
- 🌸 Misiones que se completan automáticamente durante el chat
- 🌸 Al completar las 3 misiones, la IA genera 3 nuevas más profundas
- 🌸 Las misiones completadas desaparecen del panel
- 🌸 Contador de misiones completadas en total con ese NPC
- 🌸 Notificación animada al completar — especial al completar todas
- 🌸 Historial de misiones guardado en `localStorage`

</details>

<details open>
<summary><b>📈 Stats & Relaciones</b></summary>
<br/>

- 🌸 6 stats psicológicos que **evolucionan** según cómo hablas
- 🌸 Chips visuales de cambio de stat en el chat
- 🌸 Nivel de relación global que cambia en tiempo real

| Nivel | Emoji | Condición |
|---|:---:|---|
| Desconocida | 🌫️ | Estado inicial |
| Conocida | 🌸 | Primeras conversaciones positivas |
| Aliada | 💜 | Alta empatía y lealtad |
| Rival | ⚔️ | Manipulación o ego elevados |
| Enemiga | 💀 | Relación muy deteriorada |

</details>

<details open>
<summary><b>🎨 Diseño & UX</b></summary>
<br/>

- 🌸 Tema pastel girlie en toda la app
- 🌸 Fuentes Playfair Display + Nunito
- 🌸 Animaciones y micro-interacciones
- 🌸 Sin servidor, sin registro — todo en `localStorage`

</details>

---

## 🗂️ Estructura

```
npcforge/
├── 📄 index.html
├── 📁 screenshots/
├── 📁 css/
│   ├── base.css          ✦ Variables, fuentes, animaciones
│   ├── layout.css        ✦ Header, formulario, galería
│   └── sheet.css         ✦ Ficha RPG + editor de sprite
├── 📁 js/
│   ├── storage.js        ✦ CRUD localStorage
│   ├── gemini.js         ✦ Mistral API
│   ├── sprite-editor.js  ✦ Editor pixel art 16×16
│   └── app.js            ✦ Controlador principal
└── 📁 game/
    ├── 📄 index.html
    ├── 📁 css/
    │   └── game.css      ✦ Estilos del juego
    └── 📁 js/
        ├── world.js      ✦ Mapa Phaser, NPCs, decoración
        ├── dialog.js     ✦ Chat con opciones de diálogo
        ├── missions.js   ✦ Misiones dinámicas con historial
        └── stats.js      ✦ Stats dinámicos + relaciones
```

---

## 🗺️ Hoja de ruta

### 🐛 Bugs pendientes
- [ ] 📸 Actualizar screenshots con el nuevo diseño

### 🏆 Sistema de logros *(planificado)*
- [ ] 🌸 Logros globales — "Completa 100 misiones", "Habla con 5 NPCs distintos"…
- [ ] 🌸 Panel de logros con insignias
- [ ] 🌸 Notificación al desbloquear un logro

### 📋 Fase 4 — Misiones *(completada)*
- [x] 🌸 Panel HUD con misiones activas
- [x] 🌸 Completar misiones durante el chat con IA
- [x] 🌸 Notificación animada al completar
- [x] 🌸 Opciones de diálogo clicables
- [x] 🌸 Misiones dinámicas — nuevas al completar el ciclo
- [x] 🌸 Historial de misiones completadas por NPC

### 📈 Fase 5 — Relaciones vivas *(en progreso)*
- [x] 🌸 Stats evolutivos con chips visuales
- [x] 🌸 Nivel de relación global (5 estados)
- [x] 🌸 Badge de relación en tiempo real
- [ ] 🌸 Historial de conversaciones con cada NPC

### 🎮 Fase 6 — Animaciones
- [ ] 🌸 Caminar en 4 direcciones (sprite sheet)
- [ ] 🌸 Idle animation
- [ ] 🌸 Movimiento más natural de los NPCs

### 📱 Fase 7 — App nativa
- [ ] 🌸 Escritorio (Electron o Tauri)
- [ ] 🌸 Móvil (Capacitor o PWA)
- [ ] 🌸 Controles táctiles

### 🌐 Fase 8 — Servidor y multijugador
- [ ] 🌸 Backend propio (Node.js + base de datos)
- [ ] 🌸 Login y cuentas de usuario
- [ ] 🌸 Aldeas guardadas en la nube
- [ ] 🌸 Multijugador *(por definir)*

### 🌈 Ideas futuras
- [ ] 🌸 Exportar ficha como imagen compartible
- [ ] 🌸 Comparar dos NPCs cara a cara
- [ ] 🌸 Música ambient y efectos de sonido
- [ ] 🌸 Ciclo día/noche en el mapa
- [ ] 🌸 Explorar aldeas públicas de otros jugadores

---

## 🛠️ Stack

<div align="center">

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | Vanilla JS | Sin frameworks, sin npm |
| Motor de juego | Phaser 3 | Via CDN |
| IA | Mistral AI `mistral-small-latest` | Free tier |
| Persistencia | localStorage | Sin servidor |
| Fuentes | Playfair Display + Nunito | Google Fonts |
| *(futuro)* App nativa | Electron / Tauri / Capacitor | — |
| *(futuro)* Servidor | Node.js + Express | — |
| *(futuro)* Base de datos | PostgreSQL o SQLite | — |
| *(futuro)* Tiempo real | WebSockets | Para multijugador |

</div>

---

<div align="center">

*Hecho con demasiado amor, "mostesito" y ganas 💜*

⸻

*🌸 &nbsp; ✦ &nbsp; 🌸 &nbsp; ✦ &nbsp; 🌸*

</div>
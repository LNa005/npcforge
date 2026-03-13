```markdown
<div align="center">

# 🌸 NPCForge ✨

**De la vida real a tu propia aldea virtual 🎀**
<br>
*Convierte a las personas de tu entorno en NPCs interactivos con análisis psicológico generado por IA 🧚‍♀️*

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)]()
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![Gemini](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white)]()

[**Prueba el MVP 💅**](#) • [**Roadmap 🗺️**](#-roadmap-hacia-la-aldea-) • [**Despliegue 🚀**](#-despliegue-y-uso-)

*(Añade aquí un GIF de 600x400 mostrando la generación de la ficha de personaje 💖)*

</div>

---

## 🍃 La Visión: Un "Animal Crossing" de tu vida real ✨

**NPCForge** no es solo un generador de fichas RPG. El objetivo final es construir un **simulador social 2D** donde los NPCs que generes (amigos, jefes, familiares) habiten una aldea virtual 🏡. Podrás interactuar con ellos, completar misiones de relación diarias y ver cómo evolucionan sus estadísticas psicológicas basándose en tus interacciones reales 💖.

### 📍 Estado Actual del Proyecto (Fase 1: Motor de IA y Stats) 💅

Actualmente, el proyecto funciona como un MVP en el navegador. Proporcionas una descripción y el motor impulsado por `gemini-2.0-flash` extrae un perfil estructurado:

* 📊 **Seis Estadísticas Base:** Carisma, Manipulación, Lealtad, Ego, Empatía, Drama 🎭.
* 🧠 **Perfil Psicológico:** Motivaciones ocultas, puntos débiles y señales de alarma (Red Flags 🚩).
* 📜 **Misiones Generadas:** Dinámicas de relación convertidas en *quests* accionables ⚔️.
* 💾 **Persistencia Local:** Tu "aldea" se almacena directamente en el `localStorage` del navegador. Sin backend 🚫☁️.

---

## 🛠️ Arquitectura y Tech Stack (Fase 1) 🎀

El código está diseñado bajo un modelo de separación de responsabilidades estricto, sin dependencias externas pesadas para garantizar un rendimiento óptimo en la generación del DOM.

<details>
<summary><b>📂 Ver estructura del proyecto ✨</b></summary>

```text
npcforge/
├── 📄 index.html        # Estructura semántica pura
├── 🎨 css/
│   ├── base.css         # Sistema de diseño: Variables, tipografía y reset
│   ├── layout.css       # Grid, contenedores y componentes UI
│   └── sheet.css        # Estilos específicos de las tarjetas RPG
└── 🧮 js/
    ├── storage.js       # Interfaz de persistencia (localStorage)
    ├── gemini.js        # Inyección de prompt estructurado y fetch a la API
    └── app.js           # Controlador: Listeners, DOM render y state management

```

</details>

---

## 🗺️ Roadmap hacia la Aldea 🏰🧚‍♀️

La hoja de ruta define la transición técnica desde un generador de texto estático hasta un simulador social multijugador y multiplataforma.

### 🌱 Fase 1: Fundaciones (MVP Actual)

* [x] 🤖 Generación de stats y misiones vía LLM.
* [x] 🃏 UI de Fichas RPG (HTML/CSS Grid).
* [x] 💾 Persistencia de datos en cliente (`localStorage`).

### 🌷 Fase 2: Identidad y Gestión (En progreso)

* [ ] 👾 **Generador de Sprites:** Canvas 80x80 para personalizar el aspecto de cada NPC 👗.
* [ ] ✏️ **Edición manual:** Ajuste post-generación para corregir alucinaciones de la IA ✨.
* [ ] 📦 **Exportación:** Descarga de datos en `.json` y capturas de ficha en `.png` 📸.

### 🌺 Fase 3: Simulador Social (Animal Crossing Style)

* [ ] 🗺️ **Integración de Phaser.js:** Migración a un entorno gráfico 2D (Tilemaps) 🏕️.
* [ ] 💬 **Sistema de Diálogo:** Chat interactivo inyectando la ficha de personaje como *System Prompt* persistente 💌.
* [ ] 📈 **Evolución Dinámica:** Modificación de stats en tiempo real tras completar misiones 🌟.

### 🔮 Fase 4: Refactorización Arquitectónica (Preparación para Escalabilidad)

* [ ] ⚡ **Migración a Vite:** Implementar empaquetador para minificación, HMR y gestión de assets (sprites/tilesets) 📦.
* [ ] 🛡️ **Migración a TypeScript:** Añadir tipado estricto para gestionar objetos complejos y físicas del juego 🤓.
* [ ] 🔄 **Gestión de Estado Centralizada:** Implementar Zustand o Redux para sincronizar la UI con el canvas de Phaser.js 🧠.

### ☁️ Fase 5: Backend y Multijugador

* [ ] 🗄️ **Base de Datos:** Migrar de `localStorage` a PostgreSQL (vía Supabase o Node.js) para persistencia en la nube 🌧️.
* [ ] 🔐 **Autenticación:** Sistema de login para proteger aldeas y cuentas 🔑.
* [ ] 🚪 **Multijugador Asíncrono:** Sistema de "códigos de aldea" para visitas pasivas ✈️💖.
* [ ] 🌐 **Multijugador Síncrono:** WebSockets (Socket.io/Colyseus) para interacciones y chat en tiempo real 💬👯‍♀️.

### 📱 Fase 6: Multiplataforma (Ejecutables Nativos)

* [ ] 💻 **Desktop (Windows/macOS/Linux):** Integración con **Tauri** para compilar un ejecutable nativo ligero 🦋.
* [ ] 📱 **Mobile (iOS/Android):** Integración con **Capacitor** para app nativa y notificaciones push de misiones 📲🎀.

---

## 🚀 Despliegue y Uso ✨

> [!WARNING]
> Las peticiones CORS a la API de Gemini requieren un entorno de servidor. **No ejecutes `index.html` haciendo doble clic** (`file://`) 🙅‍♀️🛑.

### 🔑 Requisito previo

Obtén tu API Key gratuita en [Google AI Studio](https://aistudio.google.com). Todo el procesamiento se realiza en el lado del cliente; tu clave se almacena localmente 🤫.

### 💻 Opción A: Servidor de Desarrollo Local

Clona el repositorio y levanta un servidor estático:

```bash
git clone [https://github.com/tu-usuario/npcforge.git](https://github.com/tu-usuario/npcforge.git)
cd npcforge

# Usando Python:
python -m http.server 8080

```

### 🌍 Opción B: Despliegue Estático (GitHub Pages)

1. Sube tu código a un repositorio en GitHub 🌸.
2. Ve a `Settings` > `Pages`.
3. Selecciona la rama `main` y la carpeta raíz `/ (root)`.
4. Guarda y accede a tu entorno en vivo ✨.

---

## 🤫 Privacidad y Datos 💖

**Arquitectura Zero-Backend (Fase 1).** Todos los perfiles psicológicos, descripciones de personas reales y tu API Key residen exclusivamente en el entorno de ejecución de tu navegador (`localStorage`) 💅. **No existen llamadas de red salientes** excepto el *payload* directo enviado a los servidores de Google Gemini para la inferencia de texto. ¡Tus secretos están a salvo! 🤐✨

```

```
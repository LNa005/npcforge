/* ================================================
   gemini.js — Llamadas a Google Gemini API
   ================================================ */

const Gemini = (() => {

  const MODEL    = 'gemini-2.0-flash';
  const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  function buildPrompt(form) {
    return `
Eres un experto en psicología social, arquetipos narrativos y diseño de personajes de rol (RPG).
Analiza a esta persona real y devuelve una FICHA DE PERSONAJE estilo RPG.

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido. Sin markdown, sin texto antes ni después.

DATOS DE LA PERSONA:
- Nombre: ${form.nombre || 'Sin nombre'}
- Relación con el usuario: ${form.relacion || 'No especificada'}
- Hobby / obsesión: ${form.hobby || 'No especificado'}
- Trabajo / rol en la vida del usuario: ${form.trabajo || 'No especificado'}
- Rasgos de personalidad: ${form.personalidad.length ? form.personalidad.join(', ') : 'No especificados'}
- Descripción libre: ${form.descripcion || 'Sin descripción'}

GENERA este objeto JSON completo:

{
  "arquetipo": "Nombre del arquetipo RPG en 2-4 palabras (ej: El Sabio Melancólico, La Manipuladora Benévola, El Héroe sin Causa)",
  "lema": "Frase de máximo 10 palabras que resume su filosofía de vida. Que suene poética.",
  "stats": {
    "carisma":      0,
    "manipulacion": 0,
    "lealtad":      0,
    "ego":          0,
    "empatia":      0,
    "drama":        0
  },
  "motivacion_oculta": "2-3 frases sobre qué quiere realmente en el fondo.",
  "punto_debil": "2-3 frases sobre su talón de Aquiles psicológico.",
  "como_ganar_su_confianza": "3-4 líneas con estrategias concretas y accionables.",
  "senal_de_alarma": "1-2 frases sobre un patrón de comportamiento a vigilar.",
  "dialogo_tipico": "Una frase concreta que diría esta persona en una situación cotidiana.",
  "misiones": [
    { "icono": "⚔", "texto": "Dinámica que este personaje te propone inconscientemente" },
    { "icono": "🛡", "texto": "Algo que necesita de ti aunque no lo pida" },
    { "icono": "💎", "texto": "Lo que puedes ganar si navegas bien esta relación" }
  ]
}

Reemplaza los valores de ejemplo con el análisis real. Los stats son números del 0 al 100.
`.trim();
  }

  async function generateSheet(form, apiKey) {
    // Los navegadores bloquean fetch a APIs externas desde file://
    // Necesita servirse desde HTTP/HTTPS (GitHub Pages, Live Server, etc.)
    if (window.location.protocol === 'file:') {
      throw new Error(
        'Abre el proyecto desde un servidor HTTP, no como archivo local. ' +
        'Usa GitHub Pages, la extensión "Live Server" de VS Code, ' +
        'o ejecuta: python -m http.server 8080'
      );
    }

    if (!apiKey || apiKey.trim().length < 10) {
      throw new Error('API Key inválida. Consíguela gratis en aistudio.google.com');
    }

    const url  = `${ENDPOINT}?key=${apiKey.trim()}`;
    const body = {
      contents: [{ parts: [{ text: buildPrompt(form) }] }],
      generationConfig: {
        temperature:     0.85,
        maxOutputTokens: 1500
      }
    };

    let res;
    try {
      res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
    } catch (networkErr) {
      throw new Error('Error de red. Comprueba tu conexión a internet.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `Error HTTP ${res.status}`;
      // Mensajes de error más claros para los casos comunes
      if (res.status === 400) throw new Error('API Key incorrecta o request mal formado.');
      if (res.status === 403) throw new Error('API Key sin permisos. Comprueba que está activada en Google AI Studio.');
      if (res.status === 429) throw new Error('Demasiadas peticiones. Espera un momento e inténtalo de nuevo.');
      throw new Error(msg);
    }

    const data = await res.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) throw new Error('Respuesta vacía de la API. Inténtalo de nuevo.');

    // Extraer JSON aunque la IA meta bloques de markdown alrededor
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('La IA no devolvió JSON. Inténtalo de nuevo.');

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('JSON malformado en la respuesta. Inténtalo de nuevo.');
    }
  }

  return { generateSheet };

})();
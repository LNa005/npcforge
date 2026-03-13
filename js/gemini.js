/* ================================================
   mistral.js — Llamadas a Mistral API
   ================================================ */

const Gemini = (() => {

  const MODEL    = 'mistral-small-latest';
  const ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

  function buildPrompt(form) {
    return `Eres un experto en psicología social, arquetipos narrativos y diseño de personajes de rol (RPG).
Analiza a esta persona real y devuelve una FICHA DE PERSONAJE estilo RPG.

Responde ÚNICAMENTE con un JSON válido. Sin markdown, sin texto antes ni después.

DATOS DE LA PERSONA:
- Nombre: ${form.nombre || 'Sin nombre'}
- Relación con el usuario: ${form.relacion || 'No especificada'}
- Hobby / obsesión: ${form.hobby || 'No especificado'}
- Trabajo / rol en la vida del usuario: ${form.trabajo || 'No especificado'}
- Rasgos de personalidad: ${form.personalidad.length ? form.personalidad.join(', ') : 'No especificados'}
- Descripción libre: ${form.descripcion || 'Sin descripción'}

GENERA este objeto JSON completo:

{
  "arquetipo": "Nombre del arquetipo RPG en 2-4 palabras (ej: El Sabio Melancólico, La Manipuladora Benévola)",
  "lema": "Frase de máximo 10 palabras que resume su filosofía de vida.",
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

Los stats son números enteros del 0 al 100.`.trim();
  }

  async function generateSheet(form, apiKey) {
    if (!apiKey || apiKey.trim().length < 10) {
      throw new Error('API Key inválida. Consíguela gratis en console.mistral.ai');
    }

    let res;
    try {
      res = await fetch(ENDPOINT, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model:           MODEL,
          messages:        [{ role: 'user', content: buildPrompt(form) }],
          response_format: { type: 'json_object' },
          temperature:     0.85,
          max_tokens:      1200
        })
      });
    } catch (e) {
      throw new Error('Error de red. Comprueba tu conexión.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('API Key incorrecta o sin permisos.');
      if (res.status === 429) throw new Error('Límite de peticiones alcanzado. Espera un momento.');
      throw new Error(err?.message || `Error HTTP ${res.status}`);
    }

    const data = await res.json();
    const raw  = data?.choices?.[0]?.message?.content;

    if (!raw) throw new Error('Respuesta vacía de la API.');

    try {
      return JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('La IA no devolvió JSON. Inténtalo de nuevo.');
      return JSON.parse(match[0]);
    }
  }

  return { generateSheet };

})();
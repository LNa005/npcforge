/* ================================================
   stats.js — Stats dinámicos por conversación
   ================================================ */

const Stats = (() => {

  const KEY      = 'npcforge_stats_evo';  // { npcId: { carisma: 45, ... } }
  const ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';
  const MODEL    = 'mistral-small-latest';

  const STAT_NAMES = ['carisma', 'manipulacion', 'lealtad', 'ego', 'empatia', 'drama'];
  const STAT_LABELS = {
    carisma:      '✦ Carisma',
    manipulacion: '⚡ Manipulación',
    lealtad:      '🛡 Lealtad',
    ego:          '👑 Ego',
    empatia:      '💜 Empatía',
    drama:        '🎭 Drama',
  };

  /* ── Persistencia ── */
  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function _save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

  function getStats(npc) {
    const data = _load();
    if (data[npc.id]) return data[npc.id];
    // Primera vez: usar los stats de la ficha base
    const base = {};
    STAT_NAMES.forEach(s => { base[s] = npc.sheet?.stats?.[s] ?? 50; });
    return base;
  }

  function applyDeltas(npcId, deltas) {
    const data    = _load();
    const current = data[npcId] || {};
    const changes = [];
    STAT_NAMES.forEach(s => {
      if (deltas[s] && deltas[s] !== 0) {
        const prev   = current[s] ?? 50;
        const next   = Math.max(0, Math.min(100, prev + deltas[s]));
        current[s]   = next;
        changes.push({ stat: s, delta: deltas[s], prev, next });
      }
    });
    data[npcId] = current;
    _save(data);
    return changes;
  }

  /* ── Evaluar cambio de stats tras conversación ── */
  async function evaluate(npc, history, apiKey) {
    if (!apiKey) return [];

    const convResumen = history.slice(-6)
      .map(m => `${m.role === 'user' ? 'Jugador' : 'NPC'}: ${m.content}`)
      .join('\n');

    const prompt = `Analiza esta conversación entre el Jugador y el NPC "${npc.form.nombre}" (${npc.sheet?.arquetipo}):
---
${convResumen}
---
Según cómo se ha comportado el Jugador, indica qué stats del NPC cambian ligeramente.
Los cambios deben ser pequeños: entre -5 y +5.
Solo indica los que realmente cambian. Si la conversación es neutral, pon todo a 0.

Responde SOLO con JSON:
{"carisma": 0, "manipulacion": 0, "lealtad": 0, "ego": 0, "empatia": 0, "drama": 0}`;

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 80
        })
      });
      const data   = await res.json();
      const raw    = data?.choices?.[0]?.message?.content || '{}';
      const deltas = JSON.parse(raw);
      return applyDeltas(npc.id, deltas);
    } catch {
      return [];
    }
  }

  /* ── Mostrar indicador de cambio en el chat ── */
  function showChanges(changes) {
    if (!changes.length) return;

    const relevant = changes.filter(c => Math.abs(c.delta) > 0);
    if (!relevant.length) return;

    const h   = document.getElementById('dialogHistory');
    const div = document.createElement('div');
    div.className = 'dmsg stat-changes';

    const chips = relevant.map(c => {
      const sign  = c.delta > 0 ? '+' : '';
      const cls   = c.delta > 0 ? 'stat-up' : 'stat-down';
      const label = STAT_LABELS[c.stat] || c.stat;
      return `<span class="stat-chip ${cls}">${label} ${sign}${c.delta}</span>`;
    }).join('');

    div.innerHTML = `<span class="dname">stats</span><span class="dtext stat-chips">${chips}</span>`;
    h.appendChild(div);
    h.scrollTop = h.scrollHeight;
  }

  /* ── Nivel de relación global ── */
  const LEVELS = [
    { min: -999, max: -30, key: 'enemiga',     label: '💀 Enemiga',      color: '#e05555' },
    { min:  -30, max: -10, key: 'rival',       label: '⚔️ Rival',         color: '#f0a878' },
    { min:  -10, max:  15, key: 'desconocida', label: '🌫️ Desconocida',   color: '#caaed8' },
    { min:   15, max:  35, key: 'conocida',    label: '🌸 Conocida',      color: '#f4afc0' },
    { min:   35, max: 999, key: 'aliada',      label: '💜 Aliada',        color: '#b899d8' },
  ];

  function getRelationLevel(npcId) {
    const stats  = _load()[npcId];
    if (!stats) return LEVELS[2]; // desconocida por defecto
    // Puntuación = promedio de cambios respecto a 50 (base)
    // empatia y lealtad suman, ego y manipulacion restan
    const score =
      (stats.empatia  || 50) - 50 +
      (stats.lealtad  || 50) - 50 -
      ((stats.manipulacion || 50) - 50) * 0.5 -
      ((stats.ego     || 50) - 50) * 0.3 +
      (stats.carisma  || 50) - 50;
    return LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[2];
  }

  function updateRelationBadge(npcId) {
    const el = document.getElementById('relationBadge');
    if (!el) return;
    const level = getRelationLevel(npcId);
    el.textContent  = level.label;
    el.style.color  = level.color;
    el.style.borderColor = level.color + '55';
    el.style.background  = level.color + '18';
  }

  return { getStats, evaluate, showChanges, getRelationLevel, updateRelationBadge, STAT_LABELS };

})();
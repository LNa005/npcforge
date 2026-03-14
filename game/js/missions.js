/* ================================================
   missions.js — Sistema de misiones con autocomplete
   ================================================ */

const Missions = (() => {

  const KEY      = 'npcforge_missions';
  const ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';
  const MODEL    = 'mistral-small-latest';

  /* ── Persistencia ── */
  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function _save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

  function getState(npcId) {
    return _load()[npcId] || [false, false, false];
  }

  function _markDone(npcId, index) {
    const data  = _load();
    const state = data[npcId] || [false, false, false];
    if (state[index]) return false; // ya estaba
    state[index]  = true;
    data[npcId]   = state;
    _save(data);
    return true; // recién completada
  }

  /* ── Render del panel ── */
  let _currentNpc = null;

  function show(npc) {
    const panel = document.getElementById('missionsPanel');
    if (!panel || !npc?.sheet?.misiones?.length) { hide(); return; }
    _currentNpc = npc;
    _render(npc);
    panel.classList.remove('hidden');
  }

  function hide() {
    document.getElementById('missionsPanel')?.classList.add('hidden');
    _currentNpc = null;
  }

  function _render(npc) {
    const state   = getState(npc.id);
    const misiones = npc.sheet.misiones;
    document.getElementById('missionsNpcName').textContent = npc.form.nombre || '?';

    const list = document.getElementById('missionsList');
    list.innerHTML = '';
    misiones.forEach((m, i) => {
      const done = state[i] || false;
      const li   = document.createElement('div');
      li.className = `mission-item${done ? ' done' : ''}`;
      li.innerHTML = `
        <span class="mission-check">${done ? '✦' : '○'}</span>
        <span class="mission-icon">${m.icono || '📌'}</span>
        <span class="mission-text">${m.texto || ''}</span>
      `;
      list.appendChild(li);
    });

    const done  = state.filter(Boolean).length;
    const total = misiones.length;
    document.getElementById('missionsCounter').textContent = `${done}/${total}`;
  }

  /* ── Auto-evaluación por IA ── */
  async function checkAuto(npc, history, apiKey) {
    if (!npc?.sheet?.misiones?.length || !apiKey) return;

    const misiones = npc.sheet.misiones;
    const state    = getState(npc.id);

    // Solo evaluar las que aún no están completadas
    const pending = misiones
      .map((m, i) => ({ i, texto: m.texto }))
      .filter(({ i }) => !state[i]);

    if (!pending.length) return;

    // Construir prompt de evaluación
    const convResumen = history.slice(-6) // últimos 6 mensajes
      .map(m => `${m.role === 'user' ? 'Jugador' : 'NPC'}: ${m.content}`)
      .join('\n');

    const prompt = `Dada esta conversación entre el jugador y el NPC:
---
${convResumen}
---
Evalúa si alguna de estas misiones se ha cumplido en la conversación.
Responde SOLO con un JSON así: {"completadas": [0, 2]} con los índices de las misiones cumplidas, o {"completadas": []} si ninguna.
Misiones:
${pending.map(({ i, texto }) => `[${i}] ${texto}`).join('\n')}`;

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model:           MODEL,
          messages:        [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature:     0.1,
          max_tokens:      60
        })
      });

      const data     = await res.json();
      const raw      = data?.choices?.[0]?.message?.content || '{}';
      const result   = JSON.parse(raw);
      const completadas = result.completadas || [];

      let hayNuevas = false;
      completadas.forEach(idx => {
        const recien = _markDone(npc.id, idx);
        if (recien) {
          hayNuevas = true;
          _showNotification(npc.form.nombre, misiones[idx]);
        }
      });

      // Re-render si algo cambió y el panel está visible
      if (hayNuevas && _currentNpc?.id === npc.id) {
        _render(npc);
      }

    } catch {
      // Fallo silencioso — no interrumpe el chat
    }
  }

  /* ── Notificación de misión completada ── */
  function _showNotification(npcName, mision) {
    const existing = document.getElementById('missionNotif');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.id = 'missionNotif';
    notif.className = 'mission-notif';
    notif.innerHTML = `
      <span class="notif-icon">✦</span>
      <div class="notif-text">
        <b>¡Misión completada!</b>
        <span>${mision.icono || '📌'} ${mision.texto}</span>
      </div>
    `;
    document.body.appendChild(notif);

    // Animar entrada y salida
    requestAnimationFrame(() => notif.classList.add('visible'));
    setTimeout(() => {
      notif.classList.remove('visible');
      setTimeout(() => notif.remove(), 500);
    }, 3500);
  }

  return { show, hide, checkAuto, getState };

})();
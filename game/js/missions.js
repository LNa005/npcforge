/* ================================================
   missions.js — Misiones dinámicas con historial
   ================================================ */

const Missions = (() => {

  const KEY      = 'npcforge_missions';   // { npcId: { active, done, total } }
  const ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';
  const MODEL    = 'mistral-small-latest';

  /* ── Estructura de datos por NPC:
     {
       active:  [{ icono, texto }, ...],  ← misiones actuales (máx 3)
       done:    [{ icono, texto }, ...],  ← historial completadas
       state:   [bool, bool, bool],       ← estado de las active
       total:   number                    ← total completadas alguna vez
     }
  ── */

  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function _save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

  function _getData(npc) {
    const all = _load();
    if (!all[npc.id]) {
      // Primera vez: usar las misiones de la ficha
      all[npc.id] = {
        active: npc.sheet.misiones || [],
        done:   [],
        state:  [false, false, false],
        total:  0,
      };
      _save(all);
    }
    return all[npc.id];
  }

  function getState(npcId) {
    const all = _load();
    return all[npcId]?.state || [false, false, false];
  }

  function _markDone(npcId, index) {
    const all  = _load();
    const data = all[npcId];
    if (!data || data.state[index]) return false;
    data.state[index] = true;
    all[npcId] = data;
    _save(all);
    return true;
  }

  /* ── Render ── */
  let _currentNpc = null;

  function show(npc) {
    const panel = document.getElementById('missionsPanel');
    if (!panel) return;
    _currentNpc = npc;
    const data = _getData(npc);
    _render(npc, data);
    panel.classList.remove('hidden');
    Stats.updateRelationBadge(npc.id);
  }

  function hide() {
    document.getElementById('missionsPanel')?.classList.add('hidden');
    _currentNpc = null;
  }

  function _render(npc, data) {
    document.getElementById('missionsNpcName').textContent = npc.form.nombre || '?';

    const list = document.getElementById('missionsList');
    list.innerHTML = '';

    const active  = data.active  || [];
    const state   = data.state   || [];
    const done    = state.filter(Boolean).length;
    const total   = active.length;

    // Mostrar misiones activas (solo las no completadas si todas están listas se muestra cargando)
    if (active.length === 0) {
      const li = document.createElement('div');
      li.className = 'mission-item';
      li.innerHTML = `<span class="mission-text" style="font-style:italic;color:var(--text-mute)">Generando nuevas misiones… 🌸</span>`;
      list.appendChild(li);
    } else {
      active.forEach((m, i) => {
        const isDone = state[i] || false;
        if (isDone) return; // no mostrar las completadas
        const li = document.createElement('div');
        li.className = 'mission-item';
        li.innerHTML = `
          <span class="mission-check">○</span>
          <span class="mission-icon">${m.icono || '📌'}</span>
          <span class="mission-text">${m.texto || ''}</span>
        `;
        list.appendChild(li);
      });
    }

    // Contador: pendientes / total + historial
    const pending = total - done;
    const totalDone = (data.total || 0);
    document.getElementById('missionsCounter').textContent =
      pending > 0 ? `${pending} pendiente${pending !== 1 ? 's' : ''}` : '✦ todas';

    // Historial si hay completadas alguna vez
    if (totalDone > 0) {
      const hist = document.createElement('div');
      hist.className = 'missions-history-label';
      hist.textContent = `✦ ${totalDone} completada${totalDone !== 1 ? 's' : ''} en total`;
      list.appendChild(hist);
    }
  }

  /* ── Auto-evaluación por IA ── */
  async function checkAuto(npc, history, apiKey) {
    if (!apiKey) return;
    const all  = _load();
    const data = all[npc.id] || _getData(npc);
    const active = data.active || [];
    if (!active.length) return;

    const pending = active
      .map((m, i) => ({ i, texto: m.texto }))
      .filter(({ i }) => !data.state[i]);

    if (!pending.length) return;

    const convResumen = history.slice(-6)
      .map(m => `${m.role === 'user' ? 'Jugador' : 'NPC'}: ${m.content}`)
      .join('\n');

    const prompt = `Conversación:\n---\n${convResumen}\n---\n¿Se ha cumplido alguna de estas misiones?\nResponde SOLO JSON: {"completadas": [índices]} o {"completadas": []}\nMisiones:\n${pending.map(({ i, texto }) => `[${i}] ${texto}`).join('\n')}`;

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 60
        })
      });

      const result = JSON.parse((await res.json())?.choices?.[0]?.message?.content || '{}');
      const completadas = result.completadas || [];
      let hayNuevas = false;

      completadas.forEach(idx => {
        if (_markDone(npc.id, idx)) {
          hayNuevas = true;
          _showNotification(npc.form.nombre, active[idx]);
        }
      });

      if (!hayNuevas) return;

      // Recargar datos actualizados
      const fresh = _load()[npc.id];
      const allDone = fresh.state.slice(0, fresh.active.length).every(Boolean);

      if (allDone) {
        // Todas completadas — mover al historial y generar nuevas
        await _cycleNewMissions(npc, fresh, apiKey);
      } else if (_currentNpc?.id === npc.id) {
        const freshData = _load()[npc.id];
        _render(npc, freshData);
        Stats.updateRelationBadge(npc.id);
      }

    } catch { /* fallo silencioso */ }
  }

  /* ── Generar nuevas misiones cuando se completan todas ── */
  async function _cycleNewMissions(npc, data, apiKey) {
    // 1. Mostrar mensaje de carga
    if (_currentNpc?.id === npc.id) {
      const list = document.getElementById('missionsList');
      if (list) {
        list.innerHTML = `<div class="mission-item"><span class="mission-text" style="font-style:italic;color:var(--text-mute)">Generando nuevas misiones… 🌸</span></div>`;
      }
    }

    // 2. Mover completadas al historial
    const all = _load();
    const current = all[npc.id];
    current.done  = [...(current.done || []), ...current.active];
    current.total = (current.total || 0) + current.active.length;
    current.active = [];
    current.state  = [false, false, false];
    all[npc.id] = current;
    _save(all);

    // 3. Notificación especial
    _showAllDoneNotification(npc.form.nombre);

    // 4. Generar nuevas misiones con IA
    const historialTextos = current.done.slice(-6).map(m => m.texto).join(', ');
    const prompt = `Eres un generador de misiones de relación para un juego RPG.
El personaje es "${npc.form.nombre}", un ${npc.sheet?.arquetipo || 'personaje'}.
Su motivación oculta: ${npc.sheet?.motivacion_oculta || ''}.
Misiones ya completadas (no repetir): ${historialTextos}.
Genera 3 misiones nuevas, más profundas y personales que las anteriores.
Responde SOLO JSON: {"misiones": [{"icono": "emoji", "texto": "descripción corta"}, ...]}`;

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.85,
          max_tokens: 200
        })
      });

      const parsed = JSON.parse((await res.json())?.choices?.[0]?.message?.content || '{}');
      const nuevas = parsed.misiones || [];

      if (nuevas.length) {
        const all2 = _load();
        all2[npc.id].active = nuevas.slice(0, 3);
        all2[npc.id].state  = [false, false, false];
        _save(all2);
      }

    } catch { /* si falla, quedará vacío hasta el próximo show */ }

    // 5. Re-render con las nuevas misiones
    if (_currentNpc?.id === npc.id) {
      const fresh = _load()[npc.id];
      // Actualizar el objeto npc en memoria
      const freshNpc = Storage.getById(npc.id);
      if (freshNpc) _render(freshNpc, fresh);
      else _render(npc, fresh);
    }
  }

  /* ── Notificaciones ── */
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
        <span>${mision?.icono || '📌'} ${mision?.texto || ''}</span>
      </div>
    `;
    document.body.appendChild(notif);
    requestAnimationFrame(() => notif.classList.add('visible'));
    setTimeout(() => { notif.classList.remove('visible'); setTimeout(() => notif.remove(), 500); }, 3500);
  }

  function _showAllDoneNotification(npcName) {
    const existing = document.getElementById('missionNotif');
    if (existing) existing.remove();
    const notif = document.createElement('div');
    notif.id = 'missionNotif';
    notif.className = 'mission-notif mission-notif-special';
    notif.innerHTML = `
      <span class="notif-icon">🌸</span>
      <div class="notif-text">
        <b>¡Todas las misiones completadas!</b>
        <span>Generando nuevas aventuras con ${npcName}…</span>
      </div>
    `;
    document.body.appendChild(notif);
    requestAnimationFrame(() => notif.classList.add('visible'));
    setTimeout(() => { notif.classList.remove('visible'); setTimeout(() => notif.remove(), 600); }, 4500);
  }

  return { show, hide, checkAuto, getState, _markDone, _showNotification };

})();
/* ================================================
   missions.js — HUD de misiones activas
   ================================================ */

const Missions = (() => {

  const KEY = 'npcforge_missions'; // { npcId: [bool, bool, bool] }

  /* ── Estado ── */
  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function _save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
  function getState(npcId) {
    const data = _load();
    return data[npcId] || [false, false, false];
  }
  function toggle(npcId, index) {
    const data  = _load();
    const state = data[npcId] || [false, false, false];
    state[index] = !state[index];
    data[npcId]  = state;
    _save(data);
    return state;
  }

  /* ── Render ── */
  let _currentNpcId = null;

  function show(npc) {
    const panel = document.getElementById('missionsPanel');
    if (!panel) return;
    if (!npc?.sheet?.misiones?.length) { hide(); return; }

    _currentNpcId = npc.id;
    const state   = getState(npc.id);
    const misiones = npc.sheet.misiones;

    document.getElementById('missionsNpcName').textContent = npc.form.nombre || '?';

    const list = document.getElementById('missionsList');
    list.innerHTML = '';

    misiones.forEach((m, i) => {
      const done = state[i] || false;
      const li   = document.createElement('div');
      li.className = `mission-item${done ? ' done' : ''}`;
      li.dataset.index = i;
      li.innerHTML = `
        <button class="mission-check" onclick="Missions.toggleItem('${npc.id}', ${i})">
          ${done ? '✦' : '○'}
        </button>
        <span class="mission-icon">${m.icono || '📌'}</span>
        <span class="mission-text">${m.texto || ''}</span>
      `;
      list.appendChild(li);
    });

    panel.classList.remove('hidden');
    _updateCounter(npc.id, misiones.length);
  }

  function hide() {
    const panel = document.getElementById('missionsPanel');
    if (panel) panel.classList.add('hidden');
    _currentNpcId = null;
  }

  function toggleItem(npcId, index) {
    const state = toggle(npcId, index);
    const npc   = Storage.getById(npcId);
    if (npc) show(npc); // re-render
  }

  function _updateCounter(npcId, total) {
    const state = getState(npcId);
    const done  = state.filter(Boolean).length;
    const el    = document.getElementById('missionsCounter');
    if (el) el.textContent = `${done}/${total}`;
  }

  function isAllDone(npcId, total) {
    return getState(npcId).slice(0, total).every(Boolean);
  }

  return { show, hide, toggleItem, getState, isAllDone };

})();
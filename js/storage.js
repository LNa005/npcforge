/* ================================================
   storage.js — Persistencia de NPCs en localStorage
   ================================================ */

const Storage = (() => {

  const NPCS_KEY   = 'npcforge_npcs';
  const APIKEY_KEY = 'npcforge_apikey';

  /* ── NPCs ── */

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(NPCS_KEY)) ?? [];
    } catch {
      return [];
    }
  }

  function save(npc) {
    const list = getAll();
    const idx  = list.findIndex(n => n.id === npc.id);

    if (idx >= 0) {
      list[idx] = npc;
    } else {
      list.unshift(npc); // más reciente primero
    }
    localStorage.setItem(NPCS_KEY, JSON.stringify(list));
  }

  function remove(id) {
    const updated = getAll().filter(n => n.id !== id);
    localStorage.setItem(NPCS_KEY, JSON.stringify(updated));
  }

  function getById(id) {
    return getAll().find(n => n.id === id) ?? null;
  }

  function generateId() {
    return `npc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  /* ── API Key ── */

  function saveApiKey(key) {
    localStorage.setItem(APIKEY_KEY, key);
  }

  function loadApiKey() {
    return localStorage.getItem(APIKEY_KEY) ?? '';
  }

  return { getAll, save, remove, getById, generateId, saveApiKey, loadApiKey };

})();

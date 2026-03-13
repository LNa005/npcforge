/* ================================================
   app.js — Controlador principal (eventos + render)
   ================================================ */

const PERSONALITY_TAGS = [
  'Introvertido','Extrovertido','Empático','Analítico',
  'Impulsivo','Controlador','Caótico','Leal',
  'Ambicioso','Perezoso','Creativo','Pragmático',
  'Ansioso','Seguro','Pasivo-agresivo','Directo',
  'Dramático','Estoico','Curioso','Cerrado'
];

const STAT_LABELS = {
  carisma:'Carisma', manipulacion:'Manipulación',
  lealtad:'Lealtad', ego:'Ego',
  empatia:'Empatía', drama:'Drama'
};

const state = {
  activeTab: 'crear',
  selectedPersonality: new Set(),
  currentSheet: null
};

document.addEventListener('DOMContentLoaded', () => {
  buildPersonalityChips();
  loadSavedApiKey();
  setupTabNav();
  setupForm();
  setupApiKeyField();
  renderGallery();
});

/* ── Tabs ── */
function setupTabNav() {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-view').forEach(view => {
    const isActive = view.id === `tab-${tab}`;
    view.classList.toggle('hidden', !isActive);
    view.classList.toggle('active', isActive);
  });
  if (tab === 'aldea') renderGallery();
}

/* ── Chips ── */
function buildPersonalityChips() {
  const container = document.getElementById('personalityChips');
  if (!container) return;
  PERSONALITY_TAGS.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = tag;
    chip.addEventListener('click', () => {
      if (state.selectedPersonality.has(tag)) {
        state.selectedPersonality.delete(tag);
        chip.classList.remove('active');
      } else {
        state.selectedPersonality.add(tag);
        chip.classList.add('active');
      }
    });
    container.appendChild(chip);
  });
}

/* ── API Key ── */
function setupApiKeyField() {
  const field  = document.getElementById('apiKey');
  const status = document.getElementById('keyStatus');
  if (!field) return;
  field.addEventListener('input', () => {
    const key = field.value.trim();
    if (!key) { status.textContent = ''; status.className = 'key-status'; return; }
    if (key.startsWith('AIza') && key.length > 20) {
      status.textContent = '✓ Formato correcto';
      status.className   = 'key-status ok';
      Storage.saveApiKey(key);
    } else {
      status.textContent = 'Debe empezar por AIza…';
      status.className   = 'key-status error';
    }
  });
}

function loadSavedApiKey() {
  const field = document.getElementById('apiKey');
  if (!field) return;
  const saved = Storage.loadApiKey();
  if (saved) { field.value = saved; field.dispatchEvent(new Event('input')); }
}

/* ── Formulario ── */
function setupForm() {
  document.getElementById('npcForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleGenerate();
  });
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    document.getElementById('npcForm').reset();
    state.selectedPersonality.clear();
    document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
    const r = document.getElementById('resultArea');
    r.classList.add('hidden');
    r.innerHTML = '';
    state.currentSheet = null;
    showToast('Formulario limpiado');
  });
}

function readForm() {
  return {
    nombre:      document.getElementById('fNombre')?.value.trim()  || '',
    relacion:    document.getElementById('fRelacion')?.value       || '',
    hobby:       document.getElementById('fHobby')?.value.trim()   || '',
    trabajo:     document.getElementById('fTrabajo')?.value.trim() || '',
    personalidad:[...state.selectedPersonality],
    descripcion: document.getElementById('fDesc')?.value.trim()    || ''
  };
}

/* ── Generar ── */
async function handleGenerate() {
  const form   = readForm();
  const apiKey = document.getElementById('apiKey')?.value.trim() || '';

  if (!form.descripcion && !form.nombre) {
    showToast('Escribe al menos el nombre o una descripción', 'error'); return;
  }

  const btn        = document.getElementById('generateBtn');
  const resultArea = document.getElementById('resultArea');

  btn.disabled    = true;
  btn.textContent = '⏳ Invocando…';
  resultArea.classList.remove('hidden');
  resultArea.innerHTML = `
    <div class="loading-msg">
      <p class="loading-title">✦ Consultando los registros arcanos ✦</p>
      <p class="loading-sub">La IA está analizando al personaje…</p>
    </div>`;

  try {
    const sheet = await Gemini.generateSheet(form, apiKey);
    state.currentSheet = { id: Storage.generateId(), form, sheet, createdAt: new Date().toISOString() };
    renderSheet(state.currentSheet, resultArea);
    showToast('✦ Ficha generada con éxito');
  } catch (err) {
    resultArea.innerHTML = `
      <div class="loading-msg">
        <p class="loading-title" style="color:var(--red-bright)">⚠ Error al generar</p>
        <p class="loading-sub">${err.message}</p>
      </div>`;
    showToast(err.message, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = '⚔ Generar ficha';
  }
}

/* ── Render ficha ── */
function renderSheet(npc, container) {
  const { form, sheet } = npc;

  const statsHTML = Object.entries(STAT_LABELS).map(([key, label]) => {
    const val = sheet.stats?.[key] ?? 0;
    return `<div class="stat-row">
      <span class="stat-name">${label}</span>
      <div class="stat-track"><div class="stat-fill" data-stat="${key}" style="width:0%"></div></div>
      <span class="stat-value mono">${val}</span>
    </div>`;
  }).join('');

  const missionsHTML = (sheet.misiones || []).map(m =>
    `<div class="mission-item">
      <span class="mission-icon">${m.icono}</span>
      <span class="mission-text">${m.texto}</span>
    </div>`
  ).join('');

  const tagsHTML = [
    form.relacion && `<span class="sheet-tag">${form.relacion}</span>`,
    form.trabajo  && `<span class="sheet-tag">${form.trabajo}</span>`,
    ...form.personalidad.slice(0,3).map(p => `<span class="sheet-tag">${p}</span>`)
  ].filter(Boolean).join('');

  const alarma = sheet.senal_de_alarma || sheet['señal_de_alarma'] || '—';

  container.innerHTML = `
    <div class="rpg-sheet">
      <div class="sheet-head">
        <p class="sheet-archetype">✦ ${sheet.arquetipo || 'Personaje desconocido'} ✦</p>
        <h2 class="sheet-name">${form.nombre || 'Sin nombre'}</h2>
        <p class="sheet-lema">${sheet.lema || ''}</p>
        <div class="sheet-tags">${tagsHTML}</div>
      </div>
      <div class="sheet-body">
        <div class="sheet-section">
          <p class="section-label">Atributos</p>
          <div class="stats-list">${statsHTML}</div>
        </div>
        <div class="sheet-section">
          <p class="section-label">Frase característica</p>
          <blockquote class="sheet-quote">${sheet.dialogo_tipico || '…'}</blockquote>
          <p class="section-label" style="margin-top:20px">⚠ Señal de alarma</p>
          <div class="prose-block red">${alarma}</div>
        </div>
        <div class="sheet-section">
          <p class="section-label">🎭 Motivación oculta</p>
          <div class="prose-block purple">${sheet.motivacion_oculta || '—'}</div>
        </div>
        <div class="sheet-section">
          <p class="section-label">💀 Punto débil</p>
          <div class="prose-block red">${sheet.punto_debil || '—'}</div>
        </div>
        <div class="sheet-section full-width">
          <p class="section-label">🔑 Cómo ganar su confianza</p>
          <div class="prose-block gold">${sheet.como_ganar_su_confianza || '—'}</div>
        </div>
        <div class="sheet-section full-width">
          <p class="section-label">📜 Misiones de relación</p>
          <div class="mission-list">${missionsHTML}</div>
        </div>
      </div>
      <div class="sheet-footer">
        <button class="btn btn-save"      onclick="saveCurrentNpc()">💾 Guardar en la aldea</button>
        <button class="btn btn-secondary" onclick="copySheetJson()">📋 Copiar JSON</button>
        <button class="btn btn-sprite"    onclick="toggleSpriteEditor()">🎨 Diseñar sprite</button>
      </div>
    </div>
    <div id="spriteEditorPanel" class="sprite-editor-panel hidden"></div>`;

  requestAnimationFrame(() => {
    container.querySelectorAll('.stat-fill').forEach(bar => {
      const val = sheet.stats?.[bar.dataset.stat] ?? 0;
      setTimeout(() => { bar.style.width = `${val}%`; }, 80);
    });
  });
}

/* ── Guardar / copiar ── */
function saveCurrentNpc() {
  if (!state.currentSheet) return;
  // Si el editor de sprite está abierto, captura el estado
  const panel = document.getElementById('spriteEditorPanel');
  if (panel && !panel.classList.contains('hidden') && panel.dataset.mounted) {
    state.currentSheet.spriteData  = SpriteEditor.getSprite();
    state.currentSheet.spriteState = SpriteEditor.getState();
  }
  Storage.save(state.currentSheet);
  showToast('✦ Personaje guardado en la aldea');
}

/** Llamado desde el botón dentro del sprite editor */
function saveSpriteAndNpc() {
  if (!state.currentSheet) return;
  state.currentSheet.spriteData  = SpriteEditor.getSprite();
  state.currentSheet.spriteState = SpriteEditor.getState();
  Storage.save(state.currentSheet);
  showToast('✦ Sprite y personaje guardados');
}

/** Abre/cierra el panel del sprite editor */
function toggleSpriteEditor() {
  const panel = document.getElementById('spriteEditorPanel');
  if (!panel) return;
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    if (!panel.dataset.mounted) {
      SpriteEditor.mount(panel, state.currentSheet?.spriteState ?? null);
      panel.dataset.mounted = 'true';
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    panel.classList.add('hidden');
  }
}

function copySheetJson() {
  if (!state.currentSheet) return;
  navigator.clipboard.writeText(JSON.stringify(state.currentSheet.sheet, null, 2))
    .then(() => showToast('JSON copiado al portapapeles'))
    .catch(() => showToast('No se pudo copiar', 'error'));
}

/* ── Galería ── */
function renderGallery() {
  const grid    = document.getElementById('cardsGrid');
  const counter = document.getElementById('npcCount');
  if (!grid) return;
  const npcs = Storage.getAll();
  counter.textContent = `${npcs.length} personaje${npcs.length !== 1 ? 's' : ''}`;
  if (npcs.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <span class="empty-icon">📖</span>
      <p class="empty-title">La aldea está vacía</p>
      <p class="empty-sub">Genera tu primer NPC en la pestaña Crear</p>
    </div>`;
    return;
  }
  grid.innerHTML = npcs.map(npc => {
    const quote     = (npc.sheet.dialogo_tipico || '').slice(0, 80);
    const spriteImg = npc.spriteData
      ? `<img class="card-sprite" src="${npc.spriteData}" alt="sprite">`
      : `<div class="card-sprite-empty">?</div>`;
    return `<div class="npc-card">
      <div class="card-header">
        ${spriteImg}
        <p class="card-name">${npc.form.nombre || 'Sin nombre'}</p>
        <p class="card-archetype">${npc.sheet.arquetipo || ''}</p>
        <p class="card-relation">${npc.form.relacion || ''}</p>
      </div>
      <p class="card-quote">${quote}${quote.length >= 80 ? '…' : ''}</p>
      <div class="card-actions">
        <button class="card-act view" onclick="viewNpc('${npc.id}')">Ver ficha</button>
        <button class="card-act del"  onclick="deleteNpc('${npc.id}')">Eliminar</button>
      </div>
    </div>`;
  }).join('');
}

function viewNpc(id) {
  const npc = Storage.getById(id);
  if (!npc) return;
  switchTab('crear');
  document.getElementById('fNombre').value   = npc.form.nombre      || '';
  document.getElementById('fRelacion').value = npc.form.relacion    || '';
  document.getElementById('fHobby').value    = npc.form.hobby       || '';
  document.getElementById('fTrabajo').value  = npc.form.trabajo     || '';
  document.getElementById('fDesc').value     = npc.form.descripcion || '';
  state.selectedPersonality = new Set(npc.form.personalidad || []);
  document.querySelectorAll('.chip').forEach(chip => {
    chip.classList.toggle('active', state.selectedPersonality.has(chip.textContent));
  });
  state.currentSheet = npc;
  const resultArea = document.getElementById('resultArea');
  resultArea.classList.remove('hidden');
  renderSheet(npc, resultArea);

  // Si el NPC tiene sprite guardado, abre el editor con ese estado
  const panel = document.getElementById('spriteEditorPanel');
  if (panel) {
    panel.innerHTML = '';
    panel.removeAttribute('data-mounted');
    if (npc.spriteState) {
      panel.classList.remove('hidden');
      SpriteEditor.mount(panel, npc.spriteState);
      panel.dataset.mounted = 'true';
    } else {
      panel.classList.add('hidden');
    }
  }

  resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteNpc(id) {
  if (!confirm('¿Eliminar este personaje de la aldea?')) return;
  Storage.remove(id);
  renderGallery();
  showToast('Personaje eliminado');
}

/* ── Toast ── */
function showToast(msg, type = 'ok') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent    = msg;
  toast.style.background = type === 'error' ? 'var(--red)' : 'var(--teal)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}
/* ================================================
   dialog.js — Chat con opciones de diálogo
   ================================================ */

const Dialog = (() => {

  const ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';
  const MODEL    = 'mistral-small-latest';
  const histories = {};

  let _open    = false;
  let _npcId   = null;
  let _onClose = null;

  function isOpen() { return _open; }

  /* ── Sistema prompt ── */
  function buildSystem(npc) {
    const s = npc.sheet;
    const misiones = (s.misiones || []).map((m, i) => `[${i}] ${m.icono || ''} ${m.texto}`).join('\n');
    return `Eres ${npc.form.nombre || 'un personaje'}, un ${s.arquetipo}.
Tu lema: "${s.lema}".
Motivación oculta: ${s.motivacion_oculta}
Punto débil: ${s.punto_debil}
Señal de alarma: ${s.senal_de_alarma || s['señal_de_alarma'] || ''}
Misiones de relación:
${misiones}

Responde SIEMPRE con un JSON con esta estructura exacta:
{
  "texto": "Tu respuesta en primera persona (máx 2-3 frases)",
  "opciones": ["opción A", "opción B", "opción C"] o null,
  "mision_completada": 0 o null
}

- "opciones": incluye 3 opciones cuando la conversación llega a un momento clave relacionado con una misión. Si no, pon null.
- "mision_completada": si la respuesta del jugador completa una misión, pon su índice. Si no, null.
- Habla siempre en primera persona. No menciones que eres IA ni que tienes una ficha.`.trim();
  }

  /* ── Abrir ── */
  function open(npc, onClose) {
    _open    = true;
    _npcId   = npc.id;
    _onClose = onClose || null;

    document.getElementById('dialogOverlay').classList.remove('hidden');
    document.getElementById('dialogNpcName').textContent = npc.form.nombre || '?';
    document.getElementById('dialogNpcArch').textContent = npc.sheet.arquetipo || '';

    const spriteEl = document.getElementById('dialogNpcSprite');
    if (npc.spriteData) { spriteEl.src = npc.spriteData; spriteEl.style.display = 'block'; }
    else                { spriteEl.style.display = 'none'; }

    const histEl = document.getElementById('dialogHistory');
    histEl.innerHTML = '';
    _clearOptions();

    if (!histories[_npcId]) {
      histories[_npcId] = [];
      const greeting = npc.sheet.dialogo_tipico || '…';
      _appendMsg(npc.form.nombre || 'NPC', greeting, 'npc');
      histories[_npcId].push({ role: 'assistant', content: greeting });
    } else {
      histories[_npcId].forEach(m => {
        const sender = m.role === 'user' ? 'Tú' : (npc.form.nombre || 'NPC');
        _appendMsg(sender, m.content, m.role === 'user' ? 'user' : 'npc');
      });
    }

    setTimeout(() => document.getElementById('dialogInput')?.focus(), 80);
  }

  /* ── Cerrar ── */
  function close() {
    if (!_open) return;
    _open = false;
    _clearOptions();
    document.getElementById('dialogOverlay').classList.add('hidden');
    document.getElementById('dialogInput').value = '';
    if (_onClose) { _onClose(); _onClose = null; }
  }

  /* ── Enviar texto libre ── */
  async function send() {
    const inputEl = document.getElementById('dialogInput');
    const text    = (inputEl?.value || '').trim();
    if (!text || !_open) return;
    inputEl.value = '';
    inputEl.focus();
    _clearOptions();
    await _sendMessage(text);
  }

  /* ── Elegir opción ── */
  async function choose(text) {
    if (!_open) return;
    _clearOptions();
    await _sendMessage(text);
  }

  /* ── Lógica compartida de envío ── */
  async function _sendMessage(text) {
    const npc = Storage.getById(_npcId);
    if (!npc) return;

    _appendMsg('Tú', text, 'user');
    histories[_npcId].push({ role: 'user', content: text });

    const thinking = _appendMsg(npc.form.nombre || 'NPC', '…', 'npc thinking');

    const apiKey = localStorage.getItem('npcforge_apikey') || '';
    if (!apiKey) {
      thinking.remove();
      _appendMsg('Sistema', 'Sin API Key. Configúrala en NPCForge.', 'sys-err');
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model:           MODEL,
          messages:        [{ role: 'system', content: buildSystem(npc) }, ...histories[_npcId]],
          response_format: { type: 'json_object' },
          temperature:     0.85,
          max_tokens:      300
        })
      });

      const data = await res.json();
      const raw  = data?.choices?.[0]?.message?.content || '{}';
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch { parsed = { texto: raw, opciones: null, mision_completada: null }; }

      const reply   = parsed.texto || '…';
      const opciones = parsed.opciones || null;
      const misionIdx = parsed.mision_completada ?? null;

      thinking.remove();
      histories[_npcId].push({ role: 'assistant', content: reply });
      _appendMsg(npc.form.nombre || 'NPC', reply, 'npc');

      // Misión completada
      if (misionIdx !== null && npc.sheet.misiones?.[misionIdx]) {
        const recien = Missions._markDone(npc.id, misionIdx);
        if (recien) {
          Missions._showNotification(npc.form.nombre, npc.sheet.misiones[misionIdx]);
          Missions.show(npc);
        }
      }

      // Mostrar opciones si las hay
      if (opciones?.length) {
        _showOptions(opciones);
      }

    } catch {
      thinking.remove();
      _appendMsg('Sistema', 'Error de conexión.', 'sys-err');
    }
  }

  /* ── Renderizar opciones ── */
  function _showOptions(opciones) {
    const container = document.getElementById('dialogOptions');
    if (!container) return;
    container.innerHTML = '';
    opciones.forEach(op => {
      const btn = document.createElement('button');
      btn.className = 'dialog-option-btn';
      btn.textContent = op;
      btn.onclick = () => choose(op);
      container.appendChild(btn);
    });
    container.classList.remove('hidden');
  }

  function _clearOptions() {
    const container = document.getElementById('dialogOptions');
    if (container) { container.innerHTML = ''; container.classList.add('hidden'); }
  }

  /* ── UI helpers ── */
  function _appendMsg(sender, text, cls) {
    const h   = document.getElementById('dialogHistory');
    const div = document.createElement('div');
    div.className = `dmsg ${cls}`;
    div.innerHTML = `<b class="dname">${sender}</b><span class="dtext">${text}</span>`;
    h.appendChild(div);
    h.scrollTop = h.scrollHeight;
    return div;
  }

  /* Capturar teclas cuando el diálogo está abierto */
  document.addEventListener('keydown', e => {
    if (!_open) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    e.stopPropagation();
    const input = document.getElementById('dialogInput');
    if (input && document.activeElement !== input) input.focus();
  }, true);

  return { open, close, send, choose, isOpen };

})();
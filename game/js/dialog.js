/* ================================================
   dialog.js — Cuadro de diálogo con NPCs via Mistral
   ================================================ */

const Dialog = (() => {

  const ENDPOINT  = 'https://api.mistral.ai/v1/chat/completions';
  const MODEL     = 'mistral-small-latest';
  const histories = {};

  let _open    = false;
  let _npcId   = null;
  let _onClose = null;

  function isOpen() { return _open; }

  function buildSystem(npc) {
    const s = npc.sheet;
    return `Eres ${npc.form.nombre || 'un personaje'}, un ${s.arquetipo}.
Tu lema: "${s.lema}".
Motivación oculta: ${s.motivacion_oculta}
Punto débil: ${s.punto_debil}
Señal de alarma: ${s.senal_de_alarma || s['señal_de_alarma'] || ''}

Habla siempre en primera persona. Sé fiel a tu carácter.
Respuestas cortas (máximo 2-3 frases). No menciones que eres una IA ni que tienes una ficha.`.trim();
  }

  /* ── Abrir diálogo ── */
  function open(npc, onClose) {
    _open    = true;
    _npcId   = npc.id;
    _onClose = onClose || null;

    document.getElementById('dialogOverlay').classList.remove('hidden');
    document.getElementById('dialogNpcName').textContent = npc.form.nombre || '?';
    document.getElementById('dialogNpcArch').textContent = npc.sheet.arquetipo || '';

    const spriteEl = document.getElementById('dialogNpcSprite');
    if (npc.spriteData) {
      spriteEl.src = npc.spriteData;
      spriteEl.style.display = 'block';
    } else {
      spriteEl.style.display = 'none';
    }

    const histEl = document.getElementById('dialogHistory');
    histEl.innerHTML = '';

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

    // Foco al input + capturar teclas para que no lleguen a Phaser
    const input = document.getElementById('dialogInput');
    setTimeout(() => input?.focus(), 80);
  }

  /* ── Cerrar diálogo ── */
  function close() {
    if (!_open) return;
    _open = false;
    document.getElementById('dialogOverlay').classList.add('hidden');
    document.getElementById('dialogInput').value = '';
    if (_onClose) { _onClose(); _onClose = null; }
  }

  /* ── Enviar mensaje ── */
  async function send() {
    const inputEl = document.getElementById('dialogInput');
    const text    = (inputEl?.value || '').trim();
    if (!text || !_open) return;
    inputEl.value = '';
    inputEl.focus();

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
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model:    MODEL,
          messages: [
            { role: 'system', content: buildSystem(npc) },
            ...histories[_npcId]
          ],
          temperature: 0.9,
          max_tokens:  150
        })
      });

      const data  = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim() || '…';

      thinking.remove();
      histories[_npcId].push({ role: 'assistant', content: reply });
      _appendMsg(npc.form.nombre || 'NPC', reply, 'npc');

    } catch {
      thinking.remove();
      _appendMsg('Sistema', 'Error de conexión.', 'sys-err');
    }
  }

  function _appendMsg(sender, text, cls) {
    const h   = document.getElementById('dialogHistory');
    const div = document.createElement('div');
    div.className = `dmsg ${cls}`;
    div.innerHTML = `<b class="dname">${sender}</b><span class="dtext">${text}</span>`;
    h.appendChild(div);
    h.scrollTop = h.scrollHeight;
    return div;
  }

  /* ── Capturar teclas cuando el diálogo está abierto ── */
  document.addEventListener('keydown', e => {
    if (!_open) return;

    // Escape cierra
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }

    // Todas las demás teclas: detener propagación para que Phaser no las capture
    e.stopPropagation();

    // Redirigir el foco al input si se escribe algo
    const input = document.getElementById('dialogInput');
    if (input && document.activeElement !== input) {
      input.focus();
    }
  }, true); // useCapture: true → intercepta antes que Phaser

  return { open, close, send, isOpen };

})();
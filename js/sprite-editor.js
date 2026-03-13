/* ================================================
   sprite-editor.js — Creador de sprite 16×16
   ================================================ */

const SpriteEditor = (() => {

  const SCALE = 10;   // 16px × 10 = 160px canvas display
  const SIZE  = 16;

  /* ── Paletas ── */

  const SKIN_TONES = [
    { base: '#fde8c8', dark: '#d4a97a' },
    { base: '#f0b882', dark: '#c07840' },
    { base: '#c68642', dark: '#8a5020' },
    { base: '#8d5524', dark: '#5a2e10' },
    { base: '#3e1c08', dark: '#1e0e04' },
  ];

  const HAIR_COLORS = [
    '#f5e642', '#d4a020', '#c8802a', '#6b3a10',
    '#151008', '#dcdcdc', '#cc3333', '#3355bb',
  ];

  const OUTFIT_COLORS = [
    '#3355cc', '#cc3333', '#228833', '#882299',
    '#e87810', '#336655', '#222222', '#775533',
  ];

  const EYE_COLORS = ['#2244aa', '#2a6030', '#6b4020', '#111111'];

  /* ── Plantilla base del cuerpo 16×16 ──
     0=transparente  1=piel  3=pelo  5=ropa
     7=contorno      8=boca  9=ojo             */
  const BODY = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //  0 zona pelo
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //  1 zona pelo
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //  2 zona pelo
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //  3 zona pelo
    [0,0,0,7,1,1,1,1,1,1,1,1,7,0,0,0], //  4 cara top
    [0,0,0,7,1,9,1,1,1,1,9,1,7,0,0,0], //  5 ojos
    [0,0,0,7,1,1,1,1,1,1,1,1,7,0,0,0], //  6 cara mid
    [0,0,0,7,1,1,1,8,1,8,1,1,7,0,0,0], //  7 boca hint
    [0,0,0,0,7,1,1,1,1,1,1,7,0,0,0,0], //  8 barbilla
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0], //  9 cuello
    [0,0,7,5,5,5,5,5,5,5,5,5,7,0,0,0], // 10 hombros
    [0,7,5,5,5,5,5,5,5,5,5,5,5,7,0,0], // 11 torso
    [7,1,1,5,5,5,5,5,5,5,5,5,1,1,7,0], // 12 torso + brazos
    [0,0,0,0,7,5,5,7,7,5,5,7,0,0,0,0], // 13 piernas
    [0,0,0,0,5,5,5,7,7,5,5,5,0,0,0,0], // 14 piernas
    [0,0,0,0,7,5,7,0,0,7,5,7,0,0,0,0], // 15 pies
  ];

  /* ── Estilos de pelo (sobrescriben filas 0–4) ── */
  const HAIR_STYLES = [
    // 0: Corto
    [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
      [0,0,0,3,3,7,7,7,7,7,7,3,3,0,0,0],
      [0,0,0,7,3,1,1,1,1,1,1,3,7,0,0,0],
    ],
    // 1: Medio
    [
      [0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0],
      [0,0,0,3,3,3,3,3,3,3,3,3,0,0,0,0],
      [0,0,3,3,3,7,7,7,7,7,7,3,3,3,0,0],
      [0,0,3,7,3,1,1,1,1,1,1,3,7,3,0,0],
      [0,0,3,7,1,1,1,1,1,1,1,1,7,3,0,0],
    ],
    // 2: Largo (más extensiones laterales en rows 5–8)
    [
      [0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0],
      [0,0,0,3,3,3,3,3,3,3,3,3,0,0,0,0],
      [0,0,3,3,3,7,7,7,7,7,7,3,3,3,0,0],
      [0,0,3,7,3,1,1,1,1,1,1,3,7,3,0,0],
      [0,0,3,7,1,1,1,1,1,1,1,1,7,3,0,0],
    ],
    // 3: Puntas
    [
      [0,0,3,0,3,3,0,0,0,3,3,0,3,0,0,0],
      [0,0,3,3,3,3,3,3,3,3,3,3,3,0,0,0],
      [0,0,3,3,3,7,7,7,7,7,7,3,3,3,0,0],
      [0,0,7,3,3,1,1,1,1,1,1,3,3,7,0,0],
      [0,0,0,7,1,1,1,1,1,1,1,1,7,0,0,0],
    ],
  ];

  // Pelo largo: extensiones laterales en columnas 2 y 13
  const LONG_EXTRAS = [
    [5,2],[5,13],[6,2],[6,13],[7,2],[7,13],[8,2],[8,13],
  ];

  /* ── Estado interno ── */
  let _state     = null;
  let _container = null;
  let _canvas    = null;
  let _ctx       = null;

  /* ── Utilidades ── */

  function darken(hex) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.round(((n >> 16) & 255) * 0.58);
    const g = Math.round(((n >>  8) & 255) * 0.58);
    const b = Math.round(( n        & 255) * 0.58);
    return `rgb(${r},${g},${b})`;
  }

  /* ── Construir la rejilla de colores 16×16 ── */

  function buildPixels() {
    const skin   = SKIN_TONES  [_state.skinIdx  ];
    const hairC  = HAIR_COLORS [_state.hairIdx  ];
    const outfit = OUTFIT_COLORS[_state.outfitIdx];
    const eyeC   = EYE_COLORS  [_state.eyeIdx   ];

    const map = {
      0: null,
      1: skin.base,
      2: skin.dark,
      3: hairC,
      4: darken(hairC),
      5: outfit,
      6: darken(outfit),
      7: '#1a1008',
      8: '#b09070',
      9: eyeC,
    };

    const grid = BODY.map(r => [...r]);

    // Aplicar filas de pelo
    HAIR_STYLES[_state.hairStyle].forEach((row, r) => {
      row.forEach((v, c) => { grid[r][c] = v; });
    });

    // Extensiones pelo largo
    if (_state.hairStyle === 2) {
      LONG_EXTRAS.forEach(([r, c]) => { grid[r][c] = 3; });
    }

    return grid.map(row => row.map(v => map[v] ?? null));
  }

  /* ── Renderizar canvas ── */

  function render() {
    if (!_ctx) return;
    _ctx.clearRect(0, 0, SIZE * SCALE, SIZE * SCALE);

    buildPixels().forEach((row, r) => {
      row.forEach((color, c) => {
        if (color) {
          _ctx.fillStyle = color;
          _ctx.fillRect(c * SCALE, r * SCALE, SCALE, SCALE);
        }
      });
    });

    // Rejilla sutil
    _ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    _ctx.lineWidth   = 0.5;
    for (let i = 0; i <= SIZE; i++) {
      _ctx.beginPath(); _ctx.moveTo(i * SCALE, 0);         _ctx.lineTo(i * SCALE, SIZE * SCALE); _ctx.stroke();
      _ctx.beginPath(); _ctx.moveTo(0,         i * SCALE); _ctx.lineTo(SIZE * SCALE, i * SCALE); _ctx.stroke();
    }
  }

  /* ── API pública ── */

  /** Devuelve el sprite como PNG base64 (16×16 real) */
  function getSprite() {
    const off  = document.createElement('canvas');
    off.width  = SIZE;
    off.height = SIZE;
    const ctx  = off.getContext('2d');
    buildPixels().forEach((row, r) => {
      row.forEach((color, c) => {
        if (color) { ctx.fillStyle = color; ctx.fillRect(c, r, 1, 1); }
      });
    });
    return off.toDataURL('image/png');
  }

  /** Devuelve el estado actual para guardarlo en el NPC */
  function getState() { return { ..._state }; }

  /** Monta el editor dentro de `container`.
   *  Si se pasa `savedState`, carga ese estado. */
  function mount(container, savedState) {
    _container = container;
    _state = savedState
      ? { ...savedState }
      : { skinIdx: 1, hairStyle: 0, hairIdx: 3, outfitIdx: 0, eyeIdx: 0 };

    const hairLabels = ['Corto', 'Medio', 'Largo', 'Puntas'];

    function swatchGroup(items, prop) {
      return items.map((item, i) => {
        const color = typeof item === 'object' ? item.base : item;
        return `<button class="swatch${i === _state[prop] ? ' active' : ''}"
                  data-idx="${i}" data-prop="${prop}"
                  style="background:${color}" title="${color}"></button>`;
      }).join('');
    }

    container.innerHTML = `
      <div class="sprite-editor">
        <div class="se-preview-col">
          <canvas id="seCanvas" class="se-canvas"
                  width="${SIZE * SCALE}" height="${SIZE * SCALE}"></canvas>
          <p class="se-preview-label">← Aspecto del NPC</p>
        </div>
        <div class="se-options">

          <div class="se-group">
            <span class="se-label">Cabello</span>
            <div class="se-btn-row">
              ${hairLabels.map((l, i) =>
                `<button class="se-opt-btn${i === _state.hairStyle ? ' active' : ''}"
                         data-hair="${i}">${l}</button>`
              ).join('')}
            </div>
          </div>

          <div class="se-group">
            <span class="se-label">Color pelo</span>
            <div class="se-swatches">${swatchGroup(HAIR_COLORS,   'hairIdx')}</div>
          </div>

          <div class="se-group">
            <span class="se-label">Tono piel</span>
            <div class="se-swatches">${swatchGroup(SKIN_TONES,    'skinIdx')}</div>
          </div>

          <div class="se-group">
            <span class="se-label">Ropa</span>
            <div class="se-swatches">${swatchGroup(OUTFIT_COLORS, 'outfitIdx')}</div>
          </div>

          <div class="se-group">
            <span class="se-label">Ojos</span>
            <div class="se-swatches">${swatchGroup(EYE_COLORS,    'eyeIdx')}</div>
          </div>

          <div class="se-save-row">
            <button class="btn btn-save" onclick="saveSpriteAndNpc()">
              💾 Guardar sprite y personaje
            </button>
          </div>

        </div>
      </div>`;

    _canvas = container.querySelector('#seCanvas');
    _ctx    = _canvas.getContext('2d');
    render();

    /* Botones de estilo de pelo */
    container.querySelectorAll('[data-hair]').forEach(btn => {
      btn.addEventListener('click', () => {
        _state.hairStyle = parseInt(btn.dataset.hair);
        container.querySelectorAll('[data-hair]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });

    /* Swatches de color */
    container.querySelectorAll('.swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const prop = btn.dataset.prop;
        _state[prop] = parseInt(btn.dataset.idx);
        container.querySelectorAll(`.swatch[data-prop="${prop}"]`)
                 .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });
  }

  return { mount, getSprite, getState };

})();
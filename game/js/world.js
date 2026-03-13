/* ================================================
   world.js — Escena principal Phaser 3 (top-down)
   ================================================ */

const TILE  = 16;
const MAP   = 40;
const SPEED = 70;
const REACH = 22;   // distancia de interacción en px

class WorldScene extends Phaser.Scene {

  constructor() {
    super({ key: 'WorldScene' });
    this.mapGrid    = [];
    this.player     = null;
    this.trees      = null;
    this.npcSprites = [];
    this.npcsData   = [];
    this.cursors    = null;
    this.wasd       = null;
    this.eKey       = null;
    this.nearbyNpc  = null;
    this.prompt     = null;   // "[E] Hablar" label
  }

  /* ── Preload: cargar sprites base64 ── */
  preload() {
    this.npcsData = Storage.getAll();

    const playerData = JSON.parse(localStorage.getItem('npcforge_player') || 'null');
    if (playerData?.spriteData) {
      this.load.image('player_spr', playerData.spriteData);
    }

    this.npcsData.forEach(npc => {
      if (npc.spriteData) {
        this.load.image(`npc_${npc.id}`, npc.spriteData);
      }
    });
  }

  /* ── Create ── */
  create() {
    this._makeTextures();
    this._buildMap();
    this._drawBackground();
    this._placeTrees();
    this._spawnPlayer();
    this._spawnNpcs();
    this._setupCamera();
    this._setupInput();
    this._makePromptLabel();

    if (this.npcsData.length === 0) {
      this._emptyHint();
    }
  }

  /* ── Update ── */
  update() {
    if (Dialog.isOpen()) {
      this.player.setVelocity(0, 0);
      return;
    }

    const L = this.cursors.left.isDown  || this.wasd.A.isDown;
    const R = this.cursors.right.isDown || this.wasd.D.isDown;
    const U = this.cursors.up.isDown    || this.wasd.W.isDown;
    const D = this.cursors.down.isDown  || this.wasd.S.isDown;

    this.player.setVelocity(
      L ? -SPEED : R ? SPEED : 0,
      U ? -SPEED : D ? SPEED : 0
    );

    // Diagonal normalization
    if ((L || R) && (U || D)) {
      this.player.body.velocity.normalize().scale(SPEED);
    }

    this._checkProximity();
  }

  /* ── Texturas procedurales ── */
  _makeTextures() {
    // 4 variantes de hierba
    [
      [0x4a7c3f, 0x3d6b34],
      [0x4f8442, 0x426e37],
      [0x527a3c, 0x446831],
      [0x486030, 0x3c5228],
    ].forEach(([main, dark], i) => {
      const g = this.add.graphics();
      g.fillStyle(main); g.fillRect(0, 0, 16, 16);
      g.fillStyle(dark);
      g.fillRect(0, 0, 2, 2);
      g.fillRect(13, 7, 2, 2);
      g.fillRect(5, 12, 2, 2);
      g.generateTexture(`grass${i}`, 16, 16);
      g.destroy();
    });

    // Camino
    const p = this.add.graphics();
    p.fillStyle(0x8b7355); p.fillRect(0, 0, 16, 16);
    p.fillStyle(0x9a8265); p.fillRect(2, 4, 3, 2); p.fillRect(9, 10, 3, 2);
    p.fillStyle(0x7a6345); p.fillRect(0, 0, 16, 1); p.fillRect(0, 15, 16, 1);
    p.generateTexture('path', 16, 16);
    p.destroy();

    // Árbol
    const t = this.add.graphics();
    t.fillStyle(0x2a4a18); t.fillRect(1, 3, 14, 9);
    t.fillStyle(0x3a6a22); t.fillRect(3, 1, 10, 5);
    t.fillStyle(0x1e3a10); t.fillRect(3, 10, 10, 2);
    t.fillStyle(0x5c3a1e); t.fillRect(6, 12, 4, 4);
    t.generateTexture('tree', 16, 16);
    t.destroy();

    // Jugador por defecto (si no hay sprite guardado)
    if (!this.textures.exists('player_spr')) {
      const pf = this.add.graphics();
      pf.fillStyle(0xc9a84c); pf.fillRect(4, 0, 8, 8);
      pf.fillStyle(0x3355cc); pf.fillRect(3, 8, 10, 8);
      pf.generateTexture('player_spr', 16, 16);
      pf.destroy();
    }

    // NPC por defecto
    const nf = this.add.graphics();
    nf.fillStyle(0xe8d0a0); nf.fillRect(4, 0, 8, 8);
    nf.fillStyle(0xaa3322); nf.fillRect(3, 8, 10, 8);
    nf.generateTexture('npc_default', 16, 16);
    nf.destroy();
  }

  /* ── Mapa procedural ── */
  _buildMap() {
    const C = MAP / 2;
    for (let y = 0; y < MAP; y++) {
      this.mapGrid[y] = [];
      for (let x = 0; x < MAP; x++) {
        const dx = Math.abs(x - C);
        const dy = Math.abs(y - C);
        if (x === C || y === C) {
          this.mapGrid[y][x] = 'path';
        } else if (dx < 7 && dy < 7) {
          this.mapGrid[y][x] = 'grass';
        } else {
          this.mapGrid[y][x] = Math.random() < 0.22 ? 'tree' : 'grass';
        }
      }
    }
  }

  /* ── Renderizar suelo ── */
  _drawBackground() {
    const rt = this.add.renderTexture(0, 0, MAP * TILE, MAP * TILE);
    for (let y = 0; y < MAP; y++) {
      for (let x = 0; x < MAP; x++) {
        const key = this.mapGrid[y][x] === 'path'
          ? 'path'
          : `grass${(x * 3 + y * 7) % 4}`;
        rt.draw(key, x * TILE, y * TILE);
      }
    }
  }

  /* ── Árboles con física ── */
  _placeTrees() {
    this.trees = this.physics.add.staticGroup();
    for (let y = 0; y < MAP; y++) {
      for (let x = 0; x < MAP; x++) {
        if (this.mapGrid[y][x] === 'tree') {
          this.trees.create(
            x * TILE + TILE / 2,
            y * TILE + TILE / 2,
            'tree'
          );
        }
      }
    }
  }

  /* ── Jugador ── */
  _spawnPlayer() {
    const cx = (MAP / 2) * TILE;
    this.player = this.physics.add.sprite(cx, cx, 'player_spr');
    this.player.setCollideWorldBounds(true).setDepth(12);
    this.physics.world.setBounds(0, 0, MAP * TILE, MAP * TILE);
    this.physics.add.collider(this.player, this.trees);
  }

  /* ── NPCs ── */
  _spawnNpcs() {
    const C = MAP / 2;
    const offsets = [
      [-3,-3],[3,-3],[-3,3],[3,3],
      [0,-5],[-5,0],[5,0],[0,5],
      [-4,-1],[4,1],[-2,-4],[2,4],
    ];

    this.npcsData.forEach((npc, i) => {
      const [ox, oy] = offsets[i % offsets.length];
      const wx = (C + ox) * TILE + TILE / 2;
      const wy = (C + oy) * TILE + TILE / 2;
      const key = this.textures.exists(`npc_${npc.id}`) ? `npc_${npc.id}` : 'npc_default';

      const s = this.physics.add.sprite(wx, wy, key);
      s.setImmovable(true).setDepth(11).setData('npc', npc);
      this.physics.add.collider(this.player, s);

      // Nombre encima del NPC
      this.add.text(wx, wy - 11, npc.form.nombre || '?', {
        fontSize: '5px',
        fontFamily: 'monospace',
        color:    '#e8dfc8',
        backgroundColor: '#0d0c0eb0',
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5, 1).setDepth(25);

      this.npcSprites.push(s);
    });
  }

  /* ── Cámara ── */
  _setupCamera() {
    this.cameras.main
      .setZoom(2)
      .setBounds(0, 0, MAP * TILE, MAP * TILE)
      .startFollow(this.player, true, 0.1, 0.1);
  }

  /* ── Input ── */
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd    = {
      W: this.input.keyboard.addKey('W'),
      A: this.input.keyboard.addKey('A'),
      S: this.input.keyboard.addKey('S'),
      D: this.input.keyboard.addKey('D'),
    };

    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.eKey.on('down', () => {
      if (this.nearbyNpc && !Dialog.isOpen()) {
        // Pausar input de Phaser para que el campo de texto funcione
        this.input.keyboard.enabled = false;
        this.player.setVelocity(0, 0);

        Dialog.open(this.nearbyNpc.getData('npc'), () => {
          this.input.keyboard.enabled = true;
        });
      }
    });
  }

  /* ── Etiqueta [E] Hablar ── */
  _makePromptLabel() {
    this.prompt = this.add.text(0, 0, '[E] Hablar', {
      fontSize: '5px',
      fontFamily: 'monospace',
      color:    '#c9a84c',
      backgroundColor: '#0d0c0ecc',
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5, 1).setDepth(30).setVisible(false);
  }

  /* ── Hint si no hay NPCs ── */
  _emptyHint() {
    const cx = (MAP / 2) * TILE;
    this.add.text(cx, cx + 20,
      'Crea personajes en NPCForge\npara poblar la aldea',
      {
        fontSize: '6px', fontFamily: 'monospace',
        color: '#c9a84c', backgroundColor: '#0d0c0ecc',
        padding: { x: 6, y: 4 }, align: 'center'
      }
    ).setOrigin(0.5).setDepth(20);
  }

  /* ── Comprobar NPC cercano ── */
  _checkProximity() {
    let closest = null;
    let minDist = Infinity;

    this.npcSprites.forEach(s => {
      const d = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, s.x, s.y
      );
      if (d < REACH && d < minDist) { minDist = d; closest = s; }
    });

    this.nearbyNpc = closest;
    if (closest) {
      this.prompt.setPosition(closest.x, closest.y - 11).setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }
}